/**
 * Local Storage Service
 * 
 * This service provides a reliable way to store and retrieve data
 * in all environments, including preview mode and new tab views.
 */

export const LOCAL_STORAGE_KEYS = {
  ADMIN_USERS: 'admin_users_data',
  ADMIN_INTERESTS: 'admin_interests_data',
  ADMIN_SERVICES: 'admin_services_data',
  ADMIN_METRICS: 'admin_metrics_data',
  AUTH_USER: 'auth_user_data',
  AUTH_TOKEN: 'auth_token',
  LAST_FETCH_TIME: 'last_fetch_time'
};

// Type for data with timestamp
type TimestampedData<T> = {
  data: T;
  timestamp: number;
};

// Save data to localStorage with timestamp
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const timestampedData: TimestampedData<T> = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(timestampedData));
    console.log(`Data saved to localStorage: ${key}`);
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
}

// Get data from localStorage with optional max age check
export function getFromLocalStorage<T>(key: string, maxAgeMs?: number): T | null {
  try {
    const storedValue = localStorage.getItem(key);
    
    if (!storedValue) return null;
    
    const timestampedData = JSON.parse(storedValue) as TimestampedData<T>;
    
    // Check if data is still fresh enough
    if (maxAgeMs && Date.now() - timestampedData.timestamp > maxAgeMs) {
      console.log(`Data in localStorage is stale: ${key}`);
      return null;
    }
    
    return timestampedData.data;
  } catch (error) {
    console.error(`Error getting from localStorage: ${key}`, error);
    return null;
  }
}

// Remove data from localStorage
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
  }
}

// Clear all app-related data from localStorage
export function clearAppData(): void {
  try {
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('All app data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing app data from localStorage', error);
  }
}

// Update last fetch time
export function updateLastFetchTime(): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_FETCH_TIME, Date.now().toString());
  } catch (error) {
    console.error('Error updating last fetch time', error);
  }
}

// Get last fetch time
export function getLastFetchTime(): number | null {
  try {
    const lastFetchTime = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_FETCH_TIME);
    return lastFetchTime ? parseInt(lastFetchTime, 10) : null;
  } catch (error) {
    console.error('Error getting last fetch time', error);
    return null;
  }
}