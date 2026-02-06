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
  tempId?: string; // Track temporary ID for replacement
}

interface UseChatOptions {
  roomId: string;
  userId: string;
  onNewMessage?: (message: Message) => void;
  playSound?: boolean; // Optional sound notification
}

export function useChat({ roomId, userId, onNewMessage, playSound = false }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const pendingMessagesRef = useRef<Map<string, string>>(new Map()); // Map tempId -> realId
  const processedMessagesRef = useRef<Set<string>>(new Set()); // Track processed messages

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!playSound) return;
    try {
      // Try to play MP3 file first
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback: Generate simple beep sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800; // Hz
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch (err) {
          // Could not play notification sound
        }
      });
    } catch (err) {
      // Could not play notification sound
    }
  }, [playSound]);

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
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        tempId, // Store temp ID for tracking
      };

      console.log('📤 [OPTIMISTIC UI] Adding message immediately:', tempId);

      // Add to state immediately for instant feedback
      setMessages((prev) => [...prev, optimisticMessage]);

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
            isPending: false,
          };

          // Message sent successfully

          // Map temp ID to real ID
          pendingMessagesRef.current.set(tempId, realMessage.id);
          processedMessagesRef.current.add(realMessage.id);

          // Replace optimistic message with real message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? realMessage : msg
            )
          );
          
          // Clear from pending after 3 seconds (to avoid duplicate from realtime)
          setTimeout(() => {
            pendingMessagesRef.current.delete(tempId);
            processedMessagesRef.current.delete(realMessage.id);
          }, 3000);

          return realMessage;
        } else {
          throw new Error(data.error || 'Failed to send message');
        }
      } catch (err) {
        console.error('❌ [ERROR] Failed to send message:', err);

        // Mark message as error (keep it visible with error state)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, error: true, isPending: false } : msg
          )
        );
        
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setSending(false);
      }
    },
    [roomId, userId]
  );

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string) => {
      const failedMessage = messages.find(m => m.id === messageId);
      if (!failedMessage || !failedMessage.error) return;

      // Remove error message
      setMessages((prev) => prev.filter(m => m.id !== messageId));

      // Resend
      try {
        await sendMessage(
          failedMessage.content || '',
          failedMessage.type,
          failedMessage.attachments
        );
      } catch (err) {
        console.error('Retry failed:', err);
      }
    },
    [messages, sendMessage]
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

    // Setting up subscription for room

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          broadcast: { self: false }, // Don't receive own broadcasts
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
        async (payload) => {
          // New message received via Realtime

          const newMessageId = payload.new.id as string;

          // Skip if already processed (from optimistic UI)
          if (processedMessagesRef.current.has(newMessageId)) {
            // Message already processed (optimistic UI)
            return;
          }

          // Skip if it's from current user and we have a pending message
          // (The optimistic UI already showed it and it will be replaced when server confirms)
          if (payload.new.sender_id === userId) {
            // Check if we have any pending temp messages
            const hasPendingMessages = Array.from(pendingMessagesRef.current.values()).includes(newMessageId);
            if (hasPendingMessages) {
              console.log('⏭️ [SKIP] Own message already shown via optimistic UI');
              return;
            }
          }

          // Check if message already exists in state
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMessageId);
            if (exists) {
              // Message already in state
              return prev;
            }

            // This is a new message from another user
            console.log('📥 [ADD] Adding new message from other user');

            // Mark as processed
            processedMessagesRef.current.add(newMessageId);
            setTimeout(() => {
              processedMessagesRef.current.delete(newMessageId);
            }, 3000);

            // Fetch full message details
            fetch(`/api/chat/rooms/${roomId}/messages/${newMessageId}`)
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  const fullMessage = {
                    ...data.message,
                    createdAt: new Date(data.message.createdAt),
                    updatedAt: new Date(data.message.updatedAt),
                    isFromMe: false,
                  };

                  setMessages((prev) => {
                    // Double check it's not already there
                    if (prev.some(m => m.id === newMessageId)) return prev;
                    return [...prev, fullMessage];
                  });

                  // Play notification sound
                  playNotificationSound();

                  // Trigger callback
                  if (onNewMessage && !fullMessage.isFromMe) {
                    onNewMessage(fullMessage);
                  }
                }
              })
              .catch(console.error);

            return prev; // Don't add yet, wait for full message fetch
          });

          // Mark as read if not from me
          if (payload.new.sender_id !== userId) {
            markAsRead();
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
        // Subscription status for room

        if (status === 'SUBSCRIBED') {
          // Successfully subscribed to room
        } else if (status === 'CLOSED') {
          console.warn('⚠️ [REALTIME] Subscription closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [REALTIME] Channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      // Unsubscribing from room
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId, userId, onNewMessage, markAsRead, playNotificationSound]);

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
    retryMessage,
    markAsRead,
    refreshMessages: loadMessages,
  };
}
