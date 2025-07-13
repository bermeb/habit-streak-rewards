import { useAppContext } from '../context/AppContext';
import { Reward, RewardCategory } from '../types';
import { generateRewardId } from '../utils/habitUtils';

export const useRewards = () => {
  const { state, dispatch } = useAppContext();

  const addReward = (rewardData: Omit<Reward, 'id' | 'claimed' | 'claimedDate'>) => {
    const newReward: Reward = {
      ...rewardData,
      id: generateRewardId(),
      claimed: false
    };
    
    dispatch({ type: 'ADD_REWARD', payload: newReward });
    return newReward;
  };

  const updateReward = (id: string, updates: Partial<Reward>) => {
    dispatch({ type: 'UPDATE_REWARD', payload: { id, updates } });
  };

  const deleteReward = (id: string) => {
    dispatch({ type: 'DELETE_REWARD', payload: id });
  };

  const claimReward = (rewardId: string) => {
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward || reward.claimed) return;

    const today = new Date().toISOString();
    dispatch({ 
      type: 'CLAIM_REWARD', 
      payload: { rewardId, date: today } 
    });
  };

  const getRewardById = (id: string): Reward | undefined => {
    return state.rewards.find(reward => reward.id === id);
  };

  const getRewardsByCategory = (category: Reward['category']): Reward[] => {
    return state.rewards.filter(reward => reward.category === category);
  };

  const getUnclaimedRewards = (): Reward[] => {
    return state.rewards.filter(reward => !reward.claimed);
  };

  const getClaimedRewards = (): Reward[] => {
    return state.rewards.filter(reward => reward.claimed);
  };

  const getRewardCategories = (): RewardCategory[] => {
    const categories: RewardCategory[] = [
      {
        name: 'small',
        color: '#10B981',
        probability: 0,
        rewards: getRewardsByCategory('small')
      },
      {
        name: 'medium',
        color: '#F59E0B',
        probability: 0,
        rewards: getRewardsByCategory('medium')
      },
      {
        name: 'large',
        color: '#EF4444',
        probability: 0,
        rewards: getRewardsByCategory('large')
      }
    ];

    return categories;
  };

  const selectRandomReward = (
    category: Reward['category'],
    excludeIds: string[] = []
  ): Reward | null => {
    const availableRewards = getRewardsByCategory(category).filter(
      reward => !reward.claimed && !excludeIds.includes(reward.id)
    );

    if (availableRewards.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableRewards.length);
    return availableRewards[randomIndex];
  };

  const getRewardStats = () => {
    const totalRewards = state.rewards.length;
    const claimedRewards = getClaimedRewards();
    const smallRewards = getRewardsByCategory('small');
    const mediumRewards = getRewardsByCategory('medium');
    const largeRewards = getRewardsByCategory('large');

    return {
      totalRewards,
      claimedCount: claimedRewards.length,
      unclaimedCount: totalRewards - claimedRewards.length,
      claimedPercentage: totalRewards > 0 ? (claimedRewards.length / totalRewards) * 100 : 0,
      categoryBreakdown: {
        small: {
          total: smallRewards.length,
          claimed: smallRewards.filter(r => r.claimed).length
        },
        medium: {
          total: mediumRewards.length,
          claimed: mediumRewards.filter(r => r.claimed).length
        },
        large: {
          total: largeRewards.length,
          claimed: largeRewards.filter(r => r.claimed).length
        }
      }
    };
  };

  const resetRewardClaims = () => {
    state.rewards.forEach(reward => {
      if (reward.claimed) {
        updateReward(reward.id, { claimed: false, claimedDate: undefined });
      }
    });
  };

  return {
    rewards: state.rewards,
    addReward,
    updateReward,
    deleteReward,
    claimReward,
    getRewardById,
    getRewardsByCategory,
    getUnclaimedRewards,
    getClaimedRewards,
    getRewardCategories,
    selectRandomReward,
    getRewardStats,
    resetRewardClaims
  };
};