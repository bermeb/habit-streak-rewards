import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppContext } from './AppContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAppPreferences } from '../hooks/useLocalStorage';

interface NotificationContextType {
  triggerMilestoneCheck: (habitId: string, newStreak: number) => void;
  triggerStreakDangerCheck: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { state } = useAppContext();
  const { showMilestoneNotification, showStreakDangerWarning } = useNotifications();
  const { notificationsEnabled } = useAppPreferences();

  const triggerMilestoneCheck = (habitId: string, newStreak: number) => {
    if (!notificationsEnabled) return;

    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    // Check if this streak matches any milestone
    const achievedMilestone = state.milestones.find(milestone => 
      milestone.days === newStreak && newStreak > 0
    );

    if (achievedMilestone) {
      showMilestoneNotification(habit.name, newStreak);
    }
  };

  const triggerStreakDangerCheck = () => {
    if (!notificationsEnabled) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    state.habits.forEach(habit => {
      if (habit.streak > 0 && habit.lastCompleted) {
        const lastCompletedDate = new Date(habit.lastCompleted);
        const daysSinceCompleted = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Warn if they haven't completed today and it's been more than 0 days
        if (daysSinceCompleted >= 1) {
          const daysLeft = Math.max(0, 2 - daysSinceCompleted); // Grace period of 1 day
          if (daysLeft <= 1) {
            showStreakDangerWarning(habit.name, daysLeft);
          }
        }
      }
    });
  };

  // Check for streak dangers when the app loads or habits change
  useEffect(() => {
    const checkInterval = setInterval(triggerStreakDangerCheck, 1000 * 60 * 60); // Check every hour
    triggerStreakDangerCheck(); // Initial check

    return () => clearInterval(checkInterval);
  }, [state.habits, notificationsEnabled]);

  const contextValue: NotificationContextType = {
    triggerMilestoneCheck,
    triggerStreakDangerCheck
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};