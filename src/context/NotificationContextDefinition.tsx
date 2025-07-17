import { createContext } from 'react';

export interface NotificationContextType {
  triggerMilestoneCheck: (habitId: string, newStreak: number) => void;
  triggerStreakDangerCheck: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);