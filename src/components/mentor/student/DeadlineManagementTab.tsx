'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Task {
  id: string;
  task_name: string;
  description: string | null;
  deadline: Date | null;
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED';
}

interface DeadlineManagementTabProps {
  studentId: string;
}

export default function DeadlineManagementTab({ studentId }: DeadlineManagementTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTasks = async () => {
      try {
        // Mock data
        setTasks([
          {
            id: 't1',
            task_name: 'Hoàn thiện Personal Statement',
            description: 'Draft cuối cùng trước khi nộp',
            deadline: new Date(Date.now() + 86400000 * 7),
            status: 'IN_REVIEW',
          },
          {
            id: 't2',
            task_name: 'Nộp đơn Common App',
            description: 'Hoàn tất hồ sơ trên Common Application',
            deadline: new Date(Date.now() + 86400000 * 14),
            status: 'PENDING',
          },
          {
            id: 't3',
            task_name: 'Chuẩn bị hồ sơ tài chính',
            description: 'Bank statement và tài liệu chứng minh tài chính',
            deadline: new Date(Date.now() + 86400000 * 21),
            status: 'PENDING',
          },
        ]);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [studentId]);

  const handleDeadlineChange = async (taskId: string, newDeadline: string) => {
    // TODO: Implement API call to update deadline
    console.log('Update deadline for task:', taskId, 'to:', newDeadline);
    
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, deadline: new Date(newDeadline) }
          : task
      )
    );
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // TODO: Implement API call to update status
    console.log('Update status for task:', taskId, 'to:', newStatus);
    
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) return;
    
    // TODO: Implement API call to delete task
    console.log('Delete task:', taskId);
    
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleAddTask = () => {
    // TODO: Implement add task modal
    alert('Chức năng thêm nhiệm vụ sẽ được triển khai');
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'IN_REVIEW':
        return 'Đang review';
      case 'PENDING':
        return 'Chờ xử lý';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f4c81] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách nhiệm vụ ({tasks.length})
        </h3>
        <button
          onClick={handleAddTask}
          className="flex items-center gap-2 rounded-lg bg-[#0f4c81] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm nhiệm vụ
        </button>
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border border-gray-200 py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Chưa có nhiệm vụ nào</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nhiệm vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{task.task_name}</div>
                      {task.description && (
                        <div className="mt-1 text-sm text-gray-500">{task.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={task.deadline ? format(task.deadline, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as Task['status'])
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="IN_REVIEW">Đang review</option>
                      <option value="COMPLETED">Hoàn thành</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
