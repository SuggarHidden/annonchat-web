import React from 'react';

interface DeleteChatModalProps {
  onClose: () => void;
  onConfirm: () => void;
  chatId: string;
}

const DeleteChatModal: React.FC<DeleteChatModalProps> = ({ onClose, onConfirm, chatId }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Delete Chat History</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete all messages from chat {chatId}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;