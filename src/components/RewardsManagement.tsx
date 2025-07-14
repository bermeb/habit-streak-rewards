import React, { useState } from 'react';
import { Plus, Edit, Trash2, Gift, Save, X, Star } from 'lucide-react';
import { Reward } from '../types';
import { useRewards } from '../hooks/useRewards';
import { generateRewardId } from '../utils/habitUtils';

export const RewardsManagement: React.FC = () => {
  const { getRewardsByCategory, addReward, updateReward, deleteReward } = useRewards();
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'small' as Reward['category'],
    description: '',
    icon: '🎁',
    color: '#10B981'
  });

  const smallRewards = getRewardsByCategory('small');
  const mediumRewards = getRewardsByCategory('medium');
  const largeRewards = getRewardsByCategory('large');

  const predefinedIcons = [
    '🎁', '🎉', '🎊', '🏆', '🥇', '🎯', '⭐', '🌟',
    '💎', '🍎', '🍕', '🍰', '☕', '🎵', '📚', '🎬',
    '🎮', '🏃', '🧘', '💆', '🛍️', '✈️', '🎨', '💻'
  ];

  const categoryColors = {
    small: '#10B981',
    medium: '#F59E0B', 
    large: '#EF4444'
  };

  const categoryNames = {
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReward) {
      updateReward(editingReward.id, formData);
    } else {
      const newReward: Reward = {
        id: generateRewardId(),
        ...formData
      };
      addReward(newReward);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'small',
      description: '',
      icon: '🎁',
      color: categoryColors.small
    });
    setEditingReward(null);
    setShowForm(false);
  };

  const handleEdit = (reward: Reward) => {
    setFormData({
      name: reward.name,
      category: reward.category,
      description: reward.description || '',
      icon: reward.icon || '🎁',
      color: reward.color || categoryColors[reward.category]
    });
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleDelete = (rewardId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Belohnung löschen möchten?')) {
      deleteReward(rewardId);
    }
  };

  const handleCategoryChange = (category: Reward['category']) => {
    setFormData({
      ...formData,
      category,
      color: categoryColors[category]
    });
  };

  const RewardCard = ({ reward }: { reward: Reward; category: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: reward.color + '20', color: reward.color }}
          >
            {reward.icon || '🎁'}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {reward.name}
            </h4>
            {reward.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reward.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(reward)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(reward.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {reward.claimed && (
        <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <Star size={12} />
          Eingelöst {reward.claimedDate && new Date(reward.claimedDate).toLocaleDateString('de-DE')}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          🎁 Belohnungen verwalten
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Neue Belohnung
        </button>
      </div>

      {/* Reward Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Small Rewards */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Klein ({smallRewards.length})
            </h3>
          </div>
          <div className="space-y-3">
            {smallRewards.map(reward => (
              <RewardCard key={reward.id} reward={reward} category="small" />
            ))}
            {smallRewards.length === 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center py-4">
                Noch keine kleinen Belohnungen
              </p>
            )}
          </div>
        </div>

        {/* Medium Rewards */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              Mittel ({mediumRewards.length})
            </h3>
          </div>
          <div className="space-y-3">
            {mediumRewards.map(reward => (
              <RewardCard key={reward.id} reward={reward} category="medium" />
            ))}
            {mediumRewards.length === 0 && (
              <p className="text-sm text-orange-600 dark:text-orange-400 text-center py-4">
                Noch keine mittleren Belohnungen
              </p>
            )}
          </div>
        </div>

        {/* Large Rewards */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Groß ({largeRewards.length})
            </h3>
          </div>
          <div className="space-y-3">
            {largeRewards.map(reward => (
              <RewardCard key={reward.id} reward={reward} category="large" />
            ))}
            {largeRewards.length === 0 && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center py-4">
                Noch keine großen Belohnungen
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingReward ? 'Belohnung bearbeiten' : 'Neue Belohnung'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="z.B. 15 Min Lieblingsserie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategorie
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.category === category
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: categoryColors[category] }}
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {categoryNames[category]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="Kurze Beschreibung der Belohnung"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="z.B. 🎁"
                  />
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                    {formData.icon || '?'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {predefinedIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-sm transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Save size={16} className="inline mr-1" />
                  {editingReward ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};