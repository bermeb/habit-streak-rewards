import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useAppContext } from '../context/AppContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  completedHabits: string[];
  totalHabits: number;
  completionRate: number;
}

interface HabitCalendarProps {
  selectedHabitId?: string;
  onDateSelect?: (date: Date) => void;
}

export const HabitCalendar: React.FC<HabitCalendarProps> = ({ 
  selectedHabitId, 
  onDateSelect 
}) => {
  const { habits } = useHabits();
  const { state: _state } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isCurrentMonth = isSameMonth(date, currentMonth);
      const isToday = isSameDay(date, new Date());

      let completedHabits: string[] = [];
      let totalHabits = 0;

      if (selectedHabitId) {
        // Single habit view
        const habit = habits.find(h => h.id === selectedHabitId);
        if (habit) {
          totalHabits = 1;
          completedHabits = habit.completedDates.includes(dateStr) ? [habit.id] : [];
        }
      } else {
        // All habits view
        totalHabits = habits.length;
        completedHabits = habits
          .filter(habit => habit.completedDates.includes(dateStr))
          .map(habit => habit.id);
      }

      const completionRate = totalHabits > 0 ? (completedHabits.length / totalHabits) * 100 : 0;

      return {
        date,
        isCurrentMonth,
        isToday,
        completedHabits,
        totalHabits,
        completionRate
      };
    });
  }, [currentMonth, habits, selectedHabitId]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getCompletionColor = (completionRate: number) => {
    if (completionRate === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (completionRate < 25) return 'bg-red-100 dark:bg-red-900/30';
    if (completionRate < 50) return 'bg-orange-100 dark:bg-orange-900/30';
    if (completionRate < 75) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (completionRate < 100) return 'bg-blue-100 dark:bg-blue-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  const getCompletionIndicator = (completionRate: number) => {
    if (completionRate === 0) return '';
    if (completionRate < 25) return '🔴';
    if (completionRate < 50) return '🟠';
    if (completionRate < 75) return '🟡';
    if (completionRate < 100) return '🔵';
    return '🟢';
  };

  const handleDateClick = (day: CalendarDay) => {
    if (onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const selectedHabit = selectedHabitId ? habits.find(h => h.id === selectedHabitId) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📅 Kalender Ansicht
            </h2>
            {selectedHabit && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedHabit.icon} {selectedHabit.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: de })}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              relative p-2 min-h-[48px] text-sm border border-gray-200 dark:border-gray-600 
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
              ${!day.isCurrentMonth ? 'opacity-30' : ''}
              ${day.isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
              ${getCompletionColor(day.completionRate)}
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className={`
                font-medium
                ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}
                ${day.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
              `}>
                {format(day.date, 'd')}
              </span>
              
              {day.completionRate > 0 && (
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs">
                    {getCompletionIndicator(day.completionRate)}
                  </span>
                  {!selectedHabitId && day.totalHabits > 0 && (
                    <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
                      {day.completedHabits.length}/{day.totalHabits}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Legende
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-600 rounded border"></div>
            <span className="text-gray-600 dark:text-gray-400">Keine Habits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded border"></div>
            <span className="text-gray-600 dark:text-gray-400">0-25%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 rounded border"></div>
            <span className="text-gray-600 dark:text-gray-400">25-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded border"></div>
            <span className="text-gray-600 dark:text-gray-400">50-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded border"></div>
            <span className="text-gray-600 dark:text-gray-400">75-99%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded border"></div>
            <span className="text-gray-600 dark:text-gray-400">100%</span>
          </div>
        </div>
      </div>

      {/* Summary for current month */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          {format(currentMonth, 'MMMM', { locale: de })} Zusammenfassung
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Perfekte Tage:</span>
            <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
              {calendarDays.filter(day => day.isCurrentMonth && day.completionRate === 100).length}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Durchschnitt:</span>
            <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
              {Math.round(
                calendarDays
                  .filter(day => day.isCurrentMonth)
                  .reduce((sum, day) => sum + day.completionRate, 0) /
                calendarDays.filter(day => day.isCurrentMonth).length
              )}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};