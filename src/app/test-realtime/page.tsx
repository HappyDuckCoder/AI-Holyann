'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/realtime';

/**
 * Component để test Supabase Realtime connection
 * Sử dụng để debug và verify rằng realtime đang hoạt động đúng
 */
export default function RealtimeTestPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [messages, setMessages] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    addLog('🔌 Setting up Realtime test subscription...');

    // Test subscription to chat_messages table
    const channel = supabase
      .channel('realtime-test', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          addLog(`📩 Event received: ${payload.eventType}`);
          addLog(`📦 Payload: ${JSON.stringify(payload.new || payload.old, null, 2)}`);

          setMessages((prev) => [
            {
              event: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date(),
            },
            ...prev,
          ].slice(0, 10));
        }
      )
      .subscribe((subscribeStatus) => {
        addLog(`📡 Subscription status: ${subscribeStatus}`);
        setStatus(subscribeStatus);

        if (subscribeStatus === 'SUBSCRIBED') {
          addLog('✅ Successfully subscribed to realtime updates!');
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
          addLog('❌ Channel error - check Supabase configuration');
        }
      });

    return () => {
      addLog('🔌 Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  // Test sending a message to trigger realtime
  const testSendMessage = async () => {
    try {
      addLog('📤 Attempting to send test message...');

      // This will trigger the realtime event if everything is configured correctly
      const response = await fetch('/api/chat/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `Test message from Realtime Test - ${new Date().toLocaleTimeString()}`,
        }),
      });

      if (response.ok) {
        addLog('✅ Test message sent successfully');
        addLog('⏳ Waiting for realtime event...');
      } else {
        addLog('❌ Failed to send test message');
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            🧪 Supabase Realtime Test
          </h1>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This page tests the Supabase Realtime connection for chat messages.
            </p>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`w-3 h-3 rounded-full ${
                  status === 'SUBSCRIBED'
                    ? 'bg-green-500 animate-pulse'
                    : status === 'CHANNEL_ERROR'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Status: {status}
              </span>
            </div>
          </div>

          {/* Test Button */}
          <button
            onClick={testSendMessage}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            🚀 Send Test Message
          </button>
        </div>

        {/* Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              📩 Recent Events ({messages.length})
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No events yet. Try sending a test message or send a real chat message.
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          msg.event === 'INSERT'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : msg.event === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {msg.event}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                      {JSON.stringify(msg.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logs Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              📋 Debug Logs
            </h2>

            <div className="bg-surface-elevated rounded-lg p-4 max-h-[500px] overflow-y-auto font-mono text-sm border border-border">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`mb-1 ${
                    log.includes('✅')
                      ? 'text-green-400'
                      : log.includes('❌')
                      ? 'text-red-400'
                      : log.includes('📩') || log.includes('📦')
                      ? 'text-blue-400'
                      : 'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">
            📚 How to Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>Verify status shows "SUBSCRIBED" (green indicator)</li>
            <li>Click "Send Test Message" button</li>
            <li>Watch for new events in the "Recent Events" panel</li>
            <li>Alternatively, send a real message in the chat and watch it appear here</li>
            <li>Check Debug Logs for detailed information</li>
          </ol>

          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              ⚠️ Troubleshooting:
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li>• If status is not "SUBSCRIBED", check Supabase connection</li>
              <li>• Verify enable-realtime.sql has been run in Supabase</li>
              <li>• Check browser console for detailed error messages</li>
              <li>• Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
