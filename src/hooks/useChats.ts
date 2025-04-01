import { useState, useEffect } from 'react';
import * as storage from '@/utils/storage';

export interface Chat {
  id: string;
  name: string;
  key: string;
  unreadCount?: number;
}

export interface LastMessage {
  content: string;
  timestamp: string;
  sender: string;
  type?: 'text' | 'image';
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [lastReadMessages, setLastReadMessages] = useState<Record<string, string>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessage>>({});

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }

    // Load last read messages
    const savedLastRead = localStorage.getItem('lastReadMessages');
    if (savedLastRead) {
      setLastReadMessages(JSON.parse(savedLastRead));
    }
  }, []);

  // Save chats to localStorage when they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save last read messages when they change
  useEffect(() => {
    if (Object.keys(lastReadMessages).length > 0) {
      localStorage.setItem('lastReadMessages', JSON.stringify(lastReadMessages));
    }
  }, [lastReadMessages]);

  // Load last messages for all chats
  useEffect(() => {
    const loadLastMessages = async () => {
      const messages: Record<string, LastMessage> = {};

      for (const chat of chats) {
        try {
          const chatMessages = await storage.getMessages(chat.id);
          if (chatMessages && chatMessages.length > 0) {
            const lastMsg = chatMessages[chatMessages.length - 1];
            messages[chat.id] = {
              content: lastMsg.content,
              timestamp: lastMsg.timestamp,
              sender: lastMsg.sender,
              type: lastMsg.type
            };
          }
        } catch (error) {
          console.error(`Error loading messages for chat ${chat.id}:`, error);
        }
      }

      setLastMessages(messages);
    };

    loadLastMessages();
  }, [chats]);

  // Update last read message when chat is selected
  useEffect(() => {
    if (selectedChat) {
      // Reset unread count for the selected chat
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );

      // Get the latest message ID for this chat
      const updateLastRead = async () => {
        try {
          const savedMessages = await storage.getMessages(selectedChat);
          if (savedMessages && savedMessages.length > 0) {
            const lastMessageId = savedMessages[savedMessages.length - 1].id;

            // Update last read message
            setLastReadMessages(prev => ({
              ...prev,
              [selectedChat]: lastMessageId
            }));
          }
        } catch (error) {
          console.error('Error updating last read message:', error);
        }
      };

      updateLastRead();
    }
  }, [selectedChat]);

  const addChat = (id: string, name: string, key: string) => {
    const newChat = { id, name, key, unreadCount: 0 };
    setChats([...chats, newChat]);
    setSelectedChat(id);
  };

  const updateChatUnreadCount = (chatId: string, increment = true) => {
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chatId
          ? { ...c, unreadCount: increment ? (c.unreadCount || 0) + 1 : 0 }
          : c
      )
    );
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (selectedChat === chatId) {
      setSelectedChat(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const editChatName = (chatId: string, newName: string) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, name: newName } : chat
    );
    setChats(updatedChats);
  };

  return {
    chats,
    selectedChat,
    lastReadMessages,
    lastMessages,
    setSelectedChat,
    addChat,
    updateChatUnreadCount,
    deleteChat,
    editChatName
  };
}