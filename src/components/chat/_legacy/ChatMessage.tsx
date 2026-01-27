'use client';

import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, CheckCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MessageData {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  isFromMe: boolean;
  isPending?: boolean;
  error?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatMessageProps {
  message: MessageData;
  showAvatar?: boolean;
  onRetry?: (messageId: string) => void;
}

const ChatMessage = memo(function ChatMessage({ 
  message, 
  showAvatar = true,
  onRetry 
}: ChatMessageProps) {
  const isOwn = message.isFromMe;
  const isPending = message.isPending;
  const hasError = message.error;

  // Memoize formatted time
  const formattedTime = useMemo(() => {
    return format(message.createdAt, 'HH:mm', { locale: vi });
  }, [message.createdAt]);

  return (
    <div
      className={cn(
        'flex items-end gap-2 mb-1',
        isOwn && 'flex-row-reverse',
        isPending && 'opacity-60'
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        showAvatar ? (
          message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>
          )
        ) : (
          <div className="w-7" />
        )
      )}

      {/* Message Bubble */}
      <div className={cn('flex flex-col', isOwn && 'items-end')}>
        <div className="relative group">
          <div
            className={cn(
              'rounded-2xl px-3 py-2 max-w-[320px] break-words',
              isOwn
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-900',
              hasError && 'border-2 border-red-300'
            )}
          >
            {/* Message Content */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          {/* Time and Status */}
          <div
            className={cn(
              'flex items-center gap-1 mt-0.5 px-1',
              isOwn ? 'justify-end' : 'justify-start'
            )}
          >
            <span className="text-[10px] text-gray-500">
              {formattedTime}
            </span>

            {/* Status Icons for own messages */}
            {isOwn && (
              <>
                {isPending ? (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : hasError ? (
                  <button
                    onClick={() => onRetry?.(message.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </button>
                ) : message.status === 'read' ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3 h-3 text-gray-500" />
                ) : (
                  <Check className="w-3 h-3 text-gray-500" />
                )}
              </>
            )}
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="absolute -bottom-6 right-0 text-[10px] text-red-500 whitespace-nowrap">
              Gửi thất bại
            </div>
          )}
        </div>
      </div>

      {/* Spacer for own messages */}
      {isOwn && <div className="w-7" />}
    </div>
  );
});

export default ChatMessage;
