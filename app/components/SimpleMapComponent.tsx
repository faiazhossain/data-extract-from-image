"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Map, {
  Marker,
  NavigationControl,
  MapRef,
  MarkerDragEvent,
  Popup,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  setSelectedMarker,
  setHoveredMarker,
  updateMarkerPosition,
} from "../redux/features/markerSlice";
import { MarkerData } from "../types";
import { FaMapMarkerAlt } from "react-icons/fa";

interface SimpleMapComponentProps {
  width?: string | number;
  height?: string | number;
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
}

const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({
  width = "100%",
  height = "100%",
  initialLatitude = 23.8103, // Default to Bangladesh center
  initialLongitude = 90.4125,
  initialZoom = 10,
}) => {
  const mapRef = useRef<MapRef>(null);
  const dispatch = useAppDispatch();

  // Get markers and state from Redux
  const {
    markers,
    selectedMarkerId,
    hoveredMarkerId,
    isDragModeEnabled,
    isLoading,
  } = useAppSelector((state) => state.marker);

  const [popupInfo, setPopupInfo] = useState<MarkerData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Only render visible markers based on the current map view to improve performance
  const [visibleMarkers, setVisibleMarkers] = useState<MarkerData[]>([]);
  const [currentBounds, setCurrentBounds] =
    useState<maplibregl.LngLatBounds | null>(null);

  // Update visible markers when the map moves or markers change
  useEffect(() => {
    if (mapRef.current && mapLoaded && currentBounds && markers.length > 0) {
      // Filter markers to only show those in the current map bounds + a buffer
      const buffer = 0.5; // Add 0.5 degrees buffer around the visible area
      const sw = currentBounds.getSouthWest();
      const ne = currentBounds.getNorthEast();

      const filtered = markers.filter((marker) => {
        return (
          marker.longitude >= sw.lng - buffer &&
          marker.longitude <= ne.lng + buffer &&
          marker.latitude >= sw.lat - buffer &&
          marker.latitude <= ne.lat + buffer
        );
      });

      // Limit the number of markers to render for performance
      const maxVisibleMarkers = 200;
      let markersToShow = filtered;

      if (filtered.length > maxVisibleMarkers) {
        // If there are too many markers, take a sample - prioritize selected marker
        markersToShow = [];

        // Always include selected and hovered markers
        if (selectedMarkerId) {
          const selected = filtered.find((m) => m.id === selectedMarkerId);
          if (selected) markersToShow.push(selected);
        }

        if (hoveredMarkerId && hoveredMarkerId !== selectedMarkerId) {
          const hovered = filtered.find((m) => m.id === hoveredMarkerId);
          if (hovered) markersToShow.push(hovered);
        }

        // Evenly distribute the remaining markers
        const step = Math.floor(
          filtered.length / (maxVisibleMarkers - markersToShow.length)
        );
        for (
          let i = 0;
          i < filtered.length && markersToShow.length < maxVisibleMarkers;
          i += step
        ) {
          const marker = filtered[i];
          if (!markersToShow.some((m) => m.id === marker.id)) {
            markersToShow.push(marker);
          }
        }

        console.log(
          `Showing ${markersToShow.length} of ${filtered.length} markers in view`
        );
      }

      setVisibleMarkers(markersToShow);
    }
  }, [markers, mapLoaded, currentBounds, selectedMarkerId, hoveredMarkerId]);

  // Fit map to markers when they first load
  useEffect(() => {
    if (mapRef.current && markers.length > 0 && !isLoading) {
      const bounds = new maplibregl.LngLatBounds();

      // Use only the first 100 markers for bounds calculation to avoid performance issues
      markers.slice(0, 100).forEach((marker) => {
        bounds.extend([marker.longitude, marker.latitude]);
      });

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
        });
      }
    }
  }, [markers.length, isLoading]);

  // Handle marker drag end
  const handleDragEnd = (event: MarkerDragEvent, markerId: string) => {
    if (!isDragModeEnabled) return;

    dispatch(
      updateMarkerPosition({
        id: markerId,
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      })
    );
  };

  // Update the current bounds when the map moves
  const handleMapMove = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      setCurrentBounds(bounds);
    }
  };

  return (
    <div style={{ width, height }} className='relative'>
      <Map
        ref={mapRef}
        mapStyle='https://map.barikoi.com/styles/barikoi-light/style.json?key=NDE2NzpVNzkyTE5UMUoy'
        initialViewState={{
          longitude: initialLongitude,
          latitude: initialLatitude,
          zoom: initialZoom,
        }}
        style={{ width, height }}
        onLoad={() => {
          setMapLoaded(true);
          handleMapMove();
        }}
        onMoveEnd={handleMapMove}
      >
        <NavigationControl position='top-right' />

        {isLoading && (
          <div className='absolute top-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg z-10 flex items-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2'></div>
            <span className='text-sm font-medium'>Loading markers...</span>
          </div>
        )}

        {markers.length > 0 &&
          visibleMarkers.map((marker) => (
            <React.Fragment key={marker.id}>
              <Marker
                longitude={marker.longitude}
                latitude={marker.latitude}
                anchor='bottom'
                draggable={isDragModeEnabled}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(marker);
                  dispatch(setSelectedMarker(marker.id));
                }}
                onDragEnd={(event) => handleDragEnd(event, marker.id)}
              >
                <div
                  className={`cursor-${
                    isDragModeEnabled ? "move" : "pointer"
                  } transition-all duration-200 transform hover:scale-110`}
                  onMouseEnter={() => dispatch(setHoveredMarker(marker.id))}
                  onMouseLeave={() => dispatch(setHoveredMarker(null))}
                >
                  <div
                    className={`p-2 rounded-full bg-white flex items-center justify-center shadow-lg border-2 ${
                      selectedMarkerId === marker.id
                        ? "border-blue-500"
                        : hoveredMarkerId === marker.id
                        ? "border-purple-500"
                        : "border-red-500"
                    }`}
                  >
                    <FaMapMarkerAlt className='text-red-500 text-xl' />
                  </div>

                  {isDragModeEnabled && selectedMarkerId === marker.id && (
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
                      Drag to update
                    </div>
                  )}
                </div>
              </Marker>

              {popupInfo && popupInfo.id === marker.id && (
                <Popup
                  longitude={marker.longitude}
                  latitude={marker.latitude}
                  anchor='bottom'
                  onClose={() => setPopupInfo(null)}
                  closeButton={true}
                  closeOnClick={false}
                  className='rounded-lg'
                  offset={[0, -15]}
                >
                  <div className='p-2 max-w-xs'>
                    <h3 className='font-bold text-md mb-1'>
                      {marker.name || "Unnamed Location"}
                    </h3>

                    <div className='text-sm space-y-1'>
                      <p>
                        <span className='font-medium'>Lat:</span>{" "}
                        {marker.latitude.toFixed(6)}
                      </p>
                      <p>
                        <span className='font-medium'>Lng:</span>{" "}
                        {marker.longitude.toFixed(6)}
                      </p>
                      {marker.contactNo && (
                        <p>
                          <span className='font-medium'>Contact:</span>{" "}
                          {marker.contactNo}
                        </p>
                      )}
                      {marker.serviceType && (
                        <p>
                          <span className='font-medium'>Type:</span>{" "}
                          {marker.serviceType}
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
            </React.Fragment>
          ))}

        {markers.length > 0 && visibleMarkers.length < markers.length && (
          <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md text-xs font-medium'>
            Showing {visibleMarkers.length} of {markers.length} markers
          </div>
        )}
      </Map>
    </div>
  );
};

export default SimpleMapComponent;
