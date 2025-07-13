import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if user previously dismissed the prompt and it hasn't expired
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() < Number(dismissed)) {
      setIsVisible(false);
    }
  }, []);

  if (!isInstallable || isInstalled || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    
    if (success) {
      setIsVisible(false);
    }
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember user dismissed the prompt for 7 days
    localStorage.setItem('pwa-install-dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              📱 App installieren
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Installiere Habit Tracker auf deinem Gerät für einen besseren Zugriff und Offline-Nutzung.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-md transition-colors"
              >
                {isInstalling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isInstalling ? 'Installiert...' : 'Installieren'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors"
              >
                Später
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};