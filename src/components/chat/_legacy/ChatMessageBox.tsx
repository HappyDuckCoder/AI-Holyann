'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Send, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/useChat'

interface ChatMessageBoxProps {
  roomId: string
  userId: string
  roomName: string
}

export default function ChatMessageBox({ roomId, userId, roomName }: ChatMessageBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refreshMessages,
  } = useChat({
    roomId,
    userId,
    onNewMessage: (message) => {
      console.log('🔔 New message received:', message)
      scrollToBottom()
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    const input = inputRef.current
    if (!input || !input.value.trim() || sending) return

    const messageContent = input.value.trim()
    input.value = ''

    try {
      await sendMessage(messageContent)
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleRetry = async (messageId: string) => {
    await refreshMessages()
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{roomName}</h2>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
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

            const isPending = message.isPending
            const hasError = message.error

            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2',
                  isOwn && 'flex-row-reverse',
                  isPending && 'opacity-60'
                )}
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

                  <div className="relative">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 relative',
                        isOwn
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-sm',
                        hasError && 'bg-red-100 text-red-800 border border-red-300'
                      )}
                    >
                      {/* Message Content */}
                      {message.content && (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

                      {/* Pending Indicator */}
                      {isPending && (
                        <div className="flex items-center gap-1 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs opacity-70">Đang gửi...</span>
                        </div>
                      )}

                      {/* Error Indicator */}
                      {hasError && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs">Gửi thất bại</span>
                          <button
                            onClick={() => handleRetry(message.id)}
                            className="text-xs underline hover:no-underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Thử lại
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    {!isPending && !hasError && (
                      <div className={cn('flex items-center gap-1 mt-1 px-1', isOwn ? 'justify-end' : 'justify-start')}>
                        <span className="text-[11px] text-gray-400">
                          {format(message.createdAt, 'HH:mm', { locale: vi })}
                        </span>
                        {isOwn && (
                          <span className="text-[11px] text-gray-400">✓✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t bg-white p-4">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập tin nhắn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className={cn(
              'p-3 rounded-full transition-colors flex-shrink-0',
              sending
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            )}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
