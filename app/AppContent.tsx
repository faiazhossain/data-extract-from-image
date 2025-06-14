'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { store } from './redux/store';
import {
  processImageData,
  addVisiblePOI,
  updatePOI,
  saveToDatabase,
  resetVisiblePOIs,
} from './redux/features/poiSlice';
import MapComponent from './components/MapComponent';
import POIList from './components/POIList';
import ActionHeader from './components/ActionHeader';
import EditPOIModal from './components/EditPOIModal';
import UploadModal from './components/UploadModal';
import { POI } from './types';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { pois, visiblePOIs, processingImage } = useAppSelector(
    (state) => state.poi
  );
  // Check if there are any POIs available (for drag mode)
  const hasAnyPOIs = visiblePOIs.length > 0;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | null>(null);

  // Animation for gradual POI appearance
  useEffect(() => {
    if (
      pois.length > 0 &&
      pois.length > visiblePOIs.length &&
      !processingImage
    ) {
      const nextIndex = visiblePOIs.length;
      if (nextIndex < pois.length) {
        // Add POIs one by one with delay for animation
        const timer = setTimeout(() => {
          dispatch(addVisiblePOI(pois[nextIndex]));
        }, 300); // Delay between each POI appearance

        return () => clearTimeout(timer);
      }
    }
  }, [pois, visiblePOIs, processingImage, dispatch]);

  const handleUploadImage = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };
  const handleProcessImage = (file: File) => {
    // Reset visible POIs before processing new image
    dispatch(resetVisiblePOIs());
    // Get coordinates from uploaded image state
    const { uploadedImage } = store.getState().poi;
    // Process the image with coordinates if available
    dispatch(
      processImageData({
        file,
        coordinates: uploadedImage?.coordinates,
      })
    );
  };
  const handleSaveToDb = () => {
    // In a real app, this would save verified POIs to a database
    dispatch(saveToDatabase());
  };

  const handleEdit = (id: string) => {
    const poi = pois.find((p) => p.id === id);
    if (poi) {
      setEditingPOI(poi);
    }
  };

  const handleSaveEdit = (updatedPOI: POI) => {
    dispatch(updatePOI(updatedPOI));
    setEditingPOI(null);
  };

  return (
    <div className='flex flex-col h-screen w-screen overflow-hidden'>
      {' '}
      <ActionHeader
        onUploadImage={handleUploadImage}
        onSaveToDb={handleSaveToDb}
        isProcessing={processingImage}
        hasData={hasAnyPOIs}
      />
      <div className='flex flex-1 overflow-hidden'>
        {/* Left side - Map */}
        <div className='flex-1 h-full relative'>
          <MapComponent width='100%' height='100%' />
        </div>

        {/* Right side - POI List */}
        <div className='w-[420px] border-l border-gray-200 bg-white shadow-md'>
          <POIList onUploadImage={handleUploadImage} onEdit={handleEdit} />
        </div>
      </div>
      {/* Edit Modal */}
      {editingPOI && (
        <EditPOIModal
          poi={editingPOI}
          onClose={() => setEditingPOI(null)}
          onSave={handleSaveEdit}
        />
      )}
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          onUpload={handleProcessImage}
        />
      )}
    </div>
  );
};

export default AppContent;
