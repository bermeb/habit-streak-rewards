import React, { createContext } from 'react';
import { AppState, HabitAction } from '@/types';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<HabitAction>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};