'use client';

import React, { useState, useEffect } from 'react';
import { uploadFileServerAction } from '@/actions/upload';
import { getSignedUrlFromFullUrl } from '@/actions/storage';
import { toast } from 'sonner';

export default function ImageTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      test,
      status,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    }]);
  };

  const testBucketAccess = async () => {
    addResult('Bucket Test', 'info', 'Testing bucket access...');

    try {
      // Test bucket access with a known file pattern
      const testUrl = 'https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/test.jpg';

      const response = await fetch(testUrl, { method: 'HEAD' });

      if (response.ok) {
        addResult('Bucket Test', 'success', 'Bucket is accessible and public');
      } else if (response.status === 404) {
        addResult('Bucket Test', 'info', 'Bucket exists but file not found (normal)');
      } else if (response.status === 403) {
        addResult('Bucket Test', 'error', 'Bucket exists but access denied - not public');
      } else {
        addResult('Bucket Test', 'error', `Bucket test failed: ${response.status}`);
      }
    } catch (error) {
      addResult('Bucket Test', 'error', `Network error: ${error}`);
    }
  };

  const testImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    addResult('Upload Test', 'info', `Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'test-user-123');
      formData.append('category', 'chat');

      const result = await uploadFileServerAction(formData);

      if (result.success) {
        addResult('Upload Test', 'success', 'File uploaded successfully', result);

        // Test if URL is accessible
        if (result.url) {
          addResult('URL Test', 'info', 'Testing uploaded file URL...');

          try {
            const response = await fetch(result.url, { method: 'HEAD' });
            if (response.ok) {
              addResult('URL Test', 'success', 'Uploaded file is accessible');

              // Test signed URL generation
              const signedResult = await getSignedUrlFromFullUrl(result.url);
              if (signedResult.success) {
                addResult('Signed URL Test', 'success', 'Signed URL generated successfully', signedResult);
              } else {
                addResult('Signed URL Test', 'error', 'Failed to generate signed URL', signedResult);
              }
            } else {
              addResult('URL Test', 'error', `Uploaded file not accessible: ${response.status}`);
            }
          } catch (error) {
            addResult('URL Test', 'error', `Error testing URL: ${error}`);
          }
        }
      } else {
        addResult('Upload Test', 'error', 'Upload failed', result);
      }
    } catch (error) {
      addResult('Upload Test', 'error', `Upload error: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      testImageUpload(file);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    testBucketAccess();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            🖼️ Image Upload & Display Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Test image upload và display trong chat system
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Test Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={testBucketAccess}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Bucket Access
              </button>

              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            📋 Test Results
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-400 dark:bg-green-900/20'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-400 dark:bg-red-900/20'
                    : 'bg-blue-50 border-blue-400 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : 'ℹ️'}
                      </span>
                      <span className="font-medium">{result.test}</span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show Data</summary>
                        <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                          {result.data}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {testResults.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Chưa có test nào. Click "Test Bucket Access" hoặc upload một ảnh để bắt đầu.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-yellow-900 dark:text-yellow-100">
            🔧 Expected Results
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li><strong>Bucket Test:</strong> Should be "accessible and public" or "file not found"</li>
            <li><strong>Upload Test:</strong> Should succeed with public URL returned</li>
            <li><strong>URL Test:</strong> Uploaded file should be accessible via URL</li>
            <li><strong>Signed URL Test:</strong> Should generate signed URL successfully</li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100">
            🛠️ Troubleshooting
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p><strong>If "access denied":</strong> Bucket không public - cần tạo bucket public</p>
            <p><strong>If "upload failed":</strong> Check environment variables và Supabase keys</p>
            <p><strong>If "URL not accessible":</strong> File uploaded nhưng bucket private</p>
            <p><strong>If "signed URL failed":</strong> Service role key không đúng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
