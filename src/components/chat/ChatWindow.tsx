import React, { useState, useRef, useEffect } from 'react';
import { useChatMessages, Message } from '@/hooks/useChatMessages';
import { useUserId } from '@/hooks/useUserId';
import * as storage from '@/utils/storage';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import ImageViewer from './ImageViewer';
import DeleteChatModal from './DeleteChatModal';
import Image from 'next/image';

interface ChatWindowProps {
  chatName: string;
  chatId: string;
  encryptionKey: string;
  onBackClick?: () => void;
  lastReadMessageId?: string;
  onChatDeleted?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatName,
  chatId,
  encryptionKey,
  onBackClick,
  lastReadMessageId,
  onChatDeleted
}) => {
  const userId = useUserId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenCaption, setFullscreenCaption] = useState<string>('');

  const { 
    messages, 
    isLoading, 
    error, 
    newMessageDivider,
    setMessages 
  } = useChatMessages({
    chatId,
    encryptionKey,
    userId,
    lastReadMessageId
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteChat = async () => {
    // Clear messages from storage and state
    await storage.deleteChat(chatId);
    setMessages([]);
    setShowDeleteModal(false);
    
    // Notify parent component if provided
    if (onChatDeleted) {
      onChatDeleted();
    }
  };

  const handleMessageSent = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const openFullscreenImage = (imageData: string, caption: string = '') => {
    setFullscreenImage(imageData);
    setFullscreenCaption(caption);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
    setFullscreenCaption('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl">
      {/* Chat header */}
      <div className="py-3 px-4 bg-gray-800 border-b border-gray-700 rounded-tr-lg flex justify-between items-center h-16">
        <div className="flex items-center">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="mr-3 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-xl font-bold text-white truncate">
            {chatName && chatName.trim() !== '' ? chatName : `ChatID: ${chatId}`}
          </h2>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center justify-center h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors"
          title="Delete chat history"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet...
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                {/* New messages divider */}
                {newMessageDivider === index && (
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-pink-500"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-900 px-3 text-sm text-pink-500">
                        New messages
                      </span>
                    </div>
                  </div>
                )}

                <MessageItem 
                  message={msg} 
                  userId={userId} 
                  onImageClick={openFullscreenImage} 
                />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <MessageInput 
        chatId={chatId}
        encryptionKey={encryptionKey}
        userId={userId}
        onMessageSent={handleMessageSent}
      />

      {/* Fullscreen image viewer */}
      {fullscreenImage && (
        <ImageViewer 
          imageUrl={fullscreenImage} 
          caption={fullscreenCaption} 
          onClose={closeFullscreenImage} 
        />
      )}

      {/* Delete chat modal */}
      {showDeleteModal && (
        <DeleteChatModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteChat}
          chatId={chatId}
        />
      )}
    </div>
  );
};

export default ChatWindow;