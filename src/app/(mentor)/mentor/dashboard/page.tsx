import { Suspense } from 'react';
import MentorDashboardContent from '@/components/mentor/dashboard/MentorDashboardContent';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Mentor Dashboard | Holyann Explore',
  description: 'Quản lý học viên và theo dõi tiến độ',
};

export default function MentorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý học viên và theo dõi tiến độ học tập
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
        <MentorDashboardContent />
      </Suspense>
    </div>
  );
}
