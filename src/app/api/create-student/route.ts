import {NextRequest, NextResponse} from 'next/server'
import {prisma} from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const {user_id} = await request.json()

        if (!user_id) {
            return NextResponse.json({
                success: false,
                error: 'user_id is required'
            }, {status: 400})
        }


        // Check if student already exists using Prisma
        const existingStudent = await prisma.students.findUnique({
            where: {user_id}
        })

        if (existingStudent) {
            return NextResponse.json({
                success: true,
                message: 'Student profile already exists',
                student_id: existingStudent.user_id
            })
        }

        // Create new student profile using Prisma (bypasses RLS)
        const newStudent = await prisma.students.create({
            data: {
                user_id: user_id,
                created_at: new Date(),
                updated_at: new Date()
            }
        })


        return NextResponse.json({
            success: true,
            message: 'Student profile created successfully',
            student_id: user_id
        })

    } catch (error: unknown) {
        console.error('❌ Error in create-student API:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, {status: 500})
    }
}
