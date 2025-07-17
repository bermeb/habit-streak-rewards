import React, { useState } from 'react';
import { 
  Calendar, 
  Target, 
  BarChart3,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  Activity,
  Eye
} from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useStreaks } from '../hooks/useStreaks';
import { useRewards } from '../hooks/useRewards';
import { useAppContext } from '../context/useAppContext';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { HabitCalendar } from './HabitCalendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';

export const Statistics: React.FC = () => {
  const { habits } = useHabits();
  const { getOverallStats } = useStreaks();
  const { getRewardStats } = useRewards();
  const { state: _state } = useAppContext();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'overview' | 'analytics' | 'calendar'>('overview');
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState<string | undefined>(undefined);

  const _overallStats = getOverallStats();
  const _rewardStats = getRewardStats();

  const getPeriodStats = () => {
    const _now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        break;
      case 'year':
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getPeriodStats();

  const getCompletionsByDate = () => {
    const completionsByDate: { [key: string]: number } = {};
    
    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        const dateObj = new Date(date);
        if (dateObj >= startDate && dateObj <= endDate) {
          const dateKey = format(dateObj, 'yyyy-MM-dd');
          completionsByDate[dateKey] = (completionsByDate[dateKey] || 0) + 1;
        }
      });
    });

    return completionsByDate;
  };

  const getHabitCompletionStats = () => {
    return habits.map(habit => {
      const completionsInPeriod = habit.completedDates.filter(date => {
        const dateObj = new Date(date);
        return dateObj >= startDate && dateObj <= endDate;
      }).length;

      const totalDaysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const completionRate = (completionsInPeriod / totalDaysInPeriod) * 100;

      return {
        ...habit,
        completionsInPeriod,
        completionRate: Math.round(completionRate)
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        newDate = direction === 'prev' ? subDays(selectedDate, 7) : addDays(selectedDate, 7);
        break;
      case 'month':
        newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + (direction === 'prev' ? -1 : 1), 1);
        break;
      case 'year':
        newDate = new Date(selectedDate.getFullYear() + (direction === 'prev' ? -1 : 1), 0, 1);
        break;
    }
    
    setSelectedDate(newDate);
  };

  const formatPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return `KW ${format(selectedDate, 'ww, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'year':
        return format(selectedDate, 'yyyy');
    }
  };

  const completionsByDate = getCompletionsByDate();
  const habitStats = getHabitCompletionStats();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'calendar':
        return (
          <div className="space-y-6">
            {/* Habit Selector for Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habit auswählen (optional)
              </label>
              <select
                value={selectedHabitForCalendar || ''}
                onChange={(e) => setSelectedHabitForCalendar(e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Alle Habits anzeigen</option>
                {habits.map(habit => (
                  <option key={habit.id} value={habit.id}>
                    {habit.icon} {habit.name}
                  </option>
                ))}
              </select>
            </div>
            <HabitCalendar selectedHabitId={selectedHabitForCalendar} />
          </div>
        );
      default:
        return (
          <>
            {/* Period Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigatePeriod('prev')}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatPeriodLabel()}
                  </h2>
                  
                  <button
                    onClick={() => navigatePeriod('next')}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {['week', 'month', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period as 'week' | 'month' | 'year')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {period === 'week' ? 'Woche' : period === 'month' ? 'Monat' : 'Jahr'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Completions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gesamte Erledigungen</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Object.values(completionsByDate).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Best Performing Habit */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bestes Habit</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {habitStats[0]?.name || 'Keine Daten'}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {habitStats[0]?.completionRate || 0}% Erfolgsrate
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Streaks */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Aktive Streaks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {habits.filter(h => h.streak > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Habit Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Habit Performance
              </h3>
              
              <div className="space-y-4">
                {habitStats.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {habit.completionsInPeriod} Erledigungen in diesem Zeitraum
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {habit.completionRate}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Erfolgsrate</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {habit.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            📊 Statistiken
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analysiere deine Gewohnheiten und verfolge deinen Fortschritt
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Übersicht
                </div>
              </button>
              
              <button
                onClick={() => setCurrentView('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Analytics
                </div>
              </button>
              
              <button
                onClick={() => setCurrentView('calendar')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'calendar'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Kalender
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Current View Content */}
        {renderCurrentView()}
      </div>
    </div>
  );
};