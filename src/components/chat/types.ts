export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isMine: boolean;
  isSending?: boolean; // For optimistic UI
  isError?: boolean; // For optimistic UI error state
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  roleCode: string;
  roleTitle: string;
  isOnline: boolean;
  lastSeen?: string;
  description: string;
  achievements: string[];
}

export interface Conversation {
  id: string; // This is likely the roomId
  mentor: Mentor;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}
