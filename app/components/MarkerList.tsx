"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  setSelectedMarker,
  setHoveredMarker,
} from "../redux/features/markerSlice";
import { FaMapMarkerAlt } from "react-icons/fa";

const MarkerList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { markers, selectedMarkerId, hoveredMarkerId, isDragModeEnabled } =
    useAppSelector((state) => state.marker);

  const handleSelectMarker = (id: string) => {
    dispatch(setSelectedMarker(id === selectedMarkerId ? null : id));
  };

  return (
    <div className='flex flex-col h-full overflow-hidden bg-gray-50'>
      <h2 className='text-xl font-bold px-6 py-4 bg-white border-b border-gray-200'>
        Markers List
        <span className='ml-2 text-sm text-gray-500'>({markers.length})</span>
      </h2>

      <div className='flex-1 overflow-y-auto'>
        {markers.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center p-6'>
            <div className='text-gray-400 mb-4'>
              <FaMapMarkerAlt className='w-12 h-12 mx-auto' />
            </div>
            <p className='text-gray-600 text-center mb-4'>
              No markers available yet.
              <br />
              Upload a CSV file to plot markers.
            </p>
          </div>
        ) : (
          <div>
            <div className='px-6 py-3 bg-gray-100 border-b border-gray-200'>
              <div className='text-sm font-medium text-gray-700'>
                Total markers: {markers.length}
              </div>
            </div>

            <ul className='divide-y divide-gray-200'>
              {markers.map((marker) => (
                <li
                  key={marker.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    selectedMarkerId === marker.id ? "bg-blue-50" : ""
                  } ${hoveredMarkerId === marker.id ? "bg-blue-50/70" : ""}`}
                  onClick={() => handleSelectMarker(marker.id)}
                  onMouseEnter={() => dispatch(setHoveredMarker(marker.id))}
                  onMouseLeave={() => dispatch(setHoveredMarker(null))}
                >
                  <div className='flex items-start'>
                    <div
                      className={`mt-1 text-red-500 ${
                        isDragModeEnabled ? "animate-bounce" : ""
                      }`}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div className='ml-3 flex-1'>
                      <p className='font-medium text-gray-900'>
                        {marker.name || "Unnamed Location"}
                      </p>
                      <div className='mt-1 text-sm text-gray-600 space-y-1'>
                        <p className='flex'>
                          <span className='font-medium w-16'>Lat:</span>
                          <span
                            className={`${
                              isDragModeEnabled ? "text-blue-600" : ""
                            }`}
                          >
                            {marker.latitude.toFixed(6)}
                          </span>
                        </p>
                        <p className='flex'>
                          <span className='font-medium w-16'>Lng:</span>
                          <span
                            className={`${
                              isDragModeEnabled ? "text-blue-600" : ""
                            }`}
                          >
                            {marker.longitude.toFixed(6)}
                          </span>
                        </p>
                        {marker.contactNo && (
                          <p className='flex'>
                            <span className='font-medium w-16'>Contact:</span>
                            <span>{marker.contactNo}</span>
                          </p>
                        )}
                      </div>
                      {marker.serviceType && (
                        <span className='inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                          {marker.serviceType}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkerList;
