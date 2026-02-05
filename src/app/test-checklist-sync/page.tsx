'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';

export default function TestChecklistSync() {
  const [checklistData, setChecklistData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/checklist');
      const result = await response.json();
      console.log('📋 Checklist data:', result);
      setChecklistData(result);
    } catch (error) {
      console.error('❌ Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckSquare size={20} className="text-green-600" />;
    }

    switch (status) {
      case 'SUBMITTED':
        return <Clock size={20} className="text-yellow-600" />;
      case 'NEEDS_REVISION':
        return (
          <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center">
              <AlertTriangle size={12} className="text-red-500" />
            </div>
          </div>
        );
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>;
    }
  };

  const getStatusText = (status: string, isCompleted: boolean) => {
    if (isCompleted) return 'Đã hoàn thành';

    switch (status) {
      case 'SUBMITTED': return 'Đang review';
      case 'NEEDS_REVISION': return 'Cần sửa lại';
      case 'PENDING': return 'Chưa bắt đầu';
      default: return status || 'Chưa xác định';
    }
  };

  const getStatusColor = (status: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-50 text-green-700 border-green-200';

    switch (status) {
      case 'SUBMITTED': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'NEEDS_REVISION': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!checklistData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Test Checklist Status Sync
            </h1>
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Đang tải...' : 'Refresh'}
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Test Status Synchronization
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ✅ <strong>COMPLETED:</strong> Tick xanh - Đã hoàn thành</li>
              <li>• ⏳ <strong>SUBMITTED:</strong> Đồng hồ vàng - Đang review</li>
              <li>• ⚠️ <strong>NEEDS_REVISION:</strong> Vòng tròn đỏ với dấu chấm than - Cần sửa lại</li>
              <li>• ⭕ <strong>PENDING:</strong> Ô vuông trống - Chưa bắt đầu</li>
            </ul>
          </div>

          {checklistData.success ? (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {['PENDING', 'SUBMITTED', 'NEEDS_REVISION', 'COMPLETED'].map(status => {
                  const count = checklistData.data.progress.filter((p: any) =>
                    status === 'COMPLETED' ? p.status === 'COMPLETED' : p.status === status
                  ).length;
                  return (
                    <div key={status} className={`p-4 rounded-lg border ${getStatusColor(status, status === 'COMPLETED')}`}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status, status === 'COMPLETED')}
                        <div>
                          <p className="text-lg font-bold">{count}</p>
                          <p className="text-sm">{getStatusText(status, status === 'COMPLETED')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Task Status Details:</h2>

                {checklistData.data.tasks.map((task: any) => {
                  const progress = checklistData.data.progress.find((p: any) => p.task_id === task.id);
                  const status = progress?.status || 'PENDING';
                  const isCompleted = status === 'COMPLETED';

                  return (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getStatusIcon(status, isCompleted)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status, isCompleted)}`}>
                              {getStatusText(status, isCompleted)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>

                          {/* Progress Info */}
                          {progress && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <strong>Task ID:</strong> {task.id}
                              </div>
                              <div>
                                <strong>Status:</strong> {progress.status}
                              </div>
                              <div>
                                <strong>Submission URL:</strong> {progress.submission_url ? 'Có file' : 'Chưa có'}
                              </div>
                              <div>
                                <strong>Updated:</strong> {progress.updated_at ? new Date(progress.updated_at).toLocaleString('vi-VN') : 'N/A'}
                              </div>
                            </div>
                          )}

                          {/* Mentor Note */}
                          {progress?.mentor_note && (
                            <div className={`mt-3 p-3 rounded border-l-4 ${
                              status === 'NEEDS_REVISION' 
                                ? 'bg-red-50 border-red-400' 
                                : status === 'SUBMITTED'
                                  ? 'bg-yellow-50 border-yellow-400'
                                  : 'bg-green-50 border-green-400'
                            }`}>
                              <div className="flex items-start gap-2">
                                <MessageSquare size={16} className={`mt-0.5 ${
                                  status === 'NEEDS_REVISION' ? 'text-red-600' : 
                                  status === 'SUBMITTED' ? 'text-yellow-600' : 'text-green-600'
                                }`} />
                                <div>
                                  <p className="text-xs font-semibold mb-1 text-gray-800">
                                    💬 Nhận xét từ mentor:
                                  </p>
                                  <p className="text-sm text-gray-700">{progress.mentor_note}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-2">❌ Lỗi khi tải dữ liệu</div>
              <p className="text-gray-600">{checklistData.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
