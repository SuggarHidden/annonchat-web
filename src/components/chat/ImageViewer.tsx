import Image from 'next/image';
import React, { useState } from 'react';

interface ImageViewerProps {
  imageUrl: string;
  caption: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, caption, onClose }) => {
  const [imageScale, setImageScale] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle zoom with mouse wheel
  const handleZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Determine zoom direction and amount
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(1, Math.min(5, imageScale + delta));

    setImageScale(newScale);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePan.x, y: e.clientY - imagePan.y });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageScale > 1) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset zoom
  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageScale(1);
    setImagePan({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="relative max-w-full max-h-[90vh] overflow-hidden">
        <Image
          src={imageUrl}
          alt="Fullscreen image"
          className="max-w-full max-h-[80vh] object-contain transition-transform duration-100"
          style={{
            transform: `scale(${imageScale}) translate(${imagePan.x / imageScale}px, ${imagePan.y / imageScale}px)`,
            cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onClick={(e) => e.stopPropagation()}
          onWheel={handleZoom}
          onMouseDown={handleMouseDown}
          onDragStart={(e) => e.preventDefault()} // Prevent default drag behavior
        />
        {caption && (
          <div className="mt-4 text-white text-center p-2 bg-gray-800 bg-opacity-70 rounded-lg">
            {caption}
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 flex space-x-2">
        <button 
          className="text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
          onClick={resetZoom}
          title="Reset zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button 
          className="text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
          onClick={onClose}
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-70 rounded-lg px-3 py-1 text-white text-sm">
        {Math.round(imageScale * 100)}% • Usa la rueda del ratón para hacer zoom
      </div>
    </div>
  );
};

export default ImageViewer;