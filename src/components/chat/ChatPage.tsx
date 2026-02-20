"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useChat } from "@/hooks/useChat";
import { Conversation, Message, Mentor } from "./types";
import { ConversationList } from "./ConversationList";
import ChatHeader from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { MentorInfo } from "./MentorInfo";
import { SharedMediaModal } from "./SharedMediaModal";

// Main Component
export const ChatPage: React.FC = () => {
    const { user } = useAuthSession();
    const { rooms, loading: roomsLoading, refreshRooms } = useChatRooms(user?.id || "");
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMobileInfo, setShowMobileInfo] = useState(false);
    const [showMobileConversations, setShowMobileConversations] = useState(false);
    const [showSharedMedia, setShowSharedMedia] = useState(false);

    // Derived state for conversations list
    const conversations: Conversation[] = useMemo(() => {
        return rooms.map(room => {
            const otherUser = room.otherUser || { id: "unknown", name: "Unknown", avatar: null, role: "mentor" };

            // For GROUP rooms: Use room name instead of user name
            // For PRIVATE rooms: Use mentor name
            const displayName = room.type === 'GROUP' ? room.name : otherUser.name;

            // Mock mentor details if missing from API
            const mentor: Mentor = {
                id: otherUser.id,
                name: displayName, // Use room name for GROUP, mentor name for PRIVATE
                avatar: otherUser.avatar || "/images/avatars/default.jpg",
                roleCode: room.type === 'GROUP' ? "GROUP" : (room.mentorType || "AS"), // Default or derive from room.mentorType if available
                roleTitle: room.type === 'GROUP' ? "Nhóm Mentor" : "Mentor",
                isOnline: false, // Need realtime presence for this
                lastSeen: "1 phút trước",
                description: room.type === 'GROUP' ? "Nhóm hỗ trợ đầy đủ" : "Chuyên gia tư vấn...",
                achievements: room.type === 'GROUP' ? [] : ["5 năm kinh nghiệm", "Mentor xuất sắc"]
            };

            return {
                id: room.id,
                mentor,
                messages: [], // Message list is fetched separately
                lastMessage: room.lastMessage?.content || "Chưa có tin nhắn",
                lastMessageTime: room.lastMessage ? new Date(room.lastMessage.createdAt) : new Date(room.createdAt),
                unreadCount: room.unreadCount
            };
        });
    }, [rooms]);

    // Select first room by default
    useEffect(() => {
        if (!selectedRoomId && conversations.length > 0) {
            setSelectedRoomId(conversations[0].id);
        }
    }, [conversations, selectedRoomId]);

    const selectedConversation = conversations.find(c => c.id === selectedRoomId);

    // Fetch messages for selected room
    const { messages: rawMessages, sendMessage, loading: messagesLoading, refreshMessages } = useChat({
        roomId: selectedRoomId || "",
        userId: user?.id || "",
        onNewMessage: () => {
             refreshRooms(); // Refresh room list to update last message/unread count
        },
        playSound: true
    });

    // Auto-refresh messages when the conversation updates in the sidebar
    // This serves as a backup to the internal realtime subscription of useChat
    useEffect(() => {
        if (selectedConversation?.lastMessageTime) {
            // Only refresh if the last message time is very recent (to avoid unnecessary fetches on mount)
            const diffInfo = Math.abs(new Date().getTime() - new Date(selectedConversation.lastMessageTime).getTime());
            if (diffInfo < 10000) { // If update happened in last 10 seconds
                refreshMessages();
            }
        }
    }, [selectedConversation?.lastMessageTime, refreshMessages]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Map raw messages to UI format
    const messages: Message[] = useMemo(() => {
        return rawMessages.map(msg => ({
            id: msg.id,
            senderId: msg.sender.id,
            senderName: msg.sender.name,
            senderAvatar: msg.sender.avatar || "/images/avatars/default.jpg",
            content: msg.content,
            type: msg.type as 'TEXT' | 'IMAGE' | 'FILE' | 'LINK' | undefined,
            timestamp: new Date(msg.createdAt),
            isRead: true, // Simplified
            isMine: msg.isFromMe,
            isSending: msg.isPending,
            isError: msg.error,
            attachments: msg.attachments?.map(att => ({
                id: att.id,
                url: att.url,
                name: att.name,
                type: att.type,
                size: att.size,
                thumbnail: att.thumbnail,
            })) || [],
        }));
    }, [rawMessages]);

    const [messageInput, setMessageInput] = useState("");

    const handleSendMessage = async () => {
        if (!messageInput.trim()) {
            return;
        }

        const content = messageInput;
        setMessageInput(""); // Clear immediately

        try {
            await sendMessage(content, 'TEXT');

            // Force scroll to bottom
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 50);
        } catch (error) {
            toast.error("Gửi tin nhắn thất bại");
            console.error("Error sending message:", error);
            setMessageInput(content); // Restore content on error
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedRoomId(conversation.id);
        setShowMobileConversations(false);
    };

    // Loading state
    if (!user) return null; // Or loading spinner

    return (
        <div className="h-full flex overflow-hidden relative bg-background">
            {/* ========== LEFT SIDEBAR - Conversation List ========== */}
            <ConversationList
                conversations={conversations}
                selectedConversationId={selectedRoomId || ""}
                searchQuery={searchQuery}
                onSelectConversation={handleSelectConversation}
                onSearchChange={setSearchQuery}
                showMobile={showMobileConversations}
                onCloseMobile={() => setShowMobileConversations(false)}
            />

            {showMobileConversations && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setShowMobileConversations(false)}
                />
            )}

            {/* ========== MAIN CHAT AREA ========== */}
            <div className="flex-1 flex flex-col bg-card border-x border-border min-h-0 w-full md:w-auto">
                {selectedConversation ? (
                    <>
                    <ChatHeader
                        mentor={selectedConversation.mentor}
                        roomName={rooms.find(r => r.id === selectedRoomId)?.name}
                        roomType={rooms.find(r => r.id === selectedRoomId)?.type}
                        onToggleMobileInfo={() => setShowMobileInfo(!showMobileInfo)}
                        onToggleMobileConversations={() =>
                            setShowMobileConversations(!showMobileConversations)
                        }
                    />

                    <MessagesList
                        messages={messages}
                        messagesEndRef={messagesEndRef}
                        messagesContainerRef={messagesContainerRef}
                        conversationId={selectedConversation.id}
                    />

                    <MessageInput
                        roomId={selectedRoomId || ""}
                        userId={user?.id || ""}
                        messageInput={messageInput}
                        onInputChange={setMessageInput}
                        onSendMessage={handleSendMessage}
                        onKeyPress={handleKeyPress}
                        onMessageSent={refreshMessages}
                    />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-muted-foreground">
                        <p className="text-sm font-medium">Chọn một cuộc hội thoại để bắt đầu</p>
                        <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-border shadow-sm">
                            <img
                                src="/images/HOEX_IMAGES/discussion-empty.jpg"
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/auth/left.jpg'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        </div>
                    </div>
                )}
            </div>

            {/* ========== RIGHT SIDEBAR - Mentor Info ========== */}
            {selectedConversation && (
                <MentorInfo
                    mentor={selectedConversation.mentor}
                    showMobileInfo={showMobileInfo}
                    onCloseMobileInfo={() => setShowMobileInfo(false)}
                    onShowSharedMedia={() => setShowSharedMedia(true)}
                />
            )}

            {/* ========== Shared Media Modal ========== */}
            {selectedConversation && (
                <SharedMediaModal
                    isOpen={showSharedMedia}
                    onClose={() => setShowSharedMedia(false)}
                    messages={messages}
                    partnerName={selectedConversation.mentor.name}
                />
            )}
        </div>
    );
};

export default ChatPage;

