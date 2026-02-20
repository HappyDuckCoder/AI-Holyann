import { Suspense } from 'react';
import MentorProfileForm from '@/components/mentor/profile/MentorProfileForm';
import { PageLoading } from '@/components/ui/PageLoading';

export const metadata = {
  title: 'Hồ sơ chuyên môn | Holyann Mentor',
  description: 'Cập nhật thông tin cá nhân và chuyên môn',
};

export default function MentorProfilePage() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.14))]">
      <div className="container max-w-4xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="space-y-6">
          <header className="border-b border-border pb-6">
            <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground sm:text-3xl">
              Hồ sơ chuyên môn
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cập nhật thông tin cá nhân và chuyên môn của bạn. Hồ sơ đầy đủ giúp học viên tin tưởng và kết nối tốt hơn.
            </p>
          </header>

          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
                <PageLoading inline size="md" className="py-0" />
              </div>
            }
          >
            <MentorProfileForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
