'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Star, AlertTriangle, Clock, ArrowRight, CalendarClock } from 'lucide-react';
import StatsCard from './StatsCard';
import UpcomingSchedule from './UpcomingSchedule';
import type { MentorDashboardStats, ScheduleEvent } from '@/types/mentor';

interface DeadlineTask {
  id: string;
  task_title: string;
  student_name: string;
  student_id: string;
  deadline: string;
  status: string;
  days_remaining: number;
}

export default function MentorDashboardContent() {
  const [stats, setStats] = useState<MentorDashboardStats>({
    totalActiveStudents: 0,
    weeklyDeadlines: 0,
    averageRating: 5.0,
  });
  const [urgentDeadlines, setUrgentDeadlines] = useState<DeadlineTask[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats and urgent deadlines
        const [statsRes, deadlinesRes] = await Promise.all([
          fetch('/api/mentor/dashboard/stats'),
          fetch('/api/mentor/dashboard/urgent-deadlines'),
        ]);

        if (!statsRes.ok) {
          console.error('Dashboard Stats API Error:', await statsRes.text());
          return;
        }

        const statsData = await statsRes.json();

        setStats({
          totalActiveStudents: statsData.totalActiveStudents,
          weeklyDeadlines: statsData.weeklyDeadlines,
          averageRating: statsData.averageRating,
        });

        // Handle urgent deadlines
        if (deadlinesRes.ok) {
          const deadlinesData = await deadlinesRes.json();
          setUrgentDeadlines(deadlinesData);
        }

        // Mock events for now
        setEvents([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to get deadline status color
  const getDeadlineColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
    if (daysRemaining === 0) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
    if (daysRemaining <= 2) return { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200' };
    return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
  };

  // Helper to format deadline text
  const getDeadlineText = (daysRemaining: number) => {
    if (daysRemaining < 0) return `Quá hạn ${Math.abs(daysRemaining)} ngày`;
    if (daysRemaining === 0) return 'Hôm nay!';
    return `Còn ${daysRemaining} ngày`;
  };

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
        {/* Left Column: Urgent Deadlines (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Deadline sắp đến hạn</h2>
                  <p className="text-sm text-gray-500">Các nhiệm vụ cần chú ý trong 5 ngày tới</p>
                </div>
              </div>
              <Link
                href="/mentor/deadlines"
                className="text-sm text-[#0f4c81] hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-gray-200">
              {urgentDeadlines.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Không có deadline nào trong 5 ngày tới
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Các học viên đang hoàn thành đúng tiến độ
                  </p>
                </div>
              ) : (
                urgentDeadlines.map((task) => {
                  const colors = getDeadlineColor(task.days_remaining);
                  return (
                    <div
                      key={task.id}
                      className={`px-6 py-4 ${colors.bg} transition-colors hover:opacity-90`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                            {task.days_remaining < 0 ? (
                              <AlertTriangle className={`h-5 w-5 ${colors.text}`} />
                            ) : (
                              <Clock className={`h-5 w-5 ${colors.text}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {task.task_title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Học viên: {task.student_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${colors.text}`}>
                              {getDeadlineText(task.days_remaining)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(task.deadline).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/mentor/student/${task.student_id}`}
                          className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#0f4c81] hover:bg-[#0f4c81] hover:text-white"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links & Schedule (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Truy cập nhanh</h3>
            <div className="space-y-3">
              <Link
                href="/mentor/students"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#0f4c81] hover:bg-blue-50 transition-colors"
              >
                <Users className="h-5 w-5 text-[#0f4c81]" />
                <span className="text-sm font-medium">Danh sách học viên</span>
              </Link>
              <Link
                href="/mentor/deadlines"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#0f4c81] hover:bg-blue-50 transition-colors"
              >
                <CalendarClock className="h-5 w-5 text-[#0f4c81]" />
                <span className="text-sm font-medium">Quản lý deadline</span>
              </Link>
              <Link
                href="/mentor/chat"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#0f4c81] hover:bg-blue-50 transition-colors"
              >
                <Calendar className="h-5 w-5 text-[#0f4c81]" />
                <span className="text-sm font-medium">Tin nhắn</span>
              </Link>
            </div>
          </div>

          {/* Schedule */}
          <UpcomingSchedule events={events} />
        </div>
      </div>
    </div>
  );
}
