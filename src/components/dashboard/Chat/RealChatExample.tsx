// Example: Tích hợp Chat Real-time vào ChatPage.tsx
// File này chứa code mẫu để thay thế mock data bằng real data

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { useChatAPI, Conversation, Message } from '@/hooks/useChatAPI';

export default function RealChatPageExample() {
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Hooks
    const {
        isConnected,
        onlineUsers,
        isUserOnline,
        joinConversation,
        leaveConversation,
        sendMessage: sendSocketMessage,
        startTyping,
        stopTyping,
        onNewMessage,
        onTyping,
        markAsRead: markSocketRead
    } = useSocket();

    const {
        loading,
        getConversations,
        getMessages,
        sendMessage: sendAPIMessage,
        markMessagesAsRead
    } = useChatAPI();

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for new messages
    useEffect(() => {
        const cleanup = onNewMessage((message) => {
            if (message.conversationId === selectedConversation?.id) {
                setMessages(prev => [...prev, {
                    ...message,
                    isMine: message.senderId === user?.id
                }]);

                // Auto mark as read if conversation is active
                markMessagesAsRead(selectedConversation.id);
            } else {
                // Update unread count for other conversations
                setConversations(prev => prev.map(conv =>
                    conv.id === message.conversationId
                        ? { ...conv, unreadCount: conv.unreadCount + 1 }
                        : conv
                ));
            }
        });

        return cleanup;
    }, [selectedConversation, user]);

    // Listen for typing events
    useEffect(() => {
        const cleanup = onTyping((event) => {
            if (event.conversationId === selectedConversation?.id && event.userId !== user?.id) {
                setTypingUsers(prev => {
                    const updated = new Set(prev);
                    if (event.isTyping) {
                        updated.add(event.userName);
                    } else {
                        updated.delete(event.userName);
                    }
                    return updated;
                });
            }
        });

        return cleanup;
    }, [selectedConversation, user]);

    // Join/leave conversation rooms
    useEffect(() => {
        if (selectedConversation) {
            joinConversation(selectedConversation.id);
            loadMessages(selectedConversation.id);

            // Mark messages as read when opening conversation
            markMessagesAsRead(selectedConversation.id);

            return () => {
                leaveConversation(selectedConversation.id);
            };
        }
    }, [selectedConversation]);

    // Functions
    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data.conversations);

            // Auto select first conversation
            if (data.conversations.length > 0 && !selectedConversation) {
                setSelectedConversation(data.conversations[0]);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const data = await getMessages(conversationId);
            setMessages(data.messages);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;

        const content = messageInput.trim();
        setMessageInput('');

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            stopTyping(selectedConversation.id, user?.name || 'User');
        }

        try {
            // Send via API (saves to database)
            const result = await sendAPIMessage(selectedConversation.id, content);

            // Send via WebSocket for real-time delivery
            sendSocketMessage({
                id: result.message.id,
                conversationId: selectedConversation.id,
                senderId: result.message.senderId,
                senderName: result.message.senderName,
                senderAvatar: result.message.senderAvatar || '',
                content: result.message.content,
                messageType: result.message.messageType,
                timestamp: result.message.timestamp,
                isRead: false
            });

            // Add to local messages
            setMessages(prev => [...prev, result.message]);

            // Update conversation last message
            setConversations(prev => prev.map(conv =>
                conv.id === selectedConversation.id
                    ? {
                        ...conv,
                        lastMessage: content,
                        lastMessageTime: new Date()
                    }
                    : conv
            ));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleInputChange = (text: string) => {
        setMessageInput(text);

        if (!selectedConversation) return;

        // Start typing indicator
        if (text && !isTyping) {
            setIsTyping(true);
            startTyping(selectedConversation.id, user?.name || 'User');
        }

        // Reset timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            stopTyping(selectedConversation.id, user?.name || 'User');
        }, 2000);

        // Stop typing if input is empty
        if (!text && isTyping) {
            setIsTyping(false);
            stopTyping(selectedConversation.id, user?.name || 'User');
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút`;
        if (hours < 24) return `${hours} giờ`;
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const formatMessageTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Conversations List */}
            <div className="w-80 bg-white border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Tin nhắn</h2>
                    <p className="text-sm text-gray-500">
                        {isConnected ? '🟢 Đang kết nối' : '🔴 Mất kết nối'}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={conv.participant.avatar || '/images/avatars/default.jpg'}
                                        alt={conv.participant.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    {isUserOnline(conv.participant.id) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold truncate">
                                            {conv.participant.name}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {formatTime(conv.lastMessageTime)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedConversation.participant.avatar || '/images/avatars/default.jpg'}
                                    alt={selectedConversation.participant.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-semibold">
                                        {selectedConversation.participant.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {isUserOnline(selectedConversation.participant.id)
                                            ? 'Đang hoạt động'
                                            : 'Không hoạt động'}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-2 max-w-md ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                                        <img
                                            src={msg.senderAvatar || '/images/avatars/default.jpg'}
                                            alt={msg.senderName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                            <div
                                                className={`rounded-lg p-3 ${
                                                    msg.isMine
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 text-gray-900'
                                                }`}
                                            >
                                                <p>{msg.content}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                <span>{formatMessageTime(msg.timestamp)}</span>
                                                {msg.isMine && msg.isRead && (
                                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {typingUsers.size > 0 && (
                                <div className="text-sm text-gray-500 italic">
                                    {Array.from(typingUsers).join(', ')} đang gõ...
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="bg-white border-t p-4">
                            <div className="flex gap-2 items-center">
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim() || loading}
                                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Chọn một cuộc hội thoại để bắt đầu
                    </div>
                )}
            </div>
        </div>
    );
}
