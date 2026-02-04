import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Tự động đánh dấu hoàn thành task trong checklist dựa trên đường dẫn (link_to)
 * @param studentId ID của học viên (UUID)
 * @param pathKeyword Từ khóa trong link_to để xác định task (vd: 'mbti', 'grit', 'riasec')
 */
export async function autoCompleteChecklistTask(studentId: string, pathKeyword: string) {
  try {
    console.log(`🤖 [ChecklistAuto] Searching for task with link containing: "${pathKeyword}" for student: ${studentId}`);

    // 1. Tìm task có link_to chứa keyword
    const task = await prisma.checklist_tasks.findFirst({
      where: {
        link_to: {
          contains: pathKeyword,
          mode: 'insensitive',
        },
      },
    });

    if (!task) {
      console.warn(`⚠️ [ChecklistAuto] No checklist task found containing link keyword: "${pathKeyword}"`);
      return { success: false, message: 'Task not found' };
    }

    console.log(`✅ [ChecklistAuto] Found task: "${task.title}" (ID: ${task.id})`);

    // 2. Cập nhật trạng thái hoàn thành cho học viên
    const progress = await prisma.student_task_progress.upsert({
      where: {
        student_id_task_id: {
          student_id: studentId,
          task_id: task.id,
        },
      },
      create: {
        student_id: studentId,
        task_id: task.id,
        status: TaskStatus.COMPLETED,
        completed_at: new Date(),
      },
      update: {
        status: TaskStatus.COMPLETED,
        completed_at: new Date(),
      },
    });

    console.log(`🎉 [ChecklistAuto] Marked task "${task.title}" as COMPLETED for student ${studentId}`);

    // 3. Revalidate cache để UI cập nhật ngay lập tức
    // Lưu ý: Path có thể khác tùy thuộc vào cấu trúc routing của bạn
    revalidatePath('/student/checklist');
    revalidatePath('/dashboard/checklist');

    return { success: true, task: task.title };
  } catch (error) {
    console.error('❌ [ChecklistAuto] Error auto-completing task:', error);
    return { success: false, error };
  }
}
