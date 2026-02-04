// Demo usage examples for mentor-checklist.ts Server Actions
// This file shows how to use the functions in components

import { getStudentChecklist, updateStudentTaskStatus, getStudentProgressStats } from '@/actions/mentor-checklist'
import { TaskStatus } from '@prisma/client'

// ===========================================
// EXAMPLE 1: Mentor Dashboard Table Component
// ===========================================

export async function MentorDashboardExample() {
  // Load student checklist for table display
  const studentId = "123e4567-e89b-12d3-a456-426614174000" // Example UUID

  const checklistResult = await getStudentChecklist(studentId)

  if (!checklistResult.success) {
    return <div>Error: {checklistResult.error}</div>
  }

  const { studentInfo, flatTasks, stages } = checklistResult.data!

  return (
    <div>
      <h2>Checklist for {studentInfo.full_name}</h2>

      {/* TABLE VIEW - Using flatTasks */}
      <table className="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Stage</th>
            <th>Status</th>
            <th>Submission</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flatTasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.stage.name}</td>
              <td>
                <StatusBadge status={task.progress?.status || 'PENDING'} />
              </td>
              <td>
                {task.progress?.submission_url && (
                  <a href={task.progress.submission_url} target="_blank">
                    View File
                  </a>
                )}
              </td>
              <td>
                <MentorActionButtons
                  studentId={studentId}
                  taskId={task.id}
                  currentStatus={task.progress?.status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* HIERARCHICAL VIEW - Using stages */}
      <div className="stages">
        {stages.map(stage => (
          <div key={stage.id} className="stage-section">
            <h3>{stage.name}</h3>
            <div className="tasks">
              {stage.tasks.map(task => (
                <div key={task.id} className="task-card">
                  <h4>{task.title}</h4>
                  <p>Status: {task.progress?.status || 'PENDING'}</p>
                  {task.progress?.mentor_note && (
                    <p>Note: {task.progress.mentor_note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===========================================
// EXAMPLE 2: Mentor Action Buttons Component
// ===========================================

function MentorActionButtons({
  studentId,
  taskId,
  currentStatus
}: {
  studentId: string
  taskId: string
  currentStatus?: TaskStatus
}) {

  const handleApprove = async () => {
    const result = await updateStudentTaskStatus(
      studentId,
      taskId,
      TaskStatus.COMPLETED,
      "Tài liệu đã được phê duyệt. Chúc mừng bạn!"
    )

    if (result.success) {
      console.log("✅ Task approved successfully!")
      // Update UI or show toast
    } else {
      console.error("❌ Failed to approve:", result.error)
    }
  }

  const handleRequestRevision = async () => {
    const mentorNote = prompt("Nhập ghi chú cho học viên:")
    if (!mentorNote) return

    const result = await updateStudentTaskStatus(
      studentId,
      taskId,
      TaskStatus.NEEDS_REVISION,
      mentorNote
    )

    if (result.success) {
      console.log("✅ Revision requested successfully!")
    } else {
      console.error("❌ Failed to request revision:", result.error)
    }
  }

  const handleMarkInProgress = async () => {
    const result = await updateStudentTaskStatus(
      studentId,
      taskId,
      TaskStatus.IN_PROGRESS,
      "Đã xác nhận học viên đang thực hiện task này"
    )

    if (result.success) {
      console.log("✅ Task marked as in progress!")
    }
  }

  return (
    <div className="mentor-actions">
      {currentStatus === TaskStatus.SUBMITTED && (
        <>
          <button onClick={handleApprove} className="btn-approve">
            ✅ Phê duyệt
          </button>
          <button onClick={handleRequestRevision} className="btn-revision">
            📝 Yêu cầu sửa
          </button>
        </>
      )}

      {currentStatus === TaskStatus.PENDING && (
        <button onClick={handleMarkInProgress} className="btn-progress">
          🏃 Đang thực hiện
        </button>
      )}

      {currentStatus === TaskStatus.NEEDS_REVISION && (
        <span className="status-waiting">
          ⏳ Chờ học viên sửa lại
        </span>
      )}

      {currentStatus === TaskStatus.COMPLETED && (
        <span className="status-completed">
          ✅ Đã hoàn thành
        </span>
      )}
    </div>
  )
}

// ===========================================
// EXAMPLE 3: Student Progress Stats Component
// ===========================================

export async function StudentProgressStatsExample({ studentId }: { studentId: string }) {
  const statsResult = await getStudentProgressStats(studentId)

  if (!statsResult.success) {
    return <div>Error loading stats: {statsResult.error}</div>
  }

  const stats = statsResult.data!

  return (
    <div className="progress-stats">
      <h3>Progress Overview</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Tasks</h4>
          <span className="stat-number">{stats.totalTasks}</span>
        </div>

        <div className="stat-card completed">
          <h4>Completed</h4>
          <span className="stat-number">{stats.completedTasks}</span>
        </div>

        <div className="stat-card submitted">
          <h4>Submitted</h4>
          <span className="stat-number">{stats.submittedTasks}</span>
        </div>

        <div className="stat-card in-progress">
          <h4>In Progress</h4>
          <span className="stat-number">{stats.inProgressTasks}</span>
        </div>

        <div className="stat-card needs-revision">
          <h4>Needs Revision</h4>
          <span className="stat-number">{stats.needsRevisionTasks}</span>
        </div>

        <div className="stat-card pending">
          <h4>Pending</h4>
          <span className="stat-number">{stats.pendingTasks}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-label">
          Overall Progress: {stats.completionPercentage}%
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ===========================================
// HELPER COMPONENTS
// ===========================================

function StatusBadge({ status }: { status: TaskStatus | 'PENDING' }) {
  const statusConfig = {
    PENDING: { label: 'Chưa bắt đầu', color: 'gray' },
    IN_PROGRESS: { label: 'Đang thực hiện', color: 'blue' },
    SUBMITTED: { label: 'Đã nộp', color: 'yellow' },
    COMPLETED: { label: 'Hoàn thành', color: 'green' },
    NEEDS_REVISION: { label: 'Cần sửa', color: 'red' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

  return (
    <span className={`status-badge status-${config.color}`}>
      {config.label}
    </span>
  )
}

// ===========================================
// INTEGRATION GUIDE
// ===========================================

/*
CÁCH SỬ DỤNG TRONG MENTOR DASHBOARD:

1. Trang danh sách học viên (/mentor/students):
   - Dùng getStudentProgressStats() để hiển thị progress summary cards

2. Trang chi tiết học viên (/mentor/students/[studentId]):
   - Dùng getStudentChecklist() để load full checklist
   - Hiển thị dạng table hoặc hierarchical view
   - Implement MentorActionButtons cho từng task

3. Server Actions trong component:
   - Tất cả functions đã có 'use server' directive
   - Call trực tiếp trong Server Components
   - Hoặc wrap trong useTransition() cho Client Components

4. Error Handling:
   - Tất c��� functions return {success, data, error} pattern
   - Check result.success trước khi access result.data
   - Display result.error nếu có lỗi

5. Revalidation:
   - Các paths đã được revalidate tự động
   - UI sẽ update sau khi mentor action hoàn thành
*/
