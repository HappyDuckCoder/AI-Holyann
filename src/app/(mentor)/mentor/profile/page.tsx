import { Suspense } from 'react';
import MentorProfileForm from '@/components/mentor/profile/MentorProfileForm';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Hồ sơ chuyên môn | Holyann Mentor',
  description: 'Cập nhật thông tin cá nhân và chuyên môn',
};

export default function MentorProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ chuyên môn</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật thông tin cá nhân và chuyên môn của bạn
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f4c81]" />
          </div>
        }
      >
        <MentorProfileForm />
      </Suspense>
    </div>
  );
}
