import { AppState } from '../types';

export interface ExportData {
  version: string;
  exportDate: string;
  appData: AppState;
}

export const CURRENT_VERSION = '1.0.0';

export const exportAppData = (state: AppState): void => {
  const exportData: ExportData = {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    appData: state
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const validateImportData = (data: unknown): { isValid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid file format' };
  }

  if (!data.version) {
    return { isValid: false, error: 'Missing version information' };
  }

  if (!data.appData) {
    return { isValid: false, error: 'Missing app data' };
  }

  const requiredFields = ['habits', 'rewards', 'milestones', 'completions', 'settings', 'statistics'];
  for (const field of requiredFields) {
    if (!(field in data.appData)) {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate habits structure
  if (!Array.isArray(data.appData.habits)) {
    return { isValid: false, error: 'Invalid habits data structure' };
  }

  // Validate rewards structure
  if (!Array.isArray(data.appData.rewards)) {
    return { isValid: false, error: 'Invalid rewards data structure' };
  }

  // Validate milestones structure
  if (!Array.isArray(data.appData.milestones)) {
    return { isValid: false, error: 'Invalid milestones data structure' };
  }

  // Validate completions structure
  if (!Array.isArray(data.appData.completions)) {
    return { isValid: false, error: 'Invalid completions data structure' };
  }

  return { isValid: true };
};

export const importAppData = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        const validation = validateImportData(data);
        if (!validation.isValid) {
          reject(new Error(validation.error));
          return;
        }
        
        resolve(data as ExportData);
      } catch {
        reject(new Error('Failed to parse file: Invalid JSON format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getDataSize = (state: AppState): string => {
  const dataStr = JSON.stringify(state);
  const bytes = new Blob([dataStr]).size;
  return formatFileSize(bytes);
};