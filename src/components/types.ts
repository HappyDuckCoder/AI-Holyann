export type DocumentType = 'transcript' | 'certificate' | 'letter' | 'essay' | 'other';

export type ActivityCategory = 'academic' | 'non_academic';

export interface Extracurricular {
    id: string;
    title: string;
    role: string;
    year: string;
    description: string;
    category?: ActivityCategory;
}

export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    uploadDate: string;
    size: string;
}

/** Một chứng chỉ ngoại ngữ (IELTS, TOEFL, ...) */
export interface EnglishCertificate {
    type: string;
    score: string;
}

export interface StudentProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    avatarUrl: string;
    gpa: number;
    gpaScale: number;
    /** Chuỗi hiển thị (vd: "IELTS 7.0, TOEFL 100") - từ englishCertificates nếu có */
    englishLevel: string;
    /** Danh sách chứng chỉ ngoại ngữ để thêm/sửa/xóa */
    englishCertificates?: EnglishCertificate[];
    satScore?: number;
    targetMajor: string;
    targetCountry: string;
    extracurriculars: Extracurricular[];
    /** Thành tích: text hoặc object có id để sửa/xóa */
    achievements: (string | { id: string; text: string; category?: 'academic' | 'non_academic' })[];
    documents: Document[];
}

export interface SwotItem {
    id: string;
    text: string;
    category: 'strength' | 'weakness' | 'opportunity' | 'threat';
}

export interface StrategyItem {
    title: string;
    description: string;
}

export interface SwotData {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    strategicAdvice: StrategyItem[];
    scores: {
        academic: number;
        extracurricular: number;
        skills: number;
        language: number;
        leadership: number;
    }
}

export interface Task {
    id: string;
    title: string;
    deadline: string;
    deadlineRaw?: Date | string | null; // Raw deadline date from database for calculations
    isCompleted: boolean;
    category?: string; // e.g., "Hồ sơ học thuật", "Tài liệu cần thiết"
    stageId: number;

    // New fields for file upload feature
    requiresFile?: boolean;    // Does this task require a file upload?
    uploadedFile?: string;     // Name of the uploaded file (if any)
    feedback?: string;         // Mentor feedback
    linkTo?: string;           // Link to navigate when task is clicked (for test tasks)
    isLocked?: boolean;        // Task is locked (completed from database, cannot be manually changed)
    status?: string;           // PENDING, IN_PROGRESS, SUBMITTED, COMPLETED, NEEDS_REVISION
    mentorNote?: string;       // Mentor's note for revision
    completedAt?: Date;        // Timestamp when the task was completed

    // Database progress information
    progress?: {
        status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'NEEDS_REVISION';
        submission_url?: string;
        mentor_note?: string;
        completed_at?: Date;
        created_at?: Date;
        updated_at?: Date;
    };
}

export interface Stage {
    id: number;
    name: string;
    description: string;
    isUnlocked: boolean;
}

export type TestType = 'MBTI' | 'GRIT' | 'RIASEC';

export type MBTIDimension = 'E/I' | 'S/N' | 'T/F' | 'J/P';
export type GritComponent = 'passion' | 'perseverance';

// Legacy interface for backward compatibility
export interface Question {
    id: number;
    text: string;
    type: TestType;

    // For MBTI
    optionA?: string;
    optionB?: string;
    dimension?: string | MBTIDimension;
    positiveDirection?: boolean;

    // For RIASEC
    category?: string;

    // For GRIT
    component?: GritComponent;
    reverse?: boolean;
}

export interface TestQuestion {
    id: string;
    question: string;
    reverse?: boolean; // true = reverse score (6 - answer)
}

// Specific test question types with id field
// For MBTI (Legacy - A/B options)
export interface MBTIQuestion {
    id: number;
    type: TestType;
    text: string;
    dimension: MBTIDimension;
    positiveDirection: boolean;
}

export interface RIASECQuestion {
}

export interface GritQuestion {
    id: number;
    text: string;
    component: GritComponent;
}

// Test Result interface
export interface TestResult {
    type: TestType;
    scores: Record<string, number>;
    rawLabel: string;
    description: string;
}

// Major Recommendation interface
export interface MajorRecommendation {
    name: string;
    category: string;
    matchReason: string;
    careerPaths: string[];
    requiredSkills: string[];
    matchPercentage?: number;
}