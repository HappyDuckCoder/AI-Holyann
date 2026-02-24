'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative w-40 h-40 mx-auto md:w-52 md:h-52">
          <Image
            src="/images/holi/pencil.png"
            alt=""
            fill
            className="object-contain opacity-90"
            sizes="(max-width: 768px) 160px, 208px"
            priority
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            404
          </h1>
          <p className="text-lg text-muted-foreground">
            Trang không tồn tại
          </p>
          <p className="text-sm text-muted-foreground/80">
            Có thể đường dẫn đã thay đổi hoặc trang đã bị xóa.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
