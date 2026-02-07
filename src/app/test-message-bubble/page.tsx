'use client';

import React from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { Message } from '@/components/chat/types';

/**
 * Demo page để test MessageBubble component với attachments
 * Truy cập: http://localhost:3000/test-message-bubble
 */
export default function MessageBubbleDemoPage() {
  // Sample messages với các trường hợp khác nhau
  const sampleMessages: Message[] = [
    // 1. Text only message (from me)
    {
      id: '1',
      senderId: 'me',
      senderName: 'Tôi',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Xin chào! Đây là tin nhắn văn bản thông thường.',
      timestamp: new Date(),
      isRead: true,
      isMine: true,
      isSending: false,
    },

    // 2. Text only message (from other)
    {
      id: '2',
      senderId: 'other',
      senderName: 'Học viên',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Chào thầy! Em có câu hỏi về bài tập.',
      timestamp: new Date(),
      isRead: false,
      isMine: false,
    },

    // 3. Single image attachment
    {
      id: '3',
      senderId: 'other',
      senderName: 'Học viên',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Em gửi thầy ảnh kết quả bài làm:',
      timestamp: new Date(),
      isRead: false,
      isMine: false,
      attachments: [
        {
          id: 'img1',
          url: 'https://picsum.photos/400/300',
          name: 'bai-tap-toan.jpg',
          type: 'image/jpeg',
          size: 245760,
        },
      ],
    },

    // 4. Multiple images (grid layout)
    {
      id: '4',
      senderId: 'me',
      senderName: 'Tôi',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Đây là một số tài liệu tham khảo:',
      timestamp: new Date(),
      isRead: true,
      isMine: true,
      attachments: [
        {
          id: 'img2',
          url: 'https://picsum.photos/400/300?random=1',
          name: 'slide-1.png',
          type: 'image/png',
          size: 180000,
        },
        {
          id: 'img3',
          url: 'https://picsum.photos/400/300?random=2',
          name: 'slide-2.png',
          type: 'image/png',
          size: 190000,
        },
        {
          id: 'img4',
          url: 'https://picsum.photos/400/300?random=3',
          name: 'slide-3.png',
          type: 'image/png',
          size: 175000,
        },
      ],
    },

    // 5. File attachments (PDF, Excel)
    {
      id: '5',
      senderId: 'other',
      senderName: 'Học viên',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Em gửi thầy báo cáo và dữ liệu phân tích:',
      timestamp: new Date(),
      isRead: false,
      isMine: false,
      attachments: [
        {
          id: 'file1',
          url: '#',
          name: 'Bao_cao_nghien_cuu_thang_1_2024.pdf',
          type: 'application/pdf',
          size: 2457600, // 2.4 MB
        },
        {
          id: 'file2',
          url: '#',
          name: 'Du_lieu_phan_tich.xlsx',
          type: 'application/vnd.ms-excel',
          size: 524288, // 512 KB
        },
      ],
    },

    // 6. Mixed content (text + images + files)
    {
      id: '6',
      senderId: 'me',
      senderName: 'Tôi',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Đây là tài liệu hướng dẫn chi tiết:\n\n1. Mockup thiết kế\n2. Tài liệu kỹ thuật\n\nHãy xem và cho feedback nhé!',
      timestamp: new Date(),
      isRead: true,
      isMine: true,
      attachments: [
        {
          id: 'mix1',
          url: 'https://picsum.photos/400/300?random=4',
          name: 'mockup-design.png',
          type: 'image/png',
          size: 320000,
        },
        {
          id: 'mix2',
          url: 'https://picsum.photos/400/300?random=5',
          name: 'wireframe.png',
          type: 'image/png',
          size: 285000,
        },
        {
          id: 'mix3',
          url: '#',
          name: 'Technical_Specification_v2.pdf',
          type: 'application/pdf',
          size: 1048576, // 1 MB
        },
      ],
    },

    // 7. Only attachments (no text)
    {
      id: '7',
      senderId: 'other',
      senderName: 'Học viên',
      senderAvatar: '/images/avatars/default.jpg',
      content: null,
      timestamp: new Date(),
      isRead: false,
      isMine: false,
      attachments: [
        {
          id: 'file3',
          url: '#',
          name: 'homework_submission.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 756000,
        },
      ],
    },

    // 8. Long file name (test truncate)
    {
      id: '8',
      senderId: 'me',
      senderName: 'Tôi',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'File có tên rất dài để test truncate:',
      timestamp: new Date(),
      isRead: true,
      isMine: true,
      attachments: [
        {
          id: 'file4',
          url: '#',
          name: 'This_is_a_very_long_file_name_that_should_be_truncated_properly_in_the_UI_for_better_user_experience.pdf',
          type: 'application/pdf',
          size: 3145728, // 3 MB
        },
      ],
    },

    // 9. Message with pending state
    {
      id: '9',
      senderId: 'me',
      senderName: 'Tôi',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Tin nhắn đang gửi...',
      timestamp: new Date(),
      isRead: false,
      isMine: true,
      isSending: true,
    },

    // 10. Message with error state
    {
      id: '10',
      senderId: 'me',
      senderName: 'Tôi',
      senderAvatar: '/images/avatars/default.jpg',
      content: 'Tin nhắn này bị lỗi khi gửi',
      timestamp: new Date(),
      isRead: false,
      isMine: true,
      isError: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            🎨 MessageBubble Component Demo
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test các trường hợp hiển thị tin nhắn với ảnh và file đính kèm
          </p>
        </div>

        {/* Message List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {sampleMessages.map((message, index) => (
              <div key={message.id}>
                <MessageBubble message={message} />

                {/* Separator between messages */}
                {index < sampleMessages.length - 1 && (
                  <div className="my-4 border-b border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100">
            📋 Test Cases
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✅ Text only message (from me)</li>
            <li>✅ Text only message (from other)</li>
            <li>✅ Single image attachment</li>
            <li>✅ Multiple images (2-column grid)</li>
            <li>✅ File attachments (PDF, Excel)</li>
            <li>✅ Mixed content (text + images + files)</li>
            <li>✅ Only attachments (no text)</li>
            <li>✅ Long file name (truncate test)</li>
            <li>✅ Pending state (sending)</li>
            <li>✅ Error state (failed to send)</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
            🧪 Testing Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Verify all message types display correctly</li>
            <li>Check hover effects on images and file cards</li>
            <li>Click images to open in new tab</li>
            <li>Click file cards to trigger download</li>
            <li>Test responsive design (resize browser)</li>
            <li>Toggle dark mode to check colors</li>
            <li>Verify long file names truncate properly</li>
            <li>Check pending and error states display correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
