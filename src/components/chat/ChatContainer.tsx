'use client';

import { useState } from 'react';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatMessageBox from '@/components/chat/ChatMessageBox';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { Info } from 'lucide-react';

interface ChatContainerProps {
  userId: string;
}

export default function ChatContainer({ userId }: ChatContainerProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectRoom = (roomId: string, roomName?: string) => {
    setSelectedRoomId(roomId);
    setSelectedRoomName(roomName || '');
  };

  return (
    <div className="h-full flex overflow-hidden bg-gray-100">
      {/* Left: Room List */}
      <div className="w-80 flex-shrink-0">
        <ChatRoomList
          userId={userId}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(roomId, roomName) => {
            setSelectedRoomId(roomId);
            setSelectedRoomName(roomName);
          }}
        />
      </div>

      {/* Center: Message Box */}
      <div className="flex-1 flex flex-col">
        {selectedRoomId ? (
          <>
            {/* Header với nút mở sidebar */}
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedRoomName || 'Chat'}</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatMessageBox
                roomId={selectedRoomId}
                userId={userId}
                roomName={selectedRoomName}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chào mừng đến với Chat
              </h3>
              <p className="text-gray-500">
                Chọn một cuộc trò chuyện để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Sidebar */}
      {selectedRoomId && (
        <ChatSidebar
          roomId={selectedRoomId}
          userId={userId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
