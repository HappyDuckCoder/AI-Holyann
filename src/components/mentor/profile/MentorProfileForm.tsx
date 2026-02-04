'use client';

import { useEffect, useState } from 'react';
import { Save, Upload, Plus, X } from 'lucide-react';
import type { MentorWithUser, Achievement, MentorType } from '@/types/mentor';

export default function MentorProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<MentorWithUser>>({
    user: {
      full_name: '',
      email: '',
      phone_number: '',
      avatar_url: null,
    },
    specialization: 'AS',
    bio: '',
    linkedin_url: '',
    website_url: '',
    university_name: '',
    degree: '',
    major: '',
    graduation_year: undefined,
    current_company: '',
    current_job_title: '',
    years_of_experience: 0,
    expertises: [],
    outstanding_achievements: [],
  });

  // For dynamic arrays
  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState({ title: '', year: new Date().getFullYear() });

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const response = await fetch('/api/mentor/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        
        // Parse JSON fields if they are strings
        const expertises = typeof data.expertises === 'string' 
          ? JSON.parse(data.expertises) 
          : data.expertises || [];
        
        const outstanding_achievements = typeof data.outstanding_achievements === 'string'
          ? JSON.parse(data.outstanding_achievements)
          : data.outstanding_achievements || [];

        setFormData({
          user: {
            full_name: data.user.full_name || '',
            email: data.user.email || '',
            phone_number: data.user.phone_number || '',
            avatar_url: data.user.avatar_url || null,
          },
          specialization: data.specialization || 'AS',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          website_url: data.website_url || '',
          university_name: data.university_name || '',
          degree: data.degree || '',
          major: data.major || '',
          graduation_year: data.graduation_year || undefined,
          current_company: data.current_company || '',
          current_job_title: data.current_job_title || '',
          years_of_experience: data.years_of_experience || 0,
          expertises: expertises,
          outstanding_achievements: outstanding_achievements,
        });
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        alert('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/mentor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            full_name: formData.user?.full_name,
            phone_number: formData.user?.phone_number,
            avatar_url: formData.user?.avatar_url,
          },
          bio: formData.bio,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          university_name: formData.university_name,
          degree: formData.degree,
          major: formData.major,
          graduation_year: formData.graduation_year,
          current_company: formData.current_company,
          current_job_title: formData.current_job_title,
          years_of_experience: formData.years_of_experience,
          expertises: formData.expertises,
          outstanding_achievements: formData.outstanding_achievements,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertises?.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        expertises: [...(formData.expertises || []), newExpertise.trim()],
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData({
      ...formData,
      expertises: formData.expertises?.filter((e) => e !== expertise) || [],
    });
  };

  const addAchievement = () => {
    if (newAchievement.title.trim()) {
      setFormData({
        ...formData,
        outstanding_achievements: [
          ...(formData.outstanding_achievements || []),
          { ...newAchievement },
        ],
      });
      setNewAchievement({ title: '', year: new Date().getFullYear() });
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      outstanding_achievements: formData.outstanding_achievements?.filter((_, i) => i !== index) || [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f4c81] border-t-transparent" />
      </div>
    );
  }

  const getMentorTypeLabel = (type: MentorType) => {
    switch (type) {
      case 'AS':
        return 'Admissions Strategist';
      case 'ACS':
        return 'Academic Content Specialist';
      case 'ARD':
        return 'Activity & Research Development';
      default:
        return type;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Basic Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
        
        <div className="space-y-4">
          {/* Avatar Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0f4c81] to-blue-600 text-2xl font-bold text-white">
                {formData.user?.full_name?.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Tải ảnh lên
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">PNG, JPG tối đa 2MB</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              required
              value={formData.user?.full_name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  user: { ...formData.user!, full_name: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              disabled
              value={formData.user?.email || ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone_number"
              value={formData.user?.phone_number || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  user: { ...formData.user!, phone_number: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Professional Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Thông tin chuyên môn</h2>
        
        <div className="space-y-4">
          {/* Specialization (Disabled/Locked) */}
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
              Chuyên môn
            </label>
            <input
              type="text"
              id="specialization"
              disabled
              value={getMentorTypeLabel(formData.specialization!)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Chuyên môn được gán bởi hệ thống và không thể thay đổi
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Giới thiệu
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              placeholder="Giới thiệu ngắn về bản thân và kinh nghiệm..."
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedin_url"
              value={formData.linkedin_url || ''}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              id="website_url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* University */}
            <div>
              <label htmlFor="university_name" className="block text-sm font-medium text-gray-700">
                Trường đại học
              </label>
              <input
                type="text"
                id="university_name"
                value={formData.university_name || ''}
                onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>

            {/* Major */}
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                Chuyên ngành
              </label>
              <input
                type="text"
                id="major"
                value={formData.major || ''}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Current Company */}
            <div>
              <label htmlFor="current_company" className="block text-sm font-medium text-gray-700">
                Công ty hiện tại
              </label>
              <input
                type="text"
                id="current_company"
                value={formData.current_company || ''}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>

            {/* Current Job Title */}
            <div>
              <label htmlFor="current_job_title" className="block text-sm font-medium text-gray-700">
                Chức vụ
              </label>
              <input
                type="text"
                id="current_job_title"
                value={formData.current_job_title || ''}
                onChange={(e) => setFormData({ ...formData, current_job_title: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Expertises (Dynamic Array) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Lĩnh vực chuyên môn</h2>
        
        {/* Display current expertises */}
        <div className="mb-4 flex flex-wrap gap-2">
          {formData.expertises?.map((expertise) => (
            <span
              key={expertise}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
            >
              {expertise}
              <button
                type="button"
                onClick={() => removeExpertise(expertise)}
                className="ml-1 rounded-full hover:bg-blue-200"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>

        {/* Add new expertise */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
            placeholder="Thêm lĩnh vực chuyên môn..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
          <button
            type="button"
            onClick={addExpertise}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
      </div>

      {/* Section 4: Achievements (Dynamic Array) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Thành tích nổi bật</h2>
        
        {/* Display current achievements */}
        <div className="mb-4 space-y-2">
          {formData.outstanding_achievements?.map((achievement, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div>
                <span className="font-medium text-gray-900">{achievement.title}</span>
                <span className="ml-2 text-sm text-gray-500">({achievement.year})</span>
              </div>
              <button
                type="button"
                onClick={() => removeAchievement(index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new achievement */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newAchievement.title}
            onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
            placeholder="Tên thành tích..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
          <input
            type="number"
            value={newAchievement.year}
            onChange={(e) => setNewAchievement({ ...newAchievement, year: parseInt(e.target.value) })}
            placeholder="Năm"
            className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
          <button
            type="button"
            onClick={addAchievement}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-[#0f4c81] px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </form>
  );
}
