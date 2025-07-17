import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/useAppContext';
import { exportAppData, importAppData, getDataSize } from '../utils/dataExport';
import { Download, Upload, AlertCircle, CheckCircle, FileText, Trash2 } from 'lucide-react';

export const DataManagement: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string>('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportAppData(state);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    setImportError('');

    try {
      const importData = await importAppData(file);
      
      // Dispatch the imported data
      dispatch({ type: 'LOAD_STATE', payload: importData.appData });
      
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 5000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    dispatch({ type: 'RESET_ALL_DATA' });
    setShowConfirmReset(false);
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'loading':
        return <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (importStatus) {
      case 'loading':
        return 'Importing data...';
      case 'success':
        return 'Data imported successfully!';
      case 'error':
        return importError;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <FileText size={20} />
        💾 Daten-Management
      </h2>

      <div className="space-y-6">
        {/* Data Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📊 Aktuelle Daten
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Habits:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {state.habits.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Belohnungen:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {state.rewards.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Meilensteine:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {state.milestones.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Erledigungen:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {state.completions.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Einstellungen:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                ✓ Inkludiert
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Datengröße:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {getDataSize(state)}
              </span>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📤 Daten exportieren
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Erstelle ein vollständiges Backup aller deiner Daten als JSON-Datei:
          </p>
          <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>✓ Alle Habits mit aktuellen Streaks</div>
              <div>✓ Belohnungen & Kategorien</div>
              <div>✓ Meilenstein-Einstellungen</div>
              <div>✓ Benutzereinstellungen & Theme</div>
              <div>✓ Vollständige Erledigungshistorie</div>
              <div>✓ Statistiken & Rad-Status</div>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            Backup herunterladen
          </button>
        </div>

        {/* Import Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📥 Daten importieren
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Lade eine zuvor erstellte Backup-Datei hoch, um alle deine Daten wiederherzustellen: Habits, Belohnungen, Meilensteine, Einstellungen und Fortschritte.
            <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
              ⚠️ Achtung: Dies überschreibt alle aktuellen Daten!
            </span>
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleImportClick}
              disabled={importStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Upload size={16} />
              Backup auswählen
            </button>
            
            {importStatus !== 'idle' && (
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className={`text-sm ${
                  importStatus === 'success' ? 'text-green-600 dark:text-green-400' :
                  importStatus === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {getStatusMessage()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reset Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🗑️ Alle Daten löschen
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Lösche alle Habits, Belohnungen, Fortschritte und Einstellungen.
            <span className="block text-red-600 dark:text-red-400 mt-1">
              ⚠️ Diese Aktion kann nicht rückgängig gemacht werden!
            </span>
          </p>
          
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Alle Daten löschen
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Ja, alles löschen
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};