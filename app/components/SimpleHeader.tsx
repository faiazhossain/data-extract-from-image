"use client";
import React from "react";
import { BiUpload } from "react-icons/bi";
import { MdOutlineDragIndicator } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { toggleDragMode } from "../redux/features/markerSlice";

interface SimpleHeaderProps {
  onUploadClick: () => void;
  onExportClick: () => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  onUploadClick,
  onExportClick,
}) => {
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

          <button
            onClick={onExportClick}
            disabled={!hasMarkers}
            className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
            title={!hasMarkers ? "Upload markers first" : "Export marker data"}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
            Export Data
          </button>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
