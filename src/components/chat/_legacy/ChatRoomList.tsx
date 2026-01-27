'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MessageCircle, Users, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatRoom {
  id: string
  name: string
  type: string
  status: string
  mentorType?: string
  lastMessage: {
    id: string
    content: string
    type: string
    createdAt: Date
    senderName: string
    isFromMe: boolean
  } | null
  otherUser: {
    id: string
    name: string
    email: string
    avatar: string | null
    role: string
  } | null
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

interface ChatRoomListProps {
  userId: string
  selectedRoomId?: string
  onSelectRoom: (roomId: string, roomName: string) => void
}

export default function ChatRoomList({ userId, selectedRoomId, onSelectRoom }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Separate rooms by type
  const groupRooms = rooms.filter(room => room.type === 'GROUP')
  const privateRooms = rooms.filter(room => room.type === 'PRIVATE' || room.type === 'DIRECT')

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/chat/rooms')
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Vui lòng đăng nhập để xem tin nhắn')
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setRooms(data.rooms || [])
      } else {
        setError(data.error || 'Không thể tải danh sách tin nhắn')
      }
    } catch (err) {
      console.error('Error loading rooms:', err)
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4">
        <div className="text-center text-red-600">
          <p className="font-semibold mb-2">Lỗi</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadRooms}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Tin nhắn
        </h2>
        <p className="text-xs text-indigo-100 mt-1">
          {privateRooms.length} chat riêng • {groupRooms.length} chat nhóm
        </p>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium mb-2">Chưa có cuộc trò chuyện nào</p>
            <p className="text-sm">Bắt đầu chat với mentor của bạn!</p>
          </div>
        ) : (
          <>
            {/* Group Chats Section */}
            {groupRooms.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-100 sticky top-0 z-10">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Chat nhóm với Mentors
                  </h3>
                </div>
                <div className="divide-y">
                  {groupRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      selectedRoomId={selectedRoomId}
                      onSelectRoom={onSelectRoom}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Private Chats Section */}
            {privateRooms.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-100 sticky top-0 z-10">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Chat riêng với từng Mentor
                  </h3>
                </div>
                <div className="divide-y">
                  {privateRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      selectedRoomId={selectedRoomId}
                      onSelectRoom={onSelectRoom}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Separate component for room item
function RoomItem({ 
  room, 
  selectedRoomId, 
  onSelectRoom 
}: { 
  room: ChatRoom
  selectedRoomId?: string
  onSelectRoom: (roomId: string, roomName: string) => void
}) {
  const isGroup = room.type === 'GROUP'
  const displayName = isGroup ? room.name : (room.otherUser?.name || room.name)
  const displayAvatar = room.otherUser?.avatar
  
  return (
    <button
      onClick={() => onSelectRoom(room.id, displayName)}
      className={cn(
        'w-full p-4 text-left hover:bg-gray-50 transition-colors relative',
        selectedRoomId === room.id && 'bg-indigo-50 border-l-4 border-indigo-600'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {isGroup ? (
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          ) : displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
          )}
          
          {/* Unread badge */}
          {room.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {room.unreadCount > 9 ? '9+' : room.unreadCount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {displayName}
            </h3>
            {room.lastMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatDistanceToNow(new Date(room.lastMessage.createdAt), {
                  addSuffix: true,
                  locale: vi
                })}
              </span>
            )}
          </div>
          
          {/* Mentor type badge */}
          {room.mentorType && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded mb-1">
              {room.mentorType}
            </span>
          )}
          
          {/* Last message */}
          {room.lastMessage ? (
            <p className={cn(
              'text-sm truncate',
              room.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}>
              {room.lastMessage.isFromMe && 'Bạn: '}
              {room.lastMessage.type === 'IMAGE' ? '📷 Hình ảnh' :
               room.lastMessage.type === 'FILE' ? '📎 File đính kèm' :
               room.lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Chưa có tin nhắn
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
