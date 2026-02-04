import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const metadata = {
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

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">
          Trang này sẽ hiển thị danh sách đầy đủ học viên.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Bạn có thể quay lại{' '}
          <Link href="/mentor/dashboard" className="text-[#0f4c81] hover:underline">
            Dashboard
          </Link>{' '}
          để xem danh sách tóm tắt.
        </p>
      </div>
    </div>
  );
}
