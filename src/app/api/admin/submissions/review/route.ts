import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { submissionId, status, mentorNote } = await request.json();

        console.log('📝 Admin: Reviewing submission:', { submissionId, status, mentorNote });

        // Validate input
        if (!submissionId || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['COMPLETED', 'NEEDS_REVISION'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Update submission status
        const updatedSubmission = await prisma.student_task_progress.update({
            where: {
                id: submissionId
            },
            data: {
                status: status,
                mentor_note: mentorNote || null,
                updated_at: new Date(),
                // Set completed_at when approved
                ...(status === 'COMPLETED' && { completed_at: new Date() })
            },
            include: {
                student: {
                    include: {
                        users: {
                            select: {
                                full_name: true,
                                email: true
                            }
                        }
                    }
                },
                task: {
                    select: {
                        title: true
                    }
                }
            }
        });

        const action = status === 'COMPLETED' ? 'approved' : 'requested revision for';
        console.log(`✅ Successfully ${action} submission for student: ${updatedSubmission.student.users.full_name}`);

        // TODO: Send notification to student about the review result
        // This could be email, in-app notification, etc.

        return NextResponse.json({
            success: true,
            message: status === 'COMPLETED' ? 'File đã được duyệt thành công!' : 'Đã gửi yêu cầu chỉnh sửa!',
            submission: updatedSubmission
        });

    } catch (error: unknown) {
        console.error('❌ Error reviewing submission:', error);

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to review submission' },
            { status: 500 }
        );
    }
}
