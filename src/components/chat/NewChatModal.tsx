import React, { useState } from 'react';
import websocketService from '../../utils/websocket';

interface NewChatModalProps {
  onClose: () => void;
  onAddChat: (id: string, name: string, key: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onAddChat }) => {
  const [chatId, setChatId] = useState('');
  const [chatName, setChatName] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Function to generate a UUID
  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setChatId(uuid);
  };

  // Function to generate a random encryption key
  const generateRandomKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    const length = 32; // A reasonable length for an encryption key
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setEncryptionKey(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatId.trim() || !encryptionKey.trim()) {
      setError('Chat ID and encryption key are required');
      return;
    }

    // Check ID length - UUID is 36 characters
    if (chatId.length > 36) {
      setError('Chat ID cannot be longer than 36 characters');
      return;
    }

    // Check key length
    if (encryptionKey.length > 128) {
      setError('Encryption key cannot be longer than 128 characters');
      return;
    }

    // Check if a chat with this ID already exists
    const existingChats = localStorage.getItem('chats');
    if (existingChats) {
      const chats = JSON.parse(existingChats);
      
      // Check if the maximum number of chats (100) has been reached
      if (chats.length >= 100) {
        setError('You cannot add more than 100 chats. Please delete some chats first.');
        return;
      }
      
      const chatExists = chats.some((chat: any) => chat.id === chatId);
      
      if (chatExists) {
        setError('A chat with this ID already exists');
        return;
      }
    }

    // If no name is provided, use ID as name
    const name = chatName.trim() || chatId;
    
    // Add the chat to the local state
    onAddChat(chatId, name, encryptionKey);
    
    // Notify the server about the new chat
    websocketService.notifyNewChat(chatId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <h2 className="text-xl font-bold mb-4">New Chat</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Chat ID</label>
            <div className="flex">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-l bg-gray-700 text-white placeholder-gray-400"
                placeholder="Enter chat ID"
                maxLength={36}
              />
              <button
                type="button"
                onClick={generateUUID}
                className="px-3 bg-gray-600 text-white rounded-r hover:bg-gray-500"
                title="Generate UUID"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Max 36 characters</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Name (optional)</label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Display name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Encryption Key</label>
            <div className="flex">
              <div className="relative flex-grow">
                <input
                  type={showKey ? "text" : "password"}
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-l bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Key to encrypt/decrypt messages"
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  {showKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={generateRandomKey}
                className="px-3 bg-gray-600 text-white rounded-r hover:bg-gray-500"
                title="Generate random key"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Max 128 characters</p>
          </div>
          
          {error && <p className="text-red-400 mb-4">{error}</p>}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChatModal;