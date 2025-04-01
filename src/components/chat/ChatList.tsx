import React, { useState, useEffect } from 'react';
import { Chat, LastMessage } from '@/hooks/useChats';
import ChatListItem from './ChatListItem';
import EditChatModal from './EditChatModal';
import ChatDetailsModal from './ChatDetailsModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Image from 'next/image';

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  lastMessages: Record<string, LastMessage>;
  onSelectChat: (id: string, key: string) => void;
  onDeleteChat: (id: string) => void;
  onEditChat: (id: string, newName: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  lastMessages,
  onSelectChat,
  onDeleteChat,
  onEditChat
}) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [userId, setUserId] = useState('Anonymous');
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);

  // Load userId from localStorage on component mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  // Function to format the last message preview
  const formatLastMessage = (message: LastMessage | undefined) => {
    if (!message) return "No messages yet";

    if (message.type === 'image') {
      return message.content ? `📷 ${message.content}` : "📷 Image";
    }

    return message.content.length > 25
      ? `${message.content.substring(0, 25)}...`
      : message.content;
  };

  const handleOpenMenu = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === chatId ? null : chatId);
  };

  const handleOpenEditModal = (chat: Chat) => {
    setEditName(chat.name);
    setEditModalOpen(chat.id);
    setMenuOpen(null);
  };

  const handleOpenDetailsModal = (chatId: string) => {
    setDetailsModalOpen(chatId);
    setMenuOpen(null);
  };

  const handleOpenDeleteConfirm = (chatId: string) => {
    setDeleteConfirmOpen(chatId);
    setMenuOpen(null);
  };

  const handleEditSubmit = (chatId: string) => {
    onEditChat(chatId, editName);
    setEditModalOpen(null);
  };

  const handleDeleteConfirm = (chatId: string) => {
    onDeleteChat(chatId);
    setDeleteConfirmOpen(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-bl-2xl">
      <div className="overflow-y-auto flex-grow">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats. Add a new one.
          </div>
        ) : (
          <ul>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat === chat.id}
                lastMessage={lastMessages[chat.id]}
                formatLastMessage={formatLastMessage}
                onSelect={() => onSelectChat(chat.id, chat.key)}
                onMenuOpen={(e) => handleOpenMenu(chat.id, e)}
                isMenuOpen={menuOpen === chat.id}
                onEdit={() => handleOpenEditModal(chat)}
                onViewDetails={() => handleOpenDetailsModal(chat.id)}
                onDelete={() => handleOpenDeleteConfirm(chat.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* User Profile Section */}
      <div className="mt-auto border-t border-gray-700 p-3 flex items-center justify-between bg-gray-800">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src="/avatar.jpg"
              alt="User Avatar"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="ml-3 text-white font-medium truncate max-w-[120px]">
            {userId}
          </div>
        </div>
        <button
          onClick={() => setIsUserEditModalOpen(true)}
          className="text-gray-400 hover:text-white p-2"
        >
          <Image
            src="/svg/icons/gear.svg"
            alt="Settings"
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <EditChatModal
          chatId={editModalOpen}
          initialName={editName}
          onNameChange={setEditName}
          onClose={() => setEditModalOpen(null)}
          onSave={() => handleEditSubmit(editModalOpen)}
        />
      )}

      {/* Details Modal */}
      {detailsModalOpen && (
        <ChatDetailsModal
          chat={chats.find(c => c.id === detailsModalOpen)!}
          onClose={() => setDetailsModalOpen(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <DeleteConfirmModal
          chatId={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(null)}
          onConfirm={() => handleDeleteConfirm(deleteConfirmOpen)}
        />
      )}

      {/* User Edit Modal */}
      {isUserEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-80">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.slice(0, 16))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={16}
              />
              <p className="text-xs text-gray-400 mt-1">{userId.length}/16 characters</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsUserEditModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save username to localStorage
                  localStorage.setItem('userId', userId);
                  setIsUserEditModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;