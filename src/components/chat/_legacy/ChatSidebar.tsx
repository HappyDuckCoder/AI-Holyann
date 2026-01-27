'use client';

import { useEffect, useState } from 'react';
import { getRoomParticipants } from '@/actions/chat/get-chat-data';
import { Users, X } from 'lucide-react';
import MediaGallery from './MediaGallery';

interface ChatSidebarProps {
  roomId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'info' | 'media';

export default function ChatSidebar({ roomId, userId, isOpen, onClose }: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId && isOpen) {
      loadData();
    }
  }, [roomId, isOpen]);

  const loadData = async () => {
    setLoading(true);
    const participantsResult = await getRoomParticipants(roomId);

    if (participantsResult.success) {
      setParticipants(participantsResult.data || []);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Thông tin</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-1" />
          Thành viên
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'media'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Lưu trữ
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Thành viên */}
            {activeTab === 'info' && (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {participant.users.avatar_url ? (
                      <img
                        src={participant.users.avatar_url}
                        alt={participant.users.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {participant.users.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {participant.users.full_name}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {participant.users.role.toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {participant.users.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Media Gallery */}
            {activeTab === 'media' && (
              <div className="-mx-4 -mb-4">
                <MediaGallery roomId={roomId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
