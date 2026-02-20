import { Suspense } from 'react';
import MentorDashboardContent from '@/components/mentor/dashboard/MentorDashboardContent';
import { PageLoading } from '@/components/ui/PageLoading';

export const metadata = {
  title: 'Mentor Dashboard | Holyann Explore',
  description: 'Quản lý học viên và theo dõi tiến độ',
};

export default function MentorDashboardPage() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.14))]">
      <div className="container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="space-y-6">
          <header className="border-b border-border pb-6">
            <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground sm:text-3xl">
              Tổng quan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý học viên và theo dõi tiến độ học tập
            </p>
          </header>

          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
                <PageLoading inline size="md" className="py-0" />
              </div>
            }
          >
            <MentorDashboardContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
