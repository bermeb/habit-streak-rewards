import { useAppContext } from '../context/AppContext';
import { Habit } from '../types';
import { 
  getNextMilestone, 
  getAchievedMilestones, 
  calculateMilestoneProgress, 
  canSpinWheel,
  getRewardProbabilities 
} from '../utils/habitUtils';

export const useStreaks = () => {
  const { state } = useAppContext();

  const getLongestStreak = (): number => {
    return Math.max(...state.habits.map(habit => habit.streak), 0);
  };

  const getCurrentStreaks = (): { habit: Habit; streak: number }[] => {
    return state.habits
      .filter(habit => habit.streak > 0)
      .map(habit => ({ habit, streak: habit.streak }))
      .sort((a, b) => b.streak - a.streak);
  };

  const getStreakStats = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return null;

    const nextMilestone = getNextMilestone(habit.streak, state.milestones);
    const achievedMilestones = getAchievedMilestones(habit.streak, state.milestones);
    const progressToNext = calculateMilestoneProgress(habit.streak, state.milestones);
    const canSpin = canSpinWheel(habit, state.milestones);
    const rewardProbabilities = getRewardProbabilities(habit.streak, state.milestones);

    return {
      currentStreak: habit.streak,
      nextMilestone,
      achievedMilestones,
      progressToNext,
      canSpinWheel: canSpin,
      rewardProbabilities,
      daysToNextMilestone: nextMilestone ? nextMilestone.days - habit.streak : 0
    };
  };

  const getOverallStats = () => {
    const longestStreak = getLongestStreak();
    const activeStreaks = getCurrentStreaks();
    const totalHabits = state.habits.length;
    const habitsWithStreaks = activeStreaks.length;

    const averageStreak = totalHabits > 0 
      ? state.habits.reduce((sum, habit) => sum + habit.streak, 0) / totalHabits 
      : 0;

    const milestonesReached = state.habits.reduce((total, habit) => {
      return total + getAchievedMilestones(habit.streak, state.milestones).length;
    }, 0);

    return {
      longestStreak,
      activeStreaks: habitsWithStreaks,
      totalHabits,
      averageStreak: Math.round(averageStreak * 10) / 10,
      milestonesReached,
      streakPercentage: totalHabits > 0 ? (habitsWithStreaks / totalHabits) * 100 : 0
    };
  };

  const getStreakTrend = (habitId: string, days: number = 7): 'up' | 'down' | 'stable' => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit || habit.completedDates.length < days) return 'stable';

    const recentCompletions = habit.completedDates.slice(-days);
    const previousCompletions = habit.completedDates.slice(-(days * 2), -days);

    if (recentCompletions.length > previousCompletions.length) return 'up';
    if (recentCompletions.length < previousCompletions.length) return 'down';
    return 'stable';
  };

  const getStreakMotivation = (streak: number): string => {
    if (streak === 0) return '🌱 Heute ist der perfekte Tag zum Anfangen!';
    if (streak === 1) return '🎯 Großartig! Der erste Schritt ist geschafft!';
    if (streak < 7) return '🔥 Du bist auf dem richtigen Weg!';
    if (streak < 30) return '💪 Fantastisch! Du baust echte Gewohnheiten auf!';
    if (streak < 100) return '🌟 Wow! Du bist ein Gewohnheits-Champion!';
    return '🏆 Unglaublich! Du bist ein wahrer Meister!';
  };

  const getStreakColor = (streak: number): string => {
    if (streak === 0) return '#6B7280';
    if (streak < 7) return '#10B981';
    if (streak < 30) return '#F59E0B';
    if (streak < 100) return '#EF4444';
    return '#8B5CF6';
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak === 0) return '⚪';
    if (streak < 7) return '🟢';
    if (streak < 30) return '🟡';
    if (streak < 100) return '🔴';
    return '🟣';
  };

  const calculateStreakScore = (habit: Habit): number => {
    const baseScore = habit.streak * 10;
    const completionBonus = habit.completedDates.length * 2;
    const consistencyBonus = habit.streak > 0 ? habit.streak * 5 : 0;
    
    return baseScore + completionBonus + consistencyBonus;
  };

  return {
    getLongestStreak,
    getCurrentStreaks,
    getStreakStats,
    getOverallStats,
    getStreakTrend,
    getStreakMotivation,
    getStreakColor,
    getStreakEmoji,
    calculateStreakScore
  };
};