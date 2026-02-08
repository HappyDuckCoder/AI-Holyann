import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function safeDate(date: any): string | null {
    if (!date) return null;
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ student_id: string }> }
) {
    try {
        const { student_id } = await params;

        console.log('📋 [API] Fetching profile for student_id:', student_id);

        if (!student_id) {
             throw new Error('Student ID is missing');
        }

        // Lấy thông tin từ users
        console.log('🔍 [API] Querying database for user...');
        let user: any;
        try {
            // Step 1: Fetch basic user info
            user = await prisma.users.findUnique({
                where: { id: student_id },
            });

            if (!user) {
                console.error('❌ [API] User not found:', student_id);
                return NextResponse.json(
                    { error: 'Không tìm thấy người dùng' },
                    { status: 404 }
                );
            }

            // Step 2: Fetch student details separately to avoid nested include issues
            console.log('🔍 [API] Fetching student record directly...');
            const studentRecordPromise = prisma.students.findUnique({
                where: { user_id: student_id }
            });

            // Fetch relations independently to avoid deep nesting issues in Prisma
            const studentRecord = await studentRecordPromise;

            if (studentRecord) {
                // Fetch background
                console.log('🔍 [API] Fetching background...');
                const background = await prisma.student_backgrounds.findUnique({
                    where: { student_id: student_id },
                    include: {
                        academic_awards: true,
                        academic_extracurriculars: true,
                        non_academic_awards: true,
                        non_academic_extracurriculars: true,
                        research_experiences: true,
                        work_experiences: true,
                        subject_scores: true,
                        personal_projects: true,
                    }
                });

                // Fetch Academic Profile
                console.log('🔍 [API] Fetching academic profile...');
                const academicProfile = await prisma.student_academic_profiles.findUnique({
                    where: { student_id: student_id }
                });

                // Fetch Parents
                console.log('🔍 [API] Fetching parents...');
                const parents = await prisma.student_parents.findMany({
                    where: { student_id: student_id }
                });

                // Fetch Skills
                console.log('🔍 [API] Fetching skills...');
                const skills = await prisma.student_skills.findMany({
                    where: { student_id: student_id }
                });

                // Assemble the full object
                 // @ts-ignore
                studentRecord.background = background;
                 // @ts-ignore
                studentRecord.academic_profile = academicProfile;
                 // @ts-ignore
                studentRecord.parents = parents;
                 // @ts-ignore
                studentRecord.student_skills = skills;
            }

            // Attach student record to user object to maintain existing logic structure
            user.students = studentRecord;

        } catch (dbError: any) {
            console.error('❌ [API] Database query failed:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
        }

        console.log('✅ [API] User processing:', {
            id: user.id,
            email: user.email,
            hasStudentRecord: !!user.students
        });

        // Nếu chưa có student record, tự động tạo
        if (!user.students) {
            console.log('⚠️ [API] No student record found, creating one...');

            try {
                console.log('🛠️ [API] Creating new student record...');
                const newStudent = await prisma.students.create({
                    data: {
                        user_id: student_id,
                        // Các trường khác để null/default
                    },
                    include: {
                        background: {
                            include: {
                                academic_awards: true,
                                academic_extracurriculars: true,
                                non_academic_awards: true,
                                non_academic_extracurriculars: true,
                                research_experiences: true,
                                work_experiences: true,
                                subject_scores: true,
                                personal_projects: true,
                            }
                        },
                        academic_profile: true,
                        parents: true,
                        student_skills: true,
                    }
                });

                console.log('✅ [API] Student record created successfully');
                // Update user object with new student record
                // @ts-ignore
                user.students = newStudent;
                console.log('✅ [API] User object updated with new student');
            } catch (createError) {
                console.error('❌ [API] Failed to create student record detailed:', createError);
                // Continue with user data only
            }
        }

        console.log('📊 [API] Processing profile data...');

        // Kiểm tra thông tin cơ bản đã đủ chưa
        const basicInfoComplete = !!(
            user.full_name &&
            user.email &&
            user.phone_number &&
            user.students?.date_of_birth
        );

        // Kiểm tra thông tin học thuật đã đủ chưa
        const academicProfile = user.students?.academic_profile;
        const hasAcademicInfo = !!(
            academicProfile?.gpa_transcript_details ||
            academicProfile?.english_certificates ||
            academicProfile?.standardized_tests
        );

        const background = user.students?.background;
        const hasExtracurriculars = !!(
            background?.academic_extracurriculars?.length ||
            background?.non_academic_extracurriculars?.length ||
            background?.academic_awards?.length ||
            background?.non_academic_awards?.length ||
            background?.work_experiences?.length ||
            background?.research_experiences?.length
        );

        const response = {
            basicInfo: {
                full_name: user.full_name || null,
                email: user.email || null,
                phone_number: user.phone_number || null,
                date_of_birth: safeDate(user.students?.date_of_birth),
                current_address: user.students?.current_address || null,
                avatar_url: user.avatar_url || null,
                status: basicInfoComplete ? 'Hoàn tất' : 'Cần bổ sung'
            },
            studentInfo: {
                current_school: user.students?.current_school || null,
                current_grade: user.students?.current_grade || null,
                intended_major: user.students?.intended_major || null,
                target_country: user.students?.target_country || null,
                yearly_budget: user.students?.yearly_budget ? user.students.yearly_budget.toString() : null,
                talents: user.students?.talents || null,
                hobbies: user.students?.hobbies || null,
                personal_desire: user.students?.personal_desire || null,
            },
            academicProfile: academicProfile || null,
            background: background || null,
            parents: user.students?.parents || [],
            status: {
                basicInfoComplete,
                hasAcademicInfo,
                hasExtracurriculars,
                overallStatus: (basicInfoComplete && hasAcademicInfo && hasExtracurriculars) 
                    ? 'Hoàn tất' 
                    : 'Cần bổ sung',
                isNewStudent: !user.students || (!hasAcademicInfo && !hasExtracurriculars)
            }
        };

        console.log('📤 [API] Returning profile data:', {
            hasBasicInfo: basicInfoComplete,
            hasAcademicInfo,
            hasExtracurriculars,
            isNewStudent: response.status.isNewStudent
        });

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('❌ Error fetching student profile:', error);
        console.error('❌ Error Stack:', error.stack);
        return NextResponse.json(
            { error: 'Lỗi khi lấy thông tin học sinh', details: error.message },
            { status: 500 }
        );
    }
}

// Cập nhật thông tin cơ bản
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ student_id: string }> }
) {
    try {
        const { student_id } = await params;
        const body = await request.json();
        const { basicInfo, studentInfo } = body;

        // Cập nhật bảng users (từ basicInfo)
        if (basicInfo) {
            const userUpdate: any = {};
            if (basicInfo.full_name) userUpdate.full_name = basicInfo.full_name;
            if (basicInfo.phone_number) userUpdate.phone_number = basicInfo.phone_number;
            if (basicInfo.email) userUpdate.email = basicInfo.email;
            if (basicInfo.avatar_url !== undefined) userUpdate.avatar_url = basicInfo.avatar_url;

            if (Object.keys(userUpdate).length > 0) {
                await prisma.users.update({
                    where: { id: student_id },
                    data: userUpdate
                });
            }

            // Cập nhật students từ basicInfo
            const studentBasicUpdate: any = {};
            if (basicInfo.current_school) studentBasicUpdate.current_school = basicInfo.current_school;
            if (basicInfo.current_grade) studentBasicUpdate.current_grade = basicInfo.current_grade;
            if (basicInfo.current_address) studentBasicUpdate.current_address = basicInfo.current_address;
            if (basicInfo.talents) studentBasicUpdate.talents = basicInfo.talents;
            if (basicInfo.hobbies) studentBasicUpdate.hobbies = basicInfo.hobbies;
            if (basicInfo.date_of_birth) studentBasicUpdate.date_of_birth = new Date(basicInfo.date_of_birth);

            if (Object.keys(studentBasicUpdate).length > 0) {
                await prisma.students.update({
                    where: { user_id: student_id },
                    data: studentBasicUpdate
                });
            }
        }

        // Cập nhật bảng students
        if (studentInfo) {
            await prisma.students.upsert({
                where: { user_id: student_id },
                update: {
                    date_of_birth: studentInfo.date_of_birth ? new Date(studentInfo.date_of_birth) : undefined,
                    current_address: studentInfo.current_address || undefined,
                    current_school: studentInfo.current_school || undefined,
                    current_grade: studentInfo.current_grade || undefined,
                    intended_major: studentInfo.intended_major || undefined,
                    target_country: studentInfo.target_country || undefined,
                    yearly_budget: studentInfo.yearly_budget ? studentInfo.yearly_budget : null,
                    talents: studentInfo.talents || undefined,
                    hobbies: studentInfo.hobbies || undefined,
                    personal_desire: studentInfo.personal_desire || undefined,
                },
                create: {
                    user_id: student_id,
                    date_of_birth: studentInfo.date_of_birth ? new Date(studentInfo.date_of_birth) : undefined,
                    current_address: studentInfo.current_address || undefined,
                    current_school: studentInfo.current_school || undefined,
                    current_grade: studentInfo.current_grade || undefined,
                    intended_major: studentInfo.intended_major || undefined,
                    target_country: studentInfo.target_country || undefined,
                    yearly_budget: studentInfo.yearly_budget ? studentInfo.yearly_budget : null,
                    talents: studentInfo.talents || undefined,
                    hobbies: studentInfo.hobbies || undefined,
                    personal_desire: studentInfo.personal_desire || undefined,
                }
            });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Cập nhật thông tin thành công' 
        });
    } catch (error) {
        console.error('❌ Error updating student profile:', error);
        return NextResponse.json(
            { error: 'Lỗi khi cập nhật thông tin' },
            { status: 500 }
        );
    }
}
