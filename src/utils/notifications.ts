export interface NotificationPermissionState {
  supported: boolean;
  permission: NotificationPermission;
  canRequest: boolean;
}

export interface CustomNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializeServiceWorker();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.error('Service Worker not ready:', error);
      }
    }
  }

  getPermissionState(): NotificationPermissionState {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    
    return {
      supported,
      permission: supported ? Notification.permission : 'denied',
      canRequest: supported && Notification.permission === 'default'
    };
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  async showNotification(options: CustomNotificationOptions): Promise<boolean> {
    const permissionState = this.getPermissionState();
    
    if (!permissionState.supported || permissionState.permission !== 'granted') {
      console.warn('Notifications not supported or not permitted');
      return false;
    }

    try {
      if (this.registration) {
        // Use service worker for persistent notifications
        const swNotificationOptions: NotificationOptions & { actions?: Array<{ action: string; title: string; icon?: string }> } = {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-192x192.png',
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction,
          silent: options.silent,
          vibrate: [200, 100, 200]
        };
        
        if (options.actions) {
          swNotificationOptions.actions = options.actions;
        }
        
        await this.registration.showNotification(options.title, swNotificationOptions);
      } else {
        // Fallback to regular notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction,
          silent: options.silent
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  async showMilestoneNotification(habitName: string, milestone: number): Promise<boolean> {
    return this.showNotification({
      title: '🎉 Meilenstein erreicht!',
      body: `${habitName}: ${milestone} Tage Streak! Zeit zum Belohnungsrad zu drehen!`,
      tag: 'milestone-achievement',
      data: {
        type: 'milestone',
        habitName,
        milestone,
        action: 'spin-wheel'
      },
      actions: [
        {
          action: 'spin-wheel',
          title: '🎰 Rad drehen',
          icon: '/icon-192x192.png'
        },
        {
          action: 'open-app',
          title: '📱 App öffnen',
          icon: '/icon-192x192.png'
        }
      ],
      requireInteraction: true
    });
  }

  async showHabitReminder(habitName: string): Promise<boolean> {
    return this.showNotification({
      title: '⏰ Habit Erinnerung',
      body: `Vergiss nicht: ${habitName} heute abhaken!`,
      tag: `habit-reminder-${habitName}`,
      data: {
        type: 'reminder',
        habitName,
        action: 'quick-check'
      },
      actions: [
        {
          action: 'mark-done',
          title: '✅ Erledigt',
          icon: '/icon-192x192.png'
        },
        {
          action: 'open-app',
          title: '📱 App öffnen',
          icon: '/icon-192x192.png'
        }
      ]
    });
  }

  async showStreakDangerWarning(habitName: string, daysLeft: number): Promise<boolean> {
    return this.showNotification({
      title: '⚠️ Streak in Gefahr!',
      body: `${habitName}: Nur noch ${daysLeft} Tag(e) bis dein Streak verloren geht!`,
      tag: `streak-danger-${habitName}`,
      data: {
        type: 'streak-danger',
        habitName,
        daysLeft,
        action: 'quick-check'
      },
      actions: [
        {
          action: 'mark-done',
          title: '✅ Jetzt abhaken',
          icon: '/icon-192x192.png'
        },
        {
          action: 'open-app',
          title: '📱 App öffnen',
          icon: '/icon-192x192.png'
        }
      ],
      requireInteraction: true
    });
  }

  async scheduleDailyReminder(habitName: string, time: string): Promise<boolean> {
    // Note: PWAs can't schedule notifications natively
    // This would require a server or using the app when it's open
    // For now, we'll use this as a placeholder for the notification logic
    console.log(`Scheduling daily reminder for ${habitName} at ${time}`);
    return true;
  }

  async clearNotificationsByTag(tag: string): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    }
  }

  async clearAllNotifications(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }
}

export const notificationManager = NotificationManager.getInstance();