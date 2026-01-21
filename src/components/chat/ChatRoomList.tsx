'use client';

import { useEffect, useState } from 'react';
import { getChatRooms } from '@/actions/chat/get-chat-data';
import { useRealtimeRooms } from '@/lib/supabase/realtime';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  status: string;
  lastMessage: {
    content: string;
    created_at: Date;
    users: {
      full_name: string;
    };
  } | null;
  unreadCount: number;
  participants: any[];
}

interface ChatRoomListProps {
  userId: string;
  selectedRoomId?: string;
  onSelectRoom: (roomId: string, roomName: string) => void;
}

export default function ChatRoomList({ userId, selectedRoomId, onSelectRoom }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    const result = await getChatRooms(userId);
    if (result.success && result.data) {
      setRooms(result.data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, [userId]);

  // Realtime updates
  useEffect(() => {
    const unsubscribe = useRealtimeRooms(userId, () => {
      loadRooms();
    });

    return unsubscribe;
  }, [userId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Tin nhắn
        </h2>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id, room.name)}
                className={cn(
                  'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                  selectedRoomId === room.id && 'bg-indigo-50 border-l-4 border-indigo-600'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {room.type === 'GROUP' ? (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {room.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {room.name}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(room.lastMessage.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {room.lastMessage ? (
                          <>
                            <span className="font-medium">
                              {room.lastMessage.users.full_name}:
                            </span>{' '}
                            {room.lastMessage.content || '[Đính kèm file]'}
                          </>
                        ) : (
                          <span className="italic">Chưa có tin nhắn</span>
                        )}
                      </p>

                      {room.unreadCount > 0 && (
                        <span className="ml-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
