'use client';

import { Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ScheduleEvent } from '@/types/mentor';

interface UpcomingScheduleProps {
  events: ScheduleEvent[];
}

export default function UpcomingSchedule({ events }: UpcomingScheduleProps) {
  const handleAddConsultation = () => {
    // TODO: Implement add consultation modal
    alert('Chức năng thêm buổi tư vấn sẽ được triển khai');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Lịch sắp tới</h2>
        <p className="mt-1 text-sm text-gray-500">{events.length} sự kiện</p>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chưa có lịch nào</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-[#0f4c81] hover:bg-blue-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0f4c81] text-white">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
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

        {/* Add Consultation Button */}
        <button
          onClick={handleAddConsultation}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f4c81] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Thêm buổi tư vấn
        </button>
      </div>
    </div>
  );
}
