'use client';

import React, {useState} from 'react';
import {ProfilePage} from '@/components/dashboard/Profile/ProfilePage';
import {EditProfileModal} from '@/components/dashboard/Profile/EditProfileModal';
import AuthHeader from '@/components/dashboard/AuthHeader';
import {StudentProfile} from '@/components/types';


// Mock data - thay thế bằng dữ liệu thực từ API/Database
const mockProfile: StudentProfile = {
    id: 'HS001',
    name: 'Nguyễn Văn A',
    email: 'a.nguyen@example.com',
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
    dob: '2005-01-15',
    avatarUrl: '/images/avatars/avt.jpg',
    gpa: 3.8,
    gpaScale: 4.0,
    englishLevel: 'IELTS 7.5',
    targetMajor: 'Computer Science',
    targetCountry: 'Canada',
    extracurriculars: [
        {
            id: '1',
            title: 'Chủ tịch Câu lạc bộ Lập trình',
            role: 'Chủ tịch',
            year: '2024',
            description: 'Dẫn dắt câu lạc bộ với 50+ thành viên'
        },
    ],
    achievements: [
        'Huy chương Vàng Toán học Quốc tế',
        'Giải Nhất Hackathon 2024',
    ],
    documents: [],
};

export default function ProfilePageWrapper() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profile, setProfile] = useState(mockProfile);

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveProfile = (updatedProfile: typeof mockProfile) => {
        setProfile(updatedProfile);
        console.log('Profile updated:', updatedProfile);
    };

    const handleUploadDocument = (file: File, type: string) => {
        console.log('Upload document:', file, type);
    };

    const handleDeleteDocument = (id: string) => {
        console.log('Delete document:', id);
    };

    return (
        <>
            <AuthHeader/>
            <main className="min-h-screen bg-white dark:bg-gray-900">
                <ProfilePage
                    profile={profile}
                    onEditClick={handleEditClick}
                    onUploadDocument={handleUploadDocument}
                    onDeleteDocument={handleDeleteDocument}
                />
                <EditProfileModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    currentProfile={profile}
                    onSave={handleSaveProfile}
                />
            </main>
        </>
    );
}