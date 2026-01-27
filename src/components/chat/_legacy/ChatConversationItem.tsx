'use client';

import { memo, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChatConversationItemProps {
  id: string;
  name: string;
  avatar?: string | null;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isOnline?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const ChatConversationItem = memo(function ChatConversationItem({
  id,
  name,
  avatar,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  isOnline = false,
  isSelected = false,
  onClick,
}: ChatConversationItemProps) {
  // Memoize formatted time để tránh re-calculate
  const formattedTime = useMemo(() => {
    if (!lastMessageTime) return '';
    
    const now = new Date();
    const diffInHours = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(lastMessageTime, { locale: vi, addSuffix: false });
    }
    
    return lastMessageTime.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }, [lastMessageTime]);

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none',
        isSelected && 'bg-gray-100'
      )}
    >
      {/* Avatar với online status */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h4 className={cn(
            'text-sm font-semibold truncate',
            unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
          )}>
            {name}
          </h4>
          
          {formattedTime && (
            <span className={cn(
              'text-xs ml-2 flex-shrink-0',
              unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'
            )}>
              {formattedTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className={cn(
            'text-sm truncate',
            unreadCount > 0 
              ? 'text-gray-900 font-medium' 
              : 'text-gray-500'
          )}>
            {lastMessage || 'Chưa có tin nhắn'}
          </p>
          
          {unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export default ChatConversationItem;
