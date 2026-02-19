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
    <div className="space-y-6">
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
