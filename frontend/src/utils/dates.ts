// Shared frontend utilities

// Common Firestore timestamp type
export type FirestoreTimestamp = {
  _seconds: number;
  _nanoseconds: number;
};

// Common date types that can be Firestore timestamp, string, or Date
export type FlexibleDate = Date | string | FirestoreTimestamp;

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
 * Format date for display
 */
export const formatDate = (date: FlexibleDate, options?: Intl.DateTimeFormatOptions): string => {
  const jsDate = convertFirestoreTimestamp(date);
  return jsDate.toLocaleDateString(undefined, options);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: FlexibleDate, options?: Intl.DateTimeFormatOptions): string => {
  const jsDate = convertFirestoreTimestamp(date);
  return jsDate.toLocaleString(undefined, options);
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (date: FlexibleDate): string => {
  const jsDate = convertFirestoreTimestamp(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: FlexibleDate): boolean => {
  const jsDate = convertFirestoreTimestamp(date);
  const today = new Date();
  return jsDate.toDateString() === today.toDateString();
};

/**
 * Check if date is within last N days
 */
export const isWithinLastDays = (date: FlexibleDate, days: number): boolean => {
  const jsDate = convertFirestoreTimestamp(date);
  const now = new Date();
  const diffInDays = (now.getTime() - jsDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays <= days;
};
