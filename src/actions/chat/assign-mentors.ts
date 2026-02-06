'use server';

import { prisma } from '@/lib/prisma';
import { MentorType, RoomType } from '@prisma/client';

interface AssignMentorsInput {
  studentId: string;
  mentorASId: string;
  mentorACSId: string;
  mentorARDId: string;
  createdBy: string;
}

export async function assignMentorsToStudent(input: AssignMentorsInput) {
  try {
    const { studentId, mentorASId, mentorACSId, mentorARDId, createdBy } = input;

    // Validate tất cả users tồn tại
    const [student, mentorAS, mentorACS, mentorARD, creator] = await Promise.all([
      prisma.users.findUnique({ where: { id: studentId } }),
      prisma.users.findUnique({ where: { id: mentorASId } }),
      prisma.users.findUnique({ where: { id: mentorACSId } }),
      prisma.users.findUnique({ where: { id: mentorARDId } }),
      prisma.users.findUnique({ where: { id: createdBy } }),
    ]);

    if (!student || !mentorAS || !mentorACS || !mentorARD || !creator) {
      throw new Error('Một hoặc nhiều user không tồn tại');
    }

    if (student.role !== 'STUDENT') {
      throw new Error('User được chọn không phải là học viên');
    }

    if (mentorAS.role !== 'MENTOR' || mentorACS.role !== 'MENTOR' || mentorARD.role !== 'MENTOR') {
      throw new Error('Một hoặc nhiều user được chọn không phải là mentor');
    }

    // Thực hiện transaction để tạo assignment và chat rooms
    // Tăng timeout lên 10s để tránh lỗi với Supabase connection pooling
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo mentor assignments (mỗi mentor type một assignment riêng)
      const assignmentAS = await tx.mentor_assignments.create({
        data: {
          student_id: studentId,
          mentor_id: mentorASId,
          type: MentorType.AS,
          status: 'ACTIVE',
        },
      });

      const assignmentACS = await tx.mentor_assignments.create({
        data: {
          student_id: studentId,
          mentor_id: mentorACSId,
          type: MentorType.ACS,
          status: 'ACTIVE',
        },
      });

      const assignmentARD = await tx.mentor_assignments.create({
        data: {
          student_id: studentId,
          mentor_id: mentorARDId,
          type: MentorType.ARD,
          status: 'ACTIVE',
        },
      });

      // 2. Tạo phòng AS
      const roomAS = await tx.chat_rooms.create({
        data: {
          name: `${student.full_name} - Mentor AS`,
          type: RoomType.PRIVATE,
          student_id: studentId,
          mentor_type: MentorType.AS,
          participants: {
            create: [
              { user_id: studentId },
              { user_id: mentorASId },
            ],
          },
        },
      });

      // 3. Tạo phòng ACS
      const roomACS = await tx.chat_rooms.create({
        data: {
          name: `${student.full_name} - Mentor ACS`,
          type: RoomType.PRIVATE,
          student_id: studentId,
          mentor_type: MentorType.ACS,
          participants: {
            create: [
              { user_id: studentId },
              { user_id: mentorACSId },
            ],
          },
        },
      });

      // 4. Tạo phòng ARD
      const roomARD = await tx.chat_rooms.create({
        data: {
          name: `${student.full_name} - Mentor ARD`,
          type: RoomType.PRIVATE,
          student_id: studentId,
          mentor_type: MentorType.ARD,
          participants: {
            create: [
              { user_id: studentId },
              { user_id: mentorARDId },
            ],
          },
        },
      });

      // 5. Tạo phòng Group
      const groupRoom = await tx.chat_rooms.create({
        data: {
          name: `${student.full_name} - Group Mentor`,
          type: RoomType.GROUP,
          student_id: studentId,
          participants: {
            create: [
              { user_id: studentId },
              { user_id: mentorASId },
              { user_id: mentorACSId },
              { user_id: mentorARDId },
            ],
          },
        },
      });

      return {
        assignments: [assignmentAS, assignmentACS, assignmentARD],
        rooms: [roomAS, roomACS, roomARD, groupRoom],
      };
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 20000, // 20 seconds
    });

    return {
      success: true,
      data: result,
      message: 'Đã gán mentor và tạo phòng chat thành công',
    };
  } catch (error: unknown) {
    console.error('Error assigning mentors:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gán mentor',
    };
  }
}

export async function closeChatRooms(studentId: string) {
  try {
    await prisma.chat_rooms.updateMany({
      where: {
        student_id: studentId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CLOSED',
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Đã đóng tất cả phòng chat',
    };
  } catch (error: unknown) {
    console.error('Error closing chat rooms:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function softDeleteChatRooms(studentId: string) {
  try {
    await prisma.chat_rooms.updateMany({
      where: {
        student_id: studentId,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Đã xóa mềm tất cả phòng chat',
    };
  } catch (error: unknown) {
    console.error('Error soft deleting chat rooms:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
