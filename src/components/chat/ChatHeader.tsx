'use client';

import { Phone, Video, Info, MoreVertical, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  roomName: string;
  roomType?: string;
  avatar?: string | null;
  isOnline?: boolean;
  onBack?: () => void;
  onToggleSidebar?: () => void;
}

export default function ChatHeader({
  roomName,
  roomType,
  avatar,
  isOnline = false,
  onBack,
  onToggleSidebar,
}: ChatHeaderProps) {
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: Avatar và Info */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={roomName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {roomName.charAt(0).toUpperCase()}
            </div>
          )}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Name and Status */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {roomName}
          </h3>
          <p className="text-xs text-gray-500">
            {isOnline ? 'Đang hoạt động' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          aria-label="Gọi thoại"
        >
          <Phone className="w-5 h-5 text-blue-600" />
        </button>
        
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          aria-label="Gọi video"
        >
          <Video className="w-5 h-5 text-blue-600" />
        </button>

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Thông tin"
          >
            <Info className="w-5 h-5 text-blue-600" />
          </button>
        )}

        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Thêm tùy chọn"
        >
          <MoreVertical className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
}
