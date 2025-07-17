import React, { useEffect, useCallback, ReactNode } from 'react';
import { useAppContext } from './useAppContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAppPreferences } from '../hooks/useLocalStorage';
import { format, differenceInDays, parseISO } from 'date-fns';
import { isHabitCompletedToday } from '../utils/habitUtils';
import { NotificationContext, NotificationContextType } from './NotificationContextDefinition';

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

  const triggerStreakDangerCheck = useCallback(() => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    
    state.habits.forEach(habit => {
      if (habit.streak > 0 && habit.lastCompleted) {
        const lastCompletedDate = parseISO(habit.lastCompleted);
        const daysSinceCompleted = differenceInDays(now, lastCompletedDate);
        
        // Check if habit was completed today
        const completedToday = isHabitCompletedToday(habit);
        
        // Only warn if they haven't completed today AND it's been 1+ days since last completion
        if (!completedToday && daysSinceCompleted >= 1) {
          // Calculate how many days left before streak is lost
          const daysLeft = Math.max(0, 1 - (daysSinceCompleted - 1));
          
          // Only show warning once per day to avoid spam
          const lastWarningKey = `streak-warning-${habit.id}-${today}`;
          const lastWarning = localStorage.getItem(lastWarningKey);
          
          if (!lastWarning) {
            showStreakDangerWarning(habit.name, daysLeft);
            localStorage.setItem(lastWarningKey, 'shown');
          }
        }
      }
    });
  }, [notificationsEnabled, state.habits, showStreakDangerWarning]);

  // Register background sync for streak checking
  const scheduleBackgroundSync = useCallback(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('streak-danger-check');
      }).catch(error => {
        console.error('Background sync registration failed:', error);
      });
    }
  }, []);

  // Check for streak dangers when the app loads or habits change
  useEffect(() => {
    // Initial check
    triggerStreakDangerCheck();
    
    // Schedule background sync for when app is closed
    scheduleBackgroundSync();
    
    // Check every hour, but only during active hours (8 AM to 10 PM)
    const checkInterval = setInterval(() => {
      const currentHour = new Date().getHours();
      if (currentHour >= 8 && currentHour <= 22) {
        triggerStreakDangerCheck();
        scheduleBackgroundSync(); // Re-schedule background sync
      }
    }, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(checkInterval);
  }, [state.habits, notificationsEnabled, triggerStreakDangerCheck, scheduleBackgroundSync]);

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