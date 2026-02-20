import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;

    // Get all students assigned to this mentor
    const assignments = await prisma.mentor_assignments.findMany({
      where: {
        mentor_id: mentorId,
        status: 'ACTIVE'
      },
      select: {
        student_id: true
      }
    });

    const studentIds = assignments.map(a => a.student_id);

    if (studentIds.length === 0) {
      return NextResponse.json([]);
    }

    // Calculate date range (today to 5 days from now)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    fiveDaysFromNow.setHours(23, 59, 59, 999);

    // Also include overdue tasks (past deadlines)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get tasks with deadlines within range (including overdue)
    const tasksWithDeadlines = await prisma.student_task_progress.findMany({
      where: {
        student_id: { in: studentIds },
        deadline: {
          gte: sevenDaysAgo,
          lte: fiveDaysFromNow
        },
        status: { in: ['PENDING', 'IN_PROGRESS', 'NEEDS_REVISION'] }
      },
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        },
        student: {
          select: {
            user_id: true,
            users: {
              select: {
                full_name: true
              }
            }
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      },
      take: 10 // Limit to 10 items
    });

    // Process and format the data
    const formattedTasks = tasksWithDeadlines
      .filter(t => t.task && t.deadline)
      .map(t => {
        const deadlineDate = new Date(t.deadline!);
        deadlineDate.setHours(0, 0, 0, 0);

        const diffTime = deadlineDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: t.id,
          task_title: t.task!.title,
          student_name: t.student.users.full_name,
          student_id: t.student_id,
          deadline: t.deadline!.toISOString(),
          status: t.status,
          days_remaining: daysRemaining
        };
      })
      // Sort by days remaining (overdue first, then by urgency)
      .sort((a, b) => a.days_remaining - b.days_remaining);

    return NextResponse.json(formattedTasks);

  } catch (error) {
    console.error('Error fetching urgent deadlines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
