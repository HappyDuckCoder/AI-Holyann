'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_read: boolean;
  deleted_at: string | null;
}

interface FormattedMessage {
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
  attachments: any[];
  isPending?: boolean;
  error?: boolean;
}

interface UseChatRealtimeOptions {
  roomId: string;
  currentUserId: string;
  onMessageReceived?: (message: FormattedMessage) => void;
  onMessageUpdated?: (message: FormattedMessage) => void;
  onMessageDeleted?: (messageId: string) => void;
  enabled?: boolean;
}

/**
 * Custom Hook: useChatRealtime
 *
 * Tích hợp Supabase Realtime để lắng nghe các thay đổi trong bảng chat_messages
 *
 * @param roomId - ID của phòng chat
 * @param currentUserId - ID của user hiện tại
 * @param setMessages - Hàm setState để cập nhật danh sách tin nhắn
 * @param options - Các tùy chọn bổ sung (callbacks, enabled flag)
 *
 * @returns cleanup function để unsubscribe
 */
export function useChatRealtime<T extends FormattedMessage>(
  roomId: string,
  currentUserId: string,
  setMessages: React.Dispatch<React.SetStateAction<T[]>>,
  options: Omit<UseChatRealtimeOptions, 'roomId' | 'currentUserId'> = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const { onMessageReceived, onMessageUpdated, onMessageDeleted, enabled = true } = options;

  // Fetch full message details with sender info
  const fetchMessageDetails = useCallback(async (messageId: string): Promise<FormattedMessage | null> => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages/${messageId}`);

      if (!response.ok) {
        console.error('Failed to fetch message details:', response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.success && data.message) {
        return {
          ...data.message,
          createdAt: new Date(data.message.createdAt),
          updatedAt: new Date(data.message.updatedAt),
          isFromMe: data.message.sender.id === currentUserId,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching message details:', error);
      return null;
    }
  }, [roomId, currentUserId]);

  // Handle new message INSERT
  const handleInsert = useCallback(async (payload: { new: ChatMessage }) => {
    const newMessage = payload.new;
    const messageId = newMessage.id;

    console.log('📩 [REALTIME INSERT]', {
      messageId,
      senderId: newMessage.sender_id,
      isFromCurrentUser: newMessage.sender_id === currentUserId,
    });

    // Prevent duplicate processing
    if (processedIdsRef.current.has(messageId)) {
      console.log('⏭️ [SKIP] Already processed:', messageId);
      return;
    }

    // Mark as processed
    processedIdsRef.current.add(messageId);

    // Auto-cleanup after 5 seconds
    setTimeout(() => {
      processedIdsRef.current.delete(messageId);
    }, 5000);

    // Check if message already exists in state
    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === messageId);

      if (exists) {
        console.log('⏭️ [SKIP] Message already in state:', messageId);
        return prev;
      }

      // Don't add immediately - fetch full details first
      return prev;
    });

    // Fetch full message with sender info
    const fullMessage = await fetchMessageDetails(messageId);

    if (!fullMessage) {
      console.error('❌ Failed to fetch full message details');
      return;
    }

    // Add to messages
    setMessages((prev) => {
      // Double-check it's not already there
      if (prev.some((msg) => msg.id === messageId)) {
        return prev;
      }

      console.log('✅ [ADD MESSAGE]', messageId);
      return [...prev, fullMessage as T];
    });

    // Trigger callback
    if (onMessageReceived) {
      onMessageReceived(fullMessage);
    }
  }, [currentUserId, fetchMessageDetails, setMessages, onMessageReceived]);

  // Handle message UPDATE
  const handleUpdate = useCallback((payload: { new: ChatMessage; old: ChatMessage }) => {
    const updatedMessage = payload.new;
    const messageId = updatedMessage.id;

    console.log('📝 [REALTIME UPDATE]', messageId);

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const updated = {
            ...msg,
            content: updatedMessage.content,
            isEdited: updatedMessage.is_edited,
            updatedAt: new Date(updatedMessage.updated_at),
          };

          // Trigger callback
          if (onMessageUpdated) {
            onMessageUpdated(updated);
          }

          return updated;
        }
        return msg;
      })
    );
  }, [setMessages, onMessageUpdated]);

  // Handle message DELETE
  const handleDelete = useCallback((payload: { old: ChatMessage }) => {
    const deletedMessage = payload.old;
    const messageId = deletedMessage.id;

    console.log('🗑️ [REALTIME DELETE]', messageId);

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // Trigger callback
    if (onMessageDeleted) {
      onMessageDeleted(messageId);
    }
  }, [setMessages, onMessageDeleted]);

  // Setup Supabase Realtime subscription
  useEffect(() => {
    if (!enabled || !roomId || !currentUserId) {
      console.log('⏸️ [REALTIME] Disabled or missing required params');
      return;
    }

    console.log('🔌 [REALTIME] Setting up subscription for room:', roomId);

    // Create unique channel name
    const channelName = `chat-room:${roomId}:${Date.now()}`;

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false }, // Don't receive own broadcasts
          presence: { key: currentUserId }, // Track presence
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        handleInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        handleUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        handleDelete
      )
      .subscribe((status) => {
        console.log(`📡 [REALTIME] Subscription status:`, status);

        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME] Successfully subscribed');
        } else if (status === 'CLOSED') {
          console.log('❌ [REALTIME] Subscription closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [REALTIME] Channel error');
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log(`🔌 [REALTIME] Cleaning up subscription for room: ${roomId}`);

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Clear processed IDs
      processedIdsRef.current.clear();
    };
  }, [
    enabled,
    roomId,
    currentUserId,
    handleInsert,
    handleUpdate,
    handleDelete,
  ]);

  // Return channel status for debugging
  return {
    isSubscribed: channelRef.current !== null,
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
}

// Export types for use in components
export type { ChatMessage, FormattedMessage, UseChatRealtimeOptions };
