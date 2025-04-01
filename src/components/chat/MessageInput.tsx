import React, { useState, useRef, useEffect } from 'react';
import { encrypt } from '@/utils/encryption';
import websocketService from '@/utils/websocket';
import * as storage from '@/utils/storage';
import { toast } from 'react-toastify';
import { Message } from '@/hooks/useChatMessages';

interface MessageInputProps {
  chatId: string;
  encryptionKey: string;
  userId: string;
  onMessageSent: (message: Message) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  encryptionKey,
  userId,
  onMessageSent
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [recentMessages, setRecentMessages] = useState<number[]>([]);
  const [remainingTime, setRemainingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_MESSAGE_LENGTH = 2000; // Define maximum message length
  const MAX_MESSAGES_PER_MINUTE = 20; // Maximum messages per minute

  // Clean up old rate limit timestamps
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      // Remove timestamps older than 1 minute
      setRecentMessages(prev => prev.filter(timestamp => timestamp > oneMinuteAgo));
    }, 5000); // Run cleanup every 5 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (isRateLimited && remainingTime > 0) {
      countdownInterval = setInterval(() => {
        setRemainingTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(countdownInterval);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isRateLimited, remainingTime]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, JPEG and PNG images are allowed.');
      return;
    }
    const maxSizeInMB = 4;
    const maxSize = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Image size must be less than ${maxSizeInMB}MB.`);
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setError(null);
  };

  const cancelImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedImage) return;

    // Check if message exceeds character limit
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      setError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters. Current length: ${newMessage.length}`);
      return;
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000; // 60 seconds ago

    const messagesInLastMinute = recentMessages.filter(timestamp => timestamp > oneMinuteAgo);

    if (messagesInLastMinute.length >= MAX_MESSAGES_PER_MINUTE) {
      // Calculate when the oldest message within the limit will expire
      const oldestMessageTime = Math.min(...messagesInLastMinute);
      const timeUntilNextSlot = oldestMessageTime + 60000 - now;
      const secondsRemaining = Math.ceil(timeUntilNextSlot / 1000);

      // Show toast notification
      toast.warning(`Please slow down! You're limited to ${MAX_MESSAGES_PER_MINUTE} messages per minute.`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: true,
      });

      setIsRateLimited(true);
      setRemainingTime(secondsRemaining);

      const rateLimitTimer = setTimeout(() => {
        setIsRateLimited(false);
        setRemainingTime(0);
      }, timeUntilNextSlot);

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Handle image message
      if (selectedImage) {
        // Convert image to base64
        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });

        // Encrypt the base64 string
        const encryptedImage = await encrypt(base64Image, encryptionKey);

        // Encrypt the caption if provided
        const caption = newMessage.trim();
        const encryptedCaption = caption ? await encrypt(caption, encryptionKey) : '';

        // Send the encrypted image via WebSocket with encrypted caption
        websocketService.sendMessage(chatId, encryptedImage, userId, 'image', encryptedCaption);

        // Add the message to the local list
        const messageId = `msg_${Date.now()}`;
        const timestamp = new Date().toISOString();

        const newMsg: Message = {
          id: messageId,
          sender: userId,
          content: caption, // Store unencrypted caption locally
          timestamp,
          isEncrypted: false,
          type: 'image',
          imageData: base64Image // Store unencrypted image locally
        };

        // Store the message using the storage utility
        await storage.storeMessage(chatId, newMsg);

        // Notify parent component
        onMessageSent(newMsg);

        // Add timestamp to recent messages for rate limiting
        setRecentMessages(prev => [...prev, now]);
      }
      // Handle text message
      else {
        // Encrypt the message
        const encryptedContent = await encrypt(newMessage, encryptionKey);

        // Send the encrypted message via WebSocket
        websocketService.sendMessage(chatId, encryptedContent, userId, 'text');

        // Add the message to the local list
        const messageId = `msg_${Date.now()}`;
        const timestamp = new Date().toISOString();

        const newMsg: Message = {
          id: messageId,
          sender: userId,
          content: newMessage, // Store unencrypted content locally
          timestamp,
          isEncrypted: false,
          type: 'text'
        };

        // Store the message using the storage utility
        await storage.storeMessage(chatId, newMsg);

        // Notify parent component
        onMessageSent(newMsg);

        // Add timestamp to recent messages for rate limiting
        setRecentMessages(prev => [...prev, now]);
      }

      // Clear input fields
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      // Focus back on the input field after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  // Function to handle input change with character limit
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value;
    setNewMessage(message);

    // Clear error when user starts typing again or is within limits
    if (message.length <= MAX_MESSAGE_LENGTH && error?.includes('characters')) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700 rounded-br-lg">
      {error && <div className="text-red-400 mb-2">{error}</div>}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 relative">
          <img
            src={imagePreview}
            alt="Selected image"
            className="h-32 rounded-lg object-contain bg-gray-700 p-1"
          />
          <button
            type="button"
            onClick={cancelImageSelection}
            className="absolute top-1 right-1 bg-gray-900 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      <div className={`flex space-x-2 relative ${isRateLimited ? 'opacity-50 pointer-events-none' : ''}`}>
        {isRateLimited && (
          <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm rounded-lg">
            <div className="bg-gray-900 bg-opacity-80 p-3 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 mr-2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span className="text-white">Slow Down: {remainingTime} s</span>
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={newMessage}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => handleMessageChange(e as any)}
            placeholder={selectedImage ? "Add a caption (optional)..." : "Type your message..."}
            className="w-full p-3 bg-gray-700 text-white placeholder-gray-400 border-none rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none min-h-[44px] max-h-[120px] overflow-y-auto"
            disabled={isLoading || isRateLimited}
            rows={1}
            style={{ height: 'auto' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if ((newMessage.trim() || selectedImage) && !isRateLimited && newMessage.length <= MAX_MESSAGE_LENGTH) {
                  handleSendMessage(e as any);
                }
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              const newHeight = Math.min(target.scrollHeight, 120); // Max height of 120px (about 4 lines)
              target.style.height = `${newHeight}px`;
            }}
          />
          {/* Character counter */}
          <div className={`absolute bottom-[-14] right-2 text-xs ${newMessage.length > MAX_MESSAGE_LENGTH ? 'text-red-400' : 'text-gray-400'
            }`}>
            {newMessage.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 h-[44px] w-[44px] flex items-center justify-center flex-shrink-0"
          disabled={isLoading || isRateLimited}
          title="Upload image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleImageSelect}
            className="hidden"
          />
        </button>

        <button
          type="submit"
          className="bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 h-[44px] w-[44px] flex items-center justify-center flex-shrink-0"
          disabled={isLoading || isRateLimited || (!newMessage.trim() && !selectedImage) || newMessage.length > MAX_MESSAGE_LENGTH}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;