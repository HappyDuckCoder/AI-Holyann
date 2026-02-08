import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { taskId, studentId } = await request.json();

        if (!taskId || !studentId) {
            return NextResponse.json(
                { success: false, error: 'Missing taskId or studentId' },
                { status: 400 }
            );
        }

        if (studentId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        await prisma.student_task_progress.upsert({
            where: {
                student_id_task_id: {
                    student_id: studentId,
                    task_id: taskId,
                },
            },
            update: {
                submission_url: null,
                status: TaskStatus.PENDING,
                completed_at: null,
                updated_at: new Date(),
            },
            create: {
                student_id: studentId,
                task_id: taskId,
                status: TaskStatus.PENDING,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Error clearing submission:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
