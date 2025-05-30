import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { POI } from '../../types';

interface POIState {
  pois: POI[];
  visiblePOIs: POI[];
  selectedPOI: string | null;
  hoveredPOI: string | null;
  loading: boolean;
  error: string | null;
  showUploadPrompt: boolean;
  processingImage: boolean;
}

const initialState: POIState = {
  pois: [], // Start with empty array
  visiblePOIs: [], // POIs currently visible/animated on the map
  selectedPOI: null,
  hoveredPOI: null,
  loading: false,
  error: null,
  showUploadPrompt: true, // Show upload prompt by default
  processingImage: false,
};

// Simulate API call to process image and extract POIs
export const processImageData = createAsyncThunk(
  'pois/processImage',
  async (imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('https://usage.bmapsbd.com/view', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      return data;
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
    }, // Action to select a POI
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
    },

    // Action to save POIs to database (mock for now)
    saveToDatabase: (state) => {
      // In a real implementation, this would call an API
      // For now, just mark everything as saved by changing status
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
    }, // Action to clear all data
    clearAllData: (state) => {
      state.pois = [];
      state.visiblePOIs = [];
      state.selectedPOI = null;
      state.hoveredPOI = null;
      state.showUploadPrompt = true;
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
  clearAllData,
} = poiSlice.actions;

export default poiSlice.reducer;
