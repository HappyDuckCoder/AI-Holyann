"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Menu, MoreVertical } from "lucide-react";
import { Conversation, Message } from "./types";
import { CONVERSATIONS } from "./data";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { ChatInfoPanel } from "./ChatInfoPanel";
import { Button } from "@/components/ui/button";

// Main Component
export const ChatPage: React.FC = () => {
  const [conversations] = useState<Conversation[]>(CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>(CONVERSATIONS[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(false);

  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      toast.error("Vui lòng nhập tin nhắn trước khi gửi", {
        description: "Không thể gửi tin nhắn rỗng",
      });
      return;
    }

    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: "student",
        senderName: "Bạn",
        senderAvatar: "/images/avatars/avt.jpg",
        content: messageInput,
        timestamp: new Date(),
        isRead: false,
        isMine: true,
      };

      // Add message to conversation (in real app, this would be an API call)
      selectedConversation.messages.push(newMessage);
      setMessageInput("");

      // Show success notification
      toast.success("Gửi tin nhắn thành công", {
        description: "Tin nhắn của bạn đã được gửi đi",
      });
    } catch (error) {
      // Show error notification
      toast.error("Gửi tin nhắn thất bại", {
        description: "Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.",
      });
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileConversations(false); // Close mobile menu after selection
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-theme(spacing.16))] bg-gray-100 dark:bg-slate-950 flex overflow-hidden relative">
      {/* Mobile Overlays */}
      {showMobileConversations && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileConversations(false)}
        />
      )}
      {showMobileInfo && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileInfo(false)}
        />
      )}

      {/* ========== 3-COLUMN LAYOUT ========== */}
      <div className="flex w-full h-full">
        {/* LEFT COLUMN - Conversation List (25%) */}
        <ChatSidebar
          conversations={conversations}
          selectedConversationId={selectedConversation.id}
          searchQuery={searchQuery}
          onSelectConversation={handleSelectConversation}
          onSearchChange={setSearchQuery}
          showMobile={showMobileConversations}
          onCloseMobile={() => setShowMobileConversations(false)}
        />

        {/* MIDDLE COLUMN - Chat Window (Flex-1) */}
        <ChatWindow
          mentor={selectedConversation.mentor}
          messages={selectedConversation.messages}
          messageInput={messageInput}
          onMessageInputChange={setMessageInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          conversationId={selectedConversation.id}
          onToggleMobileInfo={() => setShowMobileInfo(!showMobileInfo)}
          onToggleMobileConversations={() => setShowMobileConversations(!showMobileConversations)}
        />

        {/* RIGHT COLUMN - Mentor Info Panel (25%) */}
        <ChatInfoPanel
          mentor={selectedConversation.mentor}
          showMobile={showMobileInfo}
          onCloseMobile={() => setShowMobileInfo(false)}
        />
      </div>
    </div>
  );
};

export default ChatPage;
