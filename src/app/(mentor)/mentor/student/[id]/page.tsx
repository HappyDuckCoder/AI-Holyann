import { Suspense } from 'react';
import StudentDetailContent from '@/components/mentor/student/StudentDetailContent';
import { Loader2 } from 'lucide-react';

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
            <Loader2 className="h-8 w-8 animate-spin text-[#0f4c81]" />
          </div>
        }
      >
        <StudentDetailContent studentId={id} />
      </Suspense>
    </div>
  );
}
