import { useAppContext } from '../context/useAppContext';
import { Habit, HabitTemplate } from '@/types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { 
  generateHabitId, 
  isHabitCompletedToday, 
  getHabitCompletionRate,
  getHabitTemplates,
  calculateFrequencyStreak,
  shouldResetFrequencyStreak
} from '../utils/habitUtils';
import { useNotifications } from './useNotifications';
import { useAppPreferences } from './useLocalStorage';

export const useHabits = () => {
  const { state, dispatch } = useAppContext();
  const { showMilestoneNotification } = useNotifications();
  const { notificationsEnabled } = useAppPreferences();

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted' | 'completedDates' | 'created' | 'completionValues'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateHabitId(),
      streak: 0,
      lastCompleted: '',
      completedDates: [],
      completionValues: {},
      created: new Date().toISOString(),
      // Set defaults for new frequency properties
      frequency: habitData.frequency || 'daily',
      frequencyTarget: habitData.frequencyTarget || 1
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
      color: template.color,
      frequency: template.frequency || 'daily',
      frequencyTarget: template.frequencyTarget || 1
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
    
    // For frequency-based habits, we allow multiple completions per day
    // Only prevent re-completion for boolean daily habits
    if (habit.frequency === 'daily' && habit.type === 'boolean' && isHabitCompletedToday(habit)) {
      return;
    }

    // Calculate what the new streak will be after completion
    const updatedHabit: Habit = {
      ...habit,
      completedDates: [...habit.completedDates, today],
      completionValues: { ...habit.completionValues, [today]: value },
      lastCompleted: today
    };
    
    // Use new frequency-based streak calculation
    const newStreak = calculateFrequencyStreak(updatedHabit);

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
    const habitsAtRisk: Array<{name: string, daysLeft: number}> = [];
    
    state.habits.forEach(habit => {
      if (habit.streak > 0) {
        // Use new frequency-based streak danger logic
        const shouldReset = shouldResetFrequencyStreak(habit, today);
        
        if (shouldReset) {
          // For daily habits, follow the old logic
          if (habit.frequency === 'daily') {
            const lastCompletedDate = parseISO(habit.lastCompleted || today);
            const daysSinceCompleted = differenceInDays(now, lastCompletedDate);
            const completedToday = isHabitCompletedToday(habit);
            
            if (!completedToday && daysSinceCompleted >= 1) {
              const daysLeft = Math.max(0, 1 - (daysSinceCompleted - 1));
              habitsAtRisk.push({ name: habit.name, daysLeft });
            }
          } else {
            // For frequency-based habits, show generic warning
            habitsAtRisk.push({ 
              name: habit.name, 
              daysLeft: 0 // No specific days for frequency-based
            });
          }
        }
      }
    });

    // Only show notification if there are habits at risk and we haven't shown one today
    if (habitsAtRisk.length > 0) {
      const lastWarningKey = `streak-warning-multiple-${today}`;
      const lastWarning = localStorage.getItem(lastWarningKey);
      
      if (!lastWarning) {
        // Use the new consolidated notification method from notifications utils
        import('../utils/notifications').then(({ notificationManager }) => {
          notificationManager.showMultipleStreakDangerWarning(habitsAtRisk);
        });
        localStorage.setItem(lastWarningKey, 'shown');
      }
    }
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