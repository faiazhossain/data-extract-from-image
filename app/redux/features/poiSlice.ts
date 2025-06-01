import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { POI, Rupantor } from "../../types";
import { v4 as uuidv4 } from "uuid";

interface POIState {
  pois: POI[];
  visiblePOIs: POI[];
  selectedPOI: string | null;
  hoveredPOI: string | null;
  loading: boolean;
  error: string | null;
  showUploadPrompt: boolean;
  processingImage: boolean;
  uploadedImage: {
    url: string;
    file: File | null;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  } | null;
  showFullImage: boolean;
  isDragModeEnabled: boolean;
}

interface APIResponsePOI {
  poi_name: string | null;
  street_road_name_number: string | null;
  address: string | null;
  rupantor: Rupantor;
  info?: {
    predict_doc: {
      poi_name: string | null;
      street_road_name_number: string | null;
      address: string | null;
      rupantor: Rupantor;
    };
    info: {
      exist: boolean;
      latitude: number;
      longitude: number;
    };
  };
}

interface APIResponse {
  result: APIResponsePOI[];
}

const initialState: POIState = {
  pois: [],
  visiblePOIs: [],
  selectedPOI: null,
  hoveredPOI: null,
  loading: false,
  error: null,
  showUploadPrompt: true,
  processingImage: false,
  uploadedImage: null,
  showFullImage: false,
  isDragModeEnabled: false,
};

const formatPOIFromResponse = (poiData: APIResponsePOI): POI => {
  return {
    id: uuidv4(), // Generate a unique ID for the POI
    poi_name: poiData.poi_name,
    street_road_name_number: poiData.street_road_name_number || "",
    address: poiData.address || "",
    rupantor: poiData.rupantor,
    info: poiData.info, // Include the info object
    status: "ai", // Initial status
    location: {
      lat: parseFloat(poiData.rupantor.geocoded.latitude),
      lng: parseFloat(poiData.rupantor.geocoded.longitude),
    },
  };
};

// Process image through our API endpoint
export const processImageData = createAsyncThunk(
  "pois/processImage",
  async (payload: {
    file: File;
    coordinates?: { latitude: number; longitude: number };
  }) => {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.coordinates) {
      formData.append("focus_lat", payload.coordinates.latitude.toString());
      formData.append("focus_lon", payload.coordinates.longitude.toString());
    }
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = (await response.json()) as APIResponse;

      // Transform the response data into POI objects
      return data.result.map(formatPOIFromResponse);
    } catch (error) {
      throw new Error("Failed to process image: " + (error as Error).message);
    }
  }
);

export const poiSlice = createSlice({
  name: "pois",
  initialState,
  reducers: {
    // Action to add POIs gradually for animation
    addVisiblePOI: (state, action: PayloadAction<POI>) => {
      state.visiblePOIs.push(action.payload);
    },

    // Action to select a POI
    selectPOI: (state, action: PayloadAction<string | null>) => {
      state.selectedPOI = action.payload;
    },

    // Action to set hovered POI
    setHoveredPOI: (state, action: PayloadAction<string | null>) => {
      state.hoveredPOI = action.payload;
    },

    // Action to update POI status
    updatePOIStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: POI["status"];
      }>
    ) => {
      const { id, status } = action.payload;
      const poiIndex = state.pois.findIndex((poi) => poi.id === id);

      if (poiIndex !== -1) {
        state.pois[poiIndex].status = status;

        // Also update in visiblePOIs
        const visibleIndex = state.visiblePOIs.findIndex(
          (poi) => poi.id === id
        );
        if (visibleIndex !== -1) {
          state.visiblePOIs[visibleIndex].status = status;
        }
      }
    },

    // Action to update a POI's details with reverse geocoding
    updatePOI: (state, action: PayloadAction<POI>) => {
      const updatedPOI = action.payload;
      const poiIndex = state.pois.findIndex((poi) => poi.id === updatedPOI.id);

      if (poiIndex !== -1) {
        state.pois[poiIndex] = {
          ...updatedPOI,
          status: "edited",
        };

        // Also update in visiblePOIs
        const visibleIndex = state.visiblePOIs.findIndex(
          (poi) => poi.id === updatedPOI.id
        );
        if (visibleIndex !== -1) {
          state.visiblePOIs[visibleIndex] = {
            ...updatedPOI,
            status: "edited",
          };
        }
      }
    },

    // Action to reset visible POIs (for new data processing)
    resetVisiblePOIs: (state) => {
      state.visiblePOIs = [];
    },

    // Action to clear all data
    clearAllData: (state) => {
      state.pois = [];
      state.visiblePOIs = [];
      state.selectedPOI = null;
      state.hoveredPOI = null;
      state.showUploadPrompt = true;
    },

    setUploadedImage: (
      state,
      action: PayloadAction<{
        url: string;
        file: File;
        coordinates?: { latitude: number; longitude: number };
      }>
    ) => {
      state.uploadedImage = action.payload;
    },

    toggleFullImage: (state) => {
      state.showFullImage = !state.showFullImage;
    },

    clearUploadedImage: (state) => {
      state.uploadedImage = null;
    },

    // Action to enable or disable drag mode
    toggleDragMode: (state) => {
      state.isDragModeEnabled = !state.isDragModeEnabled;
    },

    // Action to toggle edit permissions for a specific POI
    togglePoiEditPermission: (state, action: PayloadAction<string>) => {
      const poiId = action.payload;
      const poiIndex = state.pois.findIndex((poi) => poi.id === poiId);
      if (poiIndex !== -1) {
        state.pois[poiIndex].isEditEnabled =
          !state.pois[poiIndex].isEditEnabled;

        // Also update in visiblePOIs
        const visibleIndex = state.visiblePOIs.findIndex(
          (poi) => poi.id === poiId
        );
        if (visibleIndex !== -1) {
          state.visiblePOIs[visibleIndex].isEditEnabled =
            !state.visiblePOIs[visibleIndex].isEditEnabled;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processImageData.pending, (state) => {
        state.loading = true;
        state.processingImage = true;
        state.error = null;
        state.showUploadPrompt = false;
      })
      .addCase(processImageData.fulfilled, (state, action) => {
        state.loading = false;
        state.processingImage = false;
        state.pois = action.payload;
        // Don't populate visiblePOIs yet - we'll do that gradually for animation
        state.visiblePOIs = [];
        state.error = null;
      })
      .addCase(processImageData.rejected, (state, action) => {
        state.loading = false;
        state.processingImage = false;
        state.error = action.error.message || "Failed to process image";
      });
  },
});

export const {
  addVisiblePOI,
  selectPOI,
  setHoveredPOI,
  updatePOIStatus,
  updatePOI,
  resetVisiblePOIs,
  clearAllData,
  setUploadedImage,
  toggleFullImage,
  clearUploadedImage,
  toggleDragMode,
  togglePoiEditPermission,
} = poiSlice.actions;

export default poiSlice.reducer;
