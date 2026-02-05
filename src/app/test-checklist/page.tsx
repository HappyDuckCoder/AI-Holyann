import ChecklistTab from '@/components/mentor/student/ChecklistTab';
import Link from 'next/link';

export default function TestChecklistPage() {
  // Test với student ID cố định
  const testStudentId = '7bbb7315-c8b3-4456-b0af-eacb39cdf561';

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/test-dashboard"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  ← Back to Dashboard
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Test Checklist Tab Component
              </h1>
              <p className="text-gray-600 mt-2">
                Testing với Student ID: {testStudentId}
              </p>
            </div>
            <Link
              href="/test-storage"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🧪 Test Storage
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <ChecklistTab studentId={testStudentId} />
          </div>
        </div>
      </div>
    </div>
  );
}
