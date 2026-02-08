"use client";
import { useState, useEffect } from "react";
import { User, UserFormData } from "@/types/admin";
import { Button } from "@/components/ui/button";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AssignMentorForm from "./AssignMentorForm";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showAssignMentorForm, setShowAssignMentorForm] = useState(false);

  // Students and mentors data
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students and mentors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, mentorsResponse] = await Promise.all([
          fetch("/api/admin/students"),
          fetch("/api/admin/mentors"),
        ]);

        if (studentsResponse.ok && mentorsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const mentorsData = await mentorsResponse.json();

          setStudents(studentsData.students || []);
          setMentors(mentorsData.mentors || []);
        } else {
          const studentsError = !studentsResponse.ok
            ? `Students API: ${studentsResponse.status} ${studentsResponse.statusText}`
            : "";
          const mentorsError = !mentorsResponse.ok
            ? `Mentors API: ${mentorsResponse.status} ${mentorsResponse.statusText}`
            : "";
          console.error(
            "Failed to fetch students or mentors:",
            studentsError,
            mentorsError,
          );

          // Try to get error details
          if (!studentsResponse.ok) {
            try {
              const errorData = await studentsResponse.json();
              console.error("Students API error details:", errorData);
            } catch (e) {
              console.error("Could not parse students error response");
            }
          }
          if (!mentorsResponse.ok) {
            try {
              const errorData = await mentorsResponse.json();
              console.error("Mentors API error details:", errorData);
            } catch (e) {
              console.error("Could not parse mentors error response");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching students/mentors data:", error);
        // Set empty arrays as fallback
        setStudents([]);
        setMentors([]);
      }
    };

    fetchData();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.role === roleFilter.toUpperCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? user.is_active : !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";

      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        await fetchUsers();
        setIsModalOpen(false);
        setEditingUser(null);
      } else {
        // Check if response has content before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          alert(error.message || "Có lỗi xảy ra");
        } else {
          alert("Có lỗi xảy ra khi lưu người dùng");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Có lỗi xảy ra khi lưu người dùng");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers();
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          alert(error.message || "Có lỗi xảy ra");
        } else {
          alert("Có lỗi xảy ra khi xóa người dùng");
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Có lỗi xảy ra khi xóa người dùng");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[300px] flex flex-col">
      <div className="flex-1 p-6 md:p-8 space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Users</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAssignMentorForm(true)}
              className="w-full md:w-auto"
            >
              Assign mentor
            </Button>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="all">All roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <UserTable
            users={currentUsers}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}–
                {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <UserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          user={editingUser}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingUser(null);
          }}
          onConfirm={handleConfirmDelete}
          userName={deletingUser?.full_name || ""}
        />

        {showAssignMentorForm && (
          <div className="modal">
            <div className="modal-content">
              <button
                className="close-button"
                onClick={() => setShowAssignMentorForm(false)}
              >
                Close
              </button>
              <AssignMentorForm students={students} mentors={mentors} />
            </div>
          </div>
        )}
      </div>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-4">
        Admin © 2025{" "}
        <span className="text-primary font-heading font-bold">
          HOLYANN EXPLORE
        </span>
      </footer>
    </div>
  );
}
