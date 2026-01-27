'use client';

import React, {useState, useRef, useEffect} from 'react';
import {
    Send, Paperclip, Image, Smile, Search,
    Phone, Video, MoreVertical, Users, Star, GraduationCap,
    CheckCheck, X, Sparkles, TrendingUp, Clock
} from 'lucide-react';
import {useAuthSession} from '@/hooks/useAuthSession';

// Types
interface Student {
    id: string;
    name: string;
    email: string;
    grade: string;
    targetCountry: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
}

export default function MentorChatPage() {
    const {user} = useAuthSession();
    const [conversations, setConversations] = useState<Student[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Student | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileInfo, setShowMobileInfo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize conversations with mentor name
    useEffect(() => {
        const mentorName = user?.name || 'Mentor';
        const convs = createMockConversations(mentorName);
        setConversations(convs);
        setSelectedConversation(convs[0]);
    }, [user]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [selectedConversation?.messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConversation) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: 'mentor',
            senderName: user?.name || 'Mentor',
            senderAvatar: '/images/avatars/mentor.jpg',
            content: messageInput,
            timestamp: new Date(),
            isRead: false,
            isMine: true
        };

        // Add message to conversation
        const updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage]
        };
        setSelectedConversation(updatedConversation);

        // Update conversations list
        setConversations(prev =>
            prev.map(conv =>
                conv.id === selectedConversation.id ? updatedConversation : conv
            )
        );

        setMessageInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.student.targetCountry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!selectedConversation) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="h-[calc(100vh-theme(spacing.16))] bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex overflow-hidden">

            {/* ========== LEFT SIDEBAR - Student List ========== */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex shadow-lg">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="text-white" size={24}/>
                        Học Viên ({conversations.length})
                    </h2>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Tìm học viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border-0 focus:ring-2 focus:ring-purple-300 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-purple-50 ${
                                selectedConversation.id === conv.id ? 'bg-purple-100 border-l-4 border-l-purple-600' : ''
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={conv.student.avatar}
                                        alt={conv.student.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                                    />
                                    {conv.student.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                    {!conv.student.isOnline && conv.student.lastSeen && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-400 rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                                            {conv.student.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                            {formatTime(conv.lastMessageTime)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                            {conv.student.grade}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                            {conv.student.targetCountry}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 truncate mb-1">
                                        {conv.lastMessage}
                                    </p>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                                                style={{width: `${conv.student.progress}%`}}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{conv.student.progress}%</span>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div className="mt-2">
                                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-purple-600 rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========== MAIN CHAT AREA ========== */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        <img
                            src={selectedConversation.student.avatar}
                            alt={selectedConversation.student.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                {selectedConversation.student.name}
                                {selectedConversation.student.isOnline && (
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {selectedConversation.student.isOnline
                                    ? 'Đang hoạt động'
                                    : `Hoạt động ${selectedConversation.student.lastSeen}`
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone size={20} className="text-gray-600"/>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Video size={20} className="text-gray-600"/>
                        </button>
                        <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                            onClick={() => setShowMobileInfo(!showMobileInfo)}
                        >
                            <MoreVertical size={20} className="text-gray-600"/>
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {selectedConversation.messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.isMine ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <img
                                src={message.senderAvatar}
                                alt={message.senderName}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className={`flex flex-col ${message.isMine ? 'items-end' : 'items-start'} max-w-md`}>
                                <div
                                    className={`px-4 py-2.5 rounded-2xl ${
                                        message.isMine
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-xs text-gray-500">
                                        {formatMessageTime(message.timestamp)}
                                    </span>
                                    {message.isMine && (
                                        <CheckCheck
                                            size={14}
                                            className={message.isRead ? 'text-blue-500' : 'text-gray-400'}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Paperclip size={20} className="text-gray-600"/>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Image size={20} className="text-gray-600"/>
                        </button>
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                        />
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Smile size={20} className="text-gray-600"/>
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim()}
                            className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== RIGHT SIDEBAR - Student Info ========== */}
            <div className={`w-80 bg-white border-l border-gray-200 flex-col ${showMobileInfo ? 'flex' : 'hidden md:flex'} shadow-lg`}>
                {/* Close button for mobile */}
                <button
                    onClick={() => setShowMobileInfo(false)}
                    className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
                >
                    <X size={20}/>
                </button>

                {/* Student Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                    <div className="text-center">
                        <img
                            src={selectedConversation.student.avatar}
                            alt={selectedConversation.student.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-purple-200"
                        />
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {selectedConversation.student.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedConversation.student.email}</p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {selectedConversation.student.grade}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {selectedConversation.student.targetCountry}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Info */}
                <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp size={18} className="text-purple-600"/>
                        Tiến độ hồ sơ
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Tổng quan</span>
                            <span className="font-semibold text-purple-600">{selectedConversation.student.progress}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all rounded-full"
                                style={{width: `${selectedConversation.student.progress}%`}}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-purple-600"/>
                        Thao tác nhanh
                    </h4>
                    <div className="space-y-2">
                        <button className="w-full px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                            <GraduationCap size={16}/>
                            Xem hồ sơ chi tiết
                        </button>
                        <button className="w-full px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                            <Clock size={16}/>
                            Đặt lịch họp
                        </button>
                        <button className="w-full px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                            <Star size={16}/>
                            Đánh dấu quan trọng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
