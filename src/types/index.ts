export interface Habit {
  id: string;
  name: string;
  type: 'boolean' | 'number' | 'time';
  target?: number; // für Kalorien/Minuten
  category: 'learning' | 'gym' | 'calories' | 'custom';
  streak: number;
  lastCompleted: string; // ISO date
  completedDates: string[];
  created: string; // ISO date
  icon?: string;
  color?: string;
}

export interface Reward {
  id: string;
  name: string;
  category: 'small' | 'medium' | 'large';
  description?: string;
  icon?: string;
  color?: string;
  claimed?: boolean;
  claimedDate?: string;
}

export interface Milestone {
  days: number;
  smallChance: number;
  mediumChance: number;
  largeChance: number;
  label?: string;
  achieved?: boolean;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // ISO date
  value: number | boolean;
  timestamp: string; // ISO timestamp
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  language: 'en' | 'de';
  reminderTime?: string; // HH:MM format
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  streakCalculationMode: 'highest' | 'all'; // highest = use highest streak, all = require all habits to reach milestone
}

export interface AppState {
  habits: Habit[];
  rewards: Reward[];
  milestones: Milestone[];
  completions: HabitCompletion[];
  settings: UserSettings;
  statistics: {
    totalHabitsCompleted: number;
    longestStreak: number;
    currentActiveHabits: number;
    rewardsEarned: number;
    lastUpdated: string;
  };
  wheelState: {
    isSpinning: boolean;
    lastSpinResult?: Reward;
    availableRewards: Reward[];
    unlockedMilestones: number[];
  };
}

export type HabitAction = 
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: { id: string; updates: Partial<Habit> } }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'COMPLETE_HABIT'; payload: { habitId: string; date: string; value: number | boolean } }
  | { type: 'RESET_HABIT_STREAK'; payload: string }
  | { type: 'ADD_REWARD'; payload: Reward }
  | { type: 'UPDATE_REWARD'; payload: { id: string; updates: Partial<Reward> } }
  | { type: 'DELETE_REWARD'; payload: string }
  | { type: 'CLAIM_REWARD'; payload: { rewardId: string; date: string } }
  | { type: 'UPDATE_MILESTONE'; payload: { index: number; milestone: Milestone } }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; payload: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SPIN_WHEEL'; payload: { result: Reward } }
  | { type: 'SET_WHEEL_SPINNING'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_ALL_DATA' };

export interface HabitTemplate {
  name: string;
  type: 'boolean' | 'number' | 'time';
  category: 'learning' | 'gym' | 'calories' | 'custom';
  target?: number;
  icon: string;
  color: string;
  description?: string;
}

export interface WheelSegment {
  id: string;
  reward: Reward;
  angle: number;
  color: string;
  probability: number;
}

export interface DateRange {
  start: string; // ISO date
  end: string; // ISO date
}

export interface StatsPeriod {
  label: string;
  days: number;
  dateRange: DateRange;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  averageValue?: number; // für number/time habits
  recentTrend: 'up' | 'down' | 'stable';
}

export interface RewardCategory {
  name: 'small' | 'medium' | 'large';
  color: string;
  probability: number;
  rewards: Reward[];
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Notification types
export interface NotificationConfig {
  enabled: boolean;
  time: string;
  days: number[]; // 0-6 for Sunday-Saturday
  message: string;
}

// Export utility types
export type HabitType = Habit['type'];
export type HabitCategory = Habit['category'];
export type RewardSize = Reward['category'];
export type ViewMode = 'dashboard' | 'habits' | 'rewards' | 'statistics' | 'settings';