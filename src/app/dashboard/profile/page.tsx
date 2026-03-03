"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ProfilePage } from "@/components/student/profile";
import AcademicInfoModal from "@/components/student/profile/AcademicInfoModal";
import AuthHeader from "@/components/auth/AuthHeader";
import { PageLoading } from "@/components/ui/PageLoading";
import { StudentProfile } from "@/components/types";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function ProfilePageWrapper() {
  const { session, isLoading: sessionLoading, isAuthenticated } = useAuthSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const analysisInFlightRef = useRef(false);
  const [isNewStudent, setIsNewStudent] = useState(false);

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
      console.warn('⚠️ [Profile] Have email but no user ID, will fetch by email:', userEmail);
      return `email:${userEmail}`;
    }

    console.warn('⚠️ [Profile] No student ID found');
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
      console.warn('⚠️ [Profile] No authentication found');
      setError("Vui lòng đăng nhập để xem hồ sơ.");
      setLoading(false);
      return;
    }

    // Skip if no studentId
    if (!studentId) {
      console.error('❌ [Profile] No student ID found', {
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
        if (studentId.startsWith('email:')) {
          const email = studentId.substring(6);
          // Fetch user by email to get the actual ID
          const userResponse = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            actualStudentId = userData.id;
          } else {
            throw new Error('Không thể tìm thấy người dùng với email này');
          }
        }

        const response = await fetch(`/api/students/${actualStudentId}/profile`);

        if (!response.ok) {
          const text = await response.text();
          console.error('❌ [Profile] API Error Response Text:', text);
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            console.error('❌ [Profile] Failed to decode JWT token:', e);
            errorData = { error: 'Unknown error', raw: text };
          }
          console.error('❌ [Profile] API Error Data:', errorData);
          const errorMessage = errorData.error || "Không thể tải thông tin học sinh";
          const errorDetails = errorData.details ? ` (${errorData.details})` : "";
          throw new Error(errorMessage + errorDetails);
        }

        const data = await response.json();

        // Check if this is a new student (just created)
        const isNewStudent = data.status?.isNewStudent;
        if (isNewStudent) {
          setIsNewStudent(true);
        } else {
          setIsNewStudent(false);
        }

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

          gpaScale: 10.0,
          englishLevel: data.academicProfile?.english_certificates?.[0]?.type
            ? (() => {
                const c = data.academicProfile.english_certificates[0];
                const level = c.level ? ` ${c.type === 'JLPT' ? c.level : `cấp ${c.level}`}` : '';
                return `${c.type}${level} ${c.score}`;
              })()
            : "Chưa cập nhật",
          targetMajor: data.studentInfo?.intended_major || "Chưa xác định",
          targetCountry: data.studentInfo?.target_country || "Chưa xác định",

          // Map extracurriculars
          extracurriculars: [
            ...(data.background?.academic_extracurriculars?.map((act: any) => ({
              id: act.id,
              title: act.activity_name,
              role: act.role || "Thành viên",
              year: act.start_date
                ? new Date(act.start_date).getFullYear().toString()
                : "",
              description: act.description || "",
            })) || []),
            ...(data.background?.non_academic_extracurriculars?.map(
              (act: any) => ({
                id: act.id,
                title: act.activity_name,
                role: act.role || "Thành viên",
                year: act.start_date
                  ? new Date(act.start_date).getFullYear().toString()
                  : "",
                description: act.description || "",
              })
            ) || []),
          ],

          // Map achievements
          achievements: [
            ...(data.background?.academic_awards?.map(
              (award: any) =>
                `${award.award_name} - ${award.issuing_organization || ""}`
            ) || []),
            ...(data.background?.non_academic_awards?.map(
              (award: any) =>
                `${award.award_name} - ${award.issuing_organization || ""}`
            ) || []),
          ],

          documents: [],
        };

        setProfile(mappedProfile);
        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Có lỗi xảy ra khi tải thông tin học sinh");
      } finally {
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
      const response = await fetch(`/api/students/${studentId}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInfo: {
            full_name: updatedProfile.name,
            phone_number: updatedProfile.phone,
            avatar_url: updatedProfile.avatarUrl,
          },
          studentInfo: {
            date_of_birth: updatedProfile.dob,
            current_address: updatedProfile.address,
            intended_major: updatedProfile.targetMajor,
            target_country: updatedProfile.targetCountry,
          },
        }),
      });

      if (response.ok) {
        setProfile(updatedProfile);
        toast.success("Cập nhật thông tin thành công", {
          description: "Thông tin hồ sơ của bạn đã được lưu",
        });
      } else {
        toast.error("Cập nhật thông tin thất bại", {
          description: "Vui lòng kiểm tra lại thông tin và thử lại",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin", {
        description: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ",
      });
    }
  };

  const handleUploadDocument = async (file: File, type: string) => {
    const studentId = getStudentId();
    if (!studentId) return;

    const formData = new FormData();
    formData.append("file", file);

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
    }
  };

  const handleDeleteDocument = (id: string) => {
    // TODO: Implement delete document API call
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
        }
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

  // Loading state
  if (loading || sessionLoading) {
    return (
      <>
        <AuthHeader />
        <main className="min-h-screen bg-white dark:bg-slate-900">
          <PageLoading
            message={sessionLoading ? 'Đang xác thực...' : 'Đang tải thông tin học sinh...'}
          />
        </main>
      </>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <>
        <AuthHeader />
        <main className="min-h-screen bg-white dark:bg-slate-900">
          <div className="flex flex-col justify-center items-center h-screen px-4">
            <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">
                ⚠️ Lỗi tải dữ liệu
              </div>
              <div className="text-red-700 dark:text-red-300 mb-4">
                {error || "Không tìm thấy thông tin học sinh"}
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <strong>Debug Info:</strong><br/>
                  Student ID: {studentId || 'null'}<br/>
                  Session: {session ? 'exists' : 'null'}<br/>
                  Authenticated: {isAuthenticated ? 'yes' : 'no'}
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
        </main>
      </>
    );
  }

  return (
    <>
      <AuthHeader />
      <main className="min-h-screen bg-background">
        {/* Welcome Banner for New Students */}
        {isNewStudent && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    🎉 Chào mừng bạn đến với Holyann Explore!
                  </h2>
                  <p className="text-blue-100 mb-4">
                    Hồ sơ của bạn đang trống. Hãy bắt đầu xây dựng hồ sơ du học của bạn bằng cách điền thông tin cơ bản, thành tích học tập và hoạt động ngoại khóa.
                  </p>
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bắt đầu xây dựng hồ sơ
                  </button>
                </div>
                <div className="hidden lg:block">
                  <svg className="w-32 h-32 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <ProfilePage
          profile={profile}
          onEditClick={handleEditClick}
          onUploadDocument={handleUploadDocument}
          onDeleteDocument={handleDeleteDocument}
        />
        {isModalOpen && profile && (
          <AcademicInfoModal
            studentId={getStudentId() || ""}
            onClose={handleCloseModal}
          />
        )}
      </main>
    </>
  );
}
