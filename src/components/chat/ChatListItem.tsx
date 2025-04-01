import React from 'react';
import { Chat, LastMessage } from '@/hooks/useChats';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  lastMessage?: LastMessage;
  formatLastMessage: (message: LastMessage | undefined) => string;
  onSelect: () => void;
  onMenuOpen: (e: React.MouseEvent) => void;
  isMenuOpen: boolean;
  onEdit: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  lastMessage,
  formatLastMessage,
  onSelect,
  onMenuOpen,
  isMenuOpen,
  onEdit,
  onViewDetails,
  onDelete
}) => {
  return (
    <li className={`relative border-b border-gray-200 hover:bg-gray-800 ${isSelected ? 'bg-gray-700' : ''}`}>
      <div
        onClick={onSelect}
        className="p-4 cursor-pointer"
      >
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
            {chat.name.charAt(0).toUpperCase()}

            {/* Unread message indicator */}
            {chat.unreadCount && chat.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chat.unreadCount > 9 ? '+9' : chat.unreadCount}
              </div>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <h3 className="font-lg font-bold truncate">{chat.name}</h3>
            <p className="text-sm text-gray-300 truncate">
              {formatLastMessage(lastMessage)}
            </p>
          </div>
          <button
            onClick={onMenuOpen}
            className="ml-2 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute right-2 top-12 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
          <ul className="py-1">
            <li>
              <button
                onClick={onEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Edit Name
              </button>
            </li>
            <li>
              <button
                onClick={onViewDetails}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                View Details
              </button>
            </li>
            <li>
              <button
                onClick={onDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </li>
  );
};

export default ChatListItem;