import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import StudentListFull from '@/components/mentor/students/StudentListFull';

export const metadata: Metadata = {
  title: 'Quản lý học viên | Holyann Mentor',
  description: 'Danh sách học viên đang phụ trách',
};

export default function StudentsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách tất cả học viên bạn đang phụ trách
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f4c81]" />
          </div>
        }
      >
        <StudentListFull />
      </Suspense>
    </div>
  );
}
