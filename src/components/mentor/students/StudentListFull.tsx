'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, User, Search, Filter } from 'lucide-react';
import type { AssignedStudent } from '@/types/mentor';

export default function StudentListFull() {
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AssignedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('name');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/mentor/students');
        if (!res.ok) {
          console.error('Failed to fetch students');
          return;
        }
        const data = await res.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter and sort students
  useEffect(() => {
    let result = [...students];

    // Filter by search
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.student.full_name.localeCompare(b.student.full_name));
        break;
      case 'progress':
        result.sort((a, b) => b.progress - a.progress);
        break;
    }

    setFilteredStudents(result);
  }, [students, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f4c81] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'progress')}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="progress">Sắp xếp theo tiến độ</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{students.length}</div>
          <div className="text-sm text-blue-600">Tổng học viên</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {students.filter((s) => s.progress >= 80).length}
          </div>
          <div className="text-sm text-green-600">Tiến độ tốt (≥80%)</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {students.filter((s) => s.progress >= 40 && s.progress < 80).length}
          </div>
          <div className="text-sm text-yellow-600">Đang tiến hành</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {students.filter((s) => s.progress < 40).length}
          </div>
          <div className="text-sm text-red-600">Cần hỗ trợ (&lt;40%)</div>
        </div>
      </div>

      {/* Student List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách học viên</h2>
          <p className="mt-1 text-sm text-gray-500">
            Hiển thị {filteredStudents.length} / {students.length} học viên
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredStudents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? 'Không tìm thấy học viên nào' : 'Chưa có học viên nào'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className="px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0f4c81] to-blue-600 text-white font-semibold">
                      {student.student.full_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {student.student.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {student.student.email}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Tiến độ</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.progress >= 80
                                ? 'bg-green-500'
                                : student.progress >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          student.progress >= 80
                            ? 'bg-green-100 text-green-800'
                            : student.progress >= 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.progress >= 80
                          ? 'Tiến độ tốt'
                          : student.progress >= 40
                          ? 'Đang tiến hành'
                          : 'Cần hỗ trợ'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/mentor/student/${student.student_id}`}
                    className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:border-[#0f4c81] hover:bg-[#0f4c81] hover:text-white"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
