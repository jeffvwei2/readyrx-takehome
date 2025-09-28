import { db } from '../../config/firebase';
import { FirestoreTimestamp, FlexibleDate } from '../types/common';

/**
 * Utility functions for Firestore operations
 */

/**
 * Convert Firestore timestamp to JavaScript Date
 */
export const convertFirestoreTimestamp = (timestamp: FlexibleDate): Date => {
  if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
    // Firestore Timestamp format
    return new Date((timestamp as FirestoreTimestamp)._seconds * 1000);
  } else if (typeof timestamp === 'string') {
    // String date format
    return new Date(timestamp);
  } else if (timestamp instanceof Date) {
    // Already a Date object
    return timestamp;
  } else {
    // Fallback to current date
    return new Date();
  }
};

/**
 * Get document by ID from any collection
 */
export const getDocumentById = async <T = any>(
  collection: string, 
  id: string
): Promise<T | null> => {
  try {
    const doc = await db.collection(collection).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${collection} document ${id}:`, error);
    return null;
  }
};

/**
 * Get all documents from a collection
 */
export const getAllDocuments = async <T = any>(
  collection: string
): Promise<T[]> => {
  try {
    const snapshot = await db.collection(collection).get();
    const documents: T[] = [];
    
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return documents;
  } catch (error) {
    console.error(`Error fetching ${collection} documents:`, error);
    return [];
  }
};

/**
 * Get documents by field value
 */
export const getDocumentsByField = async <T = any>(
  collection: string,
  field: string,
  value: any
): Promise<T[]> => {
  try {
    const snapshot = await db.collection(collection)
      .where(field, '==', value)
      .get();
    
    const documents: T[] = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return documents;
  } catch (error) {
    console.error(`Error fetching ${collection} documents by ${field}:`, error);
    return [];
  }
};

/**
 * Create a new document in a collection
 */
export const createDocument = async <T = any>(
  collection: string,
  data: Omit<T, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating ${collection} document:`, error);
    throw error;
  }
};

/**
 * Update a document in a collection
 */
export const updateDocument = async <T = any>(
  collection: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    await db.collection(collection).doc(id).update(data);
  } catch (error) {
    console.error(`Error updating ${collection} document ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a document from a collection
 */
export const deleteDocument = async (
  collection: string,
  id: string
): Promise<void> => {
  try {
    await db.collection(collection).doc(id).delete();
  } catch (error) {
    console.error(`Error deleting ${collection} document ${id}:`, error);
    throw error;
  }
};
