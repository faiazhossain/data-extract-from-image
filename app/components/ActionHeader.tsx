"use client";
import React from "react";
import { BiImageAdd } from "react-icons/bi";
import { MdOutlineDragIndicator } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { toggleDragMode } from "../redux/features/poiSlice";

interface ActionHeaderProps {
  onUploadImage: () => void;
  isProcessing?: boolean;
  hasData?: boolean;
}

const ActionHeader: React.FC<ActionHeaderProps> = ({
  onUploadImage,
  isProcessing = false,
  hasData = false,
}) => {
  const dispatch = useDispatch();
  const isDragModeEnabled = useSelector(
    (state: RootState) => state.poi.isDragModeEnabled
  );

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4 shadow-sm'>
      <div className='flex items-center justify-between max-w-[1920px] mx-auto'>
        <div className='flex flex-col'>
          <h1 className='text-2xl font-bold font-geist-sans tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent'>
            Image POI Extractor
          </h1>
          <div className='flex items-center mt-1 space-x-1'>
            <div className='relative w-4 h-4'>
              <div className='absolute inset-0 animate-fire'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  className='w-4 h-4 text-orange-500'
                >
                  <path
                    fill='currentColor'
                    d='M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11zm0-2a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-7l3 3H9l3-3zm0-2L9 9h6l-3 3z'
                  />
                </svg>
              </div>
            </div>
            <span className='text-xs font-medium text-gray-600 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent'>
              AI Powered
            </span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {" "}
          <button
            onClick={() => dispatch(toggleDragMode())}
            className={`px-4 py-2 ${
              isDragModeEnabled
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } border rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:hover:shadow-none disabled:hover:translate-y-0`}
            disabled={isProcessing || !hasData}
            title={
              !hasData
                ? "Upload an image to enable drag mode"
                : isDragModeEnabled
                ? "Click to disable drag mode"
                : "Click to enable drag mode"
            }
          >
            <MdOutlineDragIndicator
              className={`w-5 h-5 mr-2 transition-colors duration-200 ${
                isDragModeEnabled ? "text-white" : "text-gray-600"
              }`}
            />
            <span className='relative'>
              {isDragModeEnabled ? "Disable" : "Enable"} Drag
              {isDragModeEnabled && (
                <span className='absolute -top-1 -right-1.5 flex h-2 w-2'>
                  {" "}
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-200 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
                </span>
              )}
            </span>
          </button>{" "}
          <button
            onClick={onUploadImage}
            className='px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
            disabled={isProcessing}
          >
            <BiImageAdd className='w-5 h-5 mr-2 text-white' />
            Upload Image
          </button>
        </div>
      </div>
    </header>
  );
};

export default ActionHeader;
