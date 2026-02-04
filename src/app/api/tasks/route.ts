import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy tất cả tasks
export async function GET(request: NextRequest) {
  try {
    const tasks = await prisma.checklist_tasks.findMany({
      include: {
        stage: true,
      },
      orderBy: [
        { stage_id: 'asc' },
        { order_index: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Tạo task mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage_id, title, description, link_to, order_index } = body;

    // Validate required fields
    if (!stage_id || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: stage_id and title' },
        { status: 400 }
      );
    }

    // Nếu không có order_index, tự động lấy số lớn nhất + 1
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const lastTask = await prisma.checklist_tasks.findFirst({
        where: { stage_id: parseInt(stage_id) },
        orderBy: { order_index: 'desc' },
      });
      finalOrderIndex = lastTask ? lastTask.order_index + 1 : 1;
    }

    // Create task
    const newTask = await prisma.checklist_tasks.create({
      data: {
        stage_id: parseInt(stage_id),
        title,
        description: description || null,
        link_to: link_to || null,
        order_index: parseInt(finalOrderIndex),
        is_required: true,
      },
      include: {
        stage: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, link_to, order_index, is_required } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (link_to !== undefined) updateData.link_to = link_to;
    if (order_index !== undefined) updateData.order_index = parseInt(order_index);
    if (is_required !== undefined) updateData.is_required = is_required;
    updateData.updated_at = new Date();

    const updatedTask = await prisma.checklist_tasks.update({
      where: { id },
      data: updateData,
      include: {
        stage: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Delete related progress records first
    await prisma.student_task_progress.deleteMany({
      where: { task_id: id },
    });

    // Then delete the task
    await prisma.checklist_tasks.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
