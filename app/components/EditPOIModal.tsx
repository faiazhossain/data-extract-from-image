'use client';
import React, { useState, useEffect } from 'react';
import { POI } from '../types';

interface EditPOIModalProps {
  poi: POI | null;
  onClose: () => void;
  onSave: (updatedPOI: POI) => void;
}

const EditPOIModal: React.FC<EditPOIModalProps> = ({
  poi,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<POI>>({
    name: '',
    category: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (poi) {
      setFormData({
        name: poi.name,
        category: poi.category,
        latitude: poi.latitude,
        longitude: poi.longitude,
      });
    }
  }, [poi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'latitude' || name === 'longitude' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (poi) {
      onSave({
        ...poi,
        ...formData,
        status: 'verified', // Set status to verified when manually edited
      });
    }
  };

  if (!poi) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-bold text-gray-900'>
            Edit Point of Interest
          </h3>
        </div>

        <form onSubmit={handleSubmit} className='px-6 py-4'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Category
              </label>
              <input
                type='text'
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='latitude'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Latitude
                </label>
                <input
                  type='number'
                  step='any'
                  id='latitude'
                  name='latitude'
                  value={formData.latitude}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='longitude'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Longitude
                </label>
                <input
                  type='number'
                  step='any'
                  id='longitude'
                  name='longitude'
                  value={formData.longitude}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPOIModal;
