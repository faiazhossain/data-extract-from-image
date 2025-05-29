'use client';
import React from 'react';

// Using same POI interface as in MapComponent
interface POI {
  id: string;
  name: string;
  category: string;
  confidence: number;
  latitude: number;
  longitude: number;
  status: 'ai' | 'verified' | 'rejected';
}

interface POIListProps {
  pois: POI[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  selectedPOI?: string | null;
}

const POIList: React.FC<POIListProps> = ({
  pois,
  onAccept,
  onReject,
  onEdit,
  selectedPOI,
}) => {
  // Status to color mapping
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

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <h2 className='text-xl font-bold px-4 py-3 border-b'>
        Points of Interest
      </h2>

      <div className='flex-1 overflow-y-auto'>
        {pois.length === 0 ? (
          <div className='h-full flex items-center justify-center text-gray-400'>
            No POIs found. Upload an image and run detection.
          </div>
        ) : (
          <ul className='divide-y'>
            {pois.map((poi) => (
              <li
                key={poi.id}
                className={`p-4 hover:bg-gray-50 ${
                  selectedPOI === poi.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center'>
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                          poi.status
                        )}`}
                      ></div>
                      <h3 className='font-medium'>{poi.name}</h3>
                    </div>
                    <p className='text-sm text-gray-600 mt-1'>{poi.category}</p>
                    <div className='mt-1 text-xs text-gray-500'>
                      <span className='font-medium'>Confidence: </span>
                      <span>{(poi.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className='flex space-x-1'>
                    {poi.status !== 'verified' && (
                      <button
                        onClick={() => onAccept(poi.id)}
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
                    {poi.status !== 'rejected' && (
                      <button
                        onClick={() => onReject(poi.id)}
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
                    <button
                      onClick={() => onEdit(poi.id)}
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
