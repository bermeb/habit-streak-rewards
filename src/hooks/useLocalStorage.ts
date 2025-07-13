import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
};

export const usePersistedState = <T>(key: string, initialValue: T) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, setValue]);

  return [value, setValue, removeValue] as const;
};

export const useAppPreferences = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('soundEnabled', true);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>('notificationsEnabled', true);
  const [language, setLanguage] = useLocalStorage<'en' | 'de'>('language', 'de');

  const clearPreferences = () => {
    setTheme('system');
    setSoundEnabled(true);
    setNotificationsEnabled(true);
    setLanguage('de');
  };

  return {
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    language,
    setLanguage,
    clearPreferences
  };
};

export const useStorageQuota = () => {
  const [quota, setQuota] = useState<{
    used: number;
    total: number;
    percentage: number;
  }>({ used: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const checkQuota = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const used = estimate.usage || 0;
          const total = estimate.quota || 0;
          const percentage = total > 0 ? (used / total) * 100 : 0;
          
          setQuota({ used, total, percentage });
        } catch (error) {
          console.warn('Error checking storage quota:', error);
        }
      }
    };

    checkQuota();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    quota,
    formatBytes,
    isNearQuotaLimit: quota.percentage > 80
  };
};