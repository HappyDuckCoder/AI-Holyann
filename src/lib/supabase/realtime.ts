
'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Broadcast tin nhắn mới ngay lập tức (không cần đợi DB trigger)
export async function broadcastNewMessage(roomId: string, message: any) {
  try {
    const channel = supabase.channel(`room:${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message,
    });
    console.log('📤 Broadcasted message:', message.id);
  } catch (error) {
    console.error('Error broadcasting message:', error);
  }
}

// Hook để lắng nghe tin nhắn mới
export function useRealtimeMessages(roomId: string, onNewMessage: (payload: any) => void) {
  const channel = supabase
    .channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: roomId },
      },
    })
    .on('broadcast', { event: 'new_message' }, ({ payload }) => {
      console.log('📻 Broadcast message received:', payload);
      onNewMessage(payload);
    })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('🔔 New message received:', payload.new);
        onNewMessage(payload.new);
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
        console.log('🔔 Message updated:', payload.new);
        onNewMessage(payload.new);
      }
    )
    .subscribe((status) => {
      console.log(`📡 Subscription status for room ${roomId}:`, status);
    });

  return () => {
    console.log(`🔌 Unsubscribing from room ${roomId}`);
    supabase.removeChannel(channel);
  };
}

// Hook để lắng nghe trạng thái đã đọc
export function useRealtimeReadStatus(roomId: string, onReadStatusChange: (payload: any) => void) {
  const channel = supabase
    .channel(`participants:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_participants',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onReadStatusChange(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Hook để lắng nghe danh sách phòng chat (cập nhật tin nhắn mới)
export function useRealtimeRooms(userId: string, onRoomUpdate: () => void) {
  const channel = supabase
    .channel(`user-rooms:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
      },
      () => {
        onRoomUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
