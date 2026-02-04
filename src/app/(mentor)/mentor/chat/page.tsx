import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Chat | Holyann Mentor',
  description: 'Trao đổi với học viên',
};

export default function MentorChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trao đổi</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nhắn tin với học viên của bạn
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Tính năng Chat
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Tính năng chat sẽ được tích hợp tại đây.
          <br />
          Component chat hiện có sẽ được cập nhật để tương thích với giao diện mới.
        </p>
        {/* TODO: Integrate existing chat component here after fixing imports */}
      </div>
    </div>
  );
}
