import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const stages = await prisma.checklist_stages.findMany({
      orderBy: { order_index: 'asc' },
      include: {
        tasks: {
          orderBy: { order_index: 'asc' },
        },
      },
    });

    const totalTasks = stages.reduce((sum, stage) => sum + stage.tasks.length, 0);

    return NextResponse.json({
      success: true,
      message: 'Checklist data fetched successfully',
      data: {
        stageCount: stages.length,
        taskCount: totalTasks,
        stages: stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order_index: stage.order_index,
          taskCount: stage.tasks.length,
          tasks: stage.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            link_to: task.link_to,
            order_index: task.order_index,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching checklist data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'seed') {
      // Check if data already exists
      const existingStages = await prisma.checklist_stages.findMany();
      if (existingStages.length > 0) {
        return NextResponse.json({
          success: false,
          message: `Found ${existingStages.length} existing stages. Use action=reseed to delete and reseed.`,
        });
      }

      // Create stages and tasks
      const stage1 = await prisma.checklist_stages.create({
        data: {
          name: 'Chuẩn bị hồ sơ',
          description: 'Thu thập và chuẩn bị các tài liệu cần thiết cho hồ sơ du học',
          order_index: 1,
          is_default: true,
        },
      });

      const stage2 = await prisma.checklist_stages.create({
        data: {
          name: 'Nộp đơn',
          description: 'Hoàn thiện và nộp đơn ứng tuyển các trường đại học',
          order_index: 2,
          is_default: true,
        },
      });

      const stage3 = await prisma.checklist_stages.create({
        data: {
          name: 'Sau khi được nhận',
          description: 'Các bước cần làm sau khi nhận được thư mời nhập học',
          order_index: 3,
          is_default: true,
        },
      });

      // Stage 1 Tasks
      const stage1TasksData = [
        { title: 'Hoàn thành bài test MBTI', description: 'Làm bài test tính cách MBTI để hiểu rõ hơn về bản thân', link_to: '/dashboard/mbti-test', order_index: 1 },
        { title: 'Hoàn thành bài test GRIT', description: 'Đánh giá khả năng kiên trì và đam mê của bạn', link_to: '/dashboard/grit-test', order_index: 2 },
        { title: 'Hoàn thành bài test RIASEC', description: 'Khám phá sở thích nghề nghiệp và ngành học phù hợp', link_to: '/dashboard/riasec-test', order_index: 3 },
        { title: 'Cập nhật thông tin học thuật', description: 'Điền đầy đủ thông tin về GPA, chứng chỉ tiếng Anh, và các bài test chuẩn hóa', order_index: 4 },
        { title: 'Cập nhật thông tin hoạt động ngoại khóa', description: 'Liệt kê các hoạt động ngoại khóa, câu lạc bộ, và vai trò lãnh đạo', order_index: 5 },
        { title: 'Tải lên bảng điểm (Transcript)', description: 'Upload bảng điểm chính thức từ trường', order_index: 6 },
        { title: 'Chuẩn bị thư giới thiệu', description: 'Liên hệ với giáo viên để xin thư giới thiệu', order_index: 7 },
      ];

      // Stage 2 Tasks
      const stage2TasksData = [
        { title: 'Viết bài luận cá nhân (Personal Statement)', description: 'Soạn thảo và hoàn thiện bài luận cá nhân thể hiện câu chuyện của bạn', order_index: 1 },
        { title: 'Viết bài luận bổ sung', description: 'Hoàn thành các bài luận bổ sung cho từng trường', order_index: 2 },
        { title: 'Nộp đơn Common App / Coalition', description: 'Điền và nộp đơn qua Common Application hoặc Coalition Application', order_index: 3 },
        { title: 'Nộp đơn UC Application', description: 'Nộp đơn cho các trường thuộc hệ thống University of California', order_index: 4 },
        { title: 'Gửi điểm thi chuẩn hóa', description: 'Gửi điểm SAT/ACT chính thức đến các trường', order_index: 5 },
        { title: 'Thanh toán phí nộp đơn', description: 'Hoàn tất thanh toán application fee cho các trường', order_index: 6 },
      ];

      // Stage 3 Tasks
      const stage3TasksData = [
        { title: 'Xác nhận nhập học', description: 'Chọn trường và xác nhận quyết định nhập học', order_index: 1 },
        { title: 'Nộp tiền đặt cọc', description: 'Thanh toán khoản enrollment deposit để giữ chỗ', order_index: 2 },
        { title: 'Đăng ký visa F-1', description: 'Chuẩn bị hồ sơ và đăng ký phỏng vấn visa du học', order_index: 3 },
        { title: 'Tìm kiếm chỗ ở', description: 'Đăng ký ký túc xá hoặc tìm nhà ở off-campus', order_index: 4 },
        { title: 'Đăng ký các môn học', description: 'Course registration cho học kỳ đầu tiên', order_index: 5 },
        { title: 'Chuẩn bị tài chính', description: 'Mở tài khoản ngân hàng tại Mỹ và chuẩn bị tài chính', order_index: 6 },
        { title: 'Đặt vé máy bay', description: 'Book vé máy bay đến trường', order_index: 7 },
      ];

      // Create tasks
      await Promise.all([
        ...stage1TasksData.map(task =>
          prisma.checklist_tasks.create({ data: { ...task, stage_id: stage1.id, is_required: true } })
        ),
        ...stage2TasksData.map(task =>
          prisma.checklist_tasks.create({ data: { ...task, stage_id: stage2.id, is_required: true } })
        ),
        ...stage3TasksData.map(task =>
          prisma.checklist_tasks.create({ data: { ...task, stage_id: stage3.id, is_required: true } })
        ),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Checklist data seeded successfully',
        data: {
          stages: 3,
          tasks: stage1TasksData.length + stage2TasksData.length + stage3TasksData.length,
        },
      });
    }

    if (action === 'reseed') {
      // Delete all existing data
      await prisma.student_task_progress.deleteMany();
      await prisma.checklist_tasks.deleteMany();
      await prisma.checklist_stages.deleteMany();

      // Then call seed logic (redirect to seed action)
      return NextResponse.redirect(new URL('/api/test-checklist?action=seed', request.url));
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "seed" or "reseed"',
    });
  } catch (error) {
    console.error('Error seeding checklist data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
