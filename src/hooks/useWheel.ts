import { useAppContext } from '../context/useAppContext';
import { useRewards } from './useRewards';
import { Reward, WheelSegment } from '@/types';
import { getRewardProbabilities, getAchievedMilestones } from '../utils/habitUtils';

export const useWheel = () => {
  const { state, dispatch } = useAppContext();
  const { selectRandomReward, getRewardsByCategory } = useRewards();

  const generateWheelSegments = (
    streak: number,
    _availableRewards: Reward[] = []
  ): WheelSegment[] => {
    const probabilities = getRewardProbabilities(streak, state.milestones);
    const segments: WheelSegment[] = [];
    
    const colors = {
      small: '#10B981',
      medium: '#F59E0B',
      large: '#EF4444'
    };

    // Create segments with equal visual sizes but store actual probabilities
    Object.entries(probabilities).forEach(([category, probability]) => {
      const categoryRewards = getRewardsByCategory(category as Reward['category']);
      
      if (categoryRewards.length > 0) {
        categoryRewards.forEach((reward, index) => {
          segments.push({
            id: `${category}-${index}`,
            reward,
            angle: 360 / categoryRewards.length, // Equal visual size for now, will be recalculated
            color: colors[category as keyof typeof colors],
            probability: probability / categoryRewards.length
          });
        });
      }
    });

    // Calculate equal angles for all segments (visual only)
    const totalSegments = segments.length;
    if (totalSegments > 0) {
      const equalAngle = 360 / totalSegments;
      segments.forEach(segment => {
        segment.angle = equalAngle;
      });
    }

    return segments;
  };

  const spinWheel = (streak: number): Promise<Reward | null> => {
    return new Promise((resolve) => {
      dispatch({ type: 'SET_WHEEL_SPINNING', payload: true });
      
      const wheelSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{"minStreakForWheel": 7, "allowWheelOnlyAtMilestones": true, "cooldownHours": 24, "spinMode": "once-per-milestone"}');
      const spinMode = wheelSettings.spinMode || (wheelSettings.allowWheelOnlyAtMilestones ? 'once-per-milestone' : 'cooldown');
      
      // Record spin based on mode
      if (spinMode === 'once-per-milestone') {
        // Record milestone spin - mark the highest achieved milestone as spun
        const achievedMilestones = getAchievedMilestones(streak, state.milestones);
        if (achievedMilestones.length > 0) {
          const highestMilestone = Math.max(...achievedMilestones.map(m => m.days));
          const milestoneSpins = JSON.parse(localStorage.getItem('milestoneSpins') || '[]');
          if (!milestoneSpins.includes(highestMilestone)) {
            milestoneSpins.push(highestMilestone);
            localStorage.setItem('milestoneSpins', JSON.stringify(milestoneSpins));
          }
        }
      } else {
        // Record spin time for cooldown mode
        localStorage.setItem('lastWheelSpin', new Date().toISOString());
      }
      
      const probabilities = getRewardProbabilities(streak, state.milestones);
      const randomValue = Math.random() * 100;
      
      let category: Reward['category'];
      if (randomValue < probabilities.small) {
        category = 'small';
      } else if (randomValue < probabilities.small + probabilities.medium) {
        category = 'medium';
      } else {
        category = 'large';
      }

      const selectedReward = selectRandomReward(category);
      
      // Simulate spinning duration
      setTimeout(() => {
        if (selectedReward) {
          dispatch({ type: 'SPIN_WHEEL', payload: { result: selectedReward } });
        } else {
          dispatch({ type: 'SET_WHEEL_SPINNING', payload: false });
        }
        resolve(selectedReward);
      }, 3000); // 3 seconds spinning animation
    });
  };

  const canSpinWheel = (streak: number): boolean => {
    // Get wheel settings from localStorage
    const wheelSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{"minStreakForWheel": 7, "allowWheelOnlyAtMilestones": true, "cooldownHours": 24, "spinMode": "once-per-milestone"}');
    
    // Check minimum streak requirement
    if (streak < wheelSettings.minStreakForWheel) {
      return false;
    }
    
    const spinMode = wheelSettings.spinMode || (wheelSettings.allowWheelOnlyAtMilestones ? 'once-per-milestone' : 'cooldown');
    
    if (spinMode === 'once-per-milestone') {
      // Check if user has achieved any milestones
      const achievedMilestones = getAchievedMilestones(streak, state.milestones);
      if (achievedMilestones.length === 0) {
        return false;
      }
      
      // Check if there are any unspun milestones
      const milestoneSpins = JSON.parse(localStorage.getItem('milestoneSpins') || '[]');
      const unspunMilestones = achievedMilestones.filter(milestone => 
        !milestoneSpins.includes(milestone.days)
      );
      
      return unspunMilestones.length > 0;
    } else {
      // Cooldown mode - check milestone requirement if enabled (backward compatibility)
      if (wheelSettings.allowWheelOnlyAtMilestones) {
        const achievedMilestones = getAchievedMilestones(streak, state.milestones);
        if (achievedMilestones.length === 0) {
          return false;
        }
      }
      
      // Check cooldown
      if (wheelSettings.cooldownHours > 0) {
        const lastSpin = localStorage.getItem('lastWheelSpin');
        if (lastSpin) {
          const lastSpinTime = new Date(lastSpin);
          const cooldownEnd = new Date(lastSpinTime.getTime() + wheelSettings.cooldownHours * 60 * 60 * 1000);
          if (new Date() < cooldownEnd) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const getWheelState = () => {
    return {
      isSpinning: state.wheelState.isSpinning,
      lastResult: state.wheelState.lastSpinResult,
      availableRewards: state.wheelState.availableRewards,
      unlockedMilestones: state.wheelState.unlockedMilestones
    };
  };

  const resetWheel = () => {
    dispatch({ type: 'SET_WHEEL_SPINNING', payload: false });
  };

  const getSpinCost = (_streak: number): number => {
    // Higher streaks might have different costs or requirements
    return 0; // Free spins for now
  };

  const getNextSpinAvailable = (_streak: number): Date | null => {
    const wheelSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{"minStreakForWheel": 7, "allowWheelOnlyAtMilestones": true, "cooldownHours": 24, "spinMode": "once-per-milestone"}');
    const spinMode = wheelSettings.spinMode || (wheelSettings.allowWheelOnlyAtMilestones ? 'once-per-milestone' : 'cooldown');
    
    if (spinMode === 'once-per-milestone') {
      // For once-per-milestone mode, return null since availability depends on achieving new milestones
      return null;
    }
    
    if (wheelSettings.cooldownHours > 0) {
      const lastSpin = localStorage.getItem('lastWheelSpin');
      if (lastSpin) {
        const lastSpinTime = new Date(lastSpin);
        const cooldownEnd = new Date(lastSpinTime.getTime() + wheelSettings.cooldownHours * 60 * 60 * 1000);
        if (new Date() < cooldownEnd) {
          return cooldownEnd;
        }
      }
    }
    
    return null;
  };

  const getCooldownTimeRemaining = (streak: number = 0): string | null => {
    const wheelSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{"minStreakForWheel": 7, "allowWheelOnlyAtMilestones": true, "cooldownHours": 24, "spinMode": "once-per-milestone"}');
    const spinMode = wheelSettings.spinMode || (wheelSettings.allowWheelOnlyAtMilestones ? 'once-per-milestone' : 'cooldown');
    
    if (spinMode === 'once-per-milestone') {
      // For once-per-milestone mode, show how many milestones are available to spin for
      if (streak > 0) {
        const achievedMilestones = getAchievedMilestones(streak, state.milestones);
        const milestoneSpins = JSON.parse(localStorage.getItem('milestoneSpins') || '[]');
        const unspunMilestones = achievedMilestones.filter(milestone => 
          !milestoneSpins.includes(milestone.days)
        );
        
        if (unspunMilestones.length > 0) {
          return `${unspunMilestones.length} Meilenstein${unspunMilestones.length > 1 ? 'e' : ''} verfügbar`;
        } else {
          return 'Erreiche einen neuen Meilenstein';
        }
      }
      return 'Erreiche einen Meilenstein';
    }
    
    const nextSpin = getNextSpinAvailable(streak);
    if (!nextSpin) return null;
    
    const now = new Date();
    const diff = nextSpin.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const calculateWheelRotation = (targetReward: Reward, segments: WheelSegment[]): number => {
    const targetSegment = segments.find(s => s.reward.id === targetReward.id);
    if (!targetSegment) return 0;

    const targetIndex = segments.indexOf(targetSegment);
    const segmentAngle = 360 / segments.length;
    const baseRotation = 360 * 3; // Multiple full rotations
    const targetAngle = targetIndex * segmentAngle;
    
    return baseRotation + targetAngle;
  };

  return {
    generateWheelSegments,
    spinWheel,
    canSpinWheel,
    getWheelState,
    resetWheel,
    getSpinCost,
    getNextSpinAvailable,
    getCooldownTimeRemaining,
    calculateWheelRotation
  };
};