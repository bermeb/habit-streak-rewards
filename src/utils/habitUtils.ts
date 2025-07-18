import {addDays, differenceInDays, format, isAfter, isBefore, parseISO, subDays} from 'date-fns';
import {Habit, HabitTemplate, Milestone, Reward} from '@/types';

export const calculateStreaks = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  const sortedDates = completedDates
    .map(date => parseISO(date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentDate = new Date();
  
  // Start from today and work backwards
  for (let i = 0; i < sortedDates.length; i++) {
    const completedDate = sortedDates[i];
    const daysDiff = differenceInDays(currentDate, completedDate);
    
    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
};

export const shouldResetStreak = (lastCompleted: string, today: string): boolean => {
  const lastCompletedDate = parseISO(lastCompleted);
  const todayDate = parseISO(today);
  const daysDiff = differenceInDays(todayDate, lastCompletedDate);
  
  return daysDiff > 1;
};

export const isHabitCompletedToday = (habit: Habit, today?: string): boolean => {
  const todayDate = today || format(new Date(), 'yyyy-MM-dd');
  return habit.completedDates.includes(todayDate);
};

export const getHabitCompletionRate = (habit: Habit, days: number = 30): number => {
  const today = new Date();
  const startDate = subDays(today, days);
  
  const completionsInPeriod = habit.completedDates.filter(date => {
    const completedDate = parseISO(date);
    return isAfter(completedDate, startDate) && isBefore(completedDate, addDays(today, 1));
  }).length;

  return (completionsInPeriod / days) * 100;
};


export const getDefaultRewards = (): Reward[] => [
  // Small rewards
  { id: 'small-1', name: '15 Min Lieblingsserie', category: 'small', description: 'Entspannen mit einer Folge', icon: '📺', color: '#10B981' },
  { id: 'small-2', name: 'Lieblings-Snack', category: 'small', description: 'Gesunder Snack als Belohnung', icon: '🍎', color: '#10B981' },
  { id: 'small-3', name: '10 Min Meditation', category: 'small', description: 'Entspannung für Körper und Geist', icon: '🧘', color: '#10B981' },
  { id: 'small-4', name: 'Kurzer Spaziergang', category: 'small', description: 'Frische Luft und Bewegung', icon: '🚶', color: '#10B981' },
  { id: 'small-5', name: 'Lieblingslied hören', category: 'small', description: 'Musik für die Seele', icon: '🎵', color: '#10B981' },
  
  // Medium rewards
  { id: 'medium-1', name: 'Kino/Film Abend', category: 'medium', description: 'Filmabend mit Freunden oder Familie', icon: '🎬', color: '#F59E0B' },
  { id: 'medium-2', name: 'Neues Buch kaufen', category: 'medium', description: 'Investition in Bildung und Unterhaltung', icon: '📚', color: '#F59E0B' },
  { id: 'medium-3', name: 'Massage/Wellness', category: 'medium', description: 'Entspannung und Selbstfürsorge', icon: '💆', color: '#F59E0B' },
  { id: 'medium-4', name: 'Restaurant Besuch', category: 'medium', description: 'Besonderes Essen genießen', icon: '🍽️', color: '#F59E0B' },
  { id: 'medium-5', name: 'Hobby-Ausrüstung', category: 'medium', description: 'Neues Equipment für Hobbys', icon: '⚽', color: '#F59E0B' },
  
  // Large rewards
  { id: 'large-1', name: 'Wochenendtrip', category: 'large', description: 'Kurzer Urlaub oder Ausflug', icon: '✈️', color: '#EF4444' },
  { id: 'large-2', name: 'Großer Wunsch', category: 'large', description: 'Etwas, das du dir schon lange wünschst', icon: '⭐', color: '#EF4444' },
  { id: 'large-3', name: 'Kurs/Workshop', category: 'large', description: 'Neue Fähigkeiten erlernen', icon: '🎓', color: '#EF4444' },
  { id: 'large-4', name: 'Teures Hobby-Item', category: 'large', description: 'Große Anschaffung für Hobbys', icon: '🎯', color: '#EF4444' },
  { id: 'large-5', name: 'Spa Tag', category: 'large', description: 'Ganztägige Wellness-Behandlung', icon: '🧖', color: '#EF4444' }
];

export const getHabitTemplates = (): HabitTemplate[] => [
  {
    name: 'Lernen',
    type: 'time',
    category: 'learning',
    target: 30,
    icon: '📚',
    color: '#3B82F6',
    description: 'Tägliche Lernzeit in Minuten'
  },
  {
    name: 'Gym/Sport',
    type: 'boolean',
    category: 'gym',
    icon: '💪',
    color: '#EF4444',
    description: 'Sportliche Aktivität'
  },
  {
    name: 'Kalorien tracking',
    type: 'number',
    category: 'calories',
    target: 2000,
    icon: '🥗',
    color: '#10B981',
    description: 'Tägliche Kalorienzufuhr'
  },
  {
    name: 'Wasser trinken',
    type: 'number',
    category: 'custom',
    target: 8,
    icon: '💧',
    color: '#06B6D4',
    description: 'Gläser Wasser pro Tag'
  },
  {
    name: 'Meditation',
    type: 'time',
    category: 'custom',
    target: 10,
    icon: '🧘',
    color: '#8B5CF6',
    description: 'Tägliche Meditation in Minuten'
  },
  {
    name: 'Lesen',
    type: 'time',
    category: 'custom',
    target: 20,
    icon: '📖',
    color: '#F59E0B',
    description: 'Tägliche Lesezeit in Minuten'
  }
];

export const getNextMilestone = (currentStreak: number, milestones: Milestone[]): Milestone | null => {
  const sortedMilestones = milestones.sort((a, b) => a.days - b.days);
  return sortedMilestones.find(milestone => milestone.days > currentStreak) || null;
};

export const getAchievedMilestones = (currentStreak: number, milestones: Milestone[]): Milestone[] => {
  return milestones.filter(milestone => milestone.days <= currentStreak);
};

export const calculateMilestoneProgress = (currentStreak: number, milestones: Milestone[]): number => {
  const nextMilestone = getNextMilestone(currentStreak, milestones);
  if (!nextMilestone) return 100;
  
  const previousMilestone = milestones
    .filter(m => m.days <= currentStreak)
    .sort((a, b) => b.days - a.days)[0];
  
  const start = previousMilestone?.days || 0;
  const end = nextMilestone.days;
  return Math.min(((currentStreak - start) / (end - start)) * 100, 100);
};

export const canSpinWheel = (habit: Habit, milestones: Milestone[]): boolean => {
  const achievedMilestones = getAchievedMilestones(habit.streak, milestones);
  return achievedMilestones.length > 0;
};

export const getRewardProbabilities = (streak: number, milestones: Milestone[], showNext: boolean = false): { small: number; medium: number; large: number } => {
  if (showNext) {
    // Show probabilities for the next milestone to reach
    const nextMilestone = getNextMilestone(streak, milestones);
    if (nextMilestone) {
      return {
        small: nextMilestone.smallChance,
        medium: nextMilestone.mediumChance,
        large: nextMilestone.largeChance
      };
    }
    // If no next milestone, show the highest achieved one
  }
  
  // Find the highest milestone that has been achieved (streak >= milestone.days)
  const achievedMilestones = milestones
    .filter(m => streak >= m.days)
    .sort((a, b) => b.days - a.days);
  
  const currentMilestone = achievedMilestones[0];
  
  if (!currentMilestone) {
    // Use first milestone percentages when no milestones are achieved
    const firstMilestone = milestones.sort((a, b) => a.days - b.days)[0];
    if (firstMilestone) {
      return {
        small: firstMilestone.smallChance,
        medium: firstMilestone.mediumChance,
        large: firstMilestone.largeChance
      };
    }
    // Fallback if no milestones configured at all
    return { small: 50, medium: 30, large: 20 };
  }
  
  return {
    small: currentMilestone.smallChance,
    medium: currentMilestone.mediumChance,
    large: currentMilestone.largeChance
  };
};

export const calculateEffectiveStreak = (habits: Habit[], mode: 'highest' | 'all', milestones: Milestone[]): number => {
  if (habits.length === 0) return 0;
  
  if (mode === 'highest') {
    // Return the highest streak among all habits
    return Math.max(...habits.map(h => h.streak));
  } else {
    // Return the highest milestone where ALL habits have reached that milestone
    const sortedMilestones = milestones.sort((a, b) => a.days - b.days);
    
    for (let i = sortedMilestones.length - 1; i >= 0; i--) {
      const milestone = sortedMilestones[i];
      const allHabitsReachedMilestone = habits.every(habit => habit.streak >= milestone.days);
      
      if (allHabitsReachedMilestone) {
        return milestone.days;
      }
    }
    
    // If no milestones are reached by all habits, return the minimum streak
    return Math.min(...habits.map(h => h.streak));
  }
};

export const formatHabitValue = (habit: Habit, value: number | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }
  
  if (habit.type === 'time') {
    return `${value} Min`;
  }
  
  if (habit.type === 'number') {
    if (habit.category === 'calories') {
      return `${value} kcal`;
    }
    return value.toString();
  }
  
  return value.toString();
};

export const generateHabitId = (): string => {
  return `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRewardId = (): string => {
  return `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatPercentage = (value: number): string => {
  // Format percentage with German locale (comma as decimal separator)
  // Remove unnecessary decimals (e.g., 60,0% becomes 60%)
  const formatted = value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
  return `${formatted}%`;
};