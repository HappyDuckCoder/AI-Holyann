'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import StudentTabs from './StudentTabs';
import { PageLoading } from '@/components/ui/PageLoading';

interface StudentInfo {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
}

interface StudentDetailContentProps {
  studentId: string;
}

export default function StudentDetailContent({ studentId }: StudentDetailContentProps) {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`/api/mentor/student/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudent(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, [studentId]);

  if (isLoading) {
    return (
      <>
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/mentor/students"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
        <PageLoading inline size="md" message="Đang tải thông tin học viên..." />
      </>
    );
  }

  if (!student) {
    return (
      <>
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/mentor/students"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
        <div className="py-12 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">Không tìm thấy học viên hoặc bạn không có quyền truy cập</p>
          <Link
            href="/mentor/students"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Về danh sách học viên
          </Link>
        </div>
      </>
    );
  }

  return (
    <div>
      {/* Header - giống admin: back + title */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/mentor/students"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground after:mt-1 after:block after:h-0.5 after:w-12 after:rounded-full after:bg-primary">
            Chi tiết học viên
          </h1>
        </div>
      </div>

      {/* Grid: 1 cột profile card (giống admin) + 2 cột có thể mở rộng */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card thông tin cơ bản - giống admin StudentDetail cột trái */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 shadow-sm">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {student.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">{student.full_name}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{student.email}</p>
            <div className="space-y-3 text-left text-sm">
              <a
                href={`mailto:${student.email}`}
                className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>{student.email}</span>
              </a>
              {student.phone_number && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{student.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột 2–3: placeholder hoặc nội dung phụ - giống admin có 2 card học vấn + mục tiêu */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              Thông tin liên hệ
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Họ và tên:</span>
                <p className="text-foreground">{student.full_name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Email:</span>
                <p className="text-foreground">
                  <a href={`mailto:${student.email}`} className="text-primary hover:underline">
                    {student.email}
                  </a>
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Số điện thoại:</span>
                <p className="text-foreground">{student.phone_number || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần nội dung theo tab - card bọc bảng/table giống admin */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <StudentTabs studentId={studentId} />
      </div>
    </div>
  );
}
