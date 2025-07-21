import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, Clock, Target } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';

export const WheelSettings: React.FC = () => {
  const { state, dispatch } = useAppContext();
  
  // Wheel settings state
  const [wheelSettings, setWheelSettings] = useState({
    minStreakForWheel: 7,
    allowWheelOnlyAtMilestones: true,
    spinMode: 'cooldown' as 'cooldown' | 'once-per-milestone',
    cooldownHours: 24
  });

  // Load wheel settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('wheelSettings') || '{}');
    setWheelSettings(prev => ({
      ...prev,
      ...savedSettings,
      spinMode: savedSettings.allowWheelOnlyAtMilestones === false ? 'cooldown' : 'once-per-milestone'
    }));
  }, []);

  // Save wheel settings to localStorage whenever they change
  useEffect(() => {
    const settingsToSave = {
      ...wheelSettings,
      allowWheelOnlyAtMilestones: wheelSettings.spinMode === 'once-per-milestone'
    };
    localStorage.setItem('wheelSettings', JSON.stringify(settingsToSave));
  }, [wheelSettings]);

  const handleStreakModeChange = (mode: 'highest' | 'all') => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { streakCalculationMode: mode }
    });
  };

  const handleSpinModeChange = (mode: 'cooldown' | 'once-per-milestone') => {
    setWheelSettings(prev => ({ ...prev, spinMode: mode }));
  };

  const handleCooldownHoursChange = (hours: number) => {
    setWheelSettings(prev => ({ ...prev, cooldownHours: hours }));
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Settings size={20} />
        🎡 Belohnungsrad Einstellungen
      </h2>

      <div className="space-y-6">
        {/* Streak Calculation Mode */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Streak-Berechnungsmodus
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bestimme, wie der Streak für das Belohnungsrad berechnet wird
          </p>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="streakMode"
                value="highest"
                checked={state.settings.streakCalculationMode === 'highest'}
                onChange={() => handleStreakModeChange('highest')}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Höchster Streak
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Verwendet den höchsten Streak aller deiner Habits für das Belohnungsrad
                </div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="streakMode"
                value="all"
                checked={state.settings.streakCalculationMode === 'all'}
                onChange={() => handleStreakModeChange('all')}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Alle Habits erreichen Meilenstein
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Alle deine Habits müssen einen Meilenstein erreichen, bevor du höhere Belohnungen erhältst
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Spin Mode Configuration */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Rad-Spin Modus
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bestimme, wann du das Belohnungsrad drehen kannst
          </p>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="spinMode"
                value="cooldown"
                checked={wheelSettings.spinMode === 'cooldown'}
                onChange={() => handleSpinModeChange('cooldown')}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Cooldown-basiert
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Du kannst das Rad nach einer bestimmten Wartezeit wieder drehen
                </div>
              </div>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="spinMode"
                value="once-per-milestone"
                checked={wheelSettings.spinMode === 'once-per-milestone'}
                onChange={() => handleSpinModeChange('once-per-milestone')}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Einmal pro Meilenstein
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Du kannst das Rad nur drehen, wenn du einen neuen Meilenstein erreichst
                </div>
              </div>
            </label>
          </div>

          {/* Cooldown Hours Configuration */}
          {wheelSettings.spinMode === 'cooldown' && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Target size={16} />
                Cooldown-Dauer
              </h4>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Wartezeit zwischen Spins (Stunden)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={wheelSettings.cooldownHours}
                  onChange={(e) => handleCooldownHoursChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Empfohlen: 24 Stunden (1 Tag) bis 168 Stunden (1 Woche)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Settings Preview */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Aktuelle Einstellungen
          </h4>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Streak-Modus:</span>{' '}
              {state.settings.streakCalculationMode === 'highest' 
                ? 'Höchster Streak' 
                : 'Alle Habits müssen Meilenstein erreichen'
              }
            </div>
            <div>
              <span className="font-medium">Spin-Modus:</span>{' '}
              {wheelSettings.spinMode === 'cooldown' 
                ? `Cooldown (${wheelSettings.cooldownHours}h)` 
                : 'Einmal pro Meilenstein'
              }
            </div>
            <div>
              <span className="font-medium">Wahrscheinlichkeiten:</span>{' '}
              Nächster Meilenstein (automatisch)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};