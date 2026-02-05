import Link from 'next/link';

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Test Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Checklist Test */}
            <Link
              href="/test-checklist"
              className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Test Checklist Component
                </h3>
                <p className="text-blue-700">
                  Test giao diện checklist cho mentor
                </p>
              </div>
            </Link>

            {/* Storage Test */}
            <Link
              href="/test-storage"
              className="block p-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-orange-900 mb-2">
                  Test Supabase Storage
                </h3>
                <p className="text-orange-700">
                  Kiểm tra bucket và file access
                </p>
              </div>
            </Link>

            {/* API Test */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  API Endpoints
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <a href="/api/test-storage" target="_blank" className="block hover:underline">
                    GET /api/test-storage
                  </a>
                  <a href="/api/test-file-access?url=test" target="_blank" className="block hover:underline">
                    GET /api/test-file-access
                  </a>
                </div>
              </div>
            </div>

            {/* File Preview Test */}
            <Link
              href="/test-file-preview"
              className="block p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">👁️</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-2">
                  Test File Preview Modal
                </h3>
                <p className="text-purple-700">
                  Test xem trước file PDF, DOCX, ảnh
                </p>
              </div>
            </Link>

            {/* Checklist Sync Test */}
            <Link
              href="/test-checklist-sync"
              className="block p-6 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-2">
                  Test Checklist Status Sync
                </h3>
                <p className="text-teal-700">
                  Test đồng bộ status giữa student và mentor
                </p>
              </div>
            </Link>

            {/* Auth Test */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Test NextAuth Session
                </h3>
                <p className="text-red-700 mb-4">
                  Debug NextAuth CLIENT_FETCH_ERROR issue
                </p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/test-auth');
                      const result = await response.json();
                      console.log('🔐 Auth Test Result:', result);
                      alert(`Auth Test:\n\nStatus: ${response.status}\nHas Session: ${result.hasSession}\nUser ID: ${result.session?.user?.id || 'N/A'}\nError: ${result.error || 'None'}`);
                    } catch (error) {
                      console.error('Auth test failed:', error);
                      alert(`Auth Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Test Session API
                </button>
              </div>
            </div>

            {/* Reload Debug Test */}
            <Link
              href="/test-reload-debug"
              className="block p-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-orange-900 mb-2">
                  Test Auto-Reload Debug
                </h3>
                <p className="text-orange-700">
                  Debug trang checklist tự reload vấn đề
                </p>
              </div>
            </Link>

            {/* Checklist Import Test */}
            <Link
              href="/test-checklist-import"
              className="block p-6 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🧪</div>
                <h3 className="text-xl font-semibold text-indigo-900 mb-2">
                  Test Checklist Import Fix
                </h3>
                <p className="text-indigo-700">
                  Verify setTaskProgress error đã được fix
                </p>
              </div>
            </Link>

            {/* Stage Memory Test */}
            <Link
              href="/test-stage-memory"
              className="block p-6 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">💾</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                  Test Stage Memory & Persistence
                </h3>
                <p className="text-emerald-700">
                  Test localStorage persistence cho activeStageId
                </p>
              </div>
            </Link>

            {/* Issue Summary */}
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Vấn đề hiện tại
                </h3>
                <div className="text-sm text-red-700 text-left space-y-1">
                  <p>• Bucket "hoex-documents" không tồn tại</p>
                  <p>• File links trả về "Bucket not found"</p>
                  <p>• Mentor không thể xem file học viên</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Hướng dẫn khắc phục:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Vào <strong>Test Supabase Storage</strong> để kiểm tra buckets</li>
              <li>Nếu bucket chưa tồn tại, nhấn <strong>"Tạo bucket"</strong></li>
              <li>Quay lại <strong>Test Checklist</strong> để test file access</li>
              <li>Sử dụng nút <strong>"Test access"</strong> để debug từng file cụ thể</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
