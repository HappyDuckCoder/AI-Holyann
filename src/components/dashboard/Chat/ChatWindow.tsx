"use client";

import React, { useRef, useEffect } from "react";
import { Phone, Video, Send, Paperclip, Image as ImageIcon, Smile, Menu, Info } from "lucide-react";
import { Mentor, Message } from "./types";
import { getRoleIcon, getRoleColor } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ChatWindowProps {
  mentor: Mentor;
  messages: Message[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  conversationId: string;
  onToggleMobileInfo?: () => void;
  onToggleMobileConversations?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  mentor,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onKeyPress,
  conversationId,
  onToggleMobileInfo,
  onToggleMobileConversations,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const RoleIcon = getRoleIcon(mentor.roleCode);
  const roleColors = getRoleColor(mentor.roleCode);

  // Auto scroll to bottom when conversation changes
  useEffect(() => {
    if (!messagesContainerRef.current || !conversationId) return;
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    });
  }, [conversationId]);

  // Auto scroll when messages change (if near bottom)
  useEffect(() => {
    if (!messagesContainerRef.current || !messagesEndRef.current) return;
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    
    if (isNearBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 h-full min-h-0">
      {/* Header */}
      <div className="px-4 lg:px-6 py-3.5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="w-11 h-11 ring-2 ring-gray-100 dark:ring-slate-800">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-500 text-white font-semibold">
                {mentor.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {mentor.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
              {mentor.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="secondary"
                className={`${roleColors.bg} ${roleColors.text} dark:bg-slate-800 dark:text-slate-300 
                  border-0 font-medium text-xs px-2 py-0.5 h-auto`}
              >
                <RoleIcon size={12} className="mr-1" />
                {mentor.roleCode} - {mentor.roleTitle}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-slate-400 hidden sm:inline">
                {mentor.isOnline ? "● Đang hoạt động" : `Hoạt động ${mentor.lastSeen}`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mobile Menu Button */}
          {onToggleMobileConversations && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileConversations}
              className="md:hidden rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            >
              <Menu size={20} />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
          >
            <Phone size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
          >
            <Video size={20} />
          </Button>
          
          {/* Info Button */}
          {onToggleMobileInfo && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileInfo}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            >
              <Info size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white dark:from-slate-950/30 dark:to-slate-900"
      >
        {/* Date Separator */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
            <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">Hôm nay</span>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message, index) => {
          const showAvatar = !message.isMine && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
          
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${message.isMine ? "justify-end" : "justify-start"}`}
            >
              {/* Mentor Avatar (Left side) */}
              {!message.isMine && (
                <div className="shrink-0">
                  {showAvatar ? (
                    <Avatar className="w-8 h-8 ring-1 ring-gray-200 dark:ring-slate-800">
                      <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                      <AvatarFallback className="bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs">
                        {message.senderName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`flex flex-col ${message.isMine ? "items-end" : "items-start"} max-w-[75%] lg:max-w-[65%]`}>
                {/* Sender name (only for mentor messages with avatar) */}
                {!message.isMine && showAvatar && (
                  <span className="text-xs text-gray-500 dark:text-slate-400 mb-1 ml-1">
                    {message.senderName}
                  </span>
                )}

                {/* Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                    message.isMine
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 px-1">
                  {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {message.isMine && (
                    <span className="ml-1">{message.isRead ? "✓✓" : "✓"}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-end gap-2">
          {/* Attachment Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
            >
              <Paperclip size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
            >
              <ImageIcon size={20} />
            </Button>
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <Input
              type="text"
              value={messageInput}
              onChange={(e) => onMessageInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Nhập tin nhắn..."
              className="pr-12 py-6 bg-gray-100 dark:bg-slate-800 rounded-2xl border-0 
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                focus:bg-white dark:focus:bg-slate-700 transition-all
                placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
            >
              <Smile size={20} />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            size="icon"
            className={`rounded-full w-11 h-11 transition-all ${
              messageInput.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30"
                : "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
