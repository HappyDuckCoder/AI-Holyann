"use client"
import { useState } from 'react'
import { ProfilePage } from '@/components/student/profile/ProfilePage'
import { StudentProfile } from '@/components/types'
import { toast } from 'sonner'

export default function TestProfileAvatarPage() {
  const [profile, setProfile] = useState<StudentProfile>({
    id: 'ST123456',
    name: 'Nguyễn Văn A',
    email: 'student@example.com',
    phone: '0123456789',
    address: 'Quận 1, TP.HCM',
    dob: '2000-01-15',
    avatarUrl: '', // No avatar initially - will show default
    gpa: 3.5,
    gpaScale: 4.0,
    englishLevel: 'IELTS 7.0',
    satScore: 1400,
    targetMajor: 'Khoa học máy tính',
    targetCountry: 'Hoa Kỳ',
    extracurriculars: [
      {
        id: '1',
        title: 'Câu lạc bộ lập trình',
        description: 'Thành viên tích cực, tham gia các dự án coding',
        role: 'Thành viên',
        year: '2022-2024'
      },
      {
        id: '2',
        title: 'Tình nguyện viên',
        description: 'Dạy học cho trẻ em vùng cao',
        role: 'Tình nguyện viên',
        year: '2023'
      }
    ],
    achievements: [
      'Giải nhất Olympic Tin học cấp trường',
      'Học bổng xuất sắc 2023',
      'Chứng chỉ Google IT Support'
    ],
    documents: [
      {
        id: '1',
        name: 'Bảng điểm THPT',
        type: 'transcript',
        uploadDate: '2024-01-15',
        size: '2.5 MB'
      },
      {
        id: '2',
        name: 'Chứng chỉ IELTS',
        type: 'certificate',
        uploadDate: '2024-02-01',
        size: '1.2 MB'
      }
    ]
  })

  const handleProfileUpdate = async (updatedFields: Partial<StudentProfile>): Promise<void> => {
    try {

      // Update local state
      setProfile(prev => ({ ...prev, ...updatedFields }))

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Cập nhật thông tin thành công!')

    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Cập nhật thất bại. Vui lòng thử lại.')
      throw error
    }
  }

  const handleEditClick = () => {
    toast.info('Chức năng chỉnh sửa hồ sơ sẽ được triển khai sau')
  }

  const handleUploadDocument = (_file: File, _type: any) => {
    toast.info('Chức năng upload tài liệu sẽ được triển khai sau')
  }

  const handleDeleteDocument = (_id: string) => {
    toast.info('Chức năng xóa tài liệu sẽ được triển khai sau')
  }

  const handleAnalyzeProfile = () => {
    toast.info('Chức năng phân tích hồ sơ AI sẽ được triển khai sau')
  }

  const resetAvatar = () => {
    setProfile(prev => ({ ...prev, avatarUrl: '' }))
    toast.success('Avatar đã được reset về mặc định')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Test Profile Avatar Upload
              </h1>
              <p className="text-gray-600">
                Demo tính năng upload avatar trong giao diện profile
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetAvatar}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Reset Avatar
              </button>
              <a
                href="/test-avatar-upload"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Avatar Component Demo
              </a>
            </div>
          </div>

          {/* Current State Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm">
              <strong>Current Avatar:</strong> {' '}
              {profile.avatarUrl ? (
                <span className="text-green-600">
                  Có avatar tùy chỉnh ({profile.avatarUrl})
                </span>
              ) : (
                <span className="text-orange-600">
                  Sử dụng avatar mặc định
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Page */}
      <ProfilePage
        profile={profile}
        onEditClick={handleEditClick}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onAnalyzeProfile={handleAnalyzeProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}
