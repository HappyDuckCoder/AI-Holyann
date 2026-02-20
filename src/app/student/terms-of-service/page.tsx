'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  ArrowLeft,
  FileText,
  AlertCircle,
  Shield,
  Users,
  BookOpen,
  Scale,
  Mail,
  Phone,
  Ban,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

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
      if (scrollPosition >= scrollHeight - 50) setHasScrolledToBottom(true)
    }
    const el = contentRef.current
    if (el) {
      handleScroll()
      el.addEventListener('scroll', handleScroll)
      return () => el.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleAgreeChange = (checked: boolean) => {
    if (!hasScrolledToBottom) {
      toast.warning('Vui lòng đọc hết nội quy', {
        description: 'Bạn cần scroll đến cuối trang để xác nhận đã đọc hết nội dung',
      })
      return
    }
    setHasAgreed(checked)
  }

  const handleSubmit = async () => {
    if (!hasAgreed) {
      toast.error('Vui lòng xác nhận đồng ý', {
        description: 'Bạn cần tick vào ô đồng ý để tiếp tục',
      })
      return
    }
    if (!session?.user?.id) {
      toast.error('Chưa đăng nhập', { description: 'Vui lòng đăng nhập để tiếp tục' })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/checklist/complete-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: session.user.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Hoàn thành!', {
          description: 'Bạn đã đọc và đồng ý với nội quy của Holyann Explore',
        })
        setTimeout(() => router.push('/student/checklist'), 1000)
      } else {
        toast.error('Có lỗi xảy ra', { description: data.error || 'Vui lòng thử lại' })
      }
    } catch {
      toast.error('Lỗi kết nối', { description: 'Không thể kết nối đến server' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 pb-12 overflow-x-hidden">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link
          href="/student/checklist"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </motion.div>

      {/* Header banner – giống dashboard */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden mb-8 border border-primary/20 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--tw-gradient-from),transparent)] from-primary/25 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 4L4 20v20l26 16 26-16V20L30 4z' fill='none' stroke='%230f4c81' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
            <FileText className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-primary/90">
              Hiệu lực từ ngày 04/02/2026
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
              Điều khoản sử dụng & Chính sách bảo mật
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              Chào mừng bạn đến với Holyann Explore — nền tảng hỗ trợ du học toàn diện sử dụng công nghệ AI.
              Trước khi sử dụng dịch vụ, vui lòng đọc kỹ các điều khoản và nội quy dưới đây.
            </p>
          </div>
        </div>
      </motion.header>

      {/* Content card – scrollable */}
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <div
          ref={contentRef}
          className="max-h-[60vh] overflow-y-auto p-6 sm:p-8"
          aria-label="Nội dung điều khoản"
        >
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {/* I. Quyền và Nghĩa vụ */}
            <motion.section variants={itemVariant}>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/5 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg m-0">I. Quyền và Nghĩa vụ của Học viên</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-primary">1.1.</span> Quyền của Học viên
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm leading-relaxed">
                      <li>Được sử dụng các tính năng, công cụ và dịch vụ của Holyann Explore theo gói dịch vụ đã đăng ký.</li>
                      <li>Được bảo mật thông tin cá nhân theo quy định pháp luật Việt Nam hiện hành.</li>
                      <li>Được hỗ trợ, tư vấn bởi đội ngũ Ban cố vấn chuyên nghiệp theo phạm vi dịch vụ đăng ký.</li>
                      <li>Được sử dụng các công cụ AI để: phân tích hồ sơ học thuật; gợi ý ngành học, trường học, lộ trình phù hợp.</li>
                      <li>Được cập nhật các thông tin mới liên quan đến du học, học bổng và chương trình đào tạo.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-primary">1.2.</span> Nghĩa vụ của Học viên
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm leading-relaxed">
                      <li>Cung cấp thông tin cá nhân, học thuật trung thực, chính xác và đầy đủ.</li>
                      <li>Tự chịu trách nhiệm đối với mọi thông tin, tài liệu đã cung cấp trên nền tảng.</li>
                      <li>Bảo mật thông tin đăng nhập (email, mật khẩu); Holyann Explore không chịu trách nhiệm đối với các thiệt hại phát sinh do lộ thông tin từ phía học viên.</li>
                      <li>Không chia sẻ, cho mượn hoặc chuyển nhượng tài khoản dưới mọi hình thức.</li>
                      <li>Tuân thủ hướng dẫn của Ban cố vấn và quy trình của hệ thống.</li>
                      <li>Hoàn thành các bài kiểm tra đánh giá năng lực theo yêu cầu.</li>
                      <li>Tôn trọng và không xâm phạm quyền sở hữu trí tuệ của Holyann Explore và bên thứ ba.</li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </motion.section>

            {/* II. Quy định sử dụng dịch vụ */}
            <motion.section variants={itemVariant}>
              <div className="rounded-xl border border-border bg-card overflow-hidden border-l-4 border-l-emerald-500/60 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <CardHeader className="px-5 py-4 border-b border-border bg-emerald-500/5 flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold m-0">II. Quy định Sử dụng Dịch vụ</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1.5">2.1. Bài kiểm tra và công cụ AI</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Các bài kiểm tra (MBTI, Grit Scale, RIASEC...) chỉ được thực hiện <strong>một (01) lần</strong>, trừ khi có thông báo khác từ Holyann Explore.</li>
                      <li>Nghiêm cấm: gian lận; nhờ người khác làm hộ; sao chép, phát tán nội dung bài kiểm tra.</li>
                      <li>Kết quả do AI cung cấp chỉ mang tính tham khảo, không thay thế tư vấn chuyên môn hay quyết định học thuật/pháp lý. Holyann không chịu trách nhiệm đối với quyết định của học viên dựa hoàn toàn trên kết quả AI.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1.5">2.2. Tương tác với Ban cố vấn</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Sử dụng ngôn từ lịch sự, tôn trọng; đặt câu hỏi rõ ràng, đúng trọng tâm.</li>
                      <li>Không spam, quấy rối hoặc gây áp lực cho Ban cố vấn.</li>
                      <li>Tuân thủ lịch hẹn tư vấn; hủy/đổi lịch phải thông báo trước theo quy định.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1.5">2.3. Quản lý hồ sơ và dữ liệu</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Học viên có trách nhiệm cập nhật hồ sơ học thuật đầy đủ, chính xác.</li>
                      <li>Tài liệu tải lên phải đúng định dạng yêu cầu và không vi phạm pháp luật Việt Nam.</li>
                      <li>Holyann Explore có quyền từ chối hoặc xóa nội dung không phù hợp mà không cần báo trước.</li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </motion.section>

            {/* III. Chính sách bảo mật */}
            <motion.section variants={itemVariant}>
              <div className="rounded-xl border border-border overflow-hidden border-l-4 border-l-sky-500/60 bg-gradient-to-br from-sky-500/5 to-transparent">
                <CardHeader className="px-5 py-4 border-b border-border bg-sky-500/5 flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold m-0">III. Chính sách Bảo mật Thông tin</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-muted-foreground text-sm mb-3">Holyann Explore cam kết bảo mật thông tin học viên:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Áp dụng các biện pháp kỹ thuật và quản lý cần thiết để bảo vệ dữ liệu cá nhân.</li>
                    <li>Mã hóa và lưu trữ thông tin một cách an toàn.</li>
                    <li>Không cung cấp thông tin cá nhân cho bên thứ ba khi chưa có sự đồng ý của học viên, trừ trường hợp pháp luật có quy định khác.</li>
                    <li>Sử dụng dữ liệu nhằm mục đích: vận hành hệ thống, nâng cao chất lượng dịch vụ, cải thiện trải nghiệm người dùng.</li>
                    <li>Học viên có quyền yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân theo quy định pháp luật.</li>
                  </ul>
                </CardContent>
              </div>
            </motion.section>

            {/* IV. Các hành vi bị nghiêm cấm */}
            <motion.section variants={itemVariant}>
              <div className="rounded-xl border border-border overflow-hidden border-l-4 border-l-amber-500/60 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardHeader className="px-5 py-4 border-b border-border bg-amber-500/5 flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    <Ban className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold m-0">IV. Các Hành vi Bị Nghiêm cấm</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-foreground font-medium text-sm mb-2">Học viên <strong>KHÔNG ĐƯỢC</strong> thực hiện các hành vi sau:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Sử dụng nền tảng cho mục đích thương mại trái phép.</li>
                    <li>Tấn công, hack, xâm nhập hoặc gây ảnh hưởng đến hệ thống Holyann Explore.</li>
                    <li>Phát tán thông tin sai sự thật, gây hoang mang hoặc ảnh hưởng đến uy tín Holyann Explore.</li>
                    <li>Sử dụng bot, script hoặc công cụ tự động không được phép.</li>
                    <li>Mạo danh cá nhân, tổ chức khác.</li>
                    <li>Quấy rối, xúc phạm Ban cố vấn, nhân sự Holyann Explore hoặc học viên khác.</li>
                  </ul>
                  <p className="text-muted-foreground text-sm mt-3">
                    Holyann Explore có quyền tạm khóa hoặc chấm dứt tài khoản vĩnh viễn mà không hoàn lại phí đối với các hành vi vi phạm nghiêm trọng.
                  </p>
                </CardContent>
              </div>
            </motion.section>

            {/* V. Điều khoản pháp lý */}
            <motion.section variants={itemVariant}>
              <div className="rounded-xl border border-border overflow-hidden border-l-4 border-l-violet-500/60 bg-gradient-to-br from-violet-500/5 to-transparent">
                <CardHeader className="px-5 py-4 border-b border-border bg-violet-500/5 flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-700 dark:text-violet-400">
                    <Scale className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold m-0">V. Điều khoản Pháp lý</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-1 text-muted-foreground text-sm">
                  <p>Điều khoản được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>
                  <p>Mọi tranh chấp ưu tiên giải quyết qua thương lượng; nếu không đạt thỏa thuận, sẽ được đưa ra cơ quan có thẩm quyền tại Việt Nam.</p>
                  <p>Holyann Explore có quyền sửa đổi, bổ sung nội quy và điều khoản mà không cần báo trước. Phiên bản cập nhật sẽ được công bố trên nền tảng. Học viên có trách nhiệm theo dõi và cập nhật các thay đổi này.</p>
                </CardContent>
              </div>
            </motion.section>

            {/* VI. Thông tin liên hệ */}
            <motion.section variants={itemVariant}>
              <div className="rounded-xl border border-border overflow-hidden border-l-4 border-l-primary/60 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="px-5 py-4 border-b border-border bg-primary/5 flex flex-row items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold m-0">VI. Thông tin Liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Đơn vị vận hành:</strong> Holyann Technology</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> quanlyhv.holyann@gmail.com</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> Hotline: 1900-xxxx</p>
                  </div>
                </CardContent>
              </div>
            </motion.section>

            {/* Scroll cue */}
            {!hasScrolledToBottom ? (
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-6 pb-2 text-center">
                <p className="text-xs text-muted-foreground animate-pulse">
                  ↓ Vui lòng scroll xuống để đọc hết nội dung ↓
                </p>
              </div>
            ) : (
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500/10 to-transparent pt-6 pb-2 text-center">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Bạn đã đọc hết nội dung. Có thể đồng ý bên dưới.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Agreement & submit – footer of card */}
        <div className="border-t border-border p-5 sm:p-6 bg-muted/30">
          <div className="flex items-start gap-3 mb-4">
            <button
              type="button"
              onClick={() => handleAgreeChange(!hasAgreed)}
              disabled={!hasScrolledToBottom}
              className={`shrink-0 mt-0.5 transition-all duration-200 ${
                hasScrolledToBottom ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'
              }`}
              aria-label={hasAgreed ? 'Bỏ chọn đồng ý' : 'Đồng ý điều khoản'}
            >
              {hasAgreed ? (
                <CheckSquare className="h-6 w-6 text-primary fill-primary" strokeWidth={2} />
              ) : (
                <span
                  className={`block h-6 w-6 rounded-md border-2 ${
                    hasScrolledToBottom
                      ? 'border-primary/50 hover:border-primary bg-background'
                      : 'border-muted-foreground/50 bg-muted/50'
                  }`}
                />
              )}
            </button>
            <label
              onClick={() => hasScrolledToBottom && handleAgreeChange(!hasAgreed)}
              className={`text-sm text-foreground select-none ${
                hasScrolledToBottom ? 'cursor-pointer hover:text-primary/90' : 'cursor-not-allowed opacity-60'
              }`}
            >
              Tôi đã đọc, hiểu rõ và đồng ý với <strong>Điều khoản & Nội quy</strong> của Holyann Explore.
              Tôi cam kết tuân thủ các quy định trên khi sử dụng nền tảng.
            </label>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAgreed || isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold text-primary-foreground transition-all duration-200 ${
              hasAgreed && !isSubmitting
                ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              'Xác nhận và Tiếp tục'
            )}
          </button>
          {!hasScrolledToBottom && (
            <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
              Bạn cần scroll đến cuối trang để có thể đồng ý.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
