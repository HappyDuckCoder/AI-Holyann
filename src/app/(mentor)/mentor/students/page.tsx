import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageLoading } from '@/components/ui/PageLoading';
import StudentListFull from '@/components/mentor/students/StudentListFull';

export const metadata: Metadata = {
  title: 'Quản lý học viên | Holyann Mentor',
  description: 'Danh sách học viên đang phụ trách',
};

export default function StudentsListPage() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.14))]">
      <div className="container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="space-y-6">
          <header className="border-b border-border pb-6">
            <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground sm:text-3xl">
              Quản lý học viên
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách tất cả học viên bạn đang phụ trách
            </p>
          </header>

          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
                <PageLoading inline size="md" className="py-0" />
              </div>
            }
          >
            <StudentListFull />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
