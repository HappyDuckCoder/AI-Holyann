'use client';

import { useEffect, useState, useRef } from 'react';
import { Save, Upload, Plus, X, User, Briefcase, Award, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { MentorWithUser, Achievement, MentorType } from '@/types/mentor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/PageLoading';

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

  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState({ title: '', year: new Date().getFullYear() });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const response = await fetch('/api/mentor/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        const expertises =
          typeof data.expertises === 'string' ? JSON.parse(data.expertises) : data.expertises || [];
        const outstanding_achievements =
          typeof data.outstanding_achievements === 'string'
            ? JSON.parse(data.outstanding_achievements)
            : data.outstanding_achievements || [];

        setFormData({
          user: {
            full_name: data.user?.full_name || '',
            email: data.user?.email || '',
            phone_number: data.user?.phone_number || '',
            avatar_url: data.user?.avatar_url || null,
          },
          specialization: data.specialization || 'AS',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          website_url: data.website_url || '',
          university_name: data.university_name || '',
          degree: data.degree || '',
          major: data.major || '',
          graduation_year: data.graduation_year ?? undefined,
          current_company: data.current_company || '',
          current_job_title: data.current_job_title || '',
          years_of_experience: data.years_of_experience ?? 0,
          expertises,
          outstanding_achievements,
        });
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        toast.error('Không thể tải thông tin hồ sơ', {
          description: 'Vui lòng thử lại hoặc làm mới trang.',
        });
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
        headers: { 'Content-Type': 'application/json' },
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

      toast.success('Đã lưu hồ sơ', {
        description: 'Thông tin chuyên môn của bạn đã được cập nhật.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Cập nhật thất bại', {
        description: 'Vui lòng kiểm tra và thử lại.',
      });
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
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <PageLoading inline size="md" className="py-0" />
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
      <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-foreground">Thông tin cơ bản</CardTitle>
              <CardDescription className="text-muted-foreground">
                Họ tên, liên hệ và ảnh đại diện
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-primary-foreground ring-2 ring-border">
              {formData.user?.avatar_url ? (
                <img
                  src={formData.user.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                formData.user?.full_name?.charAt(0).toUpperCase() ?? 'M'
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={() => {}}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Tải ảnh lên
              </Button>
              <p className="text-xs text-muted-foreground">PNG, JPG tối đa 2MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                required
                value={formData.user?.full_name || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    user: { ...formData.user!, full_name: e.target.value },
                  })
                }
                className="border-input bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                disabled
                value={formData.user?.email || ''}
                className="bg-muted/50 text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-foreground">
                Số điện thoại
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.user?.phone_number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    user: { ...formData.user!, phone_number: e.target.value },
                  })
                }
                className="border-input bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Professional Info */}
      <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/20 text-secondary-foreground dark:bg-secondary/30">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-foreground">Thông tin chuyên môn</CardTitle>
              <CardDescription className="text-muted-foreground">
                Học vấn, kinh nghiệm và liên kết
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-foreground">
              Chuyên môn
            </Label>
            <Input
              id="specialization"
              disabled
              value={getMentorTypeLabel(formData.specialization!)}
              className="bg-muted/50 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Chuyên môn được gán bởi hệ thống và không thể thay đổi
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground">
              Giới thiệu
            </Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Giới thiệu ngắn về bản thân và kinh nghiệm..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-foreground">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="border-input bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url" className="text-foreground">
                Website
              </Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
                className="border-input bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="university_name" className="text-foreground">
                Trường đại học
              </Label>
              <Input
                id="university_name"
                value={formData.university_name || ''}
                onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                className="border-input bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-foreground">
                Bằng cấp
              </Label>
              <Input
                id="degree"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="VD: Cử nhân, Thạc sĩ"
                className="border-input bg-background text-foreground"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="major" className="text-foreground">
                Chuyên ngành
              </Label>
              <Input
                id="major"
                value={formData.major || ''}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="border-input bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_of_experience" className="text-foreground">
                Số năm kinh nghiệm
              </Label>
              <Input
                id="years_of_experience"
                type="number"
                min={0}
                value={formData.years_of_experience ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    years_of_experience: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="border-input bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_company" className="text-foreground">
                Công ty hiện tại
              </Label>
              <Input
                id="current_company"
                value={formData.current_company || ''}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                className="border-input bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_job_title" className="text-foreground">
                Chức vụ
              </Label>
              <Input
                id="current_job_title"
                value={formData.current_job_title || ''}
                onChange={(e) => setFormData({ ...formData, current_job_title: e.target.value })}
                className="border-input bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Expertises */}
      <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground dark:bg-accent/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-foreground">Lĩnh vực chuyên môn</CardTitle>
              <CardDescription className="text-muted-foreground">
                Thêm các lĩnh vực bạn có kinh nghiệm tư vấn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.expertises?.map((expertise, idx) => (
              <Badge
                key={expertise}
                variant={idx % 3 === 0 ? 'default' : idx % 3 === 1 ? 'secondary' : 'outline'}
                className="gap-1 py-1.5 pl-2.5 pr-1"
              >
                {expertise}
                <button
                  type="button"
                  onClick={() => removeExpertise(expertise)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 dark:hover:bg-primary/30"
                  aria-label="Xóa"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
              placeholder="Thêm lĩnh vực chuyên môn..."
              className="border-input bg-background text-foreground"
            />
            <Button type="button" variant="secondary" size="default" onClick={addExpertise} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Achievements */}
      <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-foreground">Thành tích nổi bật</CardTitle>
              <CardDescription className="text-muted-foreground">
                Giải thưởng, học bổng hoặc thành tựu đáng chú ý
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {formData.outstanding_achievements?.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 dark:bg-muted/20"
              >
                <span className="text-sm font-medium text-foreground">
                  {achievement.title}
                  <span className="ml-2 text-muted-foreground">({achievement.year})</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeAchievement(index)}
                  className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Xóa thành tích"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-foreground sr-only">Tên thành tích</Label>
              <Input
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                placeholder="Tên thành tích..."
                className="border-input bg-background text-foreground"
              />
            </div>
            <div className="w-full sm:w-24 space-y-2">
              <Label className="text-foreground sr-only">Năm</Label>
              <Input
                type="number"
                value={newAchievement.year}
                onChange={(e) =>
                  setNewAchievement({ ...newAchievement, year: parseInt(e.target.value) || new Date().getFullYear() })
                }
                placeholder="Năm"
                className="border-input bg-background text-foreground"
              />
            </div>
            <Button type="button" variant="secondary" size="default" onClick={addAchievement} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
