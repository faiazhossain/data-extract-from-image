'use client';
import React from 'react';

interface ActionHeaderProps {
  onUploadImage: () => void;
  onRunDetection: () => void;
  onSaveToDb: () => void;
  isProcessing?: boolean;
}

const ActionHeader: React.FC<ActionHeaderProps> = ({
  onUploadImage,
  onRunDetection,
  onSaveToDb,
  isProcessing = false,
}) => {
  return (
    <header className='bg-white border-b border-gray-200 px-4 py-3'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Image POI Extractor</h1>

        <div className='flex space-x-3'>
          <button
            onClick={onUploadImage}
            className='px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium flex items-center'
            disabled={isProcessing}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1.5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              />
            </svg>
            Upload Image
          </button>

          <button
            onClick={onRunDetection}
            className='px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center'
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1.5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
                    clipRule='evenodd'
                  />
                </svg>
                Run Detection
              </>
            )}
          </button>

          <button
            onClick={onSaveToDb}
            className='px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center'
            disabled={isProcessing}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1.5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z' />
            </svg>
            Save to DB
          </button>
        </div>
      </div>
    </header>
  );
};

export default ActionHeader;
