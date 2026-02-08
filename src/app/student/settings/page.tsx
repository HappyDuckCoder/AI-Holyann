'use client';

import { StudentPageContainer } from '@/components/student';

export default function StudentSettingsPage() {
  return (
    <StudentPageContainer>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">Cài đặt</h1>
        <p className="mt-2 text-muted-foreground">
          Trang cài đặt sẽ được cập nhật sau. Bạn có thể đổi chế độ sáng/tối và đăng xuất từ menu tài khoản trên thanh điều hướng.
        </p>
      </div>
    </StudentPageContainer>
  );
}
