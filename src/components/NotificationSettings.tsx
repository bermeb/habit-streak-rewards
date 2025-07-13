import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAppPreferences } from '../hooks/useLocalStorage';
import { Bell, BellOff, CheckCircle, AlertCircle, Clock, Award } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { permissionState, isRequesting, requestPermission, showMilestoneNotification, showHabitReminder } = useNotifications();
  const { notificationsEnabled, setNotificationsEnabled } = useAppPreferences();
  const [showTestOptions, setShowTestOptions] = useState(false);

  const handlePermissionRequest = async () => {
    const permission = await requestPermission();
    if (permission === 'granted' && !notificationsEnabled) {
      setNotificationsEnabled(true);
    }
  };

  const handleToggleNotifications = () => {
    if (permissionState.permission === 'granted') {
      setNotificationsEnabled(!notificationsEnabled);
    } else if (permissionState.canRequest) {
      handlePermissionRequest();
    }
  };

  const handleTestMilestone = () => {
    showMilestoneNotification('Test Habit', 7);
  };

  const handleTestReminder = () => {
    showHabitReminder('Test Habit');
  };

  const getPermissionIcon = () => {
    if (!permissionState.supported) {
      return <BellOff className="w-5 h-5 text-gray-400" />;
    }
    
    switch (permissionState.permission) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPermissionStatus = () => {
    if (!permissionState.supported) {
      return 'Benachrichtigungen werden von diesem Browser nicht unterstützt';
    }
    
    switch (permissionState.permission) {
      case 'granted':
        return 'Benachrichtigungen sind aktiviert';
      case 'denied':
        return 'Benachrichtigungen wurden blockiert. Aktiviere sie in den Browser-Einstellungen.';
      default:
        return 'Benachrichtigungen benötigen deine Erlaubnis';
    }
  };

  const getPermissionColor = () => {
    if (!permissionState.supported) return 'text-gray-500';
    
    switch (permissionState.permission) {
      case 'granted':
        return 'text-green-600 dark:text-green-400';
      case 'denied':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Bell size={20} />
        🔔 Benachrichtigungen
      </h2>

      <div className="space-y-6">
        {/* Permission Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            {getPermissionIcon()}
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Berechtigung Status
            </h3>
          </div>
          <p className={`text-sm ${getPermissionColor()}`}>
            {getPermissionStatus()}
          </p>
          
          {permissionState.canRequest && (
            <button
              onClick={handlePermissionRequest}
              disabled={isRequesting}
              className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm"
            >
              {isRequesting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bell size={16} />
              )}
              {isRequesting ? 'Anfrage läuft...' : 'Benachrichtigungen aktivieren'}
            </button>
          )}
        </div>

        {/* Notification Toggle */}
        {permissionState.permission === 'granted' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Benachrichtigungen aktivieren
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Erhalte Erinnerungen und Meilenstein-Benachrichtigungen
                </p>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Notification Types */}
        {permissionState.permission === 'granted' && notificationsEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Benachrichtigungs-Typen
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Award className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Meilenstein-Erfolge
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Benachrichtigungen wenn du einen Meilenstein erreichst
                  </div>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Aktiv
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Habit-Erinnerungen
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Tägliche Erinnerungen für deine Habits
                  </div>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Aktiv
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Streak-Warnungen
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Warnung wenn ein Streak in Gefahr ist
                  </div>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Aktiv
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Test Notifications */}
        {permissionState.permission === 'granted' && notificationsEnabled && (
          <div>
            <button
              onClick={() => setShowTestOptions(!showTestOptions)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showTestOptions ? 'Test-Optionen ausblenden' : 'Test-Benachrichtigungen anzeigen'}
            </button>
            
            {showTestOptions && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={handleTestMilestone}
                  className="block w-full text-left px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  🎉 Test Meilenstein-Benachrichtigung
                </button>
                <button
                  onClick={handleTestReminder}
                  className="block w-full text-left px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  ⏰ Test Erinnerungs-Benachrichtigung
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions for denied permissions */}
        {permissionState.permission === 'denied' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Benachrichtigungen aktivieren
            </h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <p><strong>Chrome/Edge:</strong> Klicke auf das Schloss-Symbol in der Adressleiste → Benachrichtigungen → Zulassen</p>
              <p><strong>Firefox:</strong> Klicke auf das Schild-Symbol → Berechtigungen → Benachrichtigungen</p>
              <p><strong>Safari:</strong> Safari → Einstellungen → Websites → Benachrichtigungen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};