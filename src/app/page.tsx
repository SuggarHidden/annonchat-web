"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useChats } from "@/hooks/useChats";
import { useStatsStore } from "@/store/statsStore";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatModal from "@/components/chat/NewChatModal";
import StatsDisplay from "@/components/StatsDisplay";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";
import Ad_50_320 from "@/components/ads/Ad_50_320";
import Ad_600_160 from "@/components/ads/Ad_600_160";
import Ad_300_160 from "@/components/ads/Ad_300_160";
import websocketService from "@/utils/websocket";
import { decrypt } from "@/utils/encryption";
import * as storage from '@/utils/storage';

export default function Home() {
  const {
    chats,
    selectedChat,
    lastReadMessages,
    lastMessages,
    setSelectedChat,
    addChat,
    updateChatUnreadCount,
    deleteChat,
    editChatName
  } = useChats();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModal] = useState(false);
  const updateStats = useStatsStore(state => state.updateStats);

  // Detect screen size for responsive mode
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initialize
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When a chat is selected on mobile, hide the list
  useEffect(() => {
    if (isMobileView && selectedChat) {
      setShowChatList(false);
    }
  }, [selectedChat, isMobileView]);

  // Global message handler for all chats and stats
  useEffect(() => {
    const handleGlobalMessage = async (data: any) => {
      try {
        // Handle stats messages
        if (data.type === 'stats') {
          console.log('Received stats message:', data);
          const statsData = data.data || {};

          updateStats({
            connectedUsers: statsData.connectedUsers || 0,
            totalMessages: statsData.totalMessages || 0,
            totalDataTransferred: statsData.totalDataTransferred
          });
          return;
        }

        // Handle chat messages
        if (data.type === 'message') {
          const chatId = data.chat_id;
          const chat = chats.find(c => c.id === chatId);

          if (chat) {
            try {
              // Try to decrypt the message
              let decryptedContent = await decrypt(data.message, chat.key);

              // Determine message type
              const messageType = data.messageType || 'text';
              let imageData;

              // If it's an image, handle it accordingly
              if (messageType === 'image') {
                imageData = decryptedContent;

                // If there's a caption, decrypt it
                if (data.content) {
                  try {
                    decryptedContent = await decrypt(data.content, chat.key);
                  } catch (error) {
                    console.error('Error decrypting caption:', error);
                    decryptedContent = ''; // Set empty caption if decryption fails
                  }
                } else {
                  decryptedContent = ''; // No caption
                }
              }

              // Create the message object
              const newMsg = {
                id: data.message_id || `msg_${Date.now()}`,
                sender: data.sender,
                content: decryptedContent,
                timestamp: data.timestamp || new Date().toISOString(),
                isEncrypted: false,
                isNew: true,
                type: messageType,
                imageData: imageData
              };

              // Get existing messages for this chat
              const savedMessages = await storage.getMessages(chatId) || [];

              // Add the new message
              const updatedMessages = [...savedMessages, newMsg];

              // Save back to storage
              await storage.storeMessages(chatId, updatedMessages);

              // Update unread count if this is not the currently selected chat
              if (selectedChat !== chatId) {
                updateChatUnreadCount(chatId, true);
              }
            } catch (error) {
              console.error('Error decrypting message:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error processing global message:', error);
      }
    };

    // Subscribe to all chats
    chats.forEach(chat => {
      websocketService.subscribe(chat.id, handleGlobalMessage);
    });

    // Subscribe to stats channel
    websocketService.subscribe('stats', handleGlobalMessage);
    console.log('Subscribed to stats channel');

    return () => {
      // Unsubscribe from all chats
      chats.forEach(chat => {
        websocketService.unsubscribe(chat.id, handleGlobalMessage);
      });

      // Unsubscribe from stats channel
      websocketService.unsubscribe('stats', handleGlobalMessage);
    };
  }, [chats, selectedChat, updateStats, updateChatUnreadCount]);

  const handleAddChat = (id: string, name: string, key: string) => {
    addChat(id, name, key);
    setIsModalOpen(false);
  };

  const toggleChatList = () => {
    setShowChatList(!showChatList);
  };

  const handleChatDeleted = () => {
    // If on mobile, show the chat list after deletion
    if (isMobileView) {
      setShowChatList(true);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-950">
      <Ad_50_320 />

      <div className="flex flex-1 overflow-hidden px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 py-2 md:py-3">
        {/* Left ad only visible on desktop */}
        <div className="hidden lg:block mr-4">
          <Ad_600_160 />
        </div>

        {/* Main container */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden rounded-2xl">
          {/* Left panel - Chat list */}
          {(!isMobileView || showChatList || !selectedChat) && (
            <div className={`${isMobileView ? 'w-full h-full' : 'w-full md:w-1/4'} border-r border-white ${isMobileView && selectedChat ? 'md:block' : ''} flex flex-col`}>
              <div className="py-3 px-4 bg-pink-600 text-white flex justify-between items-center rounded-tl-2xl h-16">
                <div className="flex items-center">
                  <Image src="/logo.png" width={32} height={32} alt="Logo" className="my-auto" />
                  <h1 className="pl-2 text-xl font-bold">AnnonChat</h1>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center h-10 w-10 hover:bg-pink-700 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square-plus-icon lucide-message-square-plus"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M12 7v6" /><path d="M9 10h6" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ChatList
                  chats={chats}
                  selectedChat={selectedChat}
                  lastMessages={lastMessages}
                  onSelectChat={(id) => {
                    setSelectedChat(id);
                    if (isMobileView) {
                      setShowChatList(false);
                    }
                  }}
                  onDeleteChat={deleteChat}
                  onEditChat={editChatName}
                />
              </div>
            </div>
          )}

          {/* Right panel - Chat window */}
          {(!isMobileView || !showChatList || !selectedChat) && (
            <div className={`${isMobileView ? 'w-full h-full' : 'w-full md:w-3/4'} flex flex-col`}>
              {selectedChat ? (
                <ChatWindow
                  chatName={chats.find(chat => chat.id === selectedChat)?.name || ""}
                  chatId={selectedChat}
                  encryptionKey={chats.find(chat => chat.id === selectedChat)?.key || ""}
                  onBackClick={isMobileView ? toggleChatList : undefined}
                  lastReadMessageId={lastReadMessages[selectedChat]}
                  onChatDeleted={handleChatDeleted}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-r-2xl">
                  <p className="text-gray-500">Select a chat to begin</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right ad only visible on desktop */}
        <div className="hidden lg:block ml-4">
          <Ad_300_160 />
        </div>
      </div>

      {/* Stats display at the bottom - only visible on desktop */}
      <div className="hidden md:block w-full mb-1 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-64">
        <StatsDisplay />
      </div>

      {/* Footer with Terms link - reduced padding */}
      <div className="w-full py-1 text-center text-gray-400 text-sm flex flex-row items-center space-x-4 justify-center">
        <button
          onClick={() => setIsTermsModalOpen(true)}
          className="hover:text-pink-500 transition-colors"
        >
          Terms
        </button>
        <button
          onClick={() => setIsPrivacyModal(true)}
          className="hover:text-pink-500 transition-colors"
        >
          Privacy
        </button>
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModal(false)}
      />

      {/* New Chat Modal */}
      {isModalOpen && (
        <NewChatModal
          onClose={() => setIsModalOpen(false)}
          onAddChat={handleAddChat}
        />
      )}
      {/*       <Ad_Social_Bar /> */}
    </main>
  );
}

