"use client";
import { useState, useEffect } from 'react';
import * as storage from '@/utils/storage';
import { decrypt } from '@/utils/encryption';
import websocketService from '@/utils/websocket';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isEncrypted: boolean;
  isNew?: boolean;
  type?: 'text' | 'image';
  imageData?: string;
}

interface UseChatMessagesProps {
  chatId: string;
  encryptionKey: string;
  userId: string;
  lastReadMessageId?: string;
}

export function useChatMessages({
  chatId,
  encryptionKey,
  userId,
  lastReadMessageId
}: UseChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageDivider, setNewMessageDivider] = useState<number | null>(null);

  // Load messages from storage
  useEffect(() => {
    setMessages([]);
    setNewMessageDivider(null);

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        console.log(`Loading messages for chat: ${chatId}`);

        const storedMessages = await storage.getMessages(chatId);

        if (storedMessages && storedMessages.length > 0) {
          console.log(`Found ${storedMessages.length} messages for chat: ${chatId}`);

          const messagesWithImages = await Promise.all(
            storedMessages.map(async (msg) => {
              if (msg.type === 'image' && !msg.imageData && (msg as any).imageKey) {
                const imageKey = (msg as any).imageKey;
                const imageData = await storage.getImage(imageKey);
                return {
                  ...msg,
                  imageData: imageData || undefined
                };
              }
              return msg;
            })
          );

          setMessages(messagesWithImages);

          // Find where to place the "new messages" divider
          if (lastReadMessageId) {
            const lastReadIndex = messagesWithImages.findIndex(msg => msg.id === lastReadMessageId);
            if (lastReadIndex !== -1 && lastReadIndex < messagesWithImages.length - 1) {
              setNewMessageDivider(lastReadIndex + 1);
            }
          }
        } else {
          console.log(`No messages found for chat: ${chatId}`);
        }
      } catch (error) {
        console.error(`Error loading messages for chat ${chatId}:`, error);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      console.log(`Cleaning up messages for chat: ${chatId}`);
      setMessages([]);
    };
  }, [chatId, lastReadMessageId]);

  // Mark new messages as read
  useEffect(() => {
    if (messages.some(msg => msg.isNew)) {
      const updatedMessages = messages.map(msg => ({
        ...msg,
        isNew: false
      }));
      setMessages(updatedMessages);
      storage.storeMessages(chatId, updatedMessages);
    }
  }, [chatId, messages]);

  // Subscribe to new messages
  useEffect(() => {
    const handleMessage = async (data: any) => {
      try {
        if (data.type === 'message' && data.sender !== userId) {
          let decryptedContent = '';
          const messageType: 'text' | 'image' = data.messageType || 'text';
          let imageData: string | undefined;

          try {
            decryptedContent = await decrypt(data.message, encryptionKey);

            if (messageType === 'image') {
              imageData = decryptedContent;

              if (data.content) {
                try {
                  decryptedContent = await decrypt(data.content, encryptionKey);
                } catch (error) {
                  console.error('Error decrypting caption:', error);
                  decryptedContent = '';
                }
              } else {
                decryptedContent = '';
              }
            }
          } catch (error) {
            console.error('Error decrypting message:', error);
            return;
          }

          const newMsg: Message = {
            id: data.message_id || `msg_${Date.now()}`,
            sender: data.sender,
            content: decryptedContent,
            timestamp: data.timestamp || new Date().toISOString(),
            isEncrypted: false,
            isNew: true,
            type: messageType,
            imageData: imageData
          };

          setMessages(prev => [...prev, newMsg]);
        }
      } catch (error) {
        console.error('Error processing received message:', error);
        setError('Error processing received message');
      }
    };

    websocketService.subscribe(chatId, handleMessage);

    return () => {
      websocketService.unsubscribe(chatId, handleMessage);
    };
  }, [chatId, encryptionKey, userId]);

  return {
    messages,
    isLoading,
    error,
    newMessageDivider,
    setMessages
  };
}