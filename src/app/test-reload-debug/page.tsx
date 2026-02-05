'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TestChecklistReloadDebug() {
  const [reloadCount, setReloadCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isObserving, setIsObserving] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  // Monitor page reload/refresh events
  useEffect(() => {
    const handleBeforeUnload = () => {
      const newCount = reloadCount + 1;
      localStorage.setItem('reloadCount', newCount.toString());
      addLog(`🔄 Page is about to reload/refresh (Count: ${newCount})`);
    };

    const handleLoad = () => {
      const storedCount = parseInt(localStorage.getItem('reloadCount') || '0');
      setReloadCount(storedCount);
      addLog(`📍 Page loaded (Total reloads: ${storedCount})`);
    };

    // Check if this is a reload
    if (document.readyState === 'complete') {
      handleLoad();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [reloadCount]);

  // Monitor visibility and focus events (similar to ChecklistPage)
  useEffect(() => {
    if (!isObserving) return;

    const handleVisibilityChange = () => {
      const state = document.visibilityState;
      addLog(`👁️ Visibility changed: ${state}`);
    };

    const handleFocus = () => {
      addLog(`🎯 Window focused`);
    };

    const handleBlur = () => {
      addLog(`😴 Window blurred`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isObserving]);

  const clearLogs = () => {
    setLogs([]);
    setReloadCount(0);
    localStorage.removeItem('reloadCount');
    addLog('🧹 Logs cleared');
  };

  const toggleObserving = () => {
    setIsObserving(!isObserving);
    addLog(isObserving ? '⏸️ Stopped observing events' : '▶️ Started observing events');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🧪 Checklist Auto-Reload Debug
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor page reloads and events that might cause them
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                reloadCount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {reloadCount > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                <span className="font-semibold">
                  {reloadCount === 0 ? 'No Reloads' : `${reloadCount} Reload${reloadCount > 1 ? 's' : ''}`}
                </span>
              </div>
              <button
                onClick={toggleObserving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isObserving 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isObserving ? 'Stop Observing' : 'Start Observing'}
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Page State</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Ready State: <strong>{document.readyState}</strong></p>
                <p>Visibility: <strong>{document.visibilityState}</strong></p>
                <p>Focused: <strong>{document.hasFocus() ? 'Yes' : 'No'}</strong></p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Monitoring</h3>
              <div className="space-y-1 text-sm text-purple-800">
                <p>Observer: <strong>{isObserving ? 'Active' : 'Inactive'}</strong></p>
                <p>Events: <strong>{logs.length}</strong></p>
                <p>Session: <strong>{Date.now()}</strong></p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Test Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    addLog('🔄 Manual refresh triggered');
                    window.location.reload();
                  }}
                  className="w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Force Reload
                </button>
                <button
                  onClick={() => addLog('📝 Manual log entry')}
                  className="w-full px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  Add Test Log
                </button>
              </div>
            </div>
          </div>

          {/* Event Logs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Event Logs</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RefreshCw size={16} />
                <span>Live monitoring {isObserving ? '(Active)' : '(Paused)'}</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No events logged yet. Start observing to see events.
                </p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-sm font-mono p-2 rounded ${
                        log.includes('🔄') || log.includes('reload') 
                          ? 'bg-red-100 text-red-800 border-l-4 border-red-400' 
                          : log.includes('👁️') || log.includes('🎯')
                            ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              🔍 How to test for auto-reload issues:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Start Observing" to monitor events</li>
              <li>2. Switch to another tab/app and come back</li>
              <li>3. Minimize/restore the window</li>
              <li>4. Open ChecklistPage in another tab and watch logs here</li>
              <li>5. Check if reload count increases without manual refresh</li>
              <li>6. Look for suspicious patterns in the event logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
