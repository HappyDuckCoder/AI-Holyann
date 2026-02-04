'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckSquare, ArrowLeft, FileText, AlertCircle, Shield, Users, Book, Scale } from 'lucide-react'
import { toast } from 'sonner'

export default function TermsOfServicePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const scrollPosition = scrollTop + clientHeight
      const isAtBottom = scrollPosition >= scrollHeight - 50

      // Debug logging
      console.log('📜 Scroll Debug:', {
        scrollTop,
        clientHeight,
        scrollHeight,
        scrollPosition,
        threshold: scrollHeight - 50,
        isAtBottom
      })

      if (isAtBottom) {
        setHasScrolledToBottom(true)
        console.log('✅ Reached bottom!')
      }
    }

    const currentRef = contentRef.current
    if (currentRef) {
      // Check immediately on mount (in case content is short)
      handleScroll()

      currentRef.addEventListener('scroll', handleScroll)
      return () => currentRef.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleAgreeChange = (checked: boolean) => {
    if (!hasScrolledToBottom) {
      toast.warning('Vui lòng đọc hết nội quy', {
        description: 'Bạn cần scroll đến cuối trang để xác nhận đã đọc hết nội dung'
      })
      return
    }
    setHasAgreed(checked)
  }

  const handleSubmit = async () => {
    if (!hasAgreed) {
      toast.error('Vui lòng xác nhận đồng ý', {
        description: 'Bạn cần tick vào ô đồng ý để tiếp tục'
      })
      return
    }

    if (!session?.user?.id) {
      toast.error('Chưa đăng nhập', {
        description: 'Vui lòng đăng nhập để tiếp tục'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checklist/complete-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: session.user.id,
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Hoàn thành!', {
          description: 'Bạn đã đọc và đồng ý với nội quy của HOEX'
        })

        // Chờ 1 giây để người dùng thấy thông báo rồi redirect
        setTimeout(() => {
          router.push('/student/checklist')
        }, 1000)
      } else {
        toast.error('Có lỗi xảy ra', {
          description: data.error || 'Vui lòng thử lại'
        })
      }
    } catch (error) {
      console.error('Error completing terms:', error)
      toast.error('Lỗi kết nối', {
        description: 'Không thể kết nối đến server'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Nội quy & Điều khoản sử dụng
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Holyann Explore (HOEX) - Nền tảng Hỗ trợ Du học
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content với scroll */}
        <div
          ref={contentRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="max-h-[600px] overflow-y-auto p-8 space-y-6">
            {/* Giới thiệu */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="text-blue-500" size={24} />
                Giới thiệu
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Chào mừng bạn đến với <strong>Holyann Explore (HOEX)</strong> - nền tảng hỗ trợ du học toàn diện
                sử dụng công nghệ AI tiên tiến. Trước khi sử dụng dịch vụ, vui lòng đọc kỹ các điều khoản và
                nội quy dưới đây.
              </p>
            </section>

            {/* Quyền và trách nhiệm của học viên */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="text-purple-500" size={24} />
                1. Quyền và Trách nhiệm của Học viên
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="pl-4 border-l-4 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2">1.1. Quyền lợi</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Được sử dụng đầy đủ các tính năng của nền tảng HOEX</li>
                    <li>Được bảo mật thông tin cá nhân theo quy định</li>
                    <li>Được hỗ trợ từ đội ngũ mentor chuyên nghiệp</li>
                    <li>Được sử dụng công cụ AI để phân tích hồ sơ và gợi ý trường học</li>
                    <li>Được cập nhật các thông tin mới nhất về du học</li>
                  </ul>
                </div>

                <div className="pl-4 border-l-4 border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2">1.2. Trách nhiệm</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Cung cấp thông tin chính xác và trung thực</li>
                    <li>Bảo mật thông tin đăng nhập (email/password)</li>
                    <li>Không chia sẻ tài khoản cho người khác</li>
                    <li>Tuân thủ các hướng dẫn từ mentor và hệ thống</li>
                    <li>Hoàn thành đầy đủ các bài test đánh giá năng lực</li>
                    <li>Tôn trọng quyền sở hữu trí tuệ của nền tảng</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Quy định sử dụng dịch vụ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Book className="text-green-500" size={24} />
                2. Quy định Sử dụng Dịch vụ
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">2.1. Sử dụng bài test và công cụ AI</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Các bài test (MBTI, Grit Scale, RIASEC) chỉ được làm <strong>một lần</strong></li>
                    <li>Không được gian lận hoặc làm giúp người khác</li>
                    <li>Kết quả AI chỉ mang tính chất tham khảo</li>
                    <li>Không sao chép hoặc phát tán nội dung bài test</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">2.2. Tương tác với Mentor</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Sử dụng ngôn từ lịch sự, tôn trọng</li>
                    <li>Đặt câu hỏi rõ ràng, cụ thể</li>
                    <li>Không spam tin nhắn</li>
                    <li>Tuân thủ lịch hẹn tư vấn</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">2.3. Quản lý hồ sơ và dữ liệu</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Cập nhật thông tin học thuật đầy đủ và chính xác</li>
                    <li>Upload các file đúng định dạng yêu cầu</li>
                    <li>Không upload nội dung vi phạm pháp luật</li>
                    <li>Chịu trách nhiệm với thông tin đã cung cấp</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Chính sách bảo mật */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="text-red-500" size={24} />
                3. Chính sách Bảo mật
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>HOEX cam kết bảo vệ thông tin cá nhân của học viên:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Thông tin cá nhân được mã hóa và lưu trữ an toàn</li>
                  <li>Không chia sẻ thông tin với bên thứ ba khi chưa có sự đồng ý</li>
                  <li>Sử dụng dữ liệu chỉ để cải thiện trải nghiệm người dùng</li>
                  <li>Học viên có quyền yêu cầu xóa dữ liệu cá nhân</li>
                </ul>
              </div>
            </section>

            {/* Điều khoản vi phạm */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-500" size={24} />
                4. Hành vi Bị Cấm
              </h2>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Các hành vi sau đây <strong>NGHIÊM CẤM</strong> và có thể dẫn đến khóa tài khoản:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 dark:text-gray-300">
                  <li>Sử dụng tài khoản cho mục đích thương mại trái phép</li>
                  <li>Hack, tấn công hệ thống</li>
                  <li>Phát tán thông tin sai lệch, gây hoang mang</li>
                  <li>Sử dụng bot, script để thao tác tự động</li>
                  <li>Mạo danh người khác</li>
                  <li>Quấy rối, xúc phạm mentor hoặc học viên khác</li>
                </ul>
              </div>
            </section>

            {/* Điều khoản pháp lý */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Scale className="text-gray-500" size={24} />
                5. Điều khoản Pháp lý
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                <p>
                  Bằng việc sử dụng nền tảng HOEX, bạn đồng ý rằng:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tất cả tranh chấp sẽ được giải quyết theo pháp luật Việt Nam</li>
                  <li>HOEX có quyền thay đổi nội quy mà không cần báo trước</li>
                  <li>Học viên có trách nhiệm cập nhật nội quy định kỳ</li>
                  <li>Mọi thắc mắc vui lòng liên hệ: support@holyann.vn</li>
                </ul>
              </div>
            </section>

            {/* Liên hệ */}
            <section className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Thông tin Liên hệ
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-sm">
                <p className="text-gray-700 dark:text-gray-300"><strong>Công ty:</strong> Holyann Technology</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> support@holyann.vn</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Hotline:</strong> 1900-xxxx</p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Hiệu lực:</strong> Từ ngày 04/02/2026
                </p>
              </div>
            </section>

            {/* Scroll indicator / Success message */}
            {!hasScrolledToBottom ? (
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pt-8 pb-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 animate-bounce">
                  ↓ Vui lòng scroll xuống để đọc hết nội dung ↓
                </p>
              </div>
            ) : (
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-green-50 dark:from-green-900/20 to-transparent pt-8 pb-4 text-center">
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                  <CheckSquare size={16} />
                  ✓ Bạn đã đọc hết nội dung. Có thể đồng ý bên dưới!
                </p>
              </div>
            )}
          </div>

          {/* Agreement checkbox và submit button */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-start gap-3 mb-4">
              <button
                onClick={() => handleAgreeChange(!hasAgreed)}
                disabled={!hasScrolledToBottom}
                className={`flex-shrink-0 transition-all duration-300 ${
                  hasScrolledToBottom 
                    ? 'cursor-pointer hover:scale-110' 
                    : 'cursor-not-allowed opacity-50'
                }`}
              >
                {hasAgreed ? (
                  <CheckSquare
                    size={24}
                    className="fill-cyan-500 stroke-white"
                    strokeWidth={3}
                  />
                ) : (
                  <div className={`w-6 h-6 border-2 rounded ${
                    hasScrolledToBottom 
                      ? 'border-cyan-400 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`} />
                )}
              </button>
              <label
                onClick={() => hasScrolledToBottom && handleAgreeChange(!hasAgreed)}
                className={`text-sm text-gray-700 dark:text-gray-300 select-none ${
                  hasScrolledToBottom ? 'cursor-pointer hover:text-gray-900 dark:hover:text-white' : 'cursor-not-allowed opacity-50'
                }`}
              >
                Tôi đã đọc, hiểu rõ và đồng ý với <strong>Điều khoản & Nội quy</strong> của
                Holyann Explore (HOEX). Tôi cam kết tuân thủ các quy định trên khi sử dụng nền tảng.
                {hasScrolledToBottom && (
                  <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                )}
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!hasAgreed || isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                hasAgreed && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                'Xác nhận và Tiếp tục'
              )}
            </button>

            {!hasScrolledToBottom && (
              <p className="text-xs text-center text-orange-500 dark:text-orange-400 mt-2">
                ⚠️ Bạn cần scroll đến cuối trang để có thể đồng ý
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
