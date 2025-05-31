import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { POI, Rupantor } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { exportToExcel } from '../../services/exportService';

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
}

interface APIResponsePOI {
  poi_name: string | null;
  street_road_name_number: string;
  address: string;
  rupantor: Rupantor;
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
};

const formatPOIFromResponse = (poiData: APIResponsePOI): POI => {
  return {
    id: uuidv4(), // Generate a unique ID for the POI
    poi_name: poiData.poi_name,
    street_road_name_number: poiData.street_road_name_number,
    address: poiData.address,
    rupantor: poiData.rupantor,
    status: 'ai', // Initial status
    category: poiData.rupantor?.geocoded?.pType || 'unknown',
  };
};

// Process image through our API endpoint
export const processImageData = createAsyncThunk(
  'pois/processImage',
  async (imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = (await response.json()) as APIResponse;

      // Transform the response data into POI objects
      return data.result.map(formatPOIFromResponse);
    } catch (error) {
      throw new Error('Failed to process image: ' + (error as Error).message);
    }
  }
);

export const poiSlice = createSlice({
  name: 'pois',
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
        status: 'ai' | 'verified' | 'rejected';
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

    // Action to update a POI's details
    updatePOI: (state, action: PayloadAction<POI>) => {
      const updatedPOI = action.payload;
      const poiIndex = state.pois.findIndex((poi) => poi.id === updatedPOI.id);

      if (poiIndex !== -1) {
        state.pois[poiIndex] = updatedPOI;

        // Also update in visiblePOIs
        const visibleIndex = state.visiblePOIs.findIndex(
          (poi) => poi.id === updatedPOI.id
        );
        if (visibleIndex !== -1) {
          state.visiblePOIs[visibleIndex] = updatedPOI;
        }
      }
    },

    // Action to reset visible POIs (for new data processing)
    resetVisiblePOIs: (state) => {
      state.visiblePOIs = [];
    }, // Action to save POIs to database (currently exports to Excel)
    saveToDatabase: (state) => {
      try {
        // Export verified POIs to Excel
        exportToExcel([...state.pois]);

        // For the demo, we'll still mark everything as saved
        state.pois.forEach((poi) => {
          if (poi.status === 'ai') {
            poi.status = 'verified';
          }
        });

        // Also update visiblePOIs to reflect changes
        state.visiblePOIs = state.visiblePOIs.map((poi) => {
          if (poi.status === 'ai') {
            return { ...poi, status: 'verified' };
          }
          return poi;
        });
      } catch (error) {
        console.error('Failed to export POIs:', error);
      }
    },

    // Action to export POIs to Excel
    exportPOIsToExcel: (state) => {
      // Call the export service (assuming it returns a promise)
      exportToExcel(state.pois)
        .then(() => {
          // Handle successful export, e.g., show a notification
          console.log('Exported successfully');
        })
        .catch((error) => {
          // Handle export error
          console.error('Export failed', error);
        });
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
        state.error = action.error.message || 'Failed to process image';
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
  saveToDatabase,
  exportPOIsToExcel,
  clearAllData,
  setUploadedImage,
  toggleFullImage,
  clearUploadedImage,
} = poiSlice.actions;

export default poiSlice.reducer;
