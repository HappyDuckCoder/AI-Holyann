'use client';

import { GraduationCap } from 'lucide-react';

interface SchoolListTabProps {
  studentId: string;
}

export default function SchoolListTab({ studentId }: SchoolListTabProps) {
  return (
    <div className="py-8 text-center">
      <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium text-foreground">
        Danh sách trường
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {/* TODO: Reuse existing <SchoolListComponent /> here */}
        Tính năng này sẽ tái sử dụng component danh sách trường hiện có.
        <br />
        Component <code className="rounded bg-muted px-2 py-1 text-xs">&lt;SchoolListComponent /&gt;</code> sẽ được tích hợp tại đây.
      </p>
    </div>
  );
}
