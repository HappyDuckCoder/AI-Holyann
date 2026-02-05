'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, Home } from 'lucide-react';

export default function TestStageMemory() {
  const [savedStageId, setSavedStageId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev].slice(0, 10));
  };

  useEffect(() => {
    // Check localStorage on mount
    const saved = localStorage.getItem('activeStageId');
    setSavedStageId(saved);
    addLog(`📍 Loaded from localStorage: ${saved || 'None'}`);
  }, []);

  const testSetStage = (stageId: number) => {
    localStorage.setItem('activeStageId', stageId.toString());
    setSavedStageId(stageId.toString());
    addLog(`💾 Set activeStageId to: ${stageId}`);
  };

  const clearStorage = () => {
    localStorage.removeItem('activeStageId');
    setSavedStageId(null);
    addLog('🧹 Cleared activeStageId from localStorage');
  };

  const refreshPage = () => {
    addLog('🔄 Refreshing page to test persistence...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🧪 Test Stage Memory & Persistence
              </h1>
              <p className="text-gray-600 mt-1">
                Test localStorage persistence cho activeStageId
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-2 rounded-lg ${
                savedStageId 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                <span className="font-semibold">
                  Stage: {savedStageId || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Stage Selection Test</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(stageId => (
                  <button
                    key={stageId}
                    onClick={() => testSetStage(stageId)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      savedStageId === stageId.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    Stage {stageId}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-3">Persistence Test</h3>
              <div className="space-y-2">
                <button
                  onClick={refreshPage}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh Page
                </button>
                <button
                  onClick={clearStorage}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Clear Storage
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">
              🧪 Test Steps:
            </h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Click "Stage 2" or "Stage 3" to simulate user selection</li>
              <li>Click "Refresh Page" to test persistence</li>
              <li>Page should remember the selected stage after reload</li>
              <li>Go to actual checklist page - should open at saved stage</li>
              <li>Test "Clear Storage" to reset to default behavior</li>
            </ol>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a
              href="/dashboard/checklist"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowRight size={16} />
              Go to Checklist
            </a>
            <a
              href="/student/checklist"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowRight size={16} />
              Student Checklist
            </a>
            <a
              href="/test-dashboard"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home size={16} />
              Test Dashboard
            </a>
          </div>

          {/* Event Logs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Event Logs</h3>

            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No events logged yet
              </p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-sm font-mono p-2 rounded ${
                      log.includes('💾') ? 'bg-blue-100 text-blue-800' :
                      log.includes('🧹') ? 'bg-red-100 text-red-800' :
                      log.includes('🔄') ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expected Behavior */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">
              ✅ Expected Behavior After Fix:
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• User ở Stage 2 → Reload page → Vẫn ở Stage 2</li>
              <li>• User chưa có progress → Auto select Stage 1 (default)</li>
              <li>• User có progress Stage 2 → Auto select Stage 2</li>
              <li>• Stage selection được persist trong localStorage</li>
              <li>• Logic fallback: savedStage → latestProgressStage → Stage 1</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
