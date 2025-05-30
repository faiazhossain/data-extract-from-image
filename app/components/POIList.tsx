'use client';
import React from 'react';
import Image from 'next/image';
import { POI } from '../types';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
  updatePOIStatus,
  selectPOI,
  setHoveredPOI,
} from '../redux/features/poiSlice';

interface POIListProps {
  onUploadImage: () => void;
  onEdit: (id: string) => void;
}

const POIList: React.FC<POIListProps> = ({ onUploadImage, onEdit }) => {
  const dispatch = useAppDispatch();
  const { visiblePOIs, selectedPOI, hoveredPOI, processingImage } =
    useAppSelector((state) => state.poi);

  const getStatusColor = (status: POI['status']) => {
    switch (status) {
      case 'ai':
        return 'bg-yellow-400'; // Yellow
      case 'verified':
        return 'bg-green-500'; // Green
      case 'rejected':
        return 'bg-red-500'; // Red
      default:
        return 'bg-yellow-400'; // Default yellow
    }
  };

  const handleAccept = (id: string) => {
    dispatch(updatePOIStatus({ id, status: 'verified' }));
  };

  const handleReject = (id: string) => {
    dispatch(updatePOIStatus({ id, status: 'rejected' }));
  };

  const handleSelectPOI = (id: string) => {
    dispatch(selectPOI(id === selectedPOI ? null : id));
  };

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <h2 className='text-xl font-bold px-4 py-3 border-b'>
        Points of Interest
      </h2>

      <div className='flex-1 overflow-y-auto'>
        {visiblePOIs.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center p-6'>
            {processingImage ? (
              <div className='flex flex-col items-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
                <p className='text-gray-600'>Processing image...</p>
              </div>
            ) : (
              <>
                <Image
                  src='/placeholder-map.svg'
                  alt='Upload Map Image'
                  width={128}
                  height={128}
                  className='mb-6 text-gray-300'
                />
                <p className='text-gray-600 text-center mb-4'>
                  No points of interest detected yet.
                  <br />
                  Upload an image to begin.
                </p>
                <button
                  onClick={onUploadImage}
                  className='mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2'
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
              </>
            )}
          </div>
        ) : (
          <ul className='divide-y'>
            {visiblePOIs.map((poi) => (
              <li
                key={
                  poi.id ||
                  `${poi.rupantor.geocoded.latitude}-${poi.rupantor.geocoded.longitude}`
                }
                className={`p-4 hover:bg-gray-50 transition-all duration-150 ${
                  selectedPOI === poi.id ? 'bg-blue-50' : ''
                } ${
                  hoveredPOI === poi.id
                    ? 'bg-blue-100 shadow-md scale-[1.01] transform'
                    : ''
                }`}
                onClick={() => poi.id && handleSelectPOI(poi.id)}
                onMouseEnter={() => poi.id && dispatch(setHoveredPOI(poi.id))}
                onMouseLeave={() => dispatch(setHoveredPOI(null))}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                          poi.status
                        )}`}
                      ></div>
                      <h3 className='font-medium'>
                        {poi.rupantor.geocoded.address_short}
                      </h3>
                    </div>
                    <div className='space-y-1 mt-2'>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>Area:</span>{' '}
                        {poi.rupantor.geocoded.area},{' '}
                        {poi.rupantor.geocoded.sub_area}
                      </p>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>Road:</span>{' '}
                        {poi.street_road_name_number}
                      </p>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>Type:</span>{' '}
                        {poi.rupantor.geocoded.pType}
                      </p>
                    </div>
                    <div className='mt-2 text-xs text-gray-500'>
                      <span className='font-medium'>Confidence: </span>
                      <span>{poi.rupantor.confidence_score_percentage}%</span>
                    </div>
                    <div className='mt-1 text-xs text-gray-400'>
                      {poi.rupantor.geocoded.postCode && (
                        <span>
                          Post Code: {poi.rupantor.geocoded.postCode} •{' '}
                        </span>
                      )}
                      <span>uCode: {poi.rupantor.geocoded.uCode}</span>
                    </div>
                  </div>

                  <div className='flex space-x-1'>
                    {poi.status !== 'verified' && poi.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(poi.id!);
                        }}
                        className='p-1 bg-green-100 hover:bg-green-200 rounded text-green-700 text-xs'
                        title='Accept'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    )}
                    {poi.status !== 'rejected' && poi.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(poi.id!);
                        }}
                        className='p-1 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs'
                        title='Reject'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    )}
                    {poi.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(poi.id!);
                        }}
                        className='p-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-xs'
                        title='Edit'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default POIList;
