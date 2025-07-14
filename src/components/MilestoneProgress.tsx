import React from 'react';
import { Target, Trophy, Star, Crown, Zap } from 'lucide-react';
import { Habit, Milestone } from '../types';
import { useStreaks } from '../hooks/useStreaks';
import { getNextMilestone, getAchievedMilestones, calculateMilestoneProgress } from '../utils/habitUtils';

interface MilestoneProgressProps {
  habit: Habit;
  milestones: Milestone[];
  className?: string;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  habit,
  milestones,
  className = ''
}) => {
  const { getStreakStats } = useStreaks();
  const _stats = getStreakStats(habit.id);
  
  const nextMilestone = getNextMilestone(habit.streak, milestones);
  const achievedMilestones = getAchievedMilestones(habit.streak, milestones);
  const progressToNext = calculateMilestoneProgress(habit.streak, milestones);

  const getMilestoneIcon = (days: number) => {
    if (days <= 7) return <Target size={20} />;
    if (days <= 14) return <Star size={20} />;
    if (days <= 30) return <Trophy size={20} />;
    if (days <= 100) return <Crown size={20} />;
    return <Zap size={20} />;
  };

  const getMilestoneColor = (days: number, achieved: boolean) => {
    if (!achieved) return 'text-gray-400 dark:text-gray-500';
    if (days <= 7) return 'text-green-500';
    if (days <= 14) return 'text-blue-500';
    if (days <= 30) return 'text-yellow-500';
    if (days <= 100) return 'text-purple-500';
    return 'text-orange-500';
  };

  const getMilestoneBgColor = (days: number, achieved: boolean) => {
    if (!achieved) return 'bg-gray-100 dark:bg-gray-700';
    if (days <= 7) return 'bg-green-100 dark:bg-green-900/30';
    if (days <= 14) return 'bg-blue-100 dark:bg-blue-900/30';
    if (days <= 30) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (days <= 100) return 'bg-purple-100 dark:bg-purple-900/30';
    return 'bg-orange-100 dark:bg-orange-900/30';
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.days - b.days);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          🎯 Meilensteine
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {achievedMilestones.length}/{milestones.length}
        </div>
      </div>

      {/* Current Progress - Mobile Optimized */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Aktueller Streak
          </span>
          <span className="text-xl font-bold text-primary-500">
            {habit.streak} 🔥
          </span>
        </div>
        
        {nextMilestone && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Nächstes Ziel: {nextMilestone.days} Tage
              </span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {nextMilestone.days - habit.streak > 0 ? `-${nextMilestone.days - habit.streak}` : '✓'}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(progressToNext)}% erreicht
              </span>
            </div>
          </>
        )}
      </div>

      {/* Milestone Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {sortedMilestones.slice(0, 4).map((milestone, _index) => {
          const isAchieved = habit.streak >= milestone.days;
          const isCurrent = nextMilestone?.days === milestone.days;
          
          return (
            <div 
              key={milestone.days} 
              className={`p-3 rounded-lg border-2 transition-all ${
                isAchieved 
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                  : isCurrent 
                  ? 'border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getMilestoneBgColor(milestone.days, isAchieved)}`}
                >
                  <div className={getMilestoneColor(milestone.days, isAchieved)}>
                    {getMilestoneIcon(milestone.days)}
                  </div>
                </div>
                {isAchieved && (
                  <div className="text-green-500 text-lg">✓</div>
                )}
                {isCurrent && !isAchieved && (
                  <div className="text-primary-500 text-lg">🎯</div>
                )}
              </div>
              
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {milestone.days} Tage
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {milestone.label || `${milestone.days}T Streak`}
              </div>
              
              {/* Compact Reward Info */}
              <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{milestone.smallChance}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>{milestone.mediumChance}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{milestone.largeChance}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Motivation Message */}
      <div className="p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
        <div className="text-center text-sm">
          {achievedMilestones.length === 0 && (
            <div className="text-gray-700 dark:text-gray-300">
              🌱 Starte deine Reise! Erreiche 7 Tage für den ersten Meilenstein.
            </div>
          )}
          
          {achievedMilestones.length > 0 && nextMilestone && (
            <div className="text-gray-700 dark:text-gray-300">
              🎯 {achievedMilestones.length} Meilenstein{achievedMilestones.length > 1 ? 'e' : ''} erreicht!
              <br />
              <span className="font-medium">
                {nextMilestone.days - habit.streak > 0 
                  ? `Noch ${nextMilestone.days - habit.streak} Tage bis zum nächsten Ziel!`
                  : 'Nächstes Ziel erreicht!'
                }
              </span>
            </div>
          )}
          
          {achievedMilestones.length > 0 && !nextMilestone && (
            <div className="text-gray-700 dark:text-gray-300">
              🏆 Alle Meilensteine erreicht! Du bist ein Gewohnheits-Meister!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};