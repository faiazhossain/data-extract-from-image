'use client';
import * as React from 'react';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';

// Explicitly import styles
import '../maplibre-fix.css';
import '../marker-styles.css';

// Import types
import { POI } from '../types';
import { useAppSelector } from '../redux/hooks';
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
  const { visiblePOIs, selectedPOI } = useAppSelector((state) => state.poi);
  const [showSatellite, setShowSatellite] = React.useState(false);
  // Use a ref to store the map instance
  const mapRef = React.useRef<MapRef>(null);

  // Effect to toggle satellite layer when showSatellite changes
  React.useEffect(() => {
    if (mapRef.current && mapRef.current.getMap) {
      const map = mapRef.current.getMap();
      if (map.isStyleLoaded()) {
        if (showSatellite) {
          // This would be replaced with actual satellite imagery in production
          // Here we're just changing the background color to simulate the effect
          map.setPaintProperty('background', 'background-color', '#143d6b');
        } else {
          map.setPaintProperty('background', 'background-color', '#ffffff');
        }
      }
    }
  }, [showSatellite]);
  // Status to color mapping
  const getMarkerColor = (status: POI['status']) => {
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
  // Track newly added POIs for animation
  const [animatedPOIs, setAnimatedPOIs] = React.useState<Set<string>>(
    new Set()
  );

  // Function to calculate animation delay based on index for staggered animation
  const getAnimationDelay = (poiId: string) => {
    const index = visiblePOIs.findIndex((poi) => poi.id === poiId);
    return index * 0.15; // 150ms delay between each marker's animation
  };

  // Keep track of which POIs have been animated
  React.useEffect(() => {
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
        mapStyle={mapStyle}
      >
        {/* Navigation Controls */}
        <NavigationControl position='top-right' /> {/* POI Markers */}
        {visiblePOIs.map((poi: POI) => (
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
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg marker-container marker-${
                  poi.status
                } ${
                  selectedPOI === poi.id
                    ? 'ring-3 ring-blue-500 ring-opacity-75'
                    : ''
                }`}
                style={{
                  backgroundColor: getMarkerColor(poi.status),
                  position: 'relative',
                }}
              >
                {/* Marker shadow for depth perception */}
                <motion.div
                  className='marker-shadow'
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  transition={{ delay: getAnimationDelay(poi.id) + 0.1 }}
                />
                <motion.span
                  className='text-xs text-white font-bold'
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: getAnimationDelay(poi.id) + 0.3 }}
                >
                  POI
                </motion.span>
                {/* Show ripple effect for newly added markers */}
                {!animatedPOIs.has(poi.id) && (
                  <MarkerRipple color={getMarkerColor(poi.status)} />
                )}
                {/* Show indicator for selected POI */}
                {selectedPOI === poi.id && (
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
        ))}
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
