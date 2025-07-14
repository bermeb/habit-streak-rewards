import React, { useState, useEffect } from 'react';
import { Plus, Trophy, CheckCircle, Circle, Timer, Hash } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useStreaks } from '../hooks/useStreaks';
import { useRewards } from '../hooks/useRewards';
import { useAppContext } from '../context/AppContext';
import { HabitForm } from './HabitForm';
import { RewardWheel } from './RewardWheel';
import { MilestoneProgress } from './MilestoneProgress';
import { format } from 'date-fns';
import { Habit } from '../types';
import { isHabitCompletedToday } from '../utils/habitUtils';

export const Dashboard: React.FC = () => {
  const { habits, getTodayCompletions, getStreakLeaders, completeHabit, checkStreakDangers } = useHabits();
  const { getOverallStats } = useStreaks();
  const { getRewardStats } = useRewards();
  const { state } = useAppContext();
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [_selectedHabitForWheel, _setSelectedHabitForWheel] = useState<string | null>(null);
  const [habitInputValues, setHabitInputValues] = useState<Record<string, number>>({});
  const [habitInputStrings, setHabitInputStrings] = useState<Record<string, string>>({});

  const todayCompletions = getTodayCompletions();
  const streakLeaders = getStreakLeaders(3);
  const overallStats = getOverallStats();
  const rewardStats = getRewardStats();

  const today = format(new Date(), 'EEEE, d. MMMM yyyy');

  // Check for streak dangers when dashboard loads
  useEffect(() => {
    checkStreakDangers();
    
    // Set up periodic checking (every 30 minutes)
    const interval = setInterval(checkStreakDangers, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkStreakDangers]);

  const getMotivationalGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen! 🌅';
    if (hour < 18) return 'Hallo! ☀️';
    return 'Guten Abend! 🌙';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleCompleteHabit = (habit: Habit) => {
    if (habit.type === 'boolean') {
      completeHabit(habit.id, true);
    } else {
      const stringValue = habitInputStrings[habit.id] || '';
      const value = parseInt(stringValue) || habitInputValues[habit.id] || habit.target || 0;
      if (value > 0) {
        completeHabit(habit.id, value);
        setHabitInputValues(prev => ({ ...prev, [habit.id]: 0 }));
        setHabitInputStrings(prev => ({ ...prev, [habit.id]: '' }));
      }
    }
  };

  const handleInputChange = (habitId: string, value: string) => {
    setHabitInputStrings(prev => ({ ...prev, [habitId]: value }));
  };

  const handleInputBlur = (habitId: string, value: string) => {
    setHabitInputValues(prev => ({ ...prev, [habitId]: parseInt(value) || 0 }));
  };

  const getInputIcon = (type: Habit['type']) => {
    switch (type) {
      case 'time': return <Timer size={16} />;
      case 'number': return <Hash size={16} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-First Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">
              {getMotivationalGreeting()}
            </h1>
            <p className="text-primary-100 text-sm mb-4">
              {today}
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{todayCompletions.length}</div>
                <div className="text-xs text-primary-200">Erledigt</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{overallStats.longestStreak}</div>
                <div className="text-xs text-primary-200">Längster Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{rewardStats.claimedCount}</div>
                <div className="text-xs text-primary-200">Belohnungen</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Heutiger Fortschritt
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {todayCompletions.length} / {habits.length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${habits.length > 0 ? (todayCompletions.length / habits.length) * 100 : 0}%` 
              }}
            />
          </div>
          
          <div className="text-center">
            <p className={`text-xl font-bold ${getProgressColor(habits.length > 0 ? (todayCompletions.length / habits.length) * 100 : 0)}`}>
              {habits.length > 0 ? Math.round((todayCompletions.length / habits.length) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              der Habits erledigt
            </p>
          </div>
        </div>

        {/* Today's Habits - Mobile Optimized */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Heutige Habits
              </h2>
              <button
                onClick={() => setShowHabitForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                Neu
              </button>
            </div>
            
            {habits.length > 0 ? (
              <div className="space-y-3">
                {habits.map((habit) => {
                  const isCompleted = isHabitCompletedToday(habit);
                  const inputValue = habitInputStrings[habit.id] !== undefined ? habitInputStrings[habit.id] : (habitInputValues[habit.id] || habit.target || 0).toString();
                  
                  return (
                    <div
                      key={habit.id}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                          : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: habit.color + '20', color: habit.color }}
                        >
                          {habit.icon || '🎯'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {habit.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{habit.streak}🔥</span>
                            </div>
                          </div>
                          
                          {habit.type !== 'boolean' && !isCompleted && (
                            <div className="flex items-center gap-2 mt-2">
                              {getInputIcon(habit.type)}
                              <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleInputChange(habit.id, e.target.value)}
                                onBlur={(e) => handleInputBlur(habit.id, e.target.value)}
                                placeholder={`Ziel: ${habit.target}`}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                              <span className="text-xs text-gray-500">
                                {habit.type === 'time' ? 'Min' : habit.category === 'calories' ? 'kcal' : ''}
                              </span>
                            </div>
                          )}
                          
                          {isCompleted && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-1">
                              <CheckCircle size={16} />
                              <span>Erledigt!</span>
                            </div>
                          )}
                        </div>
                        
                        {!isCompleted && (
                          <button
                            onClick={() => handleCompleteHabit(habit)}
                            disabled={habit.type !== 'boolean' && (parseInt(inputValue) || 0) <= 0}
                            className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <Circle size={20} className="text-gray-400" />
                          </button>
                        )}
                        
                        {isCompleted && (
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle size={20} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🎯</div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Noch keine Habits erstellt
                </p>
                <button
                  onClick={() => setShowHabitForm(true)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Erstes Habit erstellen
                </button>
              </div>
            )}
          </div>

          {/* Streak Leaders - Mobile Optimized */}
          {streakLeaders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  🏆 Top Streaks
                </h2>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-3">
                {streakLeaders.slice(0, 3).map((leader, index) => (
                  <div
                    key={leader.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{leader.icon || '🎯'}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {leader.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {leader.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {leader.streak}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reward Wheel - Mobile Optimized */}
          {streakLeaders.length > 0 && (
            <RewardWheel
              habitStreak={streakLeaders[0].streak}
              habitName={streakLeaders[0].name}
              onRewardWon={(reward) => {
                console.log('Reward won:', reward);
              }}
            />
          )}

          {/* Milestone Progress - Mobile Optimized */}
          {streakLeaders.length > 0 && (
            <MilestoneProgress
              habit={streakLeaders[0]}
              milestones={state.milestones}
            />
          )}
        </div>
      </div>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          onClose={() => setShowHabitForm(false)}
          onSave={(_habit) => {
            setShowHabitForm(false);
            // Habit is automatically added by the form, no need to do anything else
          }}
        />
      )}
    </div>
  );
};