"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ProfilePage, ProfilePageSkeleton } from "@/components/student/profile";
import type { ProfilePageProps } from "@/components/student/profile/ProfilePage";
import AcademicInfoModal from "@/components/student/profile/AcademicInfoModal";
import { StudentPageContainer } from "@/components/student";
import { StudentProfile } from "@/components/types";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function ProfilePageWrapper() {
  const {
    session,
    isLoading: sessionLoading,
    isAuthenticated,
  } = useAuthSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const analysisInFlightRef = useRef(false);
  const [uploadDocumentLoading, setUploadDocumentLoading] = useState(false);
  const [uploadAvatarLoading, setUploadAvatarLoading] = useState(false);

  // Get student ID from session - memoized to prevent unnecessary recalculations
  const studentId = useMemo(() => {
    // Checking for student ID

    // Priority 1: Try NextAuth session first
    const sessionUserId =
      (session?.user as any)?.id ||
      (session?.user as any)?.user_id ||
      (session?.user as any)?.sub;

    if (sessionUserId) {
      // Found student ID from NextAuth
      return sessionUserId as string;
    }

    // If we have email but no id, mark for email-based fetch
    const userEmail = session?.user?.email;
    if (userEmail && !sessionUserId) {
      console.warn(
        "⚠️ [Profile] Have email but no user ID, will fetch by email:",
        userEmail,
      );
      return `email:${userEmail}`;
    }

    console.warn("⚠️ [Profile] No student ID found");
    return null;
  }, [session?.user, sessionLoading, isAuthenticated]);

  // Get student ID from session (for use in handlers)
  const getStudentId = (): string | null => {
    return studentId;
  };

  // Fetch profile data from API
  useEffect(() => {
    // Skip if session is still loading (only for NextAuth)
    if (sessionLoading && !studentId) {
      return;
    }

    // For Custom Auth, we don't need NextAuth authentication
    // Check if we have studentId from ANY source (NextAuth or Custom Auth)
    const hasAuth = isAuthenticated || studentId;

    if (!hasAuth) {
      console.warn("⚠️ [Profile] No authentication found");
      setError("Vui lòng đăng nhập để xem hồ sơ.");
      setLoading(false);
      return;
    }

    // Skip if no studentId
    if (!studentId) {
      console.error("❌ [Profile] No student ID found", {
        session,
      });
      setError("Không tìm thấy thông tin học sinh. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    // Skip if already loaded
    // if (profile && !loading) {
    //   return;
    // }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Check if studentId is an email marker
        let actualStudentId = studentId;
        if (studentId.startsWith("email:")) {
          const email = studentId.substring(6);
          // Fetch user by email to get the actual ID
          const userResponse = await fetch(
            `/api/users/by-email?email=${encodeURIComponent(email)}`,
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            actualStudentId = userData.id;
          } else {
            throw new Error("Không thể tìm thấy người dùng với email này");
          }
        }

        const response = await fetch(
          `/api/students/${actualStudentId}/profile`,
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("❌ [Profile] API Error Response Text:", text);
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            console.error("❌ [Profile] Failed to decode JWT token:", e);
            errorData = { error: "Unknown error", raw: text };
          }
          console.error("❌ [Profile] API Error Data:", errorData);
          const errorMessage =
            errorData.error || "Không thể tải thông tin học sinh";
          const errorDetails = errorData.details
            ? ` (${errorData.details})`
            : "";
          throw new Error(errorMessage + errorDetails);
        }

        const data = await response.json();

        // Map API data to StudentProfile interface
        const mappedProfile: StudentProfile = {
          id: actualStudentId.substring(0, 8).toUpperCase(),
          name: data.basicInfo.full_name || "Chưa cập nhật",
          email: data.basicInfo.email || "Chưa cập nhật",
          phone: data.basicInfo.phone_number || "Chưa cập nhật",
          address: data.basicInfo.current_address || "Chưa cập nhật",
          dob: data.basicInfo.date_of_birth
            ? new Date(data.basicInfo.date_of_birth).toLocaleDateString("vi-VN")
            : "Chưa cập nhật",
          avatarUrl: data.basicInfo.avatar_url || "",

          // GPA hiện tại: Lấy GPA lớp 12, nếu không có thì lấy lớp 11
          gpa: (() => {
            const gpaDetails = data.academicProfile?.gpa_transcript_details;
            if (!gpaDetails) return 0;

            // Ưu tiên lớp 12
            if (gpaDetails.grade12) {
              return parseFloat(gpaDetails.grade12) || 0;
            }

            // Fallback lớp 11
            if (gpaDetails.grade11) {
              return parseFloat(gpaDetails.grade11) || 0;
            }

            // Fallback khác
            return (
              parseFloat(gpaDetails.grade10 || gpaDetails.grade9 || "0") || 0
            );
          })(),

          gpaScale: 10,
          englishCertificates: Array.isArray(
            data.academicProfile?.english_certificates,
          )
            ? data.academicProfile.english_certificates.map((c: any) => ({
                type: c.type || "",
                score: String(c.score ?? ""),
              }))
            : [],
          englishLevel: (() => {
            const certs = data.academicProfile?.english_certificates;
            if (!Array.isArray(certs) || certs.length === 0)
              return "Chưa cập nhật";
            return (
              certs
                .map((c: any) => `${c.type || ""} ${c.score ?? ""}`.trim())
                .filter(Boolean)
                .join(", ") || "Chưa cập nhật"
            );
          })(),
          targetMajor: data.studentInfo?.intended_major || "Chưa xác định",
          targetCountry: data.studentInfo?.target_country || "Chưa xác định",

          // Map extracurriculars (giữ category để hiển thị tag)
          extracurriculars: [
            ...(data.background?.academic_extracurriculars?.map((act: any) => ({
              id: act.id,
              title: act.activity_name || "Hoạt động",
              role: act.role || "Thành viên",
              year: act.start_date
                ? new Date(act.start_date).getFullYear().toString()
                : "—",
              description: act.description || "",
              category: "academic" as const,
            })) || []),
            ...(data.background?.non_academic_extracurriculars?.map(
              (act: any) => ({
                id: act.id,
                title: act.activity_name || "Hoạt động",
                role: act.role || "Thành viên",
                year: act.start_date
                  ? new Date(act.start_date).getFullYear().toString()
                  : "—",
                description: act.description || "",
                category: "non_academic" as const,
              }),
            ) || []),
          ],

          // Map achievements (có id + category để sửa/xóa)
          achievements: [
            ...(data.background?.academic_awards?.map((award: any) => ({
              id: award.id,
              text: `${award.award_name} - ${award.issuing_organization || ""}`.trim(),
              category: "academic" as const,
            })) || []),
            ...(data.background?.non_academic_awards?.map((award: any) => ({
              id: award.id,
              text: `${award.award_name} - ${award.issuing_organization || ""}`.trim(),
              category: "non_academic" as const,
            })) || []),
          ],

          documents: [],
        };

        setProfile(mappedProfile);
        setError(null);
        setLoading(false);

        // Tải danh sách tài liệu ở background để không chặn hiển thị trang
        try {
          const docsRes = await fetch(
            `/api/students/${actualStudentId}/upload-cv`,
          );
          if (docsRes.ok) {
            const docs = await docsRes.json();
            setProfile((prev) =>
              prev
                ? { ...prev, documents: Array.isArray(docs) ? docs : [] }
                : prev,
            );
          }
        } catch (_) {
          // documents optional
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Có lỗi xảy ra khi tải thông tin học sinh");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId, sessionLoading, isAuthenticated]);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProfile = async (updatedProfile: StudentProfile) => {
    const studentId = getStudentId();
    if (!studentId) return;
    try {
      const res = await fetch(`/api/students/${studentId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: {
            full_name: updatedProfile.name,
            phone_number: updatedProfile.phone,
            email: updatedProfile.email,
            avatar_url: updatedProfile.avatarUrl,
            date_of_birth: updatedProfile.dob,
            current_address: updatedProfile.address,
          },
          studentInfo: {
            date_of_birth: updatedProfile.dob,
            current_address: updatedProfile.address,
            intended_major: updatedProfile.targetMajor,
            target_country: updatedProfile.targetCountry,
          },
        }),
      });
      if (res.ok) {
        setProfile(updatedProfile);
        toast.success("Cập nhật thông tin thành công");
      } else {
        const data = await res.json();
        toast.error(data.error || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Có lỗi khi cập nhật");
    }
  };

  const handleSaveBasicInfo = async (data: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
  }) => {
    const studentId = getStudentId();
    if (!studentId || !profile) return;
    // Chuẩn hóa ngày sinh (dd/MM/yyyy) sang ISO (YYYY-MM-DD) để API parse đúng
    const dobForApi =
      data.dob && data.dob !== "Chưa cập nhật"
        ? (() => {
            try {
              const [d, m, y] = data.dob.split("/");
              if (d && m && y)
                return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            } catch {}
            return data.dob;
          })()
        : data.dob;
    try {
      const res = await fetch(`/api/students/${studentId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: {
            full_name: data.name,
            phone_number: data.phone,
            email: data.email,
            date_of_birth: dobForApi,
            current_address: data.address,
          },
          studentInfo: {
            date_of_birth: dobForApi,
            current_address: data.address,
          },
        }),
      });
      if (res.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                name: data.name,
                email: data.email,
                phone: data.phone,
                dob: data.dob,
                address: data.address,
              }
            : prev,
        );
        toast.success("Đã lưu thông tin cá nhân");
      } else {
        const err = await res.json();
        toast.error(err.error || "Lưu thất bại");
      }
    } catch {
      toast.error("Có lỗi khi lưu");
    }
  };

  const handleSaveAcademic: NonNullable<
    ProfilePageProps["onSaveAcademic"]
  > = async (data) => {
    const studentId = getStudentId();
    if (!studentId || !profile) return;
    const gpa = Math.min(10, Math.max(0, Number(data.gpa) || 0));
    const certs = (data.englishCertificates || []).filter(
      (c) => (c.type || "").trim() || (c.score || "").trim(),
    );
    try {
      const [profileRes, academicRes] = await Promise.all([
        fetch(`/api/students/${studentId}/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentInfo: {
              intended_major: data.targetMajor,
              target_country: data.targetCountry,
            },
          }),
        }),
        fetch(`/api/students/${studentId}/academic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gpa_transcript_details: {
              grade12: String(gpa),
              grade11: String(gpa),
            },
            english_certificates: certs.map((c) => ({
              type: (c.type || "Khác").trim() || "Khác",
              score: String(c.score || "").trim(),
            })),
          }),
        }),
      ]);
      if (profileRes.ok && academicRes.ok) {
        const englishLevel =
          certs.length === 0
            ? "Chưa cập nhật"
            : certs
                .map((c) =>
                  `${(c.type || "").trim()} ${(c.score || "").trim()}`.trim(),
                )
                .filter(Boolean)
                .join(", ");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                gpa,
                gpaScale: 10,
                englishCertificates: certs,
                englishLevel,
                targetMajor: data.targetMajor,
                targetCountry: data.targetCountry,
              }
            : prev,
        );
        toast.success("Đã lưu thông tin học thuật");
      } else {
        toast.error("Lưu thất bại");
      }
    } catch {
      toast.error("Có lỗi khi lưu");
    }
  };

  const handleUpdateActivity = async (
    act: import("@/components/types").Extracurricular,
  ) => {
    const studentId = getStudentId();
    if (!studentId) return;
    const url =
      act.category === "academic"
        ? `/api/students/${studentId}/academic-extracurriculars`
        : `/api/students/${studentId}/non-academic-extracurriculars`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: act.id,
          activity_name: act.title,
          role: act.role,
          start_date: act.year ? `${act.year}-01-01` : undefined,
          description: act.description,
        }),
      });
      if (res.ok) {
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            extracurriculars: prev.extracurriculars.map((a) =>
              a.id === act.id ? act : a,
            ),
          };
        });
        toast.success("Đã cập nhật hoạt động");
      } else {
        toast.error("Cập nhật thất bại");
        throw new Error("Update failed");
      }
    } catch (e) {
      if ((e as Error).message !== "Update failed")
        toast.error("Có lỗi khi cập nhật");
      throw e;
    }
  };

  const handleAddActivity = async (
    act: Omit<import("@/components/types").Extracurricular, "id">,
  ) => {
    const studentId = getStudentId();
    if (!studentId) return;
    const url =
      act.category === "academic"
        ? `/api/students/${studentId}/academic-extracurriculars`
        : `/api/students/${studentId}/non-academic-extracurriculars`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_name: act.title,
          role: act.role,
          start_date: act.year ? `${act.year}-01-01` : undefined,
          description: act.description,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const newAct = {
          id: data.data.id,
          title: act.title,
          role: act.role,
          year: act.year,
          description: act.description,
          category: act.category,
        };
        setProfile((prev) => {
          if (!prev) return prev;
          const list = prev.extracurriculars;
          // Giữ thứ tự như API: academic trước, non_academic sau
          if (act.category === "academic") {
            const firstNonAc = list.findIndex(
              (a) => a.category === "non_academic",
            );
            const insertIdx = firstNonAc === -1 ? list.length : firstNonAc;
            return {
              ...prev,
              extracurriculars: [
                ...list.slice(0, insertIdx),
                newAct,
                ...list.slice(insertIdx),
              ],
            };
          }
          return { ...prev, extracurriculars: [...list, newAct] };
        });
        toast.success("Đã thêm hoạt động");
      } else {
        toast.error("Thêm thất bại");
        throw new Error("Add failed");
      }
    } catch (e) {
      if ((e as Error).message !== "Add failed") toast.error("Có lỗi khi thêm");
      throw e;
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const studentId = getStudentId();
    if (!studentId || !profile) return;
    const act = profile.extracurriculars.find((a) => a.id === id);
    const base =
      act?.category === "academic"
        ? `/api/students/${studentId}/academic-extracurriculars`
        : `/api/students/${studentId}/non-academic-extracurriculars`;
    try {
      const res = await fetch(`${base}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                extracurriculars: prev.extracurriculars.filter(
                  (a) => a.id !== id,
                ),
              }
            : prev,
        );
        toast.success("Đã xóa hoạt động");
      } else toast.error("Xóa thất bại");
    } catch {
      toast.error("Có lỗi khi xóa");
    }
  };

  const handleUpdateAchievement = async (id: string, text: string) => {
    const studentId = getStudentId();
    if (!studentId || !profile) return;
    const ach = profile.achievements.find(
      (
        a,
      ): a is {
        id: string;
        text: string;
        category?: "academic" | "non_academic";
      } => typeof a === "object" && a.id === id,
    );
    const category = ach?.category ?? "academic";
    const [name, org] = text.split(/\s*-\s*/).map((s) => s.trim());
    const url =
      category === "academic"
        ? `/api/students/${studentId}/academic-awards`
        : `/api/students/${studentId}/non-academic-awards`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          award_name: name || text,
          issuing_organization: org || "",
        }),
      });
      if (res.ok) {
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            achievements: prev.achievements.map((a) =>
              typeof a === "object" && a.id === id ? { ...a, text } : a,
            ),
          };
        });
        toast.success("Đã cập nhật thành tích");
      } else {
        toast.error("Cập nhật thất bại");
        throw new Error("Update failed");
      }
    } catch (e) {
      if ((e as Error).message !== "Update failed")
        toast.error("Có lỗi khi cập nhật");
      throw e;
    }
  };

  const handleAddAchievement = async (
    text: string,
    category: "academic" | "non_academic",
  ) => {
    const studentId = getStudentId();
    if (!studentId) return;
    const [award_name, issuing_organization] = text
      .split(/\s*-\s*/)
      .map((s) => s.trim());
    const url =
      category === "academic"
        ? `/api/students/${studentId}/academic-awards`
        : `/api/students/${studentId}/non-academic-awards`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          award_name: award_name || text,
          issuing_organization: issuing_organization || "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const newA = {
          id: data.data.id,
          text,
          category,
        };
        setProfile((prev) => {
          if (!prev) return prev;
          const list = prev.achievements;
          // Giữ thứ tự như API: academic_awards trước, non_academic_awards sau
          if (category === "academic") {
            const firstNonAc = list.findIndex(
              (a) => typeof a === "object" && a.category === "non_academic",
            );
            const insertIdx = firstNonAc === -1 ? list.length : firstNonAc;
            return {
              ...prev,
              achievements: [
                ...list.slice(0, insertIdx),
                newA,
                ...list.slice(insertIdx),
              ],
            };
          }
          return { ...prev, achievements: [...list, newA] };
        });
        toast.success("Đã thêm thành tích");
      } else {
        toast.error("Thêm thất bại");
        throw new Error("Add failed");
      }
    } catch (e) {
      if ((e as Error).message !== "Add failed") toast.error("Có lỗi khi thêm");
      throw e;
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    const studentId = getStudentId();
    if (!studentId || !profile) return;
    const ach = profile.achievements.find(
      (
        a,
      ): a is {
        id: string;
        text: string;
        category?: "academic" | "non_academic";
      } => typeof a === "object" && a.id === id,
    );
    const base =
      ach?.category === "non_academic"
        ? `/api/students/${studentId}/non-academic-awards`
        : `/api/students/${studentId}/academic-awards`;
    try {
      const res = await fetch(`${base}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                achievements: prev.achievements.filter((a) =>
                  typeof a === "object" ? a.id !== id : true,
                ),
              }
            : prev,
        );
        toast.success("Đã xóa thành tích");
      } else toast.error("Xóa thất bại");
    } catch {
      toast.error("Có lỗi khi xóa");
    }
  };

  const handleUploadDocument = async (file: File, type: string) => {
    const studentId = getStudentId();
    if (!studentId) return;

    setUploadDocumentLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "documentType",
      type === "certificate" ? "certificate" : "cv",
    );

    try {
      const response = await fetch(`/api/students/${studentId}/upload-cv`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Tải tài liệu thành công", {
          description: "Tài liệu của bạn đã được tải lên và lưu",
        });
        try {
          const docsRes = await fetch(`/api/students/${studentId}/upload-cv`);
          if (docsRes.ok) {
            const docs = await docsRes.json();
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    documents: Array.isArray(docs) ? docs : prev.documents,
                  }
                : prev,
            );
          }
        } catch (_) {}
      } else {
        toast.error("Tải tài liệu thất bại", {
          description: "Vui lòng kiểm tra file và thử lại",
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Có lỗi xảy ra khi tải tài liệu", {
        description: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ",
      });
    } finally {
      setUploadDocumentLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const studentId = getStudentId();
    if (!studentId) return;
    try {
      const res = await fetch(
        `/api/students/${studentId}/upload-cv?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) =>
          prev
            ? { ...prev, documents: prev.documents.filter((d) => d.id !== id) }
            : prev,
        );
        toast.success("Đã xóa tài liệu");
      } else {
        toast.error(data.error || "Không thể xóa tài liệu");
      }
    } catch {
      toast.error("Có lỗi khi xóa tài liệu");
    }
  };

  const handleUploadAvatar = async (file: File) => {
    const studentId = getStudentId();
    if (!studentId) return;
    setUploadAvatarLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/students/${studentId}/upload-avatar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.avatarUrl) {
        setProfile((prev) =>
          prev ? { ...prev, avatarUrl: data.avatarUrl } : prev,
        );
        toast.success("Cập nhật ảnh đại diện thành công");
      } else {
        toast.error(data.error || "Không thể cập nhật ảnh");
      }
    } catch {
      toast.error("Có lỗi khi tải ảnh lên");
    } finally {
      setUploadAvatarLoading(false);
    }
  };

  const handleAnalyzeProfile = async () => {
    if (analysisInFlightRef.current) return;
    const studentId = getStudentId();
    if (!studentId) {
      toast.error("Không tìm thấy thông tin học sinh", {
        description: "Vui lòng đăng nhập lại để tiếp tục",
      });
      return;
    }

    analysisInFlightRef.current = true;
    setAnalysisLoading(true);
    setAnalysisResult(null);

    toast.info("Đang phân tích hồ sơ", {
      description:
        "AI đang phân tích hồ sơ của bạn. Vui lòng đợi trong giây lát...",
    });

    try {
      const response = await fetch(
        `/api/students/${studentId}/analyze-profile`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setAnalysisResult({
          error: data.error || "Có lỗi xảy ra khi phân tích hồ sơ",
          // Không set details để không hiển thị chi tiết lỗi
        });
        toast.error("Phân tích hồ sơ thất bại", {
          description: data.error || "Vui lòng thử lại sau",
        });
      } else {
        setAnalysisResult(data);
        toast.success("Phân tích hồ sơ hoàn tất", {
          description: "Đã tạo báo cáo phân tích chi tiết cho hồ sơ của bạn",
        });
      }
    } catch (error: any) {
      console.error("Error analyzing profile:", error);
      setAnalysisResult({
        error: "Có lỗi xảy ra khi kết nối đến server phân tích",
        details: error.message,
      });
      toast.error("Không thể kết nối đến server", {
        description: "Vui lòng kiểm tra kết nối mạng và thử lại",
      });
    } finally {
      analysisInFlightRef.current = false;
      setAnalysisLoading(false);
    }
  };

  // Loading state: hiển thị skeleton thay vì spinner để UX mượt hơn
  if (loading || sessionLoading) {
    return (
      <StudentPageContainer fullWidth>
        <div className="min-h-[60vh]">
          <ProfilePageSkeleton />
        </div>
      </StudentPageContainer>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <StudentPageContainer fullWidth>
        <div className="flex flex-col justify-center items-center min-h-[60vh] px-4">
          <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">
              ⚠️ Lỗi tải dữ liệu
            </div>
            <div className="text-red-700 dark:text-red-300 mb-4">
              {error || "Không tìm thấy thông tin học sinh"}
            </div>
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted rounded">
                <strong>Debug Info:</strong>
                <br />
                Student ID: {studentId || "null"}
                <br />
                Session: {session ? "exists" : "null"}
                <br />
                Authenticated: {isAuthenticated ? "yes" : "no"}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </StudentPageContainer>
    );
  }

  return (
    <StudentPageContainer fullWidth>
      <div className="min-h-[60vh]">
        <ProfilePage
          profile={profile}
          onEditClick={handleEditClick}
          onUploadDocument={handleUploadDocument}
          onDeleteDocument={handleDeleteDocument}
          onUploadAvatar={handleUploadAvatar}
          uploadDocumentLoading={uploadDocumentLoading}
          uploadAvatarLoading={uploadAvatarLoading}
          onSaveBasicInfo={handleSaveBasicInfo}
          onSaveAcademic={handleSaveAcademic}
          onUpdateActivity={handleUpdateActivity}
          onAddActivity={handleAddActivity}
          onDeleteActivity={handleDeleteActivity}
          onUpdateAchievement={handleUpdateAchievement}
          onAddAchievement={handleAddAchievement}
          onDeleteAchievement={handleDeleteAchievement}
        />
        {isModalOpen && profile && (
          <AcademicInfoModal
            studentId={getStudentId() || ""}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </StudentPageContainer>
  );
}
