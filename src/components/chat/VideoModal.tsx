import React from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: string;
  caption: string;
  contentType: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoData, caption, contentType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Video</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <video 
            src={videoData} 
            className="w-full max-h-[70vh] object-contain mb-4" 
            controls 
            autoPlay
            controlsList="nodownload"
            type={contentType}
          >
            Your browser does not support the video tag.
          </video>
          
          {caption && (
            <div className="mt-2 text-white">
              <p className="break-words">{caption}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;