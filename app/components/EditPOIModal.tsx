'use client';
import React, { useState, useEffect } from 'react';
import { POI } from '../types';

interface EditPOIModalProps {
  poi: POI | null;
  onClose: () => void;
  onSave: (updatedPOI: POI) => void;
}

interface EditFormData {
  street_road_name_number: string;
  area: string;
  sub_area: string;
  pType: string;
  address_short: string;
  latitude: string;
  longitude: string;
  postCode: number;
}

const EditPOIModal: React.FC<EditPOIModalProps> = ({
  poi,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    street_road_name_number: '',
    area: '',
    sub_area: '',
    pType: '',
    address_short: '',
    latitude: '',
    longitude: '',
    postCode: 0,
  });

  useEffect(() => {
    if (poi) {
      setFormData({
        street_road_name_number: poi.street_road_name_number || '',
        area: poi.rupantor.geocoded.area || '',
        sub_area: poi.rupantor.geocoded.sub_area || '',
        pType: poi.rupantor.geocoded.pType || '',
        address_short: poi.rupantor.geocoded.address_short || '',
        latitude: poi.rupantor.geocoded.latitude || '',
        longitude: poi.rupantor.geocoded.longitude || '',
        postCode: poi.rupantor.geocoded.postCode || 0,
      });
    }
  }, [poi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'postCode' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (poi) {
      const updatedPOI: POI = {
        ...poi,
        street_road_name_number: formData.street_road_name_number,
        rupantor: {
          ...poi.rupantor,
          geocoded: {
            ...poi.rupantor.geocoded,
            area: formData.area,
            sub_area: formData.sub_area,
            pType: formData.pType,
            address_short: formData.address_short,
            latitude: formData.latitude,
            longitude: formData.longitude,
            postCode: formData.postCode,
            Address: `${formData.address_short}, ${formData.area}, ${formData.sub_area}`,
          },
        },
        status: 'verified', // Set status to verified when manually edited
      };
      onSave(updatedPOI);
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
                htmlFor='address_short'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Short Address
              </label>
              <input
                type='text'
                id='address_short'
                name='address_short'
                value={formData.address_short}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div>
              <label
                htmlFor='street_road_name_number'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Road Name/Number
              </label>
              <input
                type='text'
                id='street_road_name_number'
                name='street_road_name_number'
                value={formData.street_road_name_number}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='area'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Area
                </label>
                <input
                  type='text'
                  id='area'
                  name='area'
                  value={formData.area}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='sub_area'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Sub Area
                </label>
                <input
                  type='text'
                  id='sub_area'
                  name='sub_area'
                  value={formData.sub_area}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
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

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='pType'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Property Type
                </label>
                <select
                  id='pType'
                  name='pType'
                  value={formData.pType}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                >
                  <option value=''>Select type...</option>
                  <option value='Residential'>Residential</option>
                  <option value='Commercial'>Commercial</option>
                  <option value='Office'>Office</option>
                  <option value='Healthcare'>Healthcare</option>
                  <option value='Education'>Education</option>
                  <option value='Restaurant'>Restaurant</option>
                  <option value='Shopping'>Shopping</option>
                  <option value='Transportation'>Transportation</option>
                  <option value='Recreation'>Recreation</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='postCode'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Post Code
                </label>
                <input
                  type='number'
                  id='postCode'
                  name='postCode'
                  value={formData.postCode}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
