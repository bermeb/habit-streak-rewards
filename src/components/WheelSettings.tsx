import React from 'react';
import { Settings, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';

export const WheelSettings: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handleStreakModeChange = (mode: 'highest' | 'all') => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { streakCalculationMode: mode }
    });
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
              <span className="font-medium">Wahrscheinlichkeiten:</span>{' '}
              Nächster Meilenstein (automatisch)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};