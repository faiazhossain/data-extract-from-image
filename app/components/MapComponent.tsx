'use client';
import * as React from 'react';
import Map, {
  Marker,
  NavigationControl,
  MapRef,
  MarkerDragEvent,
  Popup,
} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { RootState } from '../redux/store';

// Import icons
import {
  FaHospital,
  FaShoppingCart,
  FaBuilding,
  FaUtensils,
  FaGraduationCap,
  FaBus,
  FaTree,
  FaTheaterMasks,
  FaHome,
  FaMapMarkerAlt,
} from 'react-icons/fa';

// Explicitly import styles
import '../maplibre-fix.css';
import '../marker-styles.css';

// Import types
import { POI } from '../types';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setHoveredPOI, updatePOI } from '../redux/features/poiSlice';
import MarkerRipple from './MarkerRipple';

interface MapComponentProps {
  width?: number | string;
  height?: number | string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  mapStyle?: string;
  onSelectPOI?: (poi: POI) => void;
}

// Status color mapping
const getStatusColor = (status: POI['status']) => {
  switch (status) {
    case 'ai':
      return '#FFCC00'; // Yellow
    case 'verified':
      return '#22C55E'; // Green
    case 'rejected':
      return '#EF4444'; // Red
    default:
      return '#FFCC00'; // Default yellow
  }
};

const getIconForCategory = (category: string) => {
  switch (category.toLowerCase()) {
    case 'healthcare':
      return { component: FaHospital, color: '#FF5757' };
    case 'shopping':
      return { component: FaShoppingCart, color: '#9747FF' };
    case 'office':
      return { component: FaBuilding, color: '#5271FF' };
    case 'restaurant':
    case 'food':
      return { component: FaUtensils, color: '#FFB443' };
    case 'education':
    case 'school':
      return { component: FaGraduationCap, color: '#38B6FF' };
    case 'transportation':
      return { component: FaBus, color: '#5BB318' };
    case 'park':
    case 'recreation':
      return { component: FaTree, color: '#2DC937' };
    case 'entertainment':
      return { component: FaTheaterMasks, color: '#FF66C4' };
    case 'residential':
      return { component: FaHome, color: '#607D8B' };
    default:
      return { component: FaMapMarkerAlt, color: '#555555' };
  }
};

const MapComponent = ({
  width = 600,
  height = 400,
  latitude = 23.82229,
  longitude = 90.38367,
  zoom = 14,
  mapStyle = 'https://map.barikoi.com/styles/barikoi-light/style.json?key=NDE2NzpVNzkyTE5UMUoy',
  onSelectPOI,
}: MapComponentProps) => {
  // Get POIs from Redux store
  const dispatch = useAppDispatch();
  const { visiblePOIs, selectedPOI, hoveredPOI } = useAppSelector(
    (state: RootState) => state.poi
  );
  const [popupInfo, setPopupInfo] = useState<POI | null>(null);

  // Handle marker drag end
  const handleDragEnd = (poi: POI, event: MarkerDragEvent) => {
    const { lng, lat } = event.lngLat;
    dispatch(
      updatePOI({
        ...poi,
        rupantor: {
          ...poi.rupantor,
          geocoded: {
            ...poi.rupantor.geocoded,
            latitude: lat.toString(),
            longitude: lng.toString(),
          },
        },
        status: 'verified', // Mark as verified since it was manually positioned
      })
    );
  };

  // Use a ref to store the map instance
  const mapRef = useRef<MapRef>(null);

  // Track newly added POIs for animation
  const [animatedPOIs, setAnimatedPOIs] = useState<Set<string>>(new Set());
  // Function to calculate animation delay based on index for staggered animation
  const getAnimationDelay = (poiId: string) => {
    const index = visiblePOIs.findIndex((poi) => poi.id === poiId);
    return index * 0.15; // 150ms delay between each marker's animation
  };

  // Keep track of which POIs have been animated
  useEffect(() => {
    if (visiblePOIs.length > 0) {
      // Find POIs that haven't been animated yet
      const newPOIs = visiblePOIs.filter(
        (poi) => poi.id && !animatedPOIs.has(poi.id)
      );

      if (newPOIs.length > 0) {
        const newAnimatedPOIs = new Set(animatedPOIs);
        newPOIs.forEach((poi) => {
          if (poi.id) {
            newAnimatedPOIs.add(poi.id);
          }
        });
        setAnimatedPOIs(newAnimatedPOIs);
      }
    }
  }, [visiblePOIs, animatedPOIs]);

  // Fit bounds to markers when they change
  useEffect(() => {
    if (mapRef.current && visiblePOIs.length > 0) {
      const bounds = new maplibregl.LngLatBounds();

      visiblePOIs.forEach((poi: POI) => {
        if (
          poi.rupantor?.geocoded?.latitude &&
          poi.rupantor?.geocoded?.longitude
        ) {
          bounds.extend([
            parseFloat(poi.rupantor.geocoded.longitude),
            parseFloat(poi.rupantor.geocoded.latitude),
          ]);
        }
      });

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
        });
      }
    }
  }, [visiblePOIs]);

  // Create a complete solution with custom icon rendering for each POI type
  const renderPOIs = () => {
    return visiblePOIs.map((poi: POI) => {
      if (!poi.rupantor?.geocoded) return null;

      const isSelected = selectedPOI === poi.id;
      const isHovered = hoveredPOI === poi.id;
      const { component: IconComponent, color } = getIconForCategory(
        poi.rupantor.geocoded.pType.toLowerCase()
      );
      const statusColor = getStatusColor(poi.status || 'ai');
      const lat = parseFloat(poi.rupantor.geocoded.latitude);
      const lng = parseFloat(poi.rupantor.geocoded.longitude);

      return (
        <React.Fragment key={poi.id || `${lat}-${lng}`}>
          <Marker
            longitude={lng}
            latitude={lat}
            anchor='bottom'
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(poi);
              if (onSelectPOI) {
                onSelectPOI(poi);
              }
            }}
            draggable={true}
            onDragEnd={(event) => handleDragEnd(poi, event)}
          >
            <AnimatePresence>
              <motion.div
                initial={{ y: -100, opacity: 0, scale: 0.3 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: poi.id ? getAnimationDelay(poi.id) : 0,
                  duration: 0.8,
                }}
                whileHover={{
                  scale: 1.2,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg marker-container transition-all duration-150 ${
                  isSelected ? 'ring-3 ring-blue-500 ring-opacity-75' : ''
                } ${isHovered ? 'scale-110 shadow-xl' : ''}`}
                style={{
                  backgroundColor: 'white',
                  border: `${isHovered ? 4 : 3}px solid ${statusColor}`,
                  position: 'relative',
                }}
                onMouseEnter={() => poi.id && dispatch(setHoveredPOI(poi.id))}
                onMouseLeave={() => dispatch(setHoveredPOI(null))}
              >
                <IconComponent className='text-lg' style={{ color }} />

                {/* Show ripple effect for newly added markers */}
                {poi.id && !animatedPOIs.has(poi.id) && (
                  <MarkerRipple color={statusColor} />
                )}
              </motion.div>
            </AnimatePresence>
          </Marker>

          {popupInfo && popupInfo.id === poi.id && (
            <Popup
              longitude={lng}
              latitude={lat}
              anchor='bottom'
              closeOnClick={false}
              onClose={() => setPopupInfo(null)}
              className='rounded-lg shadow-lg'
            >
              <div className='p-3 max-w-sm'>
                <h3 className='text-lg font-semibold mb-2'>
                  {poi.rupantor.geocoded.address_short}
                </h3>
                <div className='space-y-1 text-sm'>
                  <p>
                    <span className='font-medium'>Area:</span>{' '}
                    {poi.rupantor.geocoded.area}
                  </p>
                  <p>
                    <span className='font-medium'>Road:</span>{' '}
                    {poi.street_road_name_number}
                  </p>
                  <p>
                    <span className='font-medium'>Type:</span>{' '}
                    {poi.rupantor.geocoded.pType}
                  </p>
                  {poi.rupantor.geocoded.postCode && (
                    <p>
                      <span className='font-medium'>Post Code:</span>{' '}
                      {poi.rupantor.geocoded.postCode}
                    </p>
                  )}
                  <p>
                    <span className='font-medium'>Confidence:</span>{' '}
                    {poi.rupantor.confidence_score_percentage}%
                  </p>
                </div>
                <div className='mt-2 pt-2 border-t border-gray-200'>
                  <p className='text-xs text-gray-500'>
                    {poi.rupantor.geocoded.Address}
                  </p>
                </div>
              </div>
            </Popup>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ width, height }} className='relative'>
      {' '}
      <Map
        ref={mapRef}
        mapStyle={mapStyle}
        reuseMaps
        maxZoom={20}
        minZoom={5}
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
          zoom: zoom,
          bearing: 0,
          pitch: 0,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position='top-right' showCompass showZoom />
        {renderPOIs()}
      </Map>
    </div>
  );
};

export default MapComponent;
