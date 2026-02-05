'use client';

import { useEffect, useState } from 'react';
import { createBucketIfNotExists } from '@/actions/create-bucket';

interface BucketTestResult {
  success: boolean;
  buckets?: Array<{ name: string; id: string; public: boolean }>;
  targetBucketExists?: boolean;
  message?: string;
  error?: string;
}

export default function TestStoragePage() {
  const [result, setResult] = useState<BucketTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingBucket, setCreatingBucket] = useState(false);

  const testStorage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-storage');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    setCreatingBucket(true);
    try {
      const result = await createBucketIfNotExists();
      if (result.success) {
        // Refresh test after creating bucket
        await testStorage();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingBucket(false);
    }
  };

  useEffect(() => {
    testStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <a
              href="/test-dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Dashboard
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="/test-checklist"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              📋 Test Checklist
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Supabase Storage Test
          </h1>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Testing storage...</span>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className={`ml-2 font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'Storage Connection: SUCCESS' : 'Storage Connection: FAILED'}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
                {result.error && (
                  <p className="mt-2 text-sm text-red-700 font-mono">
                    Error: {result.error}
                  </p>
                )}
              </div>

              {/* Target Bucket Status */}
              {result.success && (
                <div className={`p-4 rounded-lg ${result.targetBucketExists ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center">
                    <span className={`text-lg ${result.targetBucketExists ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.targetBucketExists ? '📁✅' : '📁⚠️'}
                    </span>
                    <span className={`ml-2 font-medium ${result.targetBucketExists ? 'text-green-800' : 'text-yellow-800'}`}>
                      Bucket 'hoex-documents': {result.targetBucketExists ? 'EXISTS' : 'NOT FOUND'}
                    </span>
                  </div>
                </div>
              )}

              {/* Available Buckets */}
              {result.buckets && result.buckets.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-3">📦 Available Buckets:</h3>
                  <div className="space-y-2">
                    {result.buckets.map((bucket) => (
                      <div key={bucket.id} className="flex items-center justify-between bg-white rounded p-3 border">
                        <div>
                          <span className="font-medium text-gray-900">{bucket.name}</span>
                          <span className="ml-2 text-xs text-gray-500">ID: {bucket.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${bucket.public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {bucket.public ? 'Public' : 'Private'}
                          </span>
                          {bucket.name === 'hoex-documents' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              TARGET
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.success && !result.targetBucketExists && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-800 mb-3">🔧 Cần sửa:</h3>
                  <div className="text-sm text-orange-700 space-y-2 mb-4">
                    <p>• Bucket 'hoex-documents' không tồn tại trên Supabase.</p>
                    <p>• Cần tạo bucket hoặc cập nhật tên bucket trong code.</p>
                    <p>• Hoặc sử dụng bucket có sẵn nếu có.</p>
                  </div>
                  <button
                    onClick={handleCreateBucket}
                    disabled={creatingBucket}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingBucket ? '🔨 Đang tạo bucket...' : '🔨 Tạo bucket hoex-documents'}
                  </button>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={testStorage}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '🔄 Đang test...' : '🔄 Test lại'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
