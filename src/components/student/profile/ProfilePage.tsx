"use client";

import React from "react";
import { StudentProfile, DocumentType, Extracurricular } from "../../types";
import { ProfileHeader } from "./components/ProfileHeader";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { AcademicInfoSection } from "./components/AcademicInfoSection";
import { ActivitiesSection } from "./components/ActivitiesSection";
import { DocumentsSection } from "./components/DocumentsSection";

export interface ProfilePageProps {
  profile: StudentProfile;
  onEditClick: () => void;
  onUploadDocument: (file: File, type: DocumentType) => void;
  onDeleteDocument: (id: string) => void;
  onUploadAvatar?: (file: File) => void;
  uploadDocumentLoading?: boolean;
  uploadAvatarLoading?: boolean;
  onSaveBasicInfo?: (data: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
  }) => void;
  onSaveAcademic?: (data: {
    gpa: number;
    gpaScale: number;
    englishCertificates: { type: string; score: string }[];
    targetMajor: string;
    targetCountry: string;
  }) => void;
  onUpdateActivity?: (act: Extracurricular) => void;
  onAddActivity?: (act: Omit<Extracurricular, "id">) => void;
  onDeleteActivity?: (id: string) => void;
  onUpdateAchievement?: (id: string, text: string) => void;
  onAddAchievement?: (text: string, category: "academic" | "non_academic") => void;
  onDeleteAchievement?: (id: string) => void;
  onProfileUpdate?: (updatedFields: Partial<StudentProfile>) => Promise<void>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onEditClick,
  onUploadDocument,
  onDeleteDocument,
  onUploadAvatar,
  uploadDocumentLoading = false,
  uploadAvatarLoading = false,
  onSaveBasicInfo,
  onSaveAcademic,
  onUpdateActivity,
  onAddActivity,
  onDeleteActivity,
  onUpdateAchievement,
  onAddAchievement,
  onDeleteAchievement,
  onProfileUpdate,
}) => {
  const isPersonalComplete = Boolean(
    profile.name && profile.email && profile.phone && profile.address && profile.dob
  );
  const hasEnglishCerts =
    (profile.englishCertificates && profile.englishCertificates.length > 0) ||
    (profile.englishLevel && profile.englishLevel !== "Chưa cập nhật");
  const isAcademicComplete = Boolean(profile.gpa && profile.targetMajor && hasEnglishCerts);
  const isActivitiesComplete =
    profile.extracurriculars.length > 0 && profile.achievements.length > 0;
  const isDocumentsComplete = profile.documents.length >= 2;

  return (
    <div>
      <ProfileHeader onEditClick={onEditClick} analyzeHref="/student/profile-analysis" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <PersonalInfoCard
            profile={profile}
            isComplete={isPersonalComplete}
            onUploadAvatar={onUploadAvatar}
            uploadAvatarLoading={uploadAvatarLoading}
            onSave={onSaveBasicInfo}
          />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <AcademicInfoSection
            profile={profile}
            isComplete={isAcademicComplete}
            onSave={onSaveAcademic}
          />
          <ActivitiesSection
            profile={profile}
            isComplete={isActivitiesComplete}
            onEditClick={onEditClick}
            onUpdateActivity={onUpdateActivity}
            onAddActivity={onAddActivity}
            onDeleteActivity={onDeleteActivity}
            onUpdateAchievement={onUpdateAchievement}
            onAddAchievement={onAddAchievement}
            onDeleteAchievement={onDeleteAchievement}
          />
          <DocumentsSection
            profile={profile}
            isComplete={isDocumentsComplete}
            onUploadDocument={onUploadDocument}
            onDeleteDocument={onDeleteDocument}
            uploadDocumentLoading={uploadDocumentLoading}
          />
        </div>
      </div>
    </div>
  );
};
