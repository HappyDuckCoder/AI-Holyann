'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/realtime';

interface Message {
  id: string;
  content: string | null;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  isFromMe: boolean;
  attachments: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
    size: number | null;
    thumbnail: string | null;
  }>;
}

interface UseChatOptions {
  roomId: string;
  userId: string;
  onNewMessage?: (message: Message) => void;
}

export function useChat({ roomId, userId, onNewMessage }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/rooms/${roomId}/messages`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      if (data.success) {
        const formattedMessages = data.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          updatedAt: new Date(msg.updatedAt),
        }));
        setMessages(formattedMessages);
      } else {
        throw new Error(data.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, type: string = 'TEXT', attachments: any[] = []) => {
      if (!content.trim() && attachments.length === 0) return;

      setSending(true);
      setError(null);

      try {
        const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: content.trim(),
            type,
            attachments,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        if (data.success) {
          const newMessage = {
            ...data.message,
            createdAt: new Date(data.message.createdAt),
            updatedAt: new Date(data.message.updatedAt),
            isFromMe: data.message.sender.id === userId,
          };

          setMessages((prev) => [...prev, newMessage]);
          return newMessage;
        } else {
          throw new Error(data.error || 'Failed to send message');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setSending(false);
      }
    },
    [roomId, userId]
  );

  // Update read status
  const markAsRead = useCallback(async () => {
    if (!roomId || !userId) return;

    try {
      await fetch(`/api/chat/rooms/${roomId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [roomId, userId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!roomId) return;

    console.log('🔌 Setting up Realtime subscription for room:', roomId);

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('📩 New message received via Realtime:', payload.new);

          // Reload messages to get full details with sender info
          await loadMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('📝 Message updated via Realtime:', payload.new);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? {
                    ...msg,
                    content: payload.new.content,
                    isEdited: payload.new.is_edited,
                    updatedAt: new Date(payload.new.updated_at),
                  }
                : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log(`📡 Realtime status for room ${roomId}:`, status);
      });

    channelRef.current = channel;

    return () => {
      console.log(`🔌 Unsubscribing from room ${roomId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userId, onNewMessage, markAsRead]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Fallback polling nếu Realtime chưa được enable (mỗi 3s)
  useEffect(() => {
    if (!roomId) return;

    const pollInterval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [roomId, loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    markAsRead,
    refreshMessages: loadMessages,
  };
}
