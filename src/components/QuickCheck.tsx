import React, { useState, useEffect } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Check, CheckCircle, Home, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { isHabitCompletedToday } from '../utils/habitUtils';

interface QuickCheckProps {
  onNavigateHome?: () => void;
}

export const QuickCheck: React.FC<QuickCheckProps> = ({ onNavigateHome }) => {
  const { habits, completeHabit, getTodayCompletions } = useHabits();
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState<string[]>([]);

  const _today = format(new Date(), 'yyyy-MM-dd');
  const todayCompletions = getTodayCompletions();
  const pendingHabits = habits.filter(habit => !isHabitCompletedToday(habit));

  useEffect(() => {
    setCompletedToday(todayCompletions.map(h => h.id));
  }, [todayCompletions]);

  const handleCompleteHabit = (habitId: string) => {
    completeHabit(habitId);
    setJustCompleted(prev => [...prev, habitId]);
    
    // Remove from just completed after animation
    setTimeout(() => {
      setJustCompleted(prev => prev.filter(id => id !== habitId));
    }, 2000);
  };

  const getHabitIcon = (icon: string) => {
    // Simple icon mapping - in a real app you might want a more robust system
    const iconMap: { [key: string]: string } = {
      '💧': '💧', '🏃‍♂️': '🏃‍♂️', '📚': '📚', '🧘‍♀️': '🧘‍♀️', 
      '💤': '💤', '🥗': '🥗', '💻': '💻', '🏋️‍♂️': '🏋️‍♂️',
      '🚶‍♂️': '🚶‍♂️', '🎯': '🎯', '📝': '📝', '🎨': '🎨'
    };
    return iconMap[icon] || '✅';
  };

  const completionRate = habits.length > 0 ? (completedToday.length / habits.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ⚡ Schnell-Check
            </h1>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Home size={20} />
              </button>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Heute erledigt
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {completedToday.length} / {habits.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {Math.round(completionRate)}% abgeschlossen
            </p>
          </div>
        </div>

        {/* Pending Habits */}
        {pendingHabits.length > 0 ? (
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock size={18} />
              Noch zu erledigen
            </h2>
            {pendingHabits.map(habit => {
              const isJustCompleted = justCompleted.includes(habit.id);
              
              return (
                <button
                  key={habit.id}
                  onClick={() => habit.id && handleCompleteHabit(habit.id)}
                  disabled={isJustCompleted}
                  className={`w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                    isJustCompleted 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {isJustCompleted ? '✅' : getHabitIcon(habit.icon || '')}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>🔥 {habit.streak} Tage</span>
                        <span>•</span>
                        <span className="capitalize">{habit.category}</span>
                      </div>
                    </div>
                    <div className={`transition-transform duration-200 ${
                      isJustCompleted ? 'scale-110' : ''
                    }`}>
                      {isJustCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Check className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Alle Habits erledigt!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fantastisch! Du hast heute alle deine Habits abgeschlossen.
            </p>
          </div>
        )}

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              Heute erledigt
            </h2>
            <div className="grid gap-2">
              {habits
                .filter(habit => completedToday.includes(habit.id))
                .map(habit => (
                  <div
                    key={habit.id}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{getHabitIcon(habit.icon || '')}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {habit.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          🔥 {habit.streak} Tage Streak
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick tip */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>💡 Tipp:</strong> Füge diese Seite zu deinem Homescreen hinzu für schnellen Zugriff!
          </p>
        </div>
      </div>
    </div>
  );
};