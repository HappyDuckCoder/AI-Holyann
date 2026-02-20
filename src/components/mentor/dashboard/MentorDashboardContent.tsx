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

  const getDeadlineColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return { bg: 'bg-destructive/10 dark:bg-destructive/20', text: 'text-destructive', border: 'border-destructive/30' };
    if (daysRemaining === 0) return { bg: 'bg-accent/10 dark:bg-accent/20', text: 'text-accent-foreground', border: 'border-accent/30' };
    if (daysRemaining <= 2) return { bg: 'bg-accent/5 dark:bg-accent/15', text: 'text-accent-foreground', border: 'border-accent/20' };
    return { bg: 'bg-muted/50 dark:bg-muted/30', text: 'text-foreground', border: 'border-border' };
  };

  // Helper to format deadline text
  const getDeadlineText = (daysRemaining: number) => {
    if (daysRemaining < 0) return `Quá hạn ${Math.abs(daysRemaining)} ngày`;
    if (daysRemaining === 0) return 'Hôm nay!';
    return `Còn ${daysRemaining} ngày`;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
          variant="primary"
        />
        <StatsCard
          title="Deadline tuần này"
          value={stats.weeklyDeadlines}
          icon={Calendar}
          variant="accent"
        />
        <StatsCard
          title="Đánh giá trung bình"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          variant="secondary"
          suffix="/5.0"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Urgent Deadlines (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/20 p-2 dark:bg-accent/30">
                  <AlertTriangle className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Deadline sắp đến hạn</h2>
                  <p className="text-sm text-muted-foreground">Các nhiệm vụ cần chú ý trong 5 ngày tới</p>
                </div>
              </div>
              <Link
                href="/mentor/deadlines"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {urgentDeadlines.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Không có deadline nào trong 5 ngày tới
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Các học viên đang hoàn thành đúng tiến độ
                  </p>
                </div>
              ) : (
                urgentDeadlines.map((task) => {
                  const colors = getDeadlineColor(task.days_remaining);
                  return (
                    <div
                      key={task.id}
                      className={`px-6 py-4 transition-colors hover:opacity-90 ${colors.bg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-4 min-w-0">
                          <div className={`rounded-lg border p-2 ${colors.bg} ${colors.border}`}>
                            {task.days_remaining < 0 ? (
                              <AlertTriangle className={`h-5 w-5 ${colors.text}`} />
                            ) : (
                              <Clock className={`h-5 w-5 ${colors.text}`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium text-foreground">
                              {task.task_title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Học viên: {task.student_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${colors.text}`}>
                              {getDeadlineText(task.days_remaining)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(task.deadline).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/mentor/student/${task.student_id}`}
                          className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
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
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Truy cập nhanh</h3>
            <div className="space-y-3">
              <Link
                href="/mentor/students"
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Danh sách học viên</span>
              </Link>
              <Link
                href="/mentor/deadlines"
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <CalendarClock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Quản lý deadline</span>
              </Link>
              <Link
                href="/mentor/chat"
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Tin nhắn</span>
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
