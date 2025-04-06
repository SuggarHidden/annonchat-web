import React from 'react';
import { Message } from '@/hooks/useChatMessages';

interface MessageItemProps {
  message: Message;
  userId: string;
  onImageClick: (imageData: string, caption: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, userId, onImageClick }) => {
  const isOwnMessage = message.sender === userId;

  return (
    <div className="flex">
      <div
        className={`max-w-[70%] ${isOwnMessage
          ? 'ml-auto bg-pink-800 text-white'
          : 'bg-gray-800 text-gray-100'
          } p-4 rounded-2xl shadow-md ${message.isNew ? 'border-2 border-pink-700' : ''}`}
        style={{ width: 'fit-content' }}
      >
        {/* Display sender name */}
        <div className={`text-xs font-semibold mb-1 ${isOwnMessage ? 'text-pink-300' : 'text-blue-300'}`}>
          {isOwnMessage ? 'You' : message.sender}
        </div>

        {message.isEncrypted ? (
          <div className="text-red-400 text-sm mb-1">
            [Unable to decrypt this message]
          </div>
        ) : null}

        {/* Display message content based on type */}
        {message.type === 'image' && message.imageData ? (
          <div>
            <img
              src={message.imageData}
              alt="Shared image"
              className="rounded-lg max-w-full max-h-[300px] object-contain mb-2 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick(message.imageData || '', message.content || '')}
            />
            {message.content && <p className="break-words">{message.content}</p>}
          </div>
        ) : (
          <p className="break-words">{message.content}</p>
        )}

        <div className="text-xs opacity-70 text-right mt-1">
          {new Date(message.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;