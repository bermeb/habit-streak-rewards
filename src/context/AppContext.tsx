import React, { useReducer, useEffect, ReactNode } from 'react';
import { AppState, HabitAction, HabitCompletion } from '@/types';
import { format } from 'date-fns';
import { calculateStreaks, shouldResetStreak, getDefaultRewards } from '../utils/habitUtils';
import { AppContext } from './useAppContext';

const initialState: AppState = {
  habits: [],
  rewards: getDefaultRewards(),
  milestones: [],
  completions: [],
  settings: {
    theme: 'system',
    notifications: true,
    soundEnabled: true,
    language: 'de',
    weekStartsOn: 1,
    streakCalculationMode: 'highest'
  },
  statistics: {
    totalHabitsCompleted: 0,
    longestStreak: 0,
    currentActiveHabits: 0,
    rewardsEarned: 0,
    lastUpdated: new Date().toISOString()
  },
  wheelState: {
    isSpinning: false,
    availableRewards: [],
    unlockedMilestones: []
  }
};

function appReducer(state: AppState, action: HabitAction): AppState {
  switch (action.type) {
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload],
        statistics: {
          ...state.statistics,
          currentActiveHabits: state.habits.length + 1,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload.id 
            ? { ...habit, ...action.payload.updates }
            : habit
        ),
        statistics: {
          ...state.statistics,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
        completions: state.completions.filter(completion => completion.habitId !== action.payload),
        statistics: {
          ...state.statistics,
          currentActiveHabits: state.habits.length - 1,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'COMPLETE_HABIT': {
      const { habitId, date, value } = action.payload;
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return state;

      const completion: HabitCompletion = {
        habitId,
        date,
        value,
        timestamp: new Date().toISOString()
      };

      const updatedCompletions = [...state.completions, completion];
      const updatedHabits = state.habits.map(h => {
        if (h.id === habitId) {
          const newCompletedDates = [...h.completedDates, date];
          const newStreak = calculateStreaks(newCompletedDates);
          return {
            ...h,
            streak: newStreak,
            lastCompleted: date,
            completedDates: newCompletedDates
          };
        }
        return h;
      });

      const newLongestStreak = Math.max(
        state.statistics.longestStreak,
        Math.max(...updatedHabits.map(h => h.streak))
      );

      return {
        ...state,
        habits: updatedHabits,
        completions: updatedCompletions,
        statistics: {
          ...state.statistics,
          totalHabitsCompleted: state.statistics.totalHabitsCompleted + 1,
          longestStreak: newLongestStreak,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case 'RESET_HABIT_STREAK':
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload 
            ? { ...habit, streak: 0 }
            : habit
        ),
        statistics: {
          ...state.statistics,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'ADD_REWARD':
      return {
        ...state,
        rewards: [...state.rewards, action.payload]
      };

    case 'UPDATE_REWARD':
      return {
        ...state,
        rewards: state.rewards.map(reward => 
          reward.id === action.payload.id 
            ? { ...reward, ...action.payload.updates }
            : reward
        )
      };

    case 'DELETE_REWARD':
      return {
        ...state,
        rewards: state.rewards.filter(reward => reward.id !== action.payload)
      };

    case 'CLAIM_REWARD': {
      const { rewardId, date } = action.payload;
      return {
        ...state,
        rewards: state.rewards.map(reward => 
          reward.id === rewardId 
            ? { ...reward, claimed: true, claimedDate: date }
            : reward
        ),
        statistics: {
          ...state.statistics,
          rewardsEarned: state.statistics.rewardsEarned + 1,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map((milestone, index) => 
          index === action.payload.index ? action.payload.milestone : milestone
        )
      };

    case 'ADD_MILESTONE':
      return {
        ...state,
        milestones: [...state.milestones, action.payload].sort((a, b) => a.days - b.days)
      };

    case 'DELETE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.filter((_, index) => index !== action.payload)
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'SPIN_WHEEL':
      return {
        ...state,
        wheelState: {
          ...state.wheelState,
          isSpinning: false,
          lastSpinResult: action.payload.result
        }
      };

    case 'SET_WHEEL_SPINNING':
      return {
        ...state,
        wheelState: {
          ...state.wheelState,
          isSpinning: action.payload
        }
      };

    case 'LOAD_STATE':
      return {
        ...action.payload,
        statistics: {
          ...action.payload.statistics,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'RESET_ALL_DATA':
      return {
        ...initialState,
        statistics: {
          ...initialState.statistics,
          lastUpdated: new Date().toISOString()
        }
      };

    default:
      return state;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('habit-tracker-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('habit-tracker-state', JSON.stringify(state));
  }, [state]);

  // Check for streak resets on app load/focus
  useEffect(() => {
    const checkStreakResets = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      state.habits.forEach(habit => {
        if (habit.lastCompleted && shouldResetStreak(habit.lastCompleted, today)) {
          dispatch({ type: 'RESET_HABIT_STREAK', payload: habit.id });
        }
      });
    };

    checkStreakResets();
    
    // Check when window gains focus
    const handleFocus = () => checkStreakResets();
    window.addEventListener('focus', handleFocus);
    
    // Set up periodic checking for streak dangers (every hour)
    const streakCheckInterval = setInterval(() => {
      checkStreakResets();
      // Note: Streak danger checking is handled by individual components that use the hook
    }, 1000 * 60 * 60); // 1 hour
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(streakCheckInterval);
    };
  }, [state.habits]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};