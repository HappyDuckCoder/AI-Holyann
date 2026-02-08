"use client"
import { useState } from 'react'
import UserAvatar from '@/components/ui/UserAvatar'

export default function TestAvatarPage() {
  const [user, setUser] = useState({
    id: 'test-user-123',
    name: 'Nguyễn Văn A',
    email: 'test@example.com',
    avatar_url: null as string | null,
    role: 'STUDENT'
  })

  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleAvatarUpload = async (file: File): Promise<void> => {
    try {
      setUploadStatus('Đang tải lên...')

      // Import the upload function
      const { uploadAvatarToServer } = await import('@/utils/avatar-upload')

      const result = await uploadAvatarToServer(file, user.id)

      if (result.success && result.url) {
        setUser(prev => ({
          ...prev,
          avatar_url: result.url ?? null,
        }))
        setUploadStatus('✅ Tải lên thành công!')

        // Clear status after 3 seconds
        setTimeout(() => setUploadStatus(''), 3000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      setUploadStatus(`❌ Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setUploadStatus(''), 5000)
      throw error
    }
  }

  const resetAvatar = () => {
    setUser(prev => ({ ...prev, avatar_url: null }))
    setUploadStatus('Avatar đã được reset')
    setTimeout(() => setUploadStatus(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Test Avatar Upload
          </h1>

          {/* Status Message */}
          {uploadStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              {uploadStatus}
            </div>
          )}

          {/* Profile Section */}
          <div className="text-center mb-8">
            <UserAvatar
              src={user.avatar_url}
              name={user.name}
              role={user.role}
              size="xl"
              showInitials={true}
              onAvatarUpload={handleAvatarUpload}
              clickable={true}
              className="mx-auto mb-4 border-4 border-blue-200 hover:border-blue-300 transition-colors"
            />
            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">
              {user.avatar_url ? 'Có avatar tùy chỉnh' : 'Sử dụng avatar mặc định'}
            </p>

            <button
              onClick={resetAvatar}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset Avatar
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Hướng dẫn sử dụng:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Click vào avatar để mở modal upload</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Chọn file hình ảnh (JPG, PNG, GIF, tối đa 5MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Xem preview và click "Cập nhật" để upload</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Click "Reset Avatar" để trở về avatar mặc định</span>
              </li>
            </ul>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserAvatar
                src={null}
                name="Không có tên"
                size="lg"
                showInitials={false}
                className="mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Không có tên<br/>Avatar mặc định</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserAvatar
                src={null}
                name="Nguyễn Văn B"
                size="lg"
                showInitials={true}
                className="mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Có tên<br/>Hiện chữ cái đầu</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserAvatar
                src="/images/avatars/avt.jpg"
                name="Có avatar"
                size="lg"
                showInitials={true}
                className="mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">Có URL avatar<br/>Hiện ảnh</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserAvatar
                src={null}
                name="Click Me"
                role="MENTOR"
                size="lg"
                showInitials={true}
                onAvatarUpload={handleAvatarUpload}
                clickable={true}
                className="mx-auto mb-2 cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400"
              />
              <p className="text-sm text-gray-600">Clickable<br/>Có thể upload</p>
            </div>
          </div>

          {/* Current State */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Trạng thái hiện tại:</h4>
            <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-auto">
{JSON.stringify({
  name: user.name,
  avatar_url: user.avatar_url,
  role: user.role,
  hasAvatar: !!user.avatar_url
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
