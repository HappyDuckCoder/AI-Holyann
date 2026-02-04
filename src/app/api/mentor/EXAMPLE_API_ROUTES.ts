/**
 * Mentor Dashboard API Routes - Example Implementation
 * 
 * These are example API routes to help integrate the Mentor Dashboard UI
 * with your database. Replace the mock data with actual Prisma queries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// ==================== EXAMPLE 1: GET DASHBOARD STATS ====================

/**
 * GET /api/mentor/dashboard/stats
 * Returns statistics for the mentor dashboard
 */
export async function getDashboardStats(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;

    // Query 1: Count active students
    const activeStudentsCount = await prisma.mentor_assignments.count({
      where: {
        mentor_id: mentorId,
        status: 'ACTIVE',
      },
    });

    // Query 2: Count weekly deadlines (example - requires tasks table)
    // const weekStart = new Date();
    // const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // const weeklyDeadlines = await prisma.mentor_tasks.count({
    //   where: {
    //     mentor_id: mentorId,
    //     deadline: {
    //       gte: weekStart,
    //       lte: weekEnd,
    //     },
    //   },
    // });

    // Query 3: Get mentor rating
    const mentor = await prisma.mentors.findUnique({
      where: { user_id: mentorId },
      select: { rating: true },
    });

    return NextResponse.json({
      totalActiveStudents: activeStudentsCount,
      weeklyDeadlines: 0, // TODO: Implement tasks table
      averageRating: mentor?.rating || 5.0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==================== EXAMPLE 2: GET ASSIGNED STUDENTS ====================

/**
 * GET /api/mentor/students
 * Returns list of students assigned to the mentor
 */
export async function getAssignedStudents(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;

    const assignments = await prisma.mentor_assignments.findMany({
      where: {
        mentor_id: mentorId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            users: {
              select: {
                full_name: true,
                email: true,
                avatar_url: true,
                phone_number: true,
              },
            },
          },
        },
      },
    });

    // Transform data to match frontend type
    const students = assignments.map((assignment) => ({
      student_id: assignment.student_id,
      assignment_id: assignment.id,
      type: assignment.type,
      status: assignment.status,
      student: {
        full_name: assignment.student.users.full_name,
        email: assignment.student.users.email,
        avatar_url: assignment.student.users.avatar_url,
        phone_number: assignment.student.users.phone_number,
      },
      progress: 0, // TODO: Calculate actual progress
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==================== EXAMPLE 3: GET STUDENT DETAIL ====================

/**
 * GET /api/mentor/student/[id]
 * Returns detailed information about a specific student
 */
export async function getStudentDetail(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;
    const studentId = params.id;

    // Verify mentor has access to this student
    const assignment = await prisma.mentor_assignments.findFirst({
      where: {
        mentor_id: mentorId,
        student_id: studentId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Student not found or access denied' },
        { status: 404 }
      );
    }

    // Get student details
    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      include: {
        users: {
          select: {
            full_name: true,
            email: true,
            phone_number: true,
            avatar_url: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: studentId,
      full_name: student?.users.full_name,
      email: student?.users.email,
      phone_number: student?.users.phone_number,
      avatar_url: student?.users.avatar_url,
    });
  } catch (error) {
    console.error('Error fetching student detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==================== EXAMPLE 4: UPDATE MENTOR PROFILE ====================

/**
 * PUT /api/mentor/profile
 * Updates mentor profile information
 */
export async function updateMentorProfile(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;
    const body = await req.json();

    // Update users table
    if (body.full_name || body.phone_number || body.avatar_url) {
      await prisma.users.update({
        where: { id: mentorId },
        data: {
          full_name: body.full_name,
          phone_number: body.phone_number,
          avatar_url: body.avatar_url,
        },
      });
    }

    // Update mentors table
    if (
      body.bio ||
      body.university_name ||
      body.current_company ||
      body.expertises ||
      body.outstanding_achievements
    ) {
      await prisma.mentors.update({
        where: { user_id: mentorId },
        data: {
          bio: body.bio,
          linkedin_url: body.linkedin_url,
          website_url: body.website_url,
          university_name: body.university_name,
          degree: body.degree,
          major: body.major,
          graduation_year: body.graduation_year,
          current_company: body.current_company,
          current_job_title: body.current_job_title,
          years_of_experience: body.years_of_experience,
          expertises: body.expertises,
          outstanding_achievements: body.outstanding_achievements,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==================== EXAMPLE 5: TASK MANAGEMENT (Requires Tasks Table) ====================

/**
 * NOTE: This requires creating a new table in your Prisma schema:
 * 
 * model mentor_tasks {
 *   id          String   @id @default(uuid()) @db.Uuid
 *   student_id  String   @db.Uuid
 *   mentor_id   String   @db.Uuid
 *   task_name   String   @db.VarChar(255)
 *   description String?  @db.Text
 *   deadline    DateTime? @db.Timestamp(6)
 *   status      String   @default("PENDING") // PENDING, IN_REVIEW, COMPLETED
 *   created_at  DateTime @default(now()) @db.Timestamp(6)
 *   updated_at  DateTime @updatedAt @db.Timestamp(6)
 *   
 *   student     students @relation(fields: [student_id], references: [user_id])
 *   mentor      mentors  @relation(fields: [mentor_id], references: [user_id])
 * }
 */

/**
 * GET /api/mentor/student/[id]/tasks
 * Returns tasks for a specific student
 */
export async function getStudentTasks(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement after creating tasks table
    // const tasks = await prisma.mentor_tasks.findMany({
    //   where: {
    //     student_id: params.id,
    //     mentor_id: session.user.id,
    //   },
    //   orderBy: { deadline: 'asc' },
    // });
    //
    // return NextResponse.json(tasks);

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentor/student/[id]/tasks
 * Creates a new task for a student
 */
export async function createStudentTask(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // TODO: Implement after creating tasks table
    // const task = await prisma.mentor_tasks.create({
    //   data: {
    //     student_id: params.id,
    //     mentor_id: session.user.id,
    //     task_name: body.task_name,
    //     description: body.description,
    //     deadline: body.deadline ? new Date(body.deadline) : null,
    //     status: 'PENDING',
    //   },
    // });
    //
    // return NextResponse.json(task);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating student task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mentor/student/[studentId]/tasks/[taskId]
 * Updates an existing task
 */
export async function updateStudentTask(
  req: NextRequest,
  { params }: { params: { studentId: string; taskId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // TODO: Implement after creating tasks table
    // const task = await prisma.mentor_tasks.update({
    //   where: { id: params.taskId },
    //   data: {
    //     deadline: body.deadline ? new Date(body.deadline) : null,
    //     status: body.status,
    //   },
    // });
    //
    // return NextResponse.json(task);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Verify mentor has access to a specific student
 */
async function verifyMentorAccess(mentorId: string, studentId: string) {
  const assignment = await prisma.mentor_assignments.findFirst({
    where: {
      mentor_id: mentorId,
      student_id: studentId,
    },
  });

  return !!assignment;
}

/**
 * Calculate student progress (example implementation)
 */
async function calculateStudentProgress(studentId: string): Promise<number> {
  // TODO: Implement based on your business logic
  // Example: Count completed tasks / total tasks
  
  // const totalTasks = await prisma.mentor_tasks.count({
  //   where: { student_id: studentId },
  // });
  // 
  // const completedTasks = await prisma.mentor_tasks.count({
  //   where: {
  //     student_id: studentId,
  //     status: 'COMPLETED',
  //   },
  // });
  // 
  // return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return 0;
}
