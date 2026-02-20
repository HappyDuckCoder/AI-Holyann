'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/PageLoading';
import type { AssignedStudent } from '@/types/mentor';

function getProgressBadgeClass(progress: number) {
  if (progress >= 80)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (progress >= 40)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

function getProgressBarClass(progress: number) {
  if (progress >= 80) return 'bg-emerald-500 dark:bg-emerald-600';
  if (progress >= 40) return 'bg-amber-500 dark:bg-amber-600';
  return 'bg-red-500 dark:bg-red-600';
}

function getProgressLabel(progress: number) {
  if (progress >= 80) return 'Tiến độ tốt';
  if (progress >= 40) return 'Đang tiến hành';
  return 'Cần hỗ trợ';
}

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
        if (!res.ok) return;
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

  useEffect(() => {
    let result = [...students];
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy === 'name') {
      result.sort((a, b) => a.student.full_name.localeCompare(b.student.full_name));
    } else {
      result.sort((a, b) => b.progress - a.progress);
    }
    setFilteredStudents(result);
  }, [students, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <PageLoading inline size="md" className="py-0" />
      </div>
    );
  }

  const goodCount = students.filter((s) => s.progress >= 80).length;
  const midCount = students.filter((s) => s.progress >= 40 && s.progress < 80).length;
  const lowCount = students.filter((s) => s.progress < 40).length;

  return (
    <div className="space-y-6">
      {/* Filters - same style as admin users */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'progress')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="progress">Sắp xếp theo tiến độ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats - semantic cards like admin */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tổng học viên</p>
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tiến độ tốt (≥80%)</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{goodCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đang tiến hành</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{midCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Cần hỗ trợ (&lt;40%)</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{lowCount}</p>
        </div>
      </div>

      {/* Table - same card + table as admin users */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <h2 className="text-lg font-semibold text-foreground">Danh sách học viên</h2>
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredStudents.length} / {students.length} học viên
          </p>
        </div>
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? 'Không tìm thấy học viên nào' : 'Chưa có học viên nào'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">
                    Học viên
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold text-muted-foreground md:table-cell sm:px-6">
                    Tiến độ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground sm:px-6">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.student_id}
                    className="border-b border-border transition-colors hover:bg-muted/30 last:border-0"
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                          {student.student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">
                            {student.student.full_name}
                          </div>
                          <div className="text-xs text-muted-foreground md:text-sm truncate max-w-[200px] sm:max-w-none">
                            {student.student.email}
                          </div>
                          {/* Progress bar - mobile */}
                          <div className="mt-1.5 md:hidden">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Tiến độ</span>
                              <span className="font-medium text-foreground">{student.progress}%</span>
                            </div>
                            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressBarClass(student.progress)}`}
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${getProgressBarClass(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground tabular-nums">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getProgressBadgeClass(student.progress)}`}
                      >
                        {getProgressLabel(student.progress)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6">
                      <Link
                        href={`/mentor/student/${student.student_id}`}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Chi tiết
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
