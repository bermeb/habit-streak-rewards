import React, { useState } from 'react';
import { Check, Edit3, Trash2, Target, Clock, Hash, Calendar } from 'lucide-react';
import { Habit } from '@/types';
import { useHabits } from '../hooks/useHabits';
import { useStreaks } from '../hooks/useStreaks';
import { formatHabitValue } from '../utils/habitUtils';
import { HabitBackfill } from './HabitBackfill';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onEdit, onDelete }) => {
  const { completeHabit, getHabitStats, canBackfillHabit } = useHabits();
  const { getStreakColor, getStreakEmoji, getStreakMotivation } = useStreaks();
  const [inputValue, setInputValue] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);

  const stats = getHabitStats(habit.id);
  const streakColor = getStreakColor(habit.streak);
  const streakEmoji = getStreakEmoji(habit.streak);
  const motivation = getStreakMotivation(habit.streak);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      if (habit.type === 'boolean') {
        completeHabit(habit.id, true);
      } else if (habit.type === 'number' || habit.type === 'time') {
        const value = parseInt(inputValue, 10) || habit.target || 0;
        if (value < 0) {
          throw new Error('Der Wert darf nicht negativ sein');
        }
        completeHabit(habit.id, value);
        setInputValue('');
      }
    } catch (error) {
      console.error('Fehler beim Abschließen des Habits:', error);
      // Could add user notification here
    } finally {
      setTimeout(() => setIsCompleting(false), 500);
    }
  };

  const getCompletionButton = () => {
    if (stats?.isCompletedToday) {
      return (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium opacity-75 cursor-not-allowed"
        >
          <Check size={20} />
          Erledigt
        </button>
      );
    }

    if (habit.type === 'boolean') {
      return (
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isCompleting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={20} />
          )}
          Abhaken
        </button>
      );
    }

    return (
      <div className="flex gap-2 w-full">
        <div className="flex-1 relative">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={habit.target?.toString() || '0'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-2 text-gray-500 text-sm">
            {habit.type === 'time' ? 'Min' : habit.category === 'calories' ? 'kcal' : ''}
          </div>
        </div>
        <button
          onClick={handleComplete}
          disabled={isCompleting || !inputValue}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isCompleting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={20} />
          )}
          Eintragen
        </button>
      </div>
    );
  };

  const getTypeIcon = () => {
    switch (habit.type) {
      case 'boolean':
        return <Check size={20} />;
      case 'number':
        return <Hash size={20} />;
      case 'time':
        return <Clock size={20} />;
      default:
        return <Target size={20} />;
    }
  };

  return (
    <div className="habit-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: habit.color + '20', color: habit.color }}
          >
            {habit.icon || getTypeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
              {habit.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {habit.category} • {habit.type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}
              className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              <Edit3 size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(habit.id)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{streakEmoji}</span>
            <span 
              className="text-2xl font-bold"
              style={{ color: streakColor }}
            >
              {habit.streak}
            </span>
          </div>
        </div>
        
        {habit.target && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ziel
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatHabitValue(habit, habit.target)}
            </span>
          </div>
        )}

        {stats && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              30-Tage Rate
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(stats.completionRate)}%
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 italic">
          {motivation}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            {getCompletionButton()}
          </div>
          {canBackfillHabit(habit.id) && (
            <button
              onClick={() => setIsBackfillOpen(true)}
              className="px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors border border-orange-200 dark:border-orange-800"
              title="Vergessene Tage nachtragen"
            >
              <Calendar size={18} />
            </button>
          )}
        </div>
        
        {habit.streak > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {habit.streak}-Tage Streak! 🔥
            </div>
          </div>
        )}
      </div>
      
      <HabitBackfill 
        habit={habit}
        isOpen={isBackfillOpen}
        onClose={() => setIsBackfillOpen(false)}
      />
    </div>
  );
};