"use client";

import React, { useState, useRef } from "react";
import { useAppDispatch } from "../redux/hooks";
import {
  addMarkersFromCSV,
  startLoadingMarkers,
} from "../redux/features/markerSlice";
import { CSVMarkerData } from "../types";

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);

    // Check if it's a CSV file
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      setSelectedFile(file);
    } else {
      setError("Please select a valid CSV file");
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsLoading(true);
      setError(null);

      try {
        // Signal that we're starting to load markers
        dispatch(startLoadingMarkers());

        const text = await selectedFile.text();

        // Clean up CSV data first
        const cleanedText = text.replace(/\/\/ filepath:.*$/m, "").trim(); // Remove filepath comment if present

        // Use a more robust CSV parsing approach
        const lines = cleanedText.split("\n").filter((line) => line.trim());

        // Make sure headers are properly extracted
        const headers = lines[0].split(",").map((header) => header.trim());

        // Validate that we have the expected headers
        if (!headers.includes("latitude") || !headers.includes("longitude")) {
          throw new Error(
            "CSV file must include 'latitude' and 'longitude' columns"
          );
        }

        // Parse CSV data
        const data: CSVMarkerData[] = [];
        const latIndex = headers.findIndex((h) => h === "latitude");
        const lngIndex = headers.findIndex((h) => h === "longitude");
        const detailsIndex = headers.findIndex((h) => h === "event_details");
        const contactIndex = headers.findIndex((h) => h === "event_contact_no");
        const serviceIndex = headers.findIndex((h) => h === "service_type");

        console.log(
          `Found headers: lat=${latIndex}, lng=${lngIndex}, details=${detailsIndex}, contact=${contactIndex}, service=${serviceIndex}`
        );

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Handle quoted values carefully
          const values: string[] = [];
          let inQuote = false;
          let currentValue = "";

          for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
              inQuote = !inQuote;
            } else if (char === "," && !inQuote) {
              values.push(currentValue);
              currentValue = "";
            } else {
              currentValue += char;
            }
          }

          // Add the last value
          values.push(currentValue);

          // Make sure we have enough values
          if (values.length < Math.max(latIndex, lngIndex) + 1) {
            console.warn(`Skipping line ${i + 1}: not enough columns`);
            continue;
          }

          // Extract and validate coordinates
          const lat = parseFloat(values[latIndex]);
          const lng = parseFloat(values[lngIndex]);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Skipping line ${i + 1}: invalid coordinates`);
            continue;
          }

          // Create a marker data object
          const item: CSVMarkerData = {
            latitude: values[latIndex],
            longitude: values[lngIndex],
            event_details: detailsIndex >= 0 ? values[detailsIndex] : "",
            event_contact_no: contactIndex >= 0 ? values[contactIndex] : "",
            service_type: serviceIndex >= 0 ? values[serviceIndex] : "",
          };

          data.push(item);
        }

        console.log(`Successfully parsed ${data.length} markers from CSV`);

        if (data.length === 0) {
          setError(
            "No valid marker data found in the CSV. Please check the file format."
          );
          setIsLoading(false);
          return;
        }

        // Add the first 50 markers to avoid overwhelming the app
        const initialBatch = data.slice(0, 50);
        dispatch(addMarkersFromCSV(initialBatch));

        // Set a small timeout to let the UI update before processing more markers
        if (data.length > 50) {
          setTimeout(() => {
            const remainingBatches: CSVMarkerData[][] = [];
            for (let i = 50; i < data.length; i += 50) {
              remainingBatches.push(data.slice(i, i + 50));
            }

            // Process remaining batches
            let currentBatch = 0;
            const processNextBatch = () => {
              if (currentBatch < remainingBatches.length) {
                dispatch(
                  addMarkersFromCSV([
                    ...initialBatch,
                    ...remainingBatches.slice(0, currentBatch + 1).flat(),
                  ])
                );
                currentBatch++;
                setTimeout(processNextBatch, 100);
              }
            };

            processNextBatch();
          }, 500);
        }

        onClose();
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setError(
          `Error parsing CSV file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-2xl w-full max-w-md p-6'>
        <h2 className='text-xl font-bold mb-4'>Upload CSV File</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } transition-colors duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className='flex flex-col items-center'>
            <svg
              className={`w-12 h-12 mb-3 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>

            <p className='mb-2 text-sm text-gray-600'>
              <span className='font-semibold'>Click to upload</span> or drag and
              drop
            </p>
            <p className='text-xs text-gray-500'>CSV file with coordinates</p>

            {selectedFile && (
              <div className='mt-4 text-left w-full'>
                <p className='text-sm font-medium text-gray-800'>
                  Selected file:
                </p>
                <p className='text-sm text-gray-600'>{selectedFile.name}</p>
              </div>
            )}

            {error && <div className='mt-3 text-red-500 text-sm'>{error}</div>}

            <input
              ref={fileInputRef}
              type='file'
              className='hidden'
              accept='.csv'
              onChange={handleFileChange}
            />
          </div>

          <button
            type='button'
            className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            onClick={handleFileSelect}
          >
            Select File
          </button>
        </div>

        <div className='mt-6 flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              selectedFile && !isLoading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center min-w-[80px]`}
          >
            {isLoading ? (
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
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadModal;
