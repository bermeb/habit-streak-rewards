import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { InstallPrompt } from './components/InstallPrompt';

// Lazy load components for better performance
const HabitsList = lazy(() => import('./components/HabitsList').then(m => ({ default: m.HabitsList })));
const MilestoneSettings = lazy(() => import('./components/MilestoneSettings').then(m => ({ default: m.MilestoneSettings })));
const RewardsManagement = lazy(() => import('./components/RewardsManagement').then(m => ({ default: m.RewardsManagement })));
const Statistics = lazy(() => import('./components/Statistics').then(m => ({ default: m.Statistics })));
const DataManagement = lazy(() => import('./components/DataManagement').then(m => ({ default: m.DataManagement })));
const NotificationSettings = lazy(() => import('./components/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const WheelSettings = lazy(() => import('./components/WheelSettings').then(m => ({ default: m.WheelSettings })));
const QuickCheck = lazy(() => import('./components/QuickCheck').then(m => ({ default: m.QuickCheck })));
import { useAppPreferences } from './hooks/useLocalStorage';
import { getNavigationAriaLabels, handleKeyboardNavigation } from './utils/accessibility';
import { 
  Home, 
  List, 
  Settings, 
  BarChart3, 
  Gift, 
  Moon, 
  Sun, 
  Monitor,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'habits' | 'rewards' | 'statistics' | 'settings' | 'quick'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useAppPreferences();
  const ariaLabels = getNavigationAriaLabels();

  // Handle URL parameters for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('quick') === 'true') {
      setCurrentView('quick');
    } else if (urlParams.get('view')) {
      const view = urlParams.get('view') as 'dashboard' | 'habits' | 'rewards' | 'statistics' | 'settings';
      if (['dashboard', 'habits', 'rewards', 'statistics', 'settings'].includes(view)) {
        setCurrentView(view);
      }
    }
    
    // Clear URL parameters after handling them
    if (urlParams.toString()) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(newTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon size={20} />;
      case 'light':
        return <Sun size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'habits', name: 'Habits', icon: List },
    { id: 'rewards', name: 'Belohnungen', icon: Gift },
    { id: 'statistics', name: 'Statistiken', icon: BarChart3 },
    { id: 'settings', name: 'Einstellungen', icon: Settings },
  ];

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'habits':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HabitsList />
          </Suspense>
        );
      case 'rewards':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <RewardsManagement />
              </div>
            </div>
          </Suspense>
        );
      case 'statistics':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Statistics />
          </Suspense>
        );
      case 'quick':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <QuickCheck onNavigateHome={() => setCurrentView('dashboard')} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 lg:mb-8">
                  ⚙️ Einstellungen
                </h1>
                <div className="space-y-6 lg:space-y-8">
                  <DataManagement />
                  <NotificationSettings />
                  <WheelSettings />
                  <MilestoneSettings />
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      🎨 Allgemeine Einstellungen
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Theme
                        </span>
                        <button
                          onClick={toggleTheme}
                          onKeyDown={(e) => handleKeyboardNavigation(e, toggleTheme)}
                          aria-label={ariaLabels.theme}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          {getThemeIcon()}
                          <span className="text-sm capitalize">{theme}</span>
                        </button>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p className="mb-2">📱 <strong>Mobile-first Design</strong> - Optimiert für Smartphones</p>
                          <p className="mb-2">🔄 <strong>Offline-Funktionen</strong> - Funktioniert ohne Internet</p>
                          <p>💾 <strong>LocalStorage</strong> - Alle Daten werden lokal gespeichert</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar - hidden in quick mode */}
        {currentView !== 'quick' && (
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Habit Tracker
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              onKeyDown={(e) => handleKeyboardNavigation(e, () => setSidebarOpen(false))}
              aria-label={ariaLabels.close}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as 'dashboard' | 'habits' | 'rewards' | 'statistics' | 'settings');
                      setSidebarOpen(false);
                    }}
                    onKeyDown={(e) => handleKeyboardNavigation(e, () => {
                      setCurrentView(item.id as 'dashboard' | 'habits' | 'rewards' | 'statistics' | 'settings');
                      setSidebarOpen(false);
                    })}
                    aria-label={ariaLabels[item.id as keyof typeof ariaLabels] || `Navigate to ${item.name}`}
                    aria-current={currentView === item.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={toggleTheme}
              onKeyDown={(e) => handleKeyboardNavigation(e, toggleTheme)}
              aria-label={ariaLabels.theme}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {getThemeIcon()}
              <span className="font-medium capitalize">{theme} Theme</span>
            </button>
          </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header - hidden in quick mode */}
          {currentView !== 'quick' && (
            <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSidebarOpen(true)}
              onKeyDown={(e) => handleKeyboardNavigation(e, () => setSidebarOpen(true))}
              aria-label={ariaLabels.menu}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Habit Tracker
            </h1>
            <button
              onClick={toggleTheme}
              onKeyDown={(e) => handleKeyboardNavigation(e, toggleTheme)}
              aria-label={ariaLabels.theme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {getThemeIcon()}
            </button>
            </div>
          )}

          {/* Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {renderContent()}
          </main>
        </div>

        {/* Sidebar overlay */}
        {sidebarOpen && currentView !== 'quick' && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* PWA Install Prompt */}
        <InstallPrompt />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;