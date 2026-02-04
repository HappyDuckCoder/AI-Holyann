'use client';

import { GraduationCap } from 'lucide-react';

interface SchoolListTabProps {
  studentId: string;
}

export default function SchoolListTab({ studentId }: SchoolListTabProps) {
  return (
    <div className="py-8 text-center">
      <GraduationCap className="mx-auto h-16 w-16 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Danh sách trường
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {/* TODO: Reuse existing <SchoolListComponent /> here */}
        Tính năng này sẽ tái sử dụng component danh sách trường hiện có.
        <br />
        Component <code className="rounded bg-gray-100 px-2 py-1 text-xs">&lt;SchoolListComponent /&gt;</code> sẽ được tích hợp tại đây.
      </p>
    </div>
  );
}
