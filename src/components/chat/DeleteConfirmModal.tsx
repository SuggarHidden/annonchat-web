import React from 'react';
import { deleteChat, getMessages, deleteImage } from '@/utils/storage';

interface DeleteConfirmModalProps {
  chatId: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ chatId, onClose, onConfirm }) => {
  
  const handleDelete = async () => {
    try {
      // Get all messages for this chat to find image IDs
      const messages = await getMessages(chatId);
      
      // Delete all images associated with this chat
      if (messages && messages.length > 0) {
        for (const message of messages) {
          if (message.type === 'image' && message.imageId) {
            await deleteImage(message.imageId);
          }
        }
      }
      
      // Delete all messages for this chat
      await deleteChat(chatId);
      
      // Remove chat from localStorage
      const storedChats = localStorage.getItem('chats');
      if (storedChats) {
        const chats = JSON.parse(storedChats);
        const updatedChats = chats.filter((chat: any) => chat.id !== chatId);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      }
      
      // Call the original onConfirm callback
      onConfirm();
    } catch (error) {
      console.error('Error deleting chat data:', error);
      // Still call onConfirm even if there was an error
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-xl font-bold mb-4">Delete Chat</h3>
        <p className="mb-6 text-gray-300">
          Are you sure you want to delete this chat? This will remove all messages and cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;