import { Suspense } from 'react';
import StudentDetailContent from '@/components/mentor/student/StudentDetailContent';
import { PageLoading } from '@/components/ui/PageLoading';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-[calc(100vh-theme(spacing.14))] bg-background px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <PageLoading inline size="md" className="py-0" />
          </div>
        }
      >
        <StudentDetailContent studentId={id} />
      </Suspense>
    </div>
  );
}
