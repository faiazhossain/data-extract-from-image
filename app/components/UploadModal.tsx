"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import exifr from "exifr";
import { useAppDispatch } from "../redux/hooks";
import { setUploadedImage } from "../redux/features/poiSlice";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const dispatch = useAppDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  const handleFileSelection = async (file: File) => {
    setError(null);
    // Check if the file is an image
    if (file.type.startsWith("image/")) {
      // Create URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      let coordinates = undefined;

      try {
        // Read EXIF data including GPS
        const output = await exifr.parse(file, { gps: true });
        coordinates =
          output?.latitude && output?.longitude
            ? { latitude: output.latitude, longitude: output.longitude }
            : undefined;
      } catch (error) {
        console.error("Error reading image metadata:", error);
        setError(
          "Error processing image metadata, but image will still be uploaded"
        );
        // Continue with the upload process even if metadata extraction fails
      }

      // Save image and coordinates to Redux store
      dispatch(
        setUploadedImage({
          url: imageUrl,
          file,
          coordinates,
        })
      );
      setSelectedFile(file);
    } else {
      setError("Please select an image file");
    }
  };
  const handleUpload = async () => {
    if (selectedFile) {
      try {
        setError(null);
        onUpload(selectedFile);
        setSelectedFile(null);
        onClose();
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to upload image"
        );
        console.error("Upload error:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
          <h3 className='text-lg font-bold text-gray-900'>Upload Image</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500 focus:outline-none'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path d='M6 18L18 6M6 6l12 12'></path>
            </svg>
          </button>
        </div>

        <div className='px-6 py-4'>
          {error && (
            <div className='mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg'>
              {error}
            </div>
          )}
          <div
            className={`border-2 border-dashed ${
              isDragging
                ? "border-blue-500"
                : error
                ? "border-red-300"
                : "border-gray-300"
            } rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
            />
            <svg
              className={`h-12 w-12 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'></path>
            </svg>

            <p className='mt-2 text-sm text-gray-600'>
              {selectedFile
                ? `Selected: ${selectedFile.name}`
                : "Drag & drop an image or click to browse"}
            </p>
          </div>

          {selectedFile && (
            <div className='mt-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium text-gray-900'>
                  {selectedFile.name}
                </p>
                <p className='text-sm text-gray-500'>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>{" "}
              <div className='mt-2 relative h-40'>
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt='Preview'
                  className='mx-auto object-contain rounded-md'
                  fill
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>
            </div>
          )}
        </div>

        <div className='px-6 py-3 flex justify-end space-x-2 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md'
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedFile
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            }`}
          >
            Upload & Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
