'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { getChatMessages, getRoomParticipants } from '@/actions/chat/get-chat-data';
import { sendMessage, markAsRead } from '@/actions/chat/send-message';
import { useRealtimeMessages, useRealtimeReadStatus } from '@/lib/supabase/realtime';
import { uploadChatFile } from '@/actions/chat/upload-file';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Send, Paperclip, Image as ImageIcon, File, Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string | null;
  type: string;
  created_at: Date;
  users: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
  attachments: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    thumbnail_url: string | null;
  }>;
  is_edited: boolean;
}

interface ChatMessageBoxProps {
  roomId: string;
  userId: string;
  roomName: string;
}

export default function ChatMessageBox({ roomId, userId, roomName }: ChatMessageBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = async () => {
    const result = await getChatMessages(roomId, userId);
    if (result.success && result.data) {
      setMessages(result.data as any);
      scrollToBottom();
    }
    setLoading(false);
  };

  const loadParticipants = async () => {
    const result = await getRoomParticipants(roomId);
    if (result.success && result.data) {
      setParticipants(result.data as any);
      // Lấy thông tin user hiện tại
      const current = (result.data as any[]).find((p: any) => p.user_id === userId);
      if (current) {
        setCurrentUser(current.users);
      }
    }
  };

  useEffect(() => {
    if (roomId) {
      setLoading(true);
      loadMessages();
      loadParticipants();
      markAsRead(roomId, userId);
    }
  }, [roomId, userId]);

  // Realtime: Lắng nghe tin nhắn mới
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = useRealtimeMessages(roomId, async (newMessage) => {
      console.log('📩 Received new message:', newMessage);

      setMessages((prev) => {
        // Skip nếu là tin nhắn của chính mình (đã có optimistic + server response)
        if (newMessage.sender_id === userId) {
          console.log('⏭️ Skipping own message from broadcast:', newMessage.id);
          // Nhưng vẫn check xem có trong state chưa, nếu chưa thì add (fallback)
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          // Nếu chưa có (edge case: optimistic bị lỗi), thì add
          console.log('⚠️ Own message not found, adding as fallback');
        }

        // Kiểm tra duplicate cho tin nhắn từ người khác
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping:', newMessage.id);
          return prev;
        }

        // Xóa tất cả optimistic messages (temp-*) vì message thật đã đến
        const withoutTemp = prev.filter((msg) => !msg.id.startsWith('temp-'));

        // Format message nếu cần (từ postgres_changes có thể thiếu nested data)
        const formattedMessage = {
          ...newMessage,
          created_at: new Date(newMessage.created_at),
          users: newMessage.users || {
            id: newMessage.sender_id,
            full_name: 'Loading...',
            avatar_url: null,
            role: 'STUDENT',
          },
          attachments: newMessage.attachments || [],
          is_edited: newMessage.is_edited || false,
        };

        console.log('✅ Adding message to state:', formattedMessage.id);
        return [...withoutTemp, formattedMessage as any];
      });

      scrollToBottom();

      // Mark as read if not sent by current user
      if (newMessage.sender_id !== userId) {
        await markAsRead(roomId, userId);
      }
    });

    return unsubscribe;
  }, [roomId, userId]);

  // Realtime: Lắng nghe trạng thái đã đọc
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = useRealtimeReadStatus(roomId, (payload) => {
      setParticipants((prev) =>
        prev.map((p) => (p.user_id === payload.user_id ? { ...p, last_read_at: payload.last_read_at } : p))
      );
    });

    return unsubscribe;
  }, [roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && uploadingFiles.length === 0) return;

    setSending(true);

    try {
      let attachments: any[] = [];

      // Upload files nếu có
      if (uploadingFiles.length > 0) {
        const uploadPromises = uploadingFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', userId);
          formData.append('roomId', roomId);

          const result = await uploadChatFile(formData);
          if (result.success && result.data) {
            return result.data;
          }
          return null;
        });

        const results = await Promise.all(uploadPromises);
        attachments = results.filter(Boolean);
      }

      // Gửi tin nhắn
      const messageType = attachments.length > 0 && attachments[0].fileType.startsWith('image/')
        ? 'IMAGE'
        : attachments.length > 0
        ? 'FILE'
        : 'TEXT';

      const messageContent = inputValue.trim() || undefined;

      // Tạo optimistic message ID
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      // Tạo optimistic message để hiển thị NGAY
      const optimisticMessage: Message = {
        id: tempId,
        content: messageContent || null,
        type: messageType,
        created_at: new Date(),
        users: currentUser || {
          id: userId,
          full_name: 'Bạn',
          avatar_url: null,
          role: 'STUDENT',
        },
        attachments: attachments.map((att, idx) => ({
          id: `temp-att-${tempId}-${idx}`,
          file_url: att.fileUrl,
          file_name: att.fileName,
          file_type: att.fileType,
          thumbnail_url: att.thumbnailUrl || null,
        })),
        is_edited: false,
      };

      // Thêm message ngay lập tức (INSTANT)
      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom();

      // Clear input ngay
      setInputValue('');
      setUploadingFiles([]);

      // Gửi lên server (background)
      const result = await sendMessage({
        roomId,
        senderId: userId,
        content: messageContent,
        type: messageType as any,
        attachments,
      });

      if (result.success) {
        console.log('✅ Message sent successfully');

        // Nếu có data từ server, replace optimistic message NGAY
        if (result.data) {
          setMessages((prev) => {
            const withoutTemp = prev.filter((msg) => msg.id !== tempId);
            const realMessage = {
              ...result.data,
              created_at: new Date(result.data.created_at),
              users: result.data.users || {
                id: userId,
                full_name: 'Bạn',
                avatar_url: null,
                role: 'STUDENT',
              },
              attachments: result.data.attachments || [],
              is_edited: false,
            };
            return [...withoutTemp, realMessage as any];
          });
          scrollToBottom();
          console.log('🚀 Message replaced with real data instantly');
        }

        // Broadcast sẽ được người khác nhận
        // Timeout chỉ để cleanup nếu có optimistic message còn sót
        setTimeout(() => {
          setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
        }, 3000);
      } else {
        // Nếu gửi thất bại, xóa optimistic message
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        console.error('Failed to send message:', result.error);
        alert('Không thể gửi tin nhắn: ' + result.error);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Rollback optimistic update nếu lỗi
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Deduplicate messages để tránh duplicate key error
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter((msg) => {
      if (seen.has(msg.id)) {
        console.warn('🚨 Duplicate message detected and filtered:', msg.id);
        return false;
      }
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{roomName}</h3>
          <p className="text-sm text-gray-500">
            {participants.length} thành viên
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {uniqueMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          uniqueMessages.map((message, index) => {
            const isOwn = message.users.id === userId;
            const showAvatar =
              index === uniqueMessages.length - 1 ||
              uniqueMessages[index + 1]?.users.id !== message.users.id;

            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {message.users.full_name.charAt(0)}
                  </div>
                ) : (
                  <div className="w-8" />
                )}

                {/* Message Bubble */}
                <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
                  {!isOwn && (
                    <span className="text-xs text-gray-600 mb-1 px-2">
                      {message.users.full_name}
                    </span>
                  )}

                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2',
                      isOwn
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                    )}
                  >
                    {/* Attachments */}
                    {message.attachments.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {message.attachments.map((att) => (
                          <div key={att.id}>
                            {att.file_type.startsWith('image/') ? (
                              <img
                                src={att.file_url}
                                alt={att.file_name}
                                className="rounded-lg max-w-xs cursor-pointer hover:opacity-90"
                                onClick={() => window.open(att.file_url, '_blank')}
                              />
                            ) : (
                              <a
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded-lg',
                                  isOwn
                                    ? 'bg-indigo-500 hover:bg-indigo-400'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                )}
                              >
                                <File className="w-5 h-5" />
                                <span className="text-sm font-medium truncate">
                                  {att.file_name}
                                </span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Content */}
                    {message.content && (
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}

                    {message.is_edited && (
                      <span className="text-xs opacity-70 mt-1 block">
                        (đã chỉnh sửa)
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {format(new Date(message.created_at), 'HH:mm', { locale: vi })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {uploadingFiles.length > 0 && (
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2 flex-wrap">
            {uploadingFiles.map((file, index) => (
              <div
                key={index}
                className="relative bg-gray-100 rounded-lg p-2 flex items-center gap-2"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                ) : (
                  <File className="w-5 h-5 text-indigo-600" />
                )}
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={sending}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-transparent resize-none outline-none max-h-32"
              rows={1}
              disabled={sending}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={sending || (!inputValue.trim() && uploadingFiles.length === 0)}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
