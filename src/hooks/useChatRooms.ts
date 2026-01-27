'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/realtime';

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  status: string;
  mentorType?: string;
  lastMessage: {
    id: string;
    content: string;
    type: string;
    createdAt: Date;
    senderName: string;
    isFromMe: boolean;
  } | null;
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  } | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useChatRooms(userId: string) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chat/rooms');

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vui lòng đăng nhập để xem tin nhắn');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const formattedRooms = data.rooms.map((room: any) => ({
          ...room,
          createdAt: new Date(room.createdAt),
          updatedAt: new Date(room.updatedAt),
          lastMessage: room.lastMessage
            ? {
                ...room.lastMessage,
                createdAt: new Date(room.lastMessage.createdAt),
              }
            : null,
        }));
        setRooms(formattedRooms);
      } else {
        throw new Error(data.error || 'Không thể tải danh sách tin nhắn');
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup realtime subscription for room updates
  useEffect(() => {
    if (!userId) return;

    // Subscribe to message changes to update room list
    const channel = supabase
      .channel('room-list-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('💬 Message event, refreshing rooms...');
          // Refresh rooms when any message is sent/updated
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadRooms]);

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Periodic refresh every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(loadRooms, 30000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  return {
    rooms,
    loading,
    error,
    refreshRooms: loadRooms,
  };
}
