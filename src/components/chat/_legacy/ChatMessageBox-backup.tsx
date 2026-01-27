'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Send, Paperclip, Image as ImageIcon, File, X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string | null
  type: string
  createdAt: Date
  updatedAt: Date
  isEdited: boolean
  sender: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
  isFromMe: boolean
  attachments: Array<{
    id: string
    url: string
    name: string
    type: string
    size: number | null
    thumbnail: string | null
  }>
}

interface ChatMessageBoxProps {
  roomId: string
  userId: string
  roomName: string
}

export default function ChatMessageBox({ roomId, userId, roomName }: ChatMessageBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async () => {
    if (!roomId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages || [])
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!inputValue.trim() || sending) return

    const messageContent = inputValue.trim()
    setInputValue('')
    setSending(true)

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageContent,
          type: 'TEXT'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      if (data.success) {
        // Add new message to state immediately
        setMessages(prev => [...prev, {
          ...data.message,
          createdAt: new Date(data.message.createdAt),
          updatedAt: new Date(data.message.updatedAt),
          isFromMe: true
        }])
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // TODO: Implement file upload
    alert('Tính năng upload file đang được phát triển')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
            <p className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.isFromMe
            const showAvatar =
              index === messages.length - 1 ||
              messages[index + 1]?.sender.id !== message.sender.id

            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}
              >
                {/* Avatar */}
                {showAvatar ? (
                  message.sender.avatar ? (
                    <img
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {message.sender.name.charAt(0)}
                    </div>
                  )
                ) : (
                  <div className="w-8" />
                )}

                {/* Message Bubble */}
                <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
                  {!isOwn && (
                    <span className="text-xs text-gray-600 mb-1 px-2">
                      {message.sender.name}
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
                            {att.type.startsWith('image/') ? (
                              <img
                                src={att.url}
                                alt={att.name}
                                className="rounded-lg max-w-xs cursor-pointer hover:opacity-90"
                                onClick={() => window.open(att.url, '_blank')}
                              />
                            ) : (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded-lg',
                                  isOwn
                                    ? 'bg-indigo-500 hover:bg-indigo-400'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                )}
                              >
                                {att.type.startsWith('image/') ? (
                                  <ImageIcon className="w-5 h-5" />
                                ) : (
                                  <File className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium truncate">
                                  {att.name}
                                </span>
                                <Download className="w-4 h-4 ml-auto" />
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

                    {message.isEdited && (
                      <span className="text-xs opacity-70 mt-1 block italic">
                        (đã chỉnh sửa)
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {format(new Date(message.createdAt), 'HH:mm', { locale: vi })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <button
            type="button"
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-transparent resize-none outline-none max-h-32"
              rows={1}
              disabled={sending}
            />
          </div>

          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
