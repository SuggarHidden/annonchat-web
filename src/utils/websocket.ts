type MessageCallback = (message: any) => void;
import { toast } from 'react-toastify';

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageCallbacks: Map<string, MessageCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Cambiado a 10 intentos
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isReconnecting = false;

  constructor(private url: string) { }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.connect();
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.isReconnecting) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      this.sendStoredChatIds();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle stats messages
        if (data.type === 'stats') {
          // Broadcast stats to all subscribers of the 'stats' channel
          if (this.messageCallbacks.has('stats')) {
            this.messageCallbacks.get('stats')?.forEach(callback => callback(data));
          }
          return;
        }

        // Handle regular chat messages
        if (data.chat_id && this.messageCallbacks.has(data.chat_id)) {
          this.messageCallbacks.get(data.chat_id)?.forEach(callback => callback(data));
        }
      } catch (error) {
        console.log('Error processing message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    /*     this.socket.onerror = (error) => {
          console.log('WebSocket error:', error);
          // Don't close the socket here, let the onclose handler manage reconnection
          // The socket will close automatically after an error
        }; */
  }

  private attemptReconnect() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    let delay = 15000; // 15 segundos para los primeros 10 intentos

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      delay = 60000; // 1 minuto después de los 10 intentos
    } else {
      this.reconnectAttempts++;
    }

    console.log(`Attempting to reconnect in ${delay / 1000} seconds (attempt ${this.reconnectAttempts})`);

    // Mostrar toast con el tiempo de reconexión
    this.showReconnectionToast(delay);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.isReconnecting = false;
      this.connect();
    }, delay);
  }

  private showReconnectionToast(delay: number) {
    try {
      toast.info(`Connection lost. Reconnecting in ${delay / 1000} seconds...`, {
        position: "top-left",
        autoClose: delay,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: true,
      });
    } catch (error) {
      console.log('Error showing reconnection toast:', error);
    }
  }

  private sendStoredChatIds() {
    try {
      const chat_ids = this.getStoredChatIds();
      if (chat_ids.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'register',
          chat_ids: chat_ids
        }));
        console.log('Chat IDs sent to server:', chat_ids);
      }
    } catch (error) {
      console.log('Error sending chat IDs:', error);
    }
  }

  private getStoredChatIds(): string[] {
    try {
      // Get chat IDs from localStorage
      const chat_ids = [];
      const chatsData = localStorage.getItem('chats');

      if (chatsData) {
        const chats = JSON.parse(chatsData);
        if (Array.isArray(chats)) {
          // Extract only the IDs from the chats array
          chat_ids.push(...chats.map(chat => chat.id));
        }
      }

      return chat_ids;
    } catch (error) {
      console.log('Error getting chat IDs from localStorage:', error);
      return [];
    }
  }

  subscribe(chat_id: string, callback: MessageCallback) {
    if (!this.messageCallbacks.has(chat_id)) {
      this.messageCallbacks.set(chat_id, []);
    }
    this.messageCallbacks.get(chat_id)?.push(callback);

    // Connection is established during initialization
  }

  unsubscribe(chat_id: string, callback: MessageCallback) {
    if (this.messageCallbacks.has(chat_id)) {
      const callbacks = this.messageCallbacks.get(chat_id) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.messageCallbacks.delete(chat_id);
      }
    }
  }

  sendMessage(chat_id: string, encryptedMessage: string, sender: string, messageType: 'text' | 'image' = 'text', content: string = '') {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.log('WebSocket is not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify({
        type: 'message',
        chat_id,
        message: encryptedMessage,
        sender,
        messageType,
        content, // Send the actual content parameter
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.log('Error sending message:', error);
      return false;
    }
  }

  notifyNewChat(chat_id: string) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.log('WebSocket is not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify({
        type: 'new_chat',
        chat_ids: [chat_id]
      }));
      return true;
    } catch (error) {
      console.log('Error notifying new chat:', error);
      return false;
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.messageCallbacks.clear();
  }
}

export const websocketService = new WebSocketService(`wss://${process.env.NEXT_PUBLIC_API_URL}/ws`);

setTimeout(() => {
  websocketService.initialize();
}, 0);

export default websocketService;