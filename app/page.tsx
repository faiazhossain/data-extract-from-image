"use client";
import { useState } from "react";
import { useAppSelector } from "./redux/hooks";
import SimpleMapComponent from "./components/SimpleMapComponent";
import SimpleHeader from "./components/SimpleHeader";
import MarkerList from "./components/MarkerList";
import CsvUploadModal from "./components/CsvUploadModal";
import { exportToExcel } from "./services/exportService";

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { markers } = useAppSelector((state) => state.marker);

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleExport = () => {
    if (markers.length > 0) {
      try {
        const fileName = exportToExcel(markers);
        alert(`Exported to ${fileName}`);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      }
    }
  };

  return (
    <div className='flex flex-col h-screen w-screen overflow-hidden'>
      <SimpleHeader
        onUploadClick={handleUploadClick}
        onExportClick={handleExport}
      />

      <div className='flex flex-1 overflow-hidden'>
        {/* Map section - takes up most of the screen */}
        <div className='flex-1 h-full'>
          <SimpleMapComponent width='100%' height='100%' />
        </div>

        {/* Sidebar - marker list */}
        <div className='w-[350px] border-l border-gray-200'>
          <MarkerList onExportClick={handleExport} />
        </div>
      </div>

      {/* CSV Upload Modal */}
      {isUploadModalOpen && (
        <CsvUploadModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
        />
      )}
    </div>
  );
}
