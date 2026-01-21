'use client';

import { useEffect, useState } from 'react';
import { getRoomParticipants, getRoomMedia } from '@/actions/chat/get-chat-data';
import { Image as ImageIcon, File, Link as LinkIcon, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatSidebarProps {
  roomId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'info' | 'media' | 'files' | 'links';

export default function ChatSidebar({ roomId, userId, isOpen, onClose }: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [participants, setParticipants] = useState<any[]>([]);
  const [media, setMedia] = useState<any>({ images: [], files: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId && isOpen) {
      loadData();
    }
  }, [roomId, isOpen]);

  const loadData = async () => {
    setLoading(true);
    const [participantsResult, mediaResult] = await Promise.all([
      getRoomParticipants(roomId),
      getRoomMedia(roomId, userId),
    ]);

    if (participantsResult.success) {
      setParticipants(participantsResult.data || []);
    }

    if (mediaResult.success) {
      setMedia(mediaResult.data || { images: [], files: [], links: [] });
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
          Ảnh
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'files'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          File
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'links'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Link
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
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {participant.users.full_name.charAt(0)}
                    </div>
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

            {/* Ảnh */}
            {activeTab === 'media' && (
              <div className="grid grid-cols-2 gap-2">
                {media.images.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có ảnh nào</p>
                  </div>
                ) : (
                  media.images.map((img: any) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.thumbnail_url || img.file_url}
                        alt={img.file_name}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(img.file_url, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <a
                          href={img.file_url}
                          download
                          className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-lg"
                        >
                          <Download className="w-4 h-4 text-gray-900" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* File */}
            {activeTab === 'files' && (
              <div className="space-y-2">
                {media.files.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <File className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có file nào</p>
                  </div>
                ) : (
                  media.files.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(file.created_at), 'dd/MM/yyyy', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                    </a>
                  ))
                )}
              </div>
            )}

            {/* Links */}
            {activeTab === 'links' && (
              <div className="space-y-2">
                {media.links.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có link nào</p>
                  </div>
                ) : (
                  media.links.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LinkIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-blue-600 truncate text-sm group-hover:underline">
                          {link.url}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Gửi bởi {link.sender.full_name} •{' '}
                          {format(new Date(link.sentAt), 'dd/MM/yyyy', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
