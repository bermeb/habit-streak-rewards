import { useAppContext } from '../context/useAppContext';
import { Habit, HabitTemplate } from '@/types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { 
  generateHabitId, 
  isHabitCompletedToday, 
  getHabitCompletionRate,
  getHabitTemplates,
  calculateStreaks
} from '../utils/habitUtils';
import { useNotifications } from './useNotifications';
import { useAppPreferences } from './useLocalStorage';

export const useHabits = () => {
  const { state, dispatch } = useAppContext();
  const { showMilestoneNotification, showStreakDangerWarning } = useNotifications();
  const { notificationsEnabled } = useAppPreferences();

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'completedDates' | 'created'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateHabitId(),
      streak: 0,
      lastCompleted: '',
      completedDates: [],
      created: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_HABIT', payload: newHabit });
    return newHabit;
  };

  const addHabitFromTemplate = (template: HabitTemplate) => {
    return addHabit({
      name: template.name,
      type: template.type,
      category: template.category,
      target: template.target,
      icon: template.icon,
      color: template.color
    });
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    dispatch({ type: 'UPDATE_HABIT', payload: { id, updates } });
  };

  const deleteHabit = (id: string) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
  };

  const completeHabit = (habitId: string, value: number | boolean = true) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if already completed today
    if (isHabitCompletedToday(habit)) {
      return;
    }

    // Calculate what the new streak will be after completion
    const newCompletedDates = [...habit.completedDates, today];
    const newStreak = calculateStreaks(newCompletedDates);

    // Check for milestone achievement
    if (notificationsEnabled && newStreak > habit.streak) {
      const achievedMilestone = state.milestones.find(milestone => 
        milestone.days === newStreak && newStreak > 0
      );

      if (achievedMilestone) {
        // Delay notification slightly to ensure state is updated
        setTimeout(() => {
          showMilestoneNotification(habit.name, newStreak);
        }, 500);
      }
    }

    dispatch({ 
      type: 'COMPLETE_HABIT', 
      payload: { habitId, date: today, value } 
    });
  };

  const resetHabitStreak = (habitId: string) => {
    dispatch({ type: 'RESET_HABIT_STREAK', payload: habitId });
  };

  const getHabitById = (id: string): Habit | undefined => {
    return state.habits.find(habit => habit.id === id);
  };

  const getHabitsByCategory = (category: Habit['category']): Habit[] => {
    return state.habits.filter(habit => habit.category === category);
  };

  const getTodayCompletions = (): Habit[] => {
    return state.habits.filter(habit => isHabitCompletedToday(habit));
  };

  const getStreakLeaders = (limit: number = 5): Habit[] => {
    return [...state.habits]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, limit);
  };

  const getHabitStats = (habitId: string, days: number = 30) => {
    const habit = getHabitById(habitId);
    if (!habit) return null;

    const completionRate = getHabitCompletionRate(habit, days);
    const isCompletedToday = isHabitCompletedToday(habit);

    return {
      completionRate,
      isCompletedToday,
      currentStreak: habit.streak,
      totalCompletions: habit.completedDates.length,
      averagePerWeek: (habit.completedDates.length / Math.max(1, days)) * 7
    };
  };

  const getAvailableTemplates = (): HabitTemplate[] => {
    return getHabitTemplates();
  };

  const checkStreakDangers = () => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    
    state.habits.forEach(habit => {
      if (habit.streak > 0 && habit.lastCompleted) {
        const lastCompletedDate = parseISO(habit.lastCompleted);
        const daysSinceCompleted = differenceInDays(now, lastCompletedDate);
        
        // Check if habit was completed today
        const completedToday = isHabitCompletedToday(habit);
        
        // Warn if they haven't completed today AND it's been 1+ days since last completion
        // This gives them until end of today to complete it
        if (!completedToday && daysSinceCompleted >= 1) {
          // Calculate how many days left before streak is lost
          // Streak is lost if they miss tomorrow (daysSinceCompleted >= 2)
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
  };

  return {
    habits: state.habits,
    addHabit,
    addHabitFromTemplate,
    updateHabit,
    deleteHabit,
    completeHabit,
    resetHabitStreak,
    getHabitById,
    getHabitsByCategory,
    getTodayCompletions,
    getStreakLeaders,
    getHabitStats,
    getAvailableTemplates,
    checkStreakDangers
  };
};