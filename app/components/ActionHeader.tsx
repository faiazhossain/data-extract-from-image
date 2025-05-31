'use client';
import React from 'react';
import { BiImageAdd, BiScan } from 'react-icons/bi';
import { FiDownload } from 'react-icons/fi';
import { MdOutlineDragIndicator } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { toggleDragMode } from '../redux/features/poiSlice';

interface ActionHeaderProps {
  onUploadImage: () => void;
  onRunDetection: () => void;
  onSaveToDb: () => void;
  isProcessing?: boolean;
  hasData?: boolean;
}

const ActionHeader: React.FC<ActionHeaderProps> = ({
  onUploadImage,
  onRunDetection,
  onSaveToDb,
  isProcessing = false,
  hasData = false,
}) => {
  const dispatch = useDispatch();
  const isDragModeEnabled = useSelector(
    (state: RootState) => state.poi.isDragModeEnabled
  );
  const hasVerifiedPOIs = useSelector((state: RootState) =>
    state.poi.visiblePOIs.some((poi) => poi.status === 'verified')
  );

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4 shadow-sm'>
      <div className='flex items-center justify-between max-w-[1920px] mx-auto'>
        <div className='flex items-center space-x-2'>
          <h1 className='text-2xl font-bold font-geist-sans tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Image POI Extractor
          </h1>
        </div>

        <div className='flex items-center space-x-4'>
          <button
            onClick={() => dispatch(toggleDragMode())}
            className={`px-4 py-2 ${
              isDragModeEnabled
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } border rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:hover:shadow-none disabled:hover:translate-y-0`}
            disabled={isProcessing || !hasData}
            title={
              !hasData
                ? 'Upload an image to enable drag mode'
                : isDragModeEnabled
                ? 'Click to disable drag mode'
                : 'Click to enable drag mode'
            }
          >
            <MdOutlineDragIndicator
              className={`w-5 h-5 mr-2 transition-colors duration-200 ${
                isDragModeEnabled ? 'text-white' : 'text-gray-600'
              }`}
            />
            <span className='relative'>
              {isDragModeEnabled ? 'Disable' : 'Enable'} Drag
              {isDragModeEnabled && (
                <span className='absolute -top-1 -right-1.5 flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
                </span>
              )}
            </span>
          </button>
          <button
            onClick={onUploadImage}
            className='px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow'
            disabled={isProcessing}
          >
            <BiImageAdd className='w-5 h-5 mr-2 text-gray-600' />
            Upload Image
          </button>
          <button
            onClick={onRunDetection}
            className='px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow'
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <BiScan className='w-5 h-5 mr-2' />
                Run Detection
              </>
            )}
          </button>
          <button
            onClick={onSaveToDb}
            className='px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            disabled={isProcessing || !hasVerifiedPOIs}
            title={
              !hasVerifiedPOIs
                ? 'Verify POIs before exporting'
                : 'Export verified POIs to Excel'
            }
          >
            <FiDownload className='w-5 h-5 mr-2' />
            Export to Excel
            {hasData && !hasVerifiedPOIs && (
              <span className='ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full'>
                Verify First
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default ActionHeader;
