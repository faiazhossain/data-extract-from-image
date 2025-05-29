'use client';
import * as React from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapComponentProps {
  width?: number | string;
  height?: number | string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  mapStyle?: string;
}

const MapComponent = ({
  width = 600,
  height = 400,
  latitude = 37.8,
  longitude = -122.4,
  zoom = 14,
  mapStyle = 'https://map.barikoi.com/styles/osm_barikoi_v2/style.json?key=NDE2NzpVNzkyTE5UMUoy',
}: MapComponentProps) => {
  return (
    <Map
      initialViewState={{
        longitude,
        latitude,
        zoom,
      }}
      style={{ width, height }}
      mapStyle={mapStyle}
    />
  );
};

export default MapComponent;
