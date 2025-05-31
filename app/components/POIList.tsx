'use client';
import React from 'react';
import Image from 'next/image';
import { POI } from '../types';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import {
  updatePOIStatus,
  selectPOI,
  setHoveredPOI,
  toggleFullImage,
} from '../redux/features/poiSlice';

interface POIListProps {
  onUploadImage: () => void;
  onEdit: (id: string) => void;
}

const POIList: React.FC<POIListProps> = ({ onUploadImage, onEdit }) => {
  const dispatch = useAppDispatch();
  const {
    visiblePOIs,
    selectedPOI,
    hoveredPOI,
    processingImage,
    uploadedImage,
    showFullImage,
  } = useAppSelector((state) => state.poi);
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
    <div className='flex flex-col h-full overflow-hidden bg-gray-50'>
      <h2 className='text-xl font-bold px-6 py-4 bg-white border-b border-gray-200 font-geist-sans tracking-tight'>
        Points of Interest
      </h2>{' '}
      {uploadedImage && (
        <div className='p-4 border-b'>
          <div
            className='relative w-full h-40 cursor-pointer overflow-hidden rounded-lg'
            onClick={() => dispatch(toggleFullImage())}
          >
            <Image
              src={uploadedImage.url}
              alt='Uploaded Image'
              fill
              style={{ objectFit: 'cover' }}
              className='hover:scale-105 transition-transform duration-200'
            />
          </div>
          {uploadedImage.coordinates && (
            <div className='mt-3 text-sm text-gray-600'>
              <p className='font-medium mb-1'>Extracted Coordinates:</p>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='font-medium'>Latitude:</span>{' '}
                  {uploadedImage.coordinates.latitude.toFixed(6)}
                </div>
                <div>
                  <span className='font-medium'>Longitude:</span>{' '}
                  {uploadedImage.coordinates.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showFullImage && uploadedImage && (
        <div
          className='fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4'
          onClick={() => dispatch(toggleFullImage())}
        >
          <div className='relative w-full max-w-4xl h-[80vh]'>
            <Image
              src={uploadedImage.url}
              alt='Full Image'
              fill
              style={{ objectFit: 'contain' }}
              className='rounded-lg'
            />
          </div>
        </div>
      )}
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
                  src='/images/map-placeholder.png'
                  alt='Upload Map Image'
                  width={128}
                  height={128}
                  className='mb-6 text-gray-300'
                />
                <p className='text-gray-600 text-center mb-4'>
                  No points of interest detected yet.
                  <br />
                  Upload an image to begin.
                </p>{' '}
                <button
                  onClick={onUploadImage}
                  className='mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center shadow-md transition-colors duration-150'
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
          <ul className='divide-y divide-gray-200 bg-white'>
            {visiblePOIs.map((poi) => (
              <li
                key={
                  poi.id ||
                  `${poi.rupantor.geocoded.latitude}-${poi.rupantor.geocoded.longitude}`
                }
                className={`p-6 hover:bg-gray-50 transition-all duration-150 ${
                  selectedPOI === poi.id ? 'bg-blue-50/70' : ''
                } ${
                  hoveredPOI === poi.id
                    ? 'bg-blue-50 shadow-md scale-[1.01] transform'
                    : ''
                }`}
                onClick={() => poi.id && handleSelectPOI(poi.id)}
                onMouseEnter={() => poi.id && dispatch(setHoveredPOI(poi.id))}
                onMouseLeave={() => dispatch(setHoveredPOI(null))}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-start'>
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 mr-3 ${getStatusColor(
                          poi.status
                        )}`}
                      ></div>
                      <div>
                        <h3 className='font-medium font-geist-sans text-gray-900 leading-tight flex items-center gap-2'>
                          {' '}
                          {poi.poi_name ||
                            poi.rupantor.geocoded.address_short}{' '}
                          {poi.info?.info?.exist && (
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-600 text-white shadow-md border border-purple-400 animate-pulse gap-1'>
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
                              Existing
                            </span>
                          )}
                        </h3>
                        <div className='space-y-2 mt-3'>
                          <p className='text-sm text-gray-600 flex'>
                            <span className='font-medium w-16'>Area:</span>
                            <span>
                              {poi.rupantor.geocoded.area}
                              {poi.rupantor.geocoded.sub_area &&
                                `, ${poi.rupantor.geocoded.sub_area}`}
                            </span>
                          </p>
                          <p className='text-sm text-gray-600 flex'>
                            <span className='font-medium w-16'>Road:</span>
                            <span>
                              {poi.rupantor.geocoded.road_name_number}
                            </span>
                          </p>
                          <p className='text-sm text-gray-600 flex'>
                            <span className='font-medium w-16'>Type:</span>
                            <span>{poi.rupantor.geocoded.pType}</span>
                          </p>
                          {poi.rupantor.geocoded.postCode && (
                            <p className='text-sm text-gray-600 flex'>
                              <span className='font-medium w-16'>Post:</span>
                              <span>{poi.rupantor.geocoded.postCode}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>{' '}
                  </div>{' '}
                  <div className='flex space-x-2 mt-4'>
                    {!poi.info?.info?.exist &&
                      poi.status !== 'verified' &&
                      poi.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(poi.id!);
                          }}
                          className='p-1.5 bg-green-50 hover:bg-green-100 rounded-md text-green-600 text-xs transition-colors duration-150'
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
                    {!poi.info?.info?.exist &&
                      poi.status !== 'rejected' &&
                      poi.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(poi.id!);
                          }}
                          className='p-1.5 bg-red-50 hover:bg-red-100 rounded-md text-red-600 text-xs transition-colors duration-150'
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
                    {(!poi.info?.info?.exist || poi.status === 'verified') &&
                      poi.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(poi.id!);
                          }}
                          className='p-1.5 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-600 text-xs transition-colors duration-150'
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
