"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

/** Lock body scroll when Discussion page is mounted - prevents double scrollbar */
function useBodyScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useChat } from "@/hooks/useChat";
import { Conversation, Message, Mentor } from "./types";
import { ConversationList } from "./ConversationList";
import ChatHeader from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { DiscussionInfoPanel } from "./info-panel/DiscussionInfoPanel";

// Main Component for Mentor Interface
export const MentorChatInterface: React.FC = () => {
  const { user } = useAuthSession();
  const {
    rooms,
    loading: roomsLoading,
    refreshRooms,
  } = useChatRooms(user?.id || "");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(false);

  // Derived state for conversations list
  const conversations: Conversation[] = useMemo(() => {
    return rooms.map((room) => {
      const otherUser = room.otherUser || {
        id: "unknown",
        name: "Unknown",
        avatar: null,
        role: "student",
        email: "",
      };

      // For GROUP rooms: Use room name instead of user name
      // For PRIVATE rooms: Use student name
      const displayName = room.type === "GROUP" ? room.name : otherUser.name;

      // Map student data to Mentor interface structure
      // This is a workaround to reuse existing components that expect 'Mentor' type
      const studentAsMentor: Mentor = {
        id: otherUser.id,
        name: displayName, // Use room name for GROUP, student name for PRIVATE
        avatar: otherUser.avatar ?? null,
        roleCode: room.type === "GROUP" ? "GROUP" : "STUDENT",
        roleTitle: room.type === "GROUP" ? "Nhóm" : "Học viên",
        isOnline: false, // Need realtime presence for this
        lastSeen: "1 phút trước",
        description: "email" in otherUser ? otherUser.email : "", // Passing email via description field
        achievements: [], // Not used for students
      };

      return {
        id: room.id,
        mentor: studentAsMentor, // Property name is 'mentor' but holds student data
        messages: [], // Message list is fetched separately
        lastMessage: room.lastMessage?.content || "Chưa có tin nhắn",
        lastMessageTime: room.lastMessage
          ? new Date(room.lastMessage.createdAt)
          : new Date(room.createdAt),
        unreadCount: room.unreadCount,
      };
    });
  }, [rooms]);

  // Select first room by default
  useEffect(() => {
    if (!selectedRoomId && conversations.length > 0) {
      setSelectedRoomId(conversations[0].id);
    }
  }, [conversations, selectedRoomId]);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedRoomId,
  );

  // Fetch messages for selected room
  const {
    messages: rawMessages,
    sendMessage,
    loading: messagesLoading,
    refreshMessages,
  } = useChat({
    roomId: selectedRoomId || "",
    userId: user?.id || "",
    onNewMessage: () => {
      refreshRooms(); // Refresh room list to update last message/unread count
    },
    playSound: true,
  });

  // Auto-refresh messages when the conversation updates in the sidebar
  useEffect(() => {
    if (selectedConversation?.lastMessageTime) {
      const diffInfo = Math.abs(
        new Date().getTime() -
          new Date(selectedConversation.lastMessageTime).getTime(),
      );
      if (diffInfo < 10000) {
        refreshMessages();
      }
    }
  }, [selectedConversation?.lastMessageTime, refreshMessages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Map raw messages to UI format
  const messages: Message[] = useMemo(() => {
    return rawMessages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender.id,
      senderName: msg.sender.name,
      senderAvatar: msg.sender.avatar ?? null,
      content: msg.content,
      type: msg.type as "TEXT" | "IMAGE" | "FILE" | "LINK" | undefined,
      timestamp: new Date(msg.createdAt),
      isRead: true,
      isMine: msg.isFromMe,
      isSending: msg.isPending,
      isError: msg.error,
      attachments:
        msg.attachments?.map((att) => ({
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
      await sendMessage(content, "TEXT");

      // Force scroll to bottom
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
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

  useBodyScrollLock();

  // Loading state
  if (!user) return null;

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-slate-900 flex overflow-hidden">
      {/* ========== LEFT SIDEBAR - Conversation List ========== */}
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedRoomId || ""}
        searchQuery={searchQuery}
        onSelectConversation={handleSelectConversation}
        onSearchChange={setSearchQuery}
        showMobile={showMobileConversations}
        onCloseMobile={() => setShowMobileConversations(false)}
        loading={roomsLoading}
      />

      {/* Mobile Overlay */}
      {showMobileConversations && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileConversations(false)}
        />
      )}

      {/* ========== FLEX ROW: Chat area + Info panel (same row, no absolute) ========== */}
      <div className="flex-1 flex min-h-0 min-w-0">
        {/* Chat container: flex column, header fixed, messages scroll, input fixed */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800">
          {selectedConversation ? (
            <>
              <ChatHeader
                mentor={selectedConversation.mentor}
                roomName={rooms.find((r) => r.id === selectedRoomId)?.name}
                roomType={rooms.find((r) => r.id === selectedRoomId)?.type}
                onToggleInfoPanel={() => setShowInfoPanel((p) => !p)}
                onToggleMobileConversations={() =>
                  setShowMobileConversations(!showMobileConversations)
                }
              />

              <MessagesList
                messages={messages}
                messagesEndRef={messagesEndRef}
                messagesContainerRef={messagesContainerRef}
                conversationId={selectedConversation.id}
                loading={messagesLoading}
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
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chọn một học viên để bắt đầu cuộc trò chuyện
            </div>
          )}
        </div>

        {/* Info Panel - flex sibling, same row, not fixed */}
        {selectedConversation && (
          <DiscussionInfoPanel
            isOpen={showInfoPanel}
            onClose={() => setShowInfoPanel(false)}
            partner={selectedConversation.mentor}
            partnerRole="student"
            roomId={selectedConversation.id}
          />
        )}
      </div>
    </div>
  );
};
