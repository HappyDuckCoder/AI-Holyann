'use client'

import { useState, useEffect } from 'react'
import { getMentorsAction } from '@/actions/admin/get-mentors'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Mail, Phone, Globe, Linkedin, Briefcase, GraduationCap, Star, Users } from 'lucide-react'

// Define type based on action return
type MentorWithUser = {
    user_id: string
    specialization: string
    bio: string | null
    linkedin_url: string | null
    website_url: string | null
    university_name: string | null
    degree: string | null
    major: string | null
    graduation_year: number | null
    current_company: string | null
    current_job_title: string | null
    years_of_experience: number | null
    expertises: any
    outstanding_achievements: any
    is_accepting_students: boolean | null
    max_students: number | null
    rating: number | null
    user: {
        id: string
        full_name: string
        email: string
        avatar_url: string | null
        phone_number: string | null
        is_active: boolean | null
        created_at: Date | null
    }
    assignments: any[]
}

export default function MentorManagement() {
    const [mentors, setMentors] = useState<MentorWithUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMentor, setSelectedMentor] = useState<MentorWithUser | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchMentors = async () => {
            const result = await getMentorsAction()
            if (result.success) {
                setMentors(result.data as any)
            }
            setLoading(false)
        }
        fetchMentors()
    }, [])

    const filteredMentors = mentors.filter(mentor =>
        mentor.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border">
                <input
                    type="text"
                    placeholder="Tìm kiếm mentor..."
                    className="px-4 py-2 border rounded-lg w-64 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                    Tổng: {filteredMentors.length} mentors
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                    <Dialog key={mentor.user_id} onOpenChange={(open) => open && setSelectedMentor(mentor)}>
                        <DialogTrigger asChild>
                            <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition cursor-pointer group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                        {/* Avatar placeholder or image */}
                                        {mentor.user.avatar_url ? (
                                            <img src={mentor.user.avatar_url} alt={mentor.user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-xl font-bold">
                                                {mentor.user.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg group-hover:text-primary transition truncate">{mentor.user.full_name}</h3>
                                        <p className="text-sm text-muted-foreground">{mentor.specialization}</p>
                                        <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                                            <Star size={12} fill="currentColor" />
                                            <span>{mentor.rating ? mentor.rating.toFixed(1) : '5.0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm border-t pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users size={14} />
                                        <span>{mentor.assignments.length}/{mentor.max_students} Học viên</span>
                                    </div>
                                    <div className={`text-right font-medium ${mentor.is_accepting_students ? 'text-green-600' : 'text-red-600'}`}>
                                        {mentor.is_accepting_students ? 'Đang nhận' : 'Full'}
                                    </div>
                                </div>
                            </div>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Hồ sơ Mentor</DialogTitle>
                            </DialogHeader>
                            {selectedMentor && (
                                <div className="space-y-6">
                                    {/* Header Info */}
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b">
                                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                             {selectedMentor.user.avatar_url ? (
                                                <img src={selectedMentor.user.avatar_url} alt={selectedMentor.user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-3xl font-bold">
                                                    {selectedMentor.user.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h2 className="text-2xl font-bold">{selectedMentor.user.full_name}</h2>
                                            <p className="text-primary font-medium flex items-center justify-center md:justify-start gap-2">
                                                <Briefcase size={16} />
                                                {selectedMentor.current_job_title || 'Mentor'} @ {selectedMentor.current_company || 'Freelance'}
                                            </p>

                                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                                                 <a href={`mailto:${selectedMentor.user.email}`} className="flex items-center gap-1 text-sm hover:underline">
                                                    <Mail size={14} /> {selectedMentor.user.email}
                                                </a>
                                                {selectedMentor.user.phone_number && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Phone size={14} /> {selectedMentor.user.phone_number}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-center md:justify-start gap-3 mt-3">
                                                {selectedMentor.linkedin_url && (
                                                    <a href={selectedMentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:opacity-80">
                                                        <Linkedin size={20} />
                                                    </a>
                                                )}
                                                {selectedMentor.website_url && (
                                                    <a href={selectedMentor.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:opacity-80">
                                                        <Globe size={20} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                                            <div className="text-2xl font-bold">{selectedMentor.years_of_experience || 0}</div>
                                            <div className="text-xs text-muted-foreground">Năm kinh nghiệm</div>
                                        </div>
                                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                                            <div className="text-2xl font-bold">{selectedMentor.rating ? selectedMentor.rating.toFixed(1) : '5.0'}</div>
                                            <div className="text-xs text-muted-foreground">Đánh giá</div>
                                        </div>
                                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                                            <div className="text-2xl font-bold">{selectedMentor.max_students}</div>
                                            <div className="text-xs text-muted-foreground">Học viên tối đa</div>
                                        </div>
                                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                                            <div className="text-2xl font-bold text-primary">{selectedMentor.specialization}</div>
                                            <div className="text-xs text-muted-foreground">Chuyên môn</div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                                            Giới thiệu
                                        </h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{selectedMentor.bio || 'Chưa cập nhật thông tin giới thiệu.'}</p>
                                    </div>

                                    {/* Education */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                             <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                             Học vấn
                                        </h3>
                                        {selectedMentor.university_name ? (
                                            <div className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                                <GraduationCap className="shrink-0 text-blue-500 mt-1" />
                                                <div>
                                                    <div className="font-semibold">{selectedMentor.university_name}</div>
                                                    <div className="text-sm text-muted-foreground">{selectedMentor.degree} - {selectedMentor.major}</div>
                                                    {selectedMentor.graduation_year && (
                                                        <div className="text-xs text-muted-foreground mt-1">Tốt nghiệp năm {selectedMentor.graduation_year}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground italic">Chưa cập nhật học vấn.</p>
                                        )}
                                    </div>

                                     {/* Achievements (JSON) */}
                                    {Array.isArray(selectedMentor.outstanding_achievements) && selectedMentor.outstanding_achievements.length > 0 && (
                                         <div className="space-y-2">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                 <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                                                 Thành tích nổi bật
                                            </h3>
                                            <ul className="space-y-2">
                                                {selectedMentor.outstanding_achievements.map((item: any, idx: number) => (
                                                    <li key={idx} className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg flex items-start gap-2 text-sm text-foreground">
                                                        <Star size={16} className="text-yellow-500 shrink-0 mt-0.5" fill="currentColor" />
                                                        <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                ))}

                {filteredMentors.length === 0 && !loading && (
                     <div className="col-span-full text-center py-16 bg-white dark:bg-card rounded-xl border border-dashed">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium">Không tìm thấy mentor nào</h3>
                        <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
