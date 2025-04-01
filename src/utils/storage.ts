// Utility for storing and retrieving data using IndexedDB

const DB_NAME = 'annonChatDB';
const DB_VERSION = 1;
const IMAGES_STORE = 'images';
const MESSAGES_STORE = 'messages';

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        db.createObjectStore(MESSAGES_STORE, { keyPath: 'chatId' });
      }
    };
  });
};

// Image Storage Functions
export const storeImage = async (imageId: string, imageData: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGES_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGES_STORE);

      const request = store.put({ id: imageId, data: imageData });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error storing image in IndexedDB:', error);
  }
};

export const getImage = async (imageId: string): Promise<string | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGES_STORE], 'readonly');
      const store = transaction.objectStore(IMAGES_STORE);

      const request = store.get(imageId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };

      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error retrieving image from IndexedDB:', error);
    return null
  }
};

export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([IMAGES_STORE], 'readwrite');
      const store = transaction.objectStore(IMAGES_STORE);

      const request = store.delete(imageId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error);
  }
};

// Message Storage Functions
export const storeMessages = async (chatId: string, messages: any[]): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGES_STORE);
      
      // Store all messages, including image messages
      const request = store.put({ chatId, messages: messages });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error storing messages in IndexedDB:', error);
  }
};

// Store a single message and append it to existing messages
export const storeMessage = async (chatId: string, message: any): Promise<void> => {
  try {
    const existingMessages = await getMessages(chatId) || [];
    const updatedMessages = [...existingMessages, message];
    await storeMessages(chatId, updatedMessages);
  } catch (error) {
    console.error('Error storing single message in IndexedDB:', error);
  }
};

export const getMessages = async (chatId: string): Promise<any[] | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MESSAGES_STORE], 'readonly');
      const store = transaction.objectStore(MESSAGES_STORE);
      
      const request = store.get(chatId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.messages : null);
      };
      
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error retrieving messages from IndexedDB:', error);
    return null;
  }
};

export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
      const store = transaction.objectStore(MESSAGES_STORE);
      
      const request = store.delete(chatId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error deleting chat from IndexedDB:', error);
  }
};

// Clear all data from the database
export const clearAllData = async (): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MESSAGES_STORE, IMAGES_STORE], 'readwrite');
      const messagesStore = transaction.objectStore(MESSAGES_STORE);
      const imagesStore = transaction.objectStore(IMAGES_STORE);
      
      const clearMessagesRequest = messagesStore.clear();
      const clearImagesRequest = imagesStore.clear();
      
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error clearing all data from IndexedDB:', error);
  }
};