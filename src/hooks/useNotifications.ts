import { useState, useEffect, useCallback } from 'react';
import { notificationManager, NotificationPermissionState } from '../utils/notifications';

export const useNotifications = () => {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(() => 
    notificationManager.getPermissionState()
  );
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Update permission state when it changes
    const updatePermissionState = () => {
      setPermissionState(notificationManager.getPermissionState());
    };

    // Listen for permission changes
    const interval = setInterval(updatePermissionState, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const requestPermission = useCallback(async () => {
    if (isRequesting || !permissionState.canRequest) {
      return permissionState.permission;
    }

    setIsRequesting(true);
    try {
      const permission = await notificationManager.requestPermission();
      setPermissionState(notificationManager.getPermissionState());
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    } finally {
      setIsRequesting(false);
    }
  }, [isRequesting, permissionState.canRequest, permissionState.permission]);

  const showMilestoneNotification = useCallback(async (habitName: string, milestone: number) => {
    if (permissionState.permission === 'granted') {
      return notificationManager.showMilestoneNotification(habitName, milestone);
    }
    return false;
  }, [permissionState.permission]);

  const showHabitReminder = useCallback(async (habitName: string) => {
    if (permissionState.permission === 'granted') {
      return notificationManager.showHabitReminder(habitName);
    }
    return false;
  }, [permissionState.permission]);

  const showStreakDangerWarning = useCallback(async (habitName: string, daysLeft: number) => {
    if (permissionState.permission === 'granted') {
      return notificationManager.showStreakDangerWarning(habitName, daysLeft);
    }
    return false;
  }, [permissionState.permission]);

  const clearNotifications = useCallback(async (tag?: string) => {
    if (tag) {
      await notificationManager.clearNotificationsByTag(tag);
    } else {
      await notificationManager.clearAllNotifications();
    }
  }, []);

  return {
    permissionState,
    isRequesting,
    requestPermission,
    showMilestoneNotification,
    showHabitReminder,
    showStreakDangerWarning,
    clearNotifications
  };
};