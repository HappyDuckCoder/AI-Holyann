'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { MentorType } from '@prisma/client'

// Schema validation input
const CreateMentorSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  specialization: z.nativeEnum(MentorType, {
    errorMap: (issue, ctx) => ({ message: 'Chuyên môn không hợp lệ' }),
  }),
})

export type CreateMentorState = {
  success?: boolean
  message?: string
  errors?: {
    fullName?: string[]
    email?: string[]
    password?: string[]
    specialization?: string[]
  }
}

export async function createMentorAction(
  prevState: CreateMentorState,
  formData: FormData
): Promise<CreateMentorState> {
  // 1. Auth Check - Chỉ user có role ADMIN mới gọi được action này
  const session = await getServerSession(authOptions)

  // Note: Cần đảm bảo logic check role ở đây.
  // authOptions callback session đã map role vào session.user.role
  const userRole = (session?.user as any)?.role

  if (!session || userRole !== 'ADMIN') {
    return {
      success: false,
      message: 'Unauthorized: Bạn không có quyền thực hiện hành động này.',
    }
  }

  // 2. Parse & Validate Data
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    specialization: formData.get('specialization'),
  }

  const validatedFields = CreateMentorSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const data = validatedFields.data

  try {
    // 3. Logic Database

    // Kiểm tra email tồn tại
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return {
        success: false,
        message: 'Email này đã được sử dụng trong hệ thống.',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Transaction tạo User và Mentor Profile
    await prisma.$transaction(async (tx) => {
      // 1. Tạo User
      const newUser = await tx.users.create({
        data: {
          full_name: data.fullName,
          email: data.email,
          password_hash: hashedPassword,
          role: 'MENTOR', // Fix cứng role
          auth_provider: 'LOCAL',
          is_active: true,
        },
      })

      // 2. Tạo Mentor Profile (Chỉ điền những cái bắt buộc)
      await tx.mentors.create({
        data: {
          user_id: newUser.id,
          specialization: data.specialization, // Admin chọn cái này
          // Các trường khác như bio, university... không cần truyền, nó sẽ tự là null/default
        },
      })

      return newUser
    })

    // 4. Revalidate cache
    revalidatePath('/admin/mentors')

    return {
      success: true,
      message: 'Tạo tài khoản Mentor thành công!',
    }

  } catch (error) {
    console.error('Create Mentor Error:', error)
    return {
      success: false,
      message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    }
  }
}
