import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { MarkerData, CSVMarkerData } from "../../types";

interface MarkerState {
  markers: MarkerData[];
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  isDragModeEnabled: boolean;
  isLoading: boolean;
}

const initialState: MarkerState = {
  markers: [],
  selectedMarkerId: null,
  hoveredMarkerId: null,
  isDragModeEnabled: false,
  isLoading: false,
};

export const markerSlice = createSlice({
  name: "markers",
  initialState,
  reducers: {
    setMarkers: (state, action: PayloadAction<MarkerData[]>) => {
      state.markers = action.payload;
    },

    startLoadingMarkers: (state) => {
      state.isLoading = true;
    },

    addMarkersFromCSV: (state, action: PayloadAction<CSVMarkerData[]>) => {
      // Process markers in batches for better performance
      const csvData = action.payload;

      // Clear existing markers first
      state.markers = [];

      // Create new markers array directly (more efficient than pushing to state.markers)
      const newMarkers = csvData.map((item) => ({
        id: uuidv4(),
        name: item.event_details || "Unnamed Location",
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        contactNo: item.event_contact_no,
        details: item.event_details,
        serviceType: item.service_type,
      }));

      state.markers = newMarkers;
      state.isLoading = false;
    },

    updateMarkerPosition: (
      state,
      action: PayloadAction<{
        id: string;
        latitude: number;
        longitude: number;
      }>
    ) => {
      const { id, latitude, longitude } = action.payload;
      const markerIndex = state.markers.findIndex((marker) => marker.id === id);

      if (markerIndex !== -1) {
        state.markers[markerIndex].latitude = latitude;
        state.markers[markerIndex].longitude = longitude;
      }
    },

    setSelectedMarker: (state, action: PayloadAction<string | null>) => {
      state.selectedMarkerId = action.payload;
    },

    setHoveredMarker: (state, action: PayloadAction<string | null>) => {
      state.hoveredMarkerId = action.payload;
    },

    toggleDragMode: (state) => {
      state.isDragModeEnabled = !state.isDragModeEnabled;
    },

    resetMarkers: (state) => {
      state.markers = [];
      state.selectedMarkerId = null;
      state.hoveredMarkerId = null;
    },
  },
});

export const {
  setMarkers,
  startLoadingMarkers,
  addMarkersFromCSV,
  updateMarkerPosition,
  setSelectedMarker,
  setHoveredMarker,
  toggleDragMode,
  resetMarkers,
} = markerSlice.actions;

export default markerSlice.reducer;
