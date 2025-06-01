"use client";
import React from "react";
import { BiUpload } from "react-icons/bi";
import { MdOutlineDragIndicator } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { toggleDragMode } from "../redux/features/markerSlice";

interface SimpleHeaderProps {
  onUploadClick: () => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({ onUploadClick }) => {
  const dispatch = useAppDispatch();
  const { isDragModeEnabled, markers } = useAppSelector(
    (state) => state.marker
  );
  const hasMarkers = markers.length > 0;

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>CSV Map Marker</h1>
          <p className='text-sm text-gray-500'>
            Upload CSV, plot markers, and drag to update coordinates
          </p>
        </div>

        <div className='flex items-center space-x-4'>
          <button
            onClick={() => dispatch(toggleDragMode())}
            className={`px-4 py-2 ${
              isDragModeEnabled
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border-gray-300"
            } border rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!hasMarkers}
            title={!hasMarkers ? "Upload markers first" : "Toggle drag mode"}
          >
            <MdOutlineDragIndicator className='w-5 h-5 mr-2' />
            {isDragModeEnabled ? "Disable" : "Enable"} Drag
            {isDragModeEnabled && (
              <span className='absolute -top-1 -right-1 flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
              </span>
            )}
          </button>

          <button
            onClick={onUploadClick}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:shadow-md'
          >
            <BiUpload className='w-5 h-5 mr-2' />
            Upload CSV
          </button>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
