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
import { FaLockOpen } from 'react-icons/fa';

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
import { getReverseGeocode } from '../services/barikoiService';
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

const getIconForCategory = (category?: string) => {
  if (!category) return { component: FaMapMarkerAlt, color: '#555555' };

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

// Status color mapping
const getStatusColor = (status: POI['status']) => {
  switch (status) {
    case 'ai':
      return '#FFCC00'; // Yellow
    case 'verified':
      return '#22C55E'; // Green
    case 'edited':
      return '#6366F1'; // Indigo
    case 'rejected':
      return '#EF4444'; // Red
    default:
      return '#FFCC00'; // Default yellow
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
  const mapRef = useRef<MapRef>(null);
  const dispatch = useAppDispatch();
  const { visiblePOIs, selectedPOI, hoveredPOI, isDragModeEnabled } =
    useAppSelector((state: RootState) => state.poi);
  const [popupInfo, setPopupInfo] = useState<POI | null>(null);
  const [draggedPOI, setDraggedPOI] = useState<POI | null>(null);

  // Handle marker drag start
  const handleDragStart = (poi: POI) => {
    if (!isDragModeEnabled) return;
    setDraggedPOI(poi);
  };

  const handleDragEnd = async (e: MarkerDragEvent, poi: POI) => {
    if (!isDragModeEnabled) return;

    try {
      // Get the reverse geocoding data for the new location
      const geoData = await getReverseGeocode(e.lngLat.lat, e.lngLat.lng);

      const updatedPoi = {
        ...poi,
        rupantor: {
          ...poi.rupantor,
          geocoded: {
            ...poi.rupantor.geocoded,
            latitude: e.lngLat.lat.toString(),
            longitude: e.lngLat.lng.toString(),
            // Update address info from reverse geocoding
            area: geoData.place.area || poi.rupantor.geocoded.area,
            sub_area:
              geoData.place.sub_district || poi.rupantor.geocoded.sub_area,
            address: geoData.place.address || poi.rupantor.geocoded.Address,
            Address: geoData.place.address || poi.rupantor.geocoded.Address,
            address_short:
              geoData.place.location_type && geoData.place.address
                ? `${geoData.place.location_type} - ${geoData.place.address}`
                : geoData.place.address || poi.rupantor.geocoded.address_short,
            city: geoData.place.city || poi.rupantor.geocoded.city,
            district: geoData.place.district || poi.rupantor.geocoded.district,
            thana: geoData.place.thana || poi.rupantor.geocoded.thana,
            postCode: geoData.place.postCode
              ? parseInt(geoData.place.postCode)
              : poi.rupantor.geocoded.postCode,
            road_name_number:
              geoData.place.address_components.road ||
              poi.rupantor.geocoded.road_name_number,
            pType: geoData.place.location_type || poi.rupantor.geocoded.pType,
            address_bn:
              geoData.place.bangla?.address || poi.rupantor.geocoded.address_bn,
            unions: geoData.place.union || poi.rupantor.geocoded.unions,
          },
        },
        location: {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        },
        status: 'edited' as POI['status'],
      };

      dispatch(updatePOI(updatedPoi));
    } catch (error) {
      console.error('Error fetching reverse geocode:', error);
      // If reverse geocoding fails, just update the coordinates
      const updatedPoi = {
        ...poi,
        rupantor: {
          ...poi.rupantor,
          geocoded: {
            ...poi.rupantor.geocoded,
            latitude: e.lngLat.lat.toString(),
            longitude: e.lngLat.lng.toString(),
          },
        },
        location: {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        },
        status: 'edited' as POI['status'],
      };
      dispatch(updatePOI(updatedPoi));
    } finally {
      setDraggedPOI(null);
    }
  };

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
      const isDragging = draggedPOI?.id === poi.id;
      const { component: IconComponent, color } = getIconForCategory(
        poi.rupantor.geocoded.pType.toLowerCase()
      );

      const lat = parseFloat(poi.rupantor.geocoded.latitude);
      const lng = parseFloat(poi.rupantor.geocoded.longitude);
      const statusColor = getStatusColor(poi.status || 'ai');

      return (
        <React.Fragment key={poi.id || `${lat}-${lng}`}>
          <Marker
            longitude={lng}
            latitude={lat}
            anchor='bottom'
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if (!isDragging) {
                setPopupInfo(poi);
                if (onSelectPOI) {
                  onSelectPOI(poi);
                }
              }
            }}
            draggable={isDragModeEnabled && !poi.info?.info?.exist}
            onDragStart={() => handleDragStart(poi)}
            onDragEnd={(event) => handleDragEnd(event, poi)}
          >
            <AnimatePresence>
              <motion.div
                initial={{ y: -100, opacity: 0, scale: 0.3 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: isDragging ? 1.3 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: poi.id ? getAnimationDelay(poi.id) : 0,
                  duration: 0.8,
                }}
                whileHover={{
                  scale: isDragModeEnabled ? 1.3 : 1.2,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-${
                  isDragModeEnabled ? 'move' : 'pointer'
                } shadow-lg marker-container group transition-all duration-150 ${
                  isSelected ? 'ring-3 ring-blue-500 ring-opacity-75' : ''
                } ${isHovered ? 'scale-110 shadow-xl' : ''} ${
                  isDragModeEnabled ? 'hover:shadow-2xl' : ''
                }`}
                style={{
                  backgroundColor: 'white',
                  border: `${
                    isHovered || isDragging ? 4 : 3
                  }px solid ${statusColor}`,
                  position: 'relative',
                }}
                onMouseEnter={() => poi.id && dispatch(setHoveredPOI(poi.id))}
                onMouseLeave={() => dispatch(setHoveredPOI(null))}
              >
                <IconComponent
                  className={`text-lg transition-transform ${
                    isDragModeEnabled ? 'transform group-hover:scale-110' : ''
                  }`}
                  style={{ color }}
                />{' '}
                {isDragModeEnabled && !isDragging && !poi.info?.info?.exist && (
                  <div className='absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity'>
                    <FaLockOpen className='w-3 h-3 inline-block mr-1' />
                    Draggable
                  </div>
                )}
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
              offset={[0, -40]}
            >
              <div className='p-3 max-w-sm'>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='text-lg font-semibold'>
                    {poi.poi_name || poi.rupantor.geocoded.address_short}
                  </h3>
                  {poi.info?.info?.exist && (
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                      Existing
                    </span>
                  )}
                </div>
                <div className='space-y-1 text-sm'>
                  {poi.rupantor.geocoded.area && (
                    <p>
                      <span className='font-medium'>Area:</span>{' '}
                      {poi.rupantor.geocoded.area}
                      {poi.rupantor.geocoded.sub_area &&
                        `, ${poi.rupantor.geocoded.sub_area}`}
                    </p>
                  )}
                  {poi.rupantor.geocoded.road_name_number && (
                    <p>
                      <span className='font-medium'>Road:</span>{' '}
                      {poi.rupantor.geocoded.road_name_number}
                      {poi.rupantor.geocoded.holding_number &&
                        ` (${poi.rupantor.geocoded.holding_number})`}
                    </p>
                  )}
                  {poi.rupantor.geocoded.pType && (
                    <p>
                      <span className='font-medium'>Type:</span>{' '}
                      {poi.rupantor.geocoded.pType}
                    </p>
                  )}
                  {poi.rupantor.geocoded.postCode && (
                    <p>
                      <span className='font-medium'>Post Code:</span>{' '}
                      {poi.rupantor.geocoded.postCode}
                    </p>
                  )}
                  <p>
                    <span className='font-medium'>Status:</span>{' '}
                    <span
                      className={`${
                        poi.status === 'verified'
                          ? 'text-green-600'
                          : poi.status === 'edited'
                          ? 'text-blue-600'
                          : poi.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {poi.status || 'ai'}
                    </span>
                  </p>
                </div>
                <div className='mt-2 pt-2 border-t border-gray-200'>
                  <p className='text-xs text-gray-500'>
                    {poi.rupantor.geocoded.Address}
                  </p>
                </div>{' '}
                {isDragModeEnabled && (
                  <div className='mt-2 pt-2 border-t border-gray-200'>
                    <p className='text-xs text-blue-600'>
                      <FaLockOpen className='w-3 h-3 inline-block mr-1' />
                      {poi.info?.info?.exist
                        ? 'This is an existing POI and cannot be moved'
                        : 'Drag mode enabled - Click and drag to move marker'}
                    </p>
                  </div>
                )}
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
