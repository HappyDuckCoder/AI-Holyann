'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, Star } from 'lucide-react';
import StatsCard from './StatsCard';
import StudentList from './StudentList';
import UpcomingSchedule from './UpcomingSchedule';
import type { MentorDashboardStats, AssignedStudent, ScheduleEvent } from '@/types/mentor';

export default function MentorDashboardContent() {
  const [stats, setStats] = useState<MentorDashboardStats>({
    totalActiveStudents: 0,
    weeklyDeadlines: 0,
    averageRating: 5.0,
  });
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch tất cả data song song
        const [statsRes, studentsRes] = await Promise.all([
          fetch('/api/mentor/dashboard/stats'),
          fetch('/api/mentor/students'),
        ]);

        if (!statsRes.ok || !studentsRes.ok) {
          const statsStatus = statsRes.status;
          const studentsStatus = studentsRes.status;
          const statsText = !statsRes.ok ? await statsRes.text() : 'OK';
          const studentsText = !studentsRes.ok ? await studentsRes.text() : 'OK';

          console.error('Dashboard Stats API Error:', { status: statsStatus, body: statsText });
          console.error('Students API Error:', { status: studentsStatus, body: studentsText });

          throw new Error('Không thể tải dữ liệu dashboard (Chi tiết lỗi trong Console)');
        }

        const statsData = await statsRes.json();
        const studentsData = await studentsRes.json();

        setStats({
          totalActiveStudents: statsData.totalActiveStudents,
          weeklyDeadlines: statsData.weeklyDeadlines,
          averageRating: statsData.averageRating,
        });

        setStudents(studentsData);

        // Mock events for now (TODO: Create events API)
        setEvents([
          {
            id: 'e1',
            title: 'Meeting với học viên',
            description: 'Review hồ sơ',
            event_date: new Date(Date.now() + 86400000),
            student_id: studentsData[0]?.student_id || null,
            student_name: studentsData[0]?.student.full_name || null,
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f4c81] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Học viên phụ trách"
          value={stats.totalActiveStudents}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Deadline tuần này"
          value={stats.weeklyDeadlines}
          icon={Calendar}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatsCard
          title="Đánh giá trung bình"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          suffix="/5.0"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Student List (2/3 width) */}
        <div className="lg:col-span-2">
          <StudentList students={students} />
        </div>

        {/* Right Column: Schedule (1/3 width) */}
        <div className="lg:col-span-1">
          <UpcomingSchedule events={events} />
        </div>
      </div>
    </div>
  );
}
