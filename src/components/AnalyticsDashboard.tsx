import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useAppContext } from '../context/AppContext';
import { 
  format, 
  subDays, 
  parseISO, 
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';

interface _HabitAnalytics {
  habitId: string;
  habitName: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  completionRate7Days: number;
  completionRate30Days: number;
  totalCompletions: number;
  trend: 'up' | 'down' | 'stable';
  lastCompleted: string | null;
  averageGap: number;
}

interface WeeklyData {
  week: string;
  completed: number;
  total: number;
  rate: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const { habits } = useHabits();
  const { state: _state } = useAppContext();
  const [_selectedPeriod, _setSelectedPeriod] = useState<7 | 30 | 90>(30);

  const habitAnalytics = useMemo(() => {
    const today = new Date();
    
    return habits.map(habit => {
      const completions = habit.completedDates.map(date => parseISO(date));
      
      // Calculate completion rates for different periods
      const last7Days = subDays(today, 7);
      const last30Days = subDays(today, 30);
      
      const completions7Days = completions.filter(date => date >= last7Days).length;
      const completions30Days = completions.filter(date => date >= last30Days).length;
      
      const completionRate7Days = (completions7Days / 7) * 100;
      const completionRate30Days = (completions30Days / 30) * 100;
      
      // Calculate trend (compare last 7 days to previous 7 days)
      const previous7Days = completions.filter(date => 
        date >= subDays(last7Days, 7) && date < last7Days
      ).length;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (completions7Days > previous7Days) trend = 'up';
      else if (completions7Days < previous7Days) trend = 'down';
      
      // Calculate average gap between completions
      const sortedCompletions = completions.sort((a, b) => a.getTime() - b.getTime());
      let averageGap = 0;
      if (sortedCompletions.length > 1) {
        const gaps = [];
        for (let i = 1; i < sortedCompletions.length; i++) {
          gaps.push(differenceInDays(sortedCompletions[i], sortedCompletions[i - 1]));
        }
        averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      }

      // Find longest streak in history
      let longestStreak = 0;
      let currentStreakInCalc = 0;
      const allDates = habit.completedDates.sort();
      
      for (let i = 0; i < allDates.length; i++) {
        if (i === 0) {
          currentStreakInCalc = 1;
        } else {
          const prevDate = parseISO(allDates[i - 1]);
          const currDate = parseISO(allDates[i]);
          const daysDiff = differenceInDays(currDate, prevDate);
          
          if (daysDiff === 1) {
            currentStreakInCalc++;
          } else {
            longestStreak = Math.max(longestStreak, currentStreakInCalc);
            currentStreakInCalc = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, currentStreakInCalc);

      return {
        habitId: habit.id,
        habitName: habit.name,
        icon: habit.icon || '📝',
        currentStreak: habit.streak,
        longestStreak,
        completionRate7Days,
        completionRate30Days,
        totalCompletions: habit.completedDates.length,
        trend,
        lastCompleted: habit.lastCompleted,
        averageGap
      };
    });
  }, [habits]);

  const weeklyData = useMemo(() => {
    const weeks: WeeklyData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(subDays(today, i * 7), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      let totalCompleted = 0;
      let totalPossible = 0;
      
      weekDays.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        totalPossible += habits.length;
        
        habits.forEach(habit => {
          if (habit.completedDates.includes(dayStr)) {
            totalCompleted++;
          }
        });
      });
      
      weeks.unshift({
        week: format(weekStart, 'dd.MM'),
        completed: totalCompleted,
        total: totalPossible,
        rate: totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0
      });
    }
    
    return weeks;
  }, [habits]);

  const overallStats = useMemo(() => {
    const totalHabits = habits.length;
    const activeStreaks = habits.filter(h => h.streak > 0).length;
    const avgCompletionRate = habitAnalytics.reduce((sum, h) => sum + h.completionRate30Days, 0) / Math.max(habitAnalytics.length, 1);
    const bestStreak = Math.max(...habitAnalytics.map(h => h.currentStreak), 0);
    const improvingHabits = habitAnalytics.filter(h => h.trend === 'up').length;
    
    return {
      totalHabits,
      activeStreaks,
      avgCompletionRate,
      bestStreak,
      improvingHabits
    };
  }, [habitAnalytics, habits]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gesamt Habits</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {overallStats.totalHabits}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktive Streaks</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {overallStats.activeStreaks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ø Erfolgsrate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(overallStats.avgCompletionRate)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bester Streak</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {overallStats.bestStreak}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verbessernd</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {overallStats.improvingHabits}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          📊 Wöchentlicher Fortschritt
        </h3>
        
        <div className="space-y-3">
          {weeklyData.map((week, _index) => (
            <div key={week.week} className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                {week.week}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-500"
                  style={{ width: `${week.rate}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {Math.round(week.rate)}%
                </div>
              </div>
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400 text-right">
                {week.completed}/{week.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          🎯 Habit Performance
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Habit
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Streak
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  7 Tage
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  30 Tage
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Trend
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rekord
                </th>
              </tr>
            </thead>
            <tbody>
              {habitAnalytics
                .sort((a, b) => b.completionRate30Days - a.completionRate30Days)
                .map(habit => (
                <tr key={habit.habitId} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {habit.habitName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                      🔥 {habit.currentStreak}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-medium ${getCompletionColor(habit.completionRate7Days)}`}>
                      {Math.round(habit.completionRate7Days)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-medium ${getCompletionColor(habit.completionRate30Days)}`}>
                      {Math.round(habit.completionRate30Days)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {getTrendIcon(habit.trend)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" />
                      {habit.longestStreak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
          💡 Insights & Empfehlungen
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best performing habit */}
          {habitAnalytics.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                🏆 Top Performer
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {habitAnalytics.reduce((best, current) => 
                  current.completionRate30Days > best.completionRate30Days ? current : best
                ).habitName} mit {Math.round(habitAnalytics.reduce((best, current) => 
                  current.completionRate30Days > best.completionRate30Days ? current : best
                ).completionRate30Days)}% Erfolgsrate
              </p>
            </div>
          )}

          {/* Habit that needs attention */}
          {habitAnalytics.some(h => h.completionRate30Days < 50) && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Braucht Aufmerksamkeit
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {habitAnalytics
                  .filter(h => h.completionRate30Days < 50)
                  .sort((a, b) => a.completionRate30Days - b.completionRate30Days)[0]?.habitName} 
                - Vielleicht das Ziel anpassen?
              </p>
            </div>
          )}

          {/* Improving habits */}
          {overallStats.improvingHabits > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                📈 Positive Entwicklung
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {overallStats.improvingHabits} Habit(s) zeigen eine positive Entwicklung - weiter so!
              </p>
            </div>
          )}

          {/* Consistency insight */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              🎯 Konsistenz-Tipp
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {overallStats.avgCompletionRate > 70 
                ? "Fantastische Konsistenz! Versuche neue Herausforderungen." 
                : "Fokussiere dich auf 1-2 Habits für bessere Konsistenz."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};