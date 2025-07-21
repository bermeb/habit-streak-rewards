import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Habit } from '@/types';
import { useHabits } from '../hooks/useHabits';

interface HabitBackfillProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
}

export const HabitBackfill: React.FC<HabitBackfillProps> = ({ habit, isOpen, onClose }) => {
  const { completeHabitForDate, getBackfillableDays } = useHabits();
  const [completingDates, setCompletingDates] = useState<Set<string>>(new Set());
  const [inputValues, setInputValues] = useState<{ [date: string]: string }>({});

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus management could be added here
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const backfillableDays = getBackfillableDays(habit.id);

  const handleCompleteForDate = async (date: string) => {
    setCompletingDates(prev => new Set(prev).add(date));

    try {
      let value: number | boolean = true;
      
      if (habit.type === 'number' || habit.type === 'time') {
        const inputValue = inputValues[date];
        const parsedValue = inputValue ? parseInt(inputValue, 10) : (habit.target || 0);
        
        // Validate the input
        if (isNaN(parsedValue) || parsedValue < 0) {
          throw new Error('Ungültiger Wert eingegeben');
        }
        
        // Additional validation for time type (max 24 hours = 1440 minutes)
        if (habit.type === 'time' && parsedValue > 1440) {
          throw new Error('Zeit kann nicht mehr als 24 Stunden (1440 Minuten) betragen');
        }
        
        value = parsedValue;
      }

      completeHabitForDate(habit.id, date, value);
      
      // Remove from input values after completion
      setInputValues(prev => {
        const newValues = { ...prev };
        delete newValues[date];
        return newValues;
      });
    } catch (error) {
      console.error('Fehler beim Nachtragen:', error);
      // You could add a toast notification here
    } finally {
      setTimeout(() => {
        setCompletingDates(prev => {
          const newSet = new Set(prev);
          newSet.delete(date);
          return newSet;
        });
      }, 500);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Gestern';
    }
    
    return format(date, 'EEEE, d. MMMM', { locale: de });
  };

  const getDateIcon = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return <Clock size={16} className="text-orange-500" />;
    }
    
    return <Calendar size={16} className="text-gray-500" />;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backfill-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 
              id="backfill-title" 
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Vergessene Tage nachtragen
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Schließen"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {habit.name}
          </p>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {backfillableDays.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-gray-600 dark:text-gray-400">
                Alle Tage der letzten Woche sind bereits erledigt!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Du kannst bis zu 7 Tage rückwirkend als erledigt markieren:
              </p>
              
              {backfillableDays.map((date) => (
                <div
                  key={date}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getDateIcon(date)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDateDisplay(date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(parseISO(date), 'dd.MM.yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {habit.type === 'boolean' ? (
                      <button
                        onClick={() => handleCompleteForDate(date)}
                        disabled={completingDates.has(date)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg text-sm transition-colors"
                      >
                        {completingDates.has(date) ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Erledigt
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inputValues[date] || ''}
                          onChange={(e) => setInputValues(prev => ({
                            ...prev,
                            [date]: e.target.value
                          }))}
                          placeholder={habit.target?.toString() || '0'}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={() => handleCompleteForDate(date)}
                          disabled={completingDates.has(date)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                          title={!inputValues[date] ? `Standardwert verwenden: ${habit.target || 0}` : undefined}
                        >
                          {completingDates.has(date) ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          OK
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ℹ️ Das Nachtragen vergessener Tage hilft dir dabei, deinen Streak fortzusetzen, 
            auch wenn du mal vergessen hast, dein Habit zu markieren.
          </p>
        </div>
      </div>
    </div>
  );
};