'use client';
import * as React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Explicitly import styles again to ensure they're loaded
import '../maplibre-fix.css';

// Define the POI type
interface POI {
  id: string;
  name: string;
  category: string;
  confidence: number;
  latitude: number;
  longitude: number;
  status: 'ai' | 'verified' | 'rejected'; // 'ai' = yellow, 'verified' = green, 'rejected' = red
}

interface MapComponentProps {
  width?: number | string;
  height?: number | string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  mapStyle?: string;
  pois?: POI[];
  onSelectPOI?: (poi: POI) => void;
}

const MapComponent = ({
  width = 600,
  height = 400,
  latitude = 23.82229,
  longitude = 90.38367,
  zoom = 14,
  mapStyle = 'https://map.barikoi.com/styles/osm_barikoi_v2/style.json?key=NDE2NzpVNzkyTE5UMUoy',
  pois = [],
  onSelectPOI,
}: MapComponentProps) => {  const [showSatellite, setShowSatellite] = React.useState(false);
  // Use a ref to store the map instance
  const mapRef = React.useRef<any>(null);
  
  // Effect to toggle satellite layer when showSatellite changes
  React.useEffect(() => {
    if (mapRef.current) {
      console.log('Map is available, satellite toggle:', showSatellite);
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
  return (
    <div className='relative' style={{ width: width, height: height }}>      <Map
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
        <NavigationControl position='top-right' />

        {/* POI Markers */}
        {pois.map((poi) => (
          <Marker
            key={poi.id}
            longitude={poi.longitude}
            latitude={poi.latitude}
            anchor='bottom'
            onClick={() => onSelectPOI && onSelectPOI(poi)}
          >
            <div
              className='w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform'
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
