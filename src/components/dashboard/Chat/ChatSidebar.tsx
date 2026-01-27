"use client";

import React from "react";
import { Search, MessageCircle, X } from "lucide-react";
import { Conversation } from "./types";
import { getRoleIcon, getRoleColor, formatTime } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string;
  searchQuery: string;
  onSelectConversation: (conversation: Conversation) => void;
  onSearchChange: (query: string) => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  searchQuery,
  onSelectConversation,
  onSearchChange,
  showMobile = false,
  onCloseMobile,
}) => {
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.mentor.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col h-full
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto transform transition-transform duration-300 ease-in-out 
        ${showMobile ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-2xl md:shadow-none`}
    >
      {/* Header */}
      <div className="p-4 lg:p-5 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="text-blue-600 dark:text-blue-400" size={22} />
            Trao Đổi
          </h2>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-colors text-gray-600 dark:text-slate-300 md:hidden"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
            size={18}
          />
          <Input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border-gray-200 dark:border-slate-700 
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-sm
              placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {filteredConversations.map((conv) => {
            const RoleIcon = getRoleIcon(conv.mentor.roleCode);
            const roleColors = getRoleColor(conv.mentor.roleCode);
            const isSelected = selectedConversationId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 
                  ${isSelected 
                    ? "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-600 dark:border-l-blue-400" 
                    : "border-l-4 border-l-transparent"
                  }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with Online Indicator */}
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-slate-900">
                      <AvatarImage src={conv.mentor.avatar} alt={conv.mentor.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-500 text-white font-semibold">
                        {conv.mentor.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conv.mentor.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name & Time */}
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-semibold text-sm truncate ${
                        isSelected 
                          ? "text-blue-700 dark:text-blue-300" 
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {conv.mentor.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>

                    {/* Role Badge */}
                    <Badge 
                      variant="secondary"
                      className={`mb-2 ${roleColors.bg} ${roleColors.text} dark:bg-slate-800 dark:text-slate-300 
                        border-0 font-medium text-xs px-2 py-0.5 h-auto`}
                    >
                      <RoleIcon size={12} className="mr-1" />
                      {conv.mentor.roleCode}
                    </Badge>

                    {/* Last Message & Unread */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-600 dark:text-slate-400 truncate flex-1">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge 
                          className="shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 dark:bg-blue-500 text-white 
                            text-xs font-semibold rounded-full flex items-center justify-center"
                        >
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle size={40} className="mx-auto text-gray-300 dark:text-slate-700 mb-3" />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Không tìm thấy cuộc trò chuyện nào
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
