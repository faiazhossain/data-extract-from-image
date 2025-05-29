'use client';
import * as React from 'react';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

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
import { setHoveredPOI } from '../redux/features/poiSlice';
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
  mapStyle = 'https://map.barikoi.com/styles/osm_barikoi_v2/style.json?key=NDE2NzpVNzkyTE5UMUoy',
  onSelectPOI,
}: MapComponentProps) => {
  // Get POIs from Redux store
  const dispatch = useAppDispatch();
  const { visiblePOIs, selectedPOI, hoveredPOI } = useAppSelector(
    (state) => state.poi
  );
  const [showSatellite, setShowSatellite] = useState(false);

  // Use a ref to store the map instance
  const mapRef = useRef<MapRef>(null);

  // Store the current map style based on satellite toggle
  const currentMapStyle = showSatellite
    ? 'https://api.maptiler.com/maps/dfa2a215-243b-4b69-87ef-ce275b09249c/style.json?key=ASrfqapsZfy4BRFJJdVy'
    : mapStyle;

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
      const newPOIs = visiblePOIs.filter((poi) => !animatedPOIs.has(poi.id));

      if (newPOIs.length > 0) {
        const newAnimatedPOIs = new Set(animatedPOIs);
        newPOIs.forEach((poi) => newAnimatedPOIs.add(poi.id));
        setAnimatedPOIs(newAnimatedPOIs);
      }
    }
  }, [visiblePOIs, animatedPOIs]);
  // Create a complete solution with custom icon rendering for each POI type
  const renderPOIs = () => {
    return visiblePOIs.map((poi: POI) => {
      const isSelected = selectedPOI === poi.id;
      const isHovered = hoveredPOI === poi.id;
      const { component: IconComponent, color } = getIconForCategory(
        poi.category
      );
      const statusColor = getStatusColor(poi.status);
      return (
        <Marker
          key={poi.id}
          longitude={poi.longitude}
          latitude={poi.latitude}
          anchor='bottom'
          onClick={() => onSelectPOI && onSelectPOI(poi)}
        >
          <AnimatePresence>
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.3 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: getAnimationDelay(poi.id),
                duration: 0.8,
              }}
              whileHover={{
                scale: 1.2,
                y: -5, // Lift the marker slightly on hover
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
              onMouseEnter={() => dispatch(setHoveredPOI(poi.id))}
              onMouseLeave={() => dispatch(setHoveredPOI(null))}
            >
              {/* Icon for the POI type */}
              <IconComponent className='text-lg' style={{ color }} />

              {/* Show ripple effect for newly added markers */}
              {!animatedPOIs.has(poi.id) && (
                <MarkerRipple color={statusColor} />
              )}

              {/* Show indicator for selected POI */}
              {isSelected && (
                <motion.div
                  className='absolute -bottom-1 w-3 h-3 bg-blue-500 rounded-full'
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Marker>
      );
    });
  };

  return (
    <div className='relative' style={{ width: width, height: height }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude,
          latitude,
          zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={currentMapStyle}
      >
        {/* Navigation Controls */}
        <NavigationControl position='top-right' />

        {/* POI Markers */}
        {renderPOIs()}
      </Map>

      {/* Satellite Toggle */}
      <div className='absolute top-3 left-3 bg-white rounded-md shadow-md p-2'>
        <label className='inline-flex items-center cursor-pointer'>
          <input
            type='checkbox'
            className='sr-only peer'
            checked={showSatellite}
            onChange={() => setShowSatellite(!showSatellite)}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className='ms-3 text-sm font-medium text-gray-900'>
            Satellite
          </span>
        </label>
      </div>
    </div>
  );
};

export default MapComponent;
