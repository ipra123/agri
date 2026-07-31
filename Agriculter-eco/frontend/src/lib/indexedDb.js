const DB_NAME = "ChatFilesDB";
const STORE_NAME = "files";
const DB_VERSION = 1;

let dbPromise = null;

const getDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onerror = (e) => {
      console.error("IndexedDB open error:", e.target.error);
      reject(e.target.error);
    };
  });

  return dbPromise;
};

/**
 * Stores file data (Base64 string or Blob) associated with a message ID in IndexedDB.
 * @param {string} messageId 
 * @param {string|Blob} fileData 
 * @returns {Promise<boolean>}
 */
export const storeFile = async (messageId, fileData) => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(fileData, messageId);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => {
        console.error("IndexedDB store error:", e.target.error);
        reject(e.target.error);
      };
    });
  } catch (err) {
    console.error("Failed to store file in IndexedDB:", err);
    return false;
  }
};

/**
 * Retrieves file data associated with a message ID from IndexedDB.
 * @param {string} messageId 
 * @returns {Promise<string|Blob|null>}
 */
export const getFile = async (messageId) => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(messageId);

      request.onsuccess = (e) => resolve(e.target.result || null);
      request.onerror = (e) => {
        console.error("IndexedDB retrieve error:", e.target.error);
        reject(e.target.error);
      };
    });
  } catch (err) {
    console.error("Failed to retrieve file from IndexedDB:", err);
    return null;
  }
};
