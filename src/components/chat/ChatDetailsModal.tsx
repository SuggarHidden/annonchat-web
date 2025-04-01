import React from 'react';
import { Chat } from '@/hooks/useChats';

interface ChatDetailsModalProps {
  chat: Chat;
  onClose: () => void;
}

const ChatDetailsModal: React.FC<ChatDetailsModalProps> = ({ chat, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-xl font-bold mb-4">Chat Details</h3>
        
        <div className="mb-4">
          <p className="text-gray-400 text-sm">Chat Name</p>
          <p className="text-white">{chat.name}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-400 text-sm">Chat ID</p>
          <div className="flex items-center">
            <p className="text-white break-all">{chat.id}</p>
            <button
              onClick={() => navigator.clipboard.writeText(chat.id)}
              className="ml-2 text-gray-400 hover:text-white"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-400 text-sm">Encryption Key</p>
          <div className="flex items-center">
            <p className="text-white break-all">{chat.key.substring(0, 8)}•••••••••••</p>
            <button
              onClick={() => navigator.clipboard.writeText(chat.key)}
              className="ml-2 text-gray-400 hover:text-white"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetailsModal;