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
        } catch (_err) {
          // Could not play notification sound
        }
      });
    } catch (_err) {
      // Could not play notification sound
    }
  }, [playSound]);

  // Load messages (silent = true: no loading spinner, for polling/realtime fallback)
  const loadMessages = useCallback(async (silent = false) => {
    if (!roomId) return;

    try {
      if (!silent) setLoading(true);
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
      if (!silent) setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (!silent) setLoading(false);
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

  // Delete message (soft delete on server, remove from local state)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!roomId) return;
      try {
        const res = await fetch(`/api/chat/rooms/${roomId}/messages/${messageId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to delete message');
        }
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (err) {
        console.error('Delete message error:', err);
        throw err;
      }
    },
    [roomId]
  );

  // Delete single attachment (remove from message in DB and local state)
  const deleteAttachment = useCallback(
    async (messageId: string, attachmentId: string) => {
      if (!roomId) return;
      try {
        const res = await fetch(
          `/api/chat/rooms/${roomId}/attachments/${attachmentId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to delete file');
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  attachments: m.attachments.filter((a) => a.id !== attachmentId),
                }
              : m
          )
        );
      } catch (err) {
        console.error('Delete attachment error:', err);
        throw err;
      }
    },
    [roomId]
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

    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;

    const setupSubscription = () => {
      // Subscribe to new messages
      const channel = supabase
        .channel(`room:${roomId}:${Date.now()}`, {
          config: {
            broadcast: { self: false },
            presence: { key: userId },
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
            const newMessageId = payload.new.id as string;

            // Skip if already processed (from optimistic UI)
            if (processedMessagesRef.current.has(newMessageId)) {
              return;
            }

            // Skip if it's from current user and we have a pending message
            if (payload.new.sender_id === userId) {
              const hasPendingMessages = Array.from(pendingMessagesRef.current.values()).includes(newMessageId);
              if (hasPendingMessages) {
                return;
              }
            }

            // Check if message already exists in state
            setMessages((prev) => {
              const exists = prev.some(m => m.id === newMessageId);
              if (exists) {
                return prev;
              }

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

              return prev;
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
            const newRow = payload.new as { id: string; deleted_at: string | null; content: string; is_edited: boolean; updated_at: string };
            if (newRow.deleted_at) {
              setMessages((prev) => prev.filter((m) => m.id !== newRow.id));
              return;
            }
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === newRow.id
                  ? {
                      ...msg,
                      content: newRow.content,
                      isEdited: newRow.is_edited,
                      updatedAt: new Date(newRow.updated_at),
                    }
                  : msg
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const deletedId = (payload as unknown as { old: { id: string } }).old?.id;
            if (deletedId) {
              setMessages((prev) => prev.filter((m) => m.id !== deletedId));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            retryCount = 0; // Reset retry count on success
          } else if (status === 'CLOSED') {
            // Attempt to reconnect
            if (retryCount < maxRetries) {
              retryCount++;

              retryTimeout = setTimeout(() => {
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current);
                }
                setupSubscription();
              }, 2000 * retryCount); // Exponential backoff
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ [REALTIME] Channel error - Check Supabase configuration');
            console.error('Troubleshooting tips:');
            console.error('1. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
            console.error('2. Check if Realtime is enabled: ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages');
            console.error('3. Verify RLS policies allow SELECT on chat_messages');
            console.error('4. Check Supabase Dashboard → Database → Replication for enabled tables');

            // Attempt retry on channel error
            if (retryCount < maxRetries) {
              retryCount++;

              retryTimeout = setTimeout(() => {
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current);
                }
                setupSubscription();
              }, 3000 * retryCount);
            } else {
              console.error('❌ [REALTIME] Max retries reached. Realtime features disabled.');
              console.error('💡 Chat will still work but messages won\'t update automatically.');
              console.error('💡 Please refresh the page or check Supabase configuration.');
            }
          }
        });

      channelRef.current = channel;
    };

    // Initial setup
    setupSubscription();

    // Cleanup
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }

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

  // Fallback: poll for new messages every 15s (when Supabase realtime is unavailable)
  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(() => loadMessages(true), 15000);
    return () => clearInterval(interval);
  }, [roomId, loadMessages]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    retryMessage,
    deleteMessage,
    deleteAttachment,
    markAsRead,
    refreshMessages: loadMessages,
  };
}
