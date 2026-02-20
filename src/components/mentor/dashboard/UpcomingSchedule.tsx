'use client';

import { Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import type { ScheduleEvent } from '@/types/mentor';

interface UpcomingScheduleProps {
  events: ScheduleEvent[];
}

export default function UpcomingSchedule({ events }: UpcomingScheduleProps) {
  const handleAddConsultation = () => {
    toast.info('Chức năng thêm buổi tư vấn sẽ được triển khai');
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Lịch sắp tới</h2>
        <p className="mt-1 text-sm text-muted-foreground">{events.length} sự kiện</p>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Chưa có lịch nào</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:border-primary hover:bg-primary/5 dark:bg-muted/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 font-medium text-foreground">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(event.event_date), 'dd/MM/yyyy - HH:mm', {
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={handleAddConsultation}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Thêm buổi tư vấn
        </button>
      </div>
    </div>
  );
}
