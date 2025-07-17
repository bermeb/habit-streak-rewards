import { useAppContext } from '../context/AppContext';
import { useRewards } from './useRewards';
import { Reward, WheelSegment } from '@/types';
import { getRewardProbabilities } from '../utils/habitUtils';

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
      
      // Record spin time for cooldown
      localStorage.setItem('lastWheelSpin', new Date().toISOString());
      
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
    const wheelSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{"minStreakForWheel": 7, "allowWheelOnlyAtMilestones": true, "cooldownHours": 24}');
    
    // Check minimum streak requirement
    if (streak < wheelSettings.minStreakForWheel) {
      return false;
    }
    
    // Check milestone requirement if enabled
    if (wheelSettings.allowWheelOnlyAtMilestones) {
      const achievedMilestones = state.milestones.filter(m => m.days <= streak);
      if (achievedMilestones.length === 0) {
        return false;
      }
    }
    
    // Check cooldown if enabled
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
    const wheelSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{"minStreakForWheel": 7, "allowWheelOnlyAtMilestones": true, "cooldownHours": 24}');
    
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

  const getCooldownTimeRemaining = (): string | null => {
    const nextSpin = getNextSpinAvailable(0);
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