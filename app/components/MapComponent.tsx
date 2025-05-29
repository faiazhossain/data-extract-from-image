'use client';
import * as React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Explicitly import styles again to ensure they're loaded
import '../maplibre-fix.css';

// Import types
import { POI } from '../types';
import { useAppSelector } from '../redux/hooks';

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
  const mapRef = React.useRef<any>(null);

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

  // Animation for POI markers
  const [markerAnimation, setMarkerAnimation] = React.useState<{
    [key: string]: boolean;
  }>({});

  // Trigger animation for newly added POIs
  React.useEffect(() => {
    visiblePOIs.forEach((poi) => {
      if (!markerAnimation[poi.id]) {
        setMarkerAnimation((prev) => ({ ...prev, [poi.id]: true }));

        // Reset animation after it plays
        setTimeout(() => {
          setMarkerAnimation((prev) => ({ ...prev, [poi.id]: false }));
        }, 1000);
      }
    });
  }, [visiblePOIs, markerAnimation]);

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
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transform transition-all duration-500 ${
                markerAnimation[poi.id]
                  ? 'scale-150 animate-bounce shadow-lg'
                  : 'hover:scale-110'
              } ${selectedPOI === poi.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: getMarkerColor(poi.status) }}
            >
              <span className='text-xs text-white font-bold'>P</span>
            </div>
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
