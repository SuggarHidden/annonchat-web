import React from 'react';

interface EditChatModalProps {
  chatId: string;
  initialName: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const EditChatModal: React.FC<EditChatModalProps> = ({
  initialName,
  onNameChange,
  onClose,
  onSave
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-80">
        <h3 className="text-xl font-bold mb-4">Edit Chat Name</h3>
        <input
          type="text"
          value={initialName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
          placeholder="Enter new name"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditChatModal;