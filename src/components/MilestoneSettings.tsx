import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Target } from 'lucide-react';
import { Milestone } from '@/types';
import { useAppContext } from '../context/useAppContext';
import { formatPercentage } from '../utils/habitUtils';

interface MilestoneSettingsProps {
  className?: string;
}

export const MilestoneSettings: React.FC<MilestoneSettingsProps> = ({ className = '' }) => {
  const { state, dispatch } = useAppContext();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    days: 0,
    smallChance: 50,
    mediumChance: 30,
    largeChance: 20,
    label: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputValues, setInputValues] = useState({
    days: '',
    smallChance: '',
    mediumChance: '',
    largeChance: ''
  });

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    const milestone = state.milestones[index];
    setNewMilestone({ ...milestone });
    setInputValues({
      days: milestone.days.toString(),
      smallChance: milestone.smallChance.toString(),
      mediumChance: milestone.mediumChance.toString(),
      largeChance: milestone.largeChance.toString()
    });
  };

  const handleSave = (index: number) => {
    if (newMilestone.days <= 0) return;
    
    // Ensure probabilities add up to 100 (allow small rounding tolerance)
    const total = newMilestone.smallChance + newMilestone.mediumChance + newMilestone.largeChance;
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total;
      newMilestone.smallChance = Math.round((newMilestone.smallChance * scale) * 10) / 10;
      newMilestone.mediumChance = Math.round((newMilestone.mediumChance * scale) * 10) / 10;
      newMilestone.largeChance = Math.round((100 - newMilestone.smallChance - newMilestone.mediumChance) * 10) / 10;
    }

    dispatch({ type: 'UPDATE_MILESTONE', payload: { index, milestone: newMilestone } });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    if (newMilestone.days <= 0) return;
    
    // Ensure probabilities add up to 100 (allow small rounding tolerance)
    const total = newMilestone.smallChance + newMilestone.mediumChance + newMilestone.largeChance;
    if (Math.abs(total - 100) > 0.1) {
      const scale = 100 / total;
      newMilestone.smallChance = Math.round((newMilestone.smallChance * scale) * 10) / 10;
      newMilestone.mediumChance = Math.round((newMilestone.mediumChance * scale) * 10) / 10;
      newMilestone.largeChance = Math.round((100 - newMilestone.smallChance - newMilestone.mediumChance) * 10) / 10;
    }

    dispatch({ type: 'ADD_MILESTONE', payload: newMilestone });
    setNewMilestone({
      days: 0,
      smallChance: 50,
      mediumChance: 30,
      largeChance: 20,
      label: ''
    });
    setShowAddForm(false);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Möchtest du diesen Meilenstein wirklich löschen?')) {
      dispatch({ type: 'DELETE_MILESTONE', payload: index });
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setShowAddForm(false);
    setNewMilestone({
      days: 0,
      smallChance: 50,
      mediumChance: 30,
      largeChance: 20,
      label: ''
    });
    setInputValues({
      days: '',
      smallChance: '',
      mediumChance: '',
      largeChance: ''
    });
  };


  const renderMilestoneForm = (milestone: Milestone, isEditing: boolean, index?: number) => {
    const totalProbability = milestone.smallChance + milestone.mediumChance + milestone.largeChance;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tage
            </label>
            <input
              type="number"
              value={inputValues.days || milestone.days}
              onChange={(e) => {
                setInputValues(prev => ({ ...prev, days: e.target.value }));
                setNewMilestone({ ...milestone, days: parseInt(e.target.value) || 0 });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label (optional)
            </label>
            <input
              type="text"
              value={milestone.label || ''}
              onChange={(e) => setNewMilestone({ ...milestone, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. 1 Woche"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wahrscheinlichkeiten
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Klein:</span>
                <input
                  type="number"
                  step="0.1"
                  value={inputValues.smallChance || milestone.smallChance}
                  onChange={(e) => {
                    setInputValues(prev => ({ ...prev, smallChance: e.target.value }));
                    setNewMilestone({ ...milestone, smallChance: parseFloat(e.target.value) || 0 });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Mittel:</span>
                <input
                  type="number"
                  step="0.1"
                  value={inputValues.mediumChance || milestone.mediumChance}
                  onChange={(e) => {
                    setInputValues(prev => ({ ...prev, mediumChance: e.target.value }));
                    setNewMilestone({ ...milestone, mediumChance: parseFloat(e.target.value) || 0 });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Groß:</span>
                <input
                  type="number"
                  step="0.1"
                  value={inputValues.largeChance || milestone.largeChance}
                  onChange={(e) => {
                    setInputValues(prev => ({ ...prev, largeChance: e.target.value }));
                    setNewMilestone({ ...milestone, largeChance: parseFloat(e.target.value) || 0 });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
              </div>
            </div>
            
            {Math.abs(totalProbability - 100) > 0.1 && (
              <div className="text-sm text-red-500 mt-1">
                Gesamt: {formatPercentage(totalProbability)} (sollte 100% sein)
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => isEditing && typeof index === 'number' ? handleSave(index) : handleAdd()}
              disabled={milestone.days <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              {isEditing ? 'Speichern' : 'Hinzufügen'}
            </button>
            
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X size={16} />
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sortedMilestones = [...state.milestones].sort((a, b) => a.days - b.days);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Meilenstein-Einstellungen
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          Hinzufügen
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Neuer Meilenstein
          </h4>
          {renderMilestoneForm(newMilestone, false)}
        </div>
      )}

      <div className="space-y-4">
        {sortedMilestones.map((milestone, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
          >
            {editingIndex === index ? (
              renderMilestoneForm(newMilestone, true, index)
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target size={20} className="text-primary-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {milestone.label || `${milestone.days} Tage`}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {milestone.days} Tage Streak
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatPercentage(milestone.smallChance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatPercentage(milestone.mediumChance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatPercentage(milestone.largeChance)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedMilestones.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🎯</div>
          <p className="text-gray-600 dark:text-gray-400">
            Keine Meilensteine konfiguriert
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Füge Meilensteine hinzu um Belohnungen freizuschalten
          </p>
        </div>
      )}
    </div>
  );
};