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
  isPending?: boolean;
  error?: boolean;
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
  const pendingMessagesRef = useRef<Set<string>>(new Set());

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

  // Send message with Optimistic UI
  const sendMessage = useCallback(
    async (content: string, type: string = 'TEXT', attachments: any[] = []) => {
      if (!content.trim() && attachments.length === 0) return;

      setSending(true);
      setError(null);

      // Create temporary message ID
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      // Optimistic UI: Add message immediately
      const optimisticMessage: Message = {
        id: tempId,
        content: content.trim(),
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
        sender: {
          id: userId,
          name: 'You',
          avatar: null,
          role: 'USER',
        },
        isFromMe: true,
        attachments: attachments || [],
        isPending: true,
      };

      // Adding message immediately (optimistic UI)
      setMessages((prev) => [...prev, optimisticMessage]);
      pendingMessagesRef.current.add(tempId);

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
          const realMessage = {
            ...data.message,
            createdAt: new Date(data.message.createdAt),
            updatedAt: new Date(data.message.updatedAt),
            isFromMe: true,
          };

          // Server confirmed message

          // Replace optimistic message with real message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? realMessage : msg
            )
          );
          
          pendingMessagesRef.current.delete(tempId);
          pendingMessagesRef.current.add(realMessage.id);
          
          // Remove from pending after 2 seconds (to avoid duplicate from realtime)
          setTimeout(() => {
            pendingMessagesRef.current.delete(realMessage.id);
          }, 2000);

          return realMessage;
        } else {
          throw new Error(data.error || 'Failed to send message');
        }
      } catch (err) {
        console.error('❌ Error sending message:', err);
        
        // Mark message as error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, error: true, isPending: false } : msg
          )
        );
        
        pendingMessagesRef.current.delete(tempId);
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
          // New message received via Realtime

          const newMessageId = payload.new.id;
          
          // Skip if this is a pending message from current user (optimistic UI already shown)
          if (pendingMessagesRef.current.has(newMessageId)) {
            // Skipping duplicate message (already in optimistic UI)
            return;
          }

          // Check if message is from current user (already shown via optimistic UI)
          if (payload.new.sender_id === userId) {
            // Skipping own message (shown via optimistic UI)
            return;
          }

          // Load full message details for messages from others
          // Loading new message from other user
          await loadMessages();
          
          // Mark as read if not from me
          markAsRead();
          
          // Trigger callback for notifications
          if (onNewMessage) {
            // Message details will be in the updated messages state
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && !lastMessage.isFromMe) {
              onNewMessage(lastMessage);
            }
          }
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
          // Message updated via Realtime

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
        // Realtime status for room
      });

    channelRef.current = channel;

    return () => {
      // Unsubscribing from room
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userId, onNewMessage, markAsRead, loadMessages, messages]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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
