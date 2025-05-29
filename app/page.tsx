'use client';

import { useState } from 'react';
import MapComponent from './components/MapComponent';
import POIList from './components/POIList';
import ActionHeader from './components/ActionHeader';
import EditPOIModal from './components/EditPOIModal';
import { POI } from './types';

// Sample mock data
const mockPOIs: POI[] = [
  {
    id: '1',
    name: 'Dhaka City Hospital',
    category: 'Healthcare',
    confidence: 0.92,
    latitude: 23.8225,
    longitude: 90.384,
    status: 'ai',
  },
  {
    id: '2',
    name: 'Urban Plaza Mall',
    category: 'Shopping',
    confidence: 0.87,
    latitude: 23.821,
    longitude: 90.3855,
    status: 'verified',
  },
  {
    id: '3',
    name: 'Dhaka Tech Hub',
    category: 'Office',
    confidence: 0.75,
    latitude: 23.824,
    longitude: 90.383,
    status: 'rejected',
  },
];

export default function Home() {
  const [pois, setPOIs] = useState<POI[]>(mockPOIs);
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingPOI, setEditingPOI] = useState<POI | null>(null);

  const handleSelectPOI = (poi: POI) => {
    setSelectedPOI(poi.id === selectedPOI ? null : poi.id);
  };

  const handleAccept = (id: string) => {
    setPOIs(
      pois.map((poi) => (poi.id === id ? { ...poi, status: 'verified' } : poi))
    );
  };

  const handleReject = (id: string) => {
    setPOIs(
      pois.map((poi) => (poi.id === id ? { ...poi, status: 'rejected' } : poi))
    );
  };

  const handleEdit = (id: string) => {
    const poi = pois.find((p) => p.id === id);
    if (poi) {
      setEditingPOI(poi);
    }
  };

  const handleSaveEdit = (updatedPOI: POI) => {
    setPOIs(pois.map((poi) => (poi.id === updatedPOI.id ? updatedPOI : poi)));
    setEditingPOI(null);
  };

  const handleUploadImage = () => {
    // In a real app, this would open a file picker
    console.log('Upload image clicked');
    // Mockup functionality to be implemented
  };

  const handleRunDetection = () => {
    // In a real app, this would call an AI detection API
    setIsProcessing(true);
    setTimeout(() => {
      // Simulate adding new POIs after processing
      const newPOI: POI = {
        id: `${Date.now()}`,
        name: 'New Detected Location',
        category: 'Unknown',
        confidence: 0.68,
        latitude: 23.8215 + Math.random() * 0.01,
        longitude: 90.3845 + Math.random() * 0.01,
        status: 'ai',
      };
      setPOIs([...pois, newPOI]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSaveToDb = () => {
    // In a real app, this would save verified POIs to a database
    console.log('Save to DB clicked');
    // Mockup functionality to be implemented
  };
  return (
    <div className='flex flex-col h-screen w-screen overflow-hidden'>
      <ActionHeader
        onUploadImage={handleUploadImage}
        onRunDetection={handleRunDetection}
        onSaveToDb={handleSaveToDb}
        isProcessing={isProcessing}
      />

      <div className='flex flex-1 overflow-hidden'>
        {/* Left side - Map */}
        <div className='flex-1 h-full relative'>
          <MapComponent
            width="100%"
            height="100%"
            pois={pois}
            onSelectPOI={handleSelectPOI}
          />
        </div>

        {/* Right side - POI List */}
        <div className='w-96 border-l border-gray-200 bg-white shadow-md'>
          <POIList
            pois={pois}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
            selectedPOI={selectedPOI}
          />
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
    </div>
  );
}
