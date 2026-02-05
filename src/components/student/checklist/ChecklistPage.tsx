'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {
    CheckSquare,
    Square,
    ArrowRight,
    Flag,
    Rocket,
    Trophy,
    AlertCircle,
    ChevronDown,
    UploadCloud,
    FileText,
    MessageSquare,
    Clock,
    Calendar,
    Loader2,
    Sparkles,
    AlertTriangle
} from 'lucide-react';
import {Task, Stage, StudentProfile} from '@/components/types';
import ProgressBar from './ProgressBar';
import StageNavigation from './StageNavigation';
import {scanCVWithAI} from '@/service/geminiService';

// Helper to calculate days remaining
const getDaysRemaining = (deadline: string) => {
    const parts = deadline.split('/');
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return {text: 'Quá hạn', color: 'text-red-600 bg-red-50 ring-red-100'};
    if (diffDays <= 7) return {text: `Còn ${diffDays} ngày`, color: 'text-orange-600 bg-orange-50 ring-orange-100'};
    return {text: 'Đang thực hiện', color: 'text-blue-600 bg-blue-50 ring-blue-100'};
};

const ChecklistPage: React.FC = () => {
    // Fixed: Removed setTaskProgress usage - v2.0
    const { data: session } = useSession();
    const [stages, setStages] = useState<Stage[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeStageId, setActiveStageId] = useState<number>(1);
    const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
    const [uploadingCV, setUploadingCV] = useState(false);
    const [scanningCV, setScanningCV] = useState(false);
    const [scannedProfile, setScannedProfile] = useState<StudentProfile | null>(null);
    const [cvScanError, setCvScanError] = useState<string>('');
    const [loadingProgress, setLoadingProgress] = useState(true);

    const router = useRouter();

    // Load real checklist data from API
    const fetchChecklistData = useCallback(async () => {
        try {
            setLoadingProgress(true);
            console.log('📋 Loading real checklist data from API...');

            const response = await fetch('/api/student/checklist', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success && result.data) {
                const { stages: apiStages, tasks: apiTasks, progress } = result.data;

                console.log('✅ Real data loaded:', { stages: apiStages.length, tasks: apiTasks.length, progress: progress.length });

                // Transform API stages to UI format
                const transformedStages: Stage[] = apiStages.map((stage: any, index: number) => ({
                    id: stage.id,
                    name: stage.name,
                    description: stage.description || '',
                    isUnlocked: stage.isUnlocked || index === 0 // First stage always unlocked
                }));

                // Transform API tasks to UI format
                const transformedTasks: Task[] = apiTasks.map((task: any) => {
                    const taskProgress = progress.find((p: any) => p.task_id === task.id);

                    return {
                        id: task.id,
                        stageId: task.stage_id,
                        title: task.title,
                        description: task.description || '',
                        deadline: '30/12/2026', // Default deadline, can be enhanced later
                        isCompleted: taskProgress?.status === 'COMPLETED',
                        isLocked: taskProgress?.status === 'COMPLETED', // Lock completed tasks from DB
                        status: taskProgress?.status || 'PENDING', // Add status field
                        requiresFile: task.title.toLowerCase().includes('upload') ||
                                     task.title.toLowerCase().includes('tải lên') ||
                                     task.title.toLowerCase().includes('cv') ||
                                     task.title.toLowerCase().includes('tài liệu'),
                        category: task.stage?.name || 'Chung',
                        linkTo: task.link_to || undefined,
                        uploadedFile: taskProgress?.submission_url ? 'File đã upload' : undefined,
                        feedback: taskProgress?.mentor_note || // Priority 1: Use mentor note from DB
                                 apiTasks.find((apiTask: any) => apiTask.id === task.id)?.feedback || // Priority 2: Use feedback from task transformation
                                 (task.title.includes('MBTI') ? 'Bài test MBTI giúp bạn hiểu rõ kiểu tính cách của mình, từ đó định hướng nghề nghiệp và môi trường học tập phù hợp.' :
                                  task.title.includes('Grit') ? 'Grit Scale đo lường mức độ kiên trì và đam mê theo đuổi mục tiêu dài hạn của bạn.' :
                                  task.title.includes('Holland') || task.title.includes('RIASEC') ? 'Holland Code giúp xác định xu hướng nghề nghiệp dựa trên 6 nhóm tính cách: Realistic, Investigative, Artistic, Social, Enterprising, Conventional.' :
                                  undefined) // Priority 3: Default feedback for tests only
                    };
                });

                setStages(transformedStages);
                setTasks(transformedTasks);

                // Set active stage to latest available instead of first stage
                if (transformedStages.length > 0) {
                    const latestStageId = getLatestAvailableStage(transformedStages, transformedTasks);
                    setActiveStageId(latestStageId);
                    // Save to localStorage for persistence
                    localStorage.setItem('activeStageId', latestStageId.toString());
                }
            } else {
                console.error('❌ Failed to load checklist data:', result.error);
            }
        } catch (error) {
            console.error('❌ Error loading checklist data:', error);
        } finally {
            setLoadingProgress(false);
        }
    }, []); // Empty dependency array - chỉ tạo function 1 lần

    // Sync with test completion status
    const fetchProgress = useCallback(async () => {
        if (!session?.user?.id) {
            console.log('⏭️ Skipping fetchProgress - no session user ID');
            return;
        }

        try {
            console.log('🔄 Fetching test progress...');
            // Check test completion status
            const testResponse = await fetch('/api/tests/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (testResponse.ok) {
                const testResult = await testResponse.json();
                if (testResult.success) {
                    console.log('📊 Test status received:', testResult.data);
                    // Update task completion based on test status
                    setTasks(prev => prev.map(task => {
                        let isCompleted = task.isCompleted;
                        let isLocked = task.isLocked;

                        // Map test completion to tasks
                        if (task.linkTo === '/dashboard/tests' && task.title.includes('MBTI')) {
                            isCompleted = testResult.data.mbti?.status === 'COMPLETED';
                            isLocked = testResult.data.mbti?.status === 'COMPLETED';
                        } else if (task.linkTo === '/dashboard/tests' && task.title.includes('Grit')) {
                            isCompleted = testResult.data.grit?.status === 'COMPLETED';
                            isLocked = testResult.data.grit?.status === 'COMPLETED';
                        } else if (task.linkTo === '/dashboard/tests' && (task.title.includes('Holland') || task.title.includes('RIASEC'))) {
                            isCompleted = testResult.data.riasec?.status === 'COMPLETED';
                            isLocked = testResult.data.riasec?.status === 'COMPLETED';
                        }

                        return { ...task, isCompleted, isLocked };
                    }));
                }
            }
        } catch (error) {
            console.error('❌ Error fetching test progress:', error);
        }
    }, []); // Empty dependency - function stable, chỉ check session bên trong

    useEffect(() => {
        fetchChecklistData();
    }, []); // Chỉ chạy 1 lần khi component mount

    useEffect(() => {
        if (tasks.length > 0 && session?.user?.id) {
            fetchProgress();
        }
    }, [session?.user?.id, tasks.length]); // Chỉ chạy khi session hoặc tasks thay đổi

    // Consolidated auto-refresh logic - chỉ 1 useEffect để tránh conflicts
    useEffect(() => {
        let refreshTimeout: NodeJS.Timeout;

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('📍 Page visible again, scheduling refresh...');
                // Debounce refresh để tránh quá nhiều calls
                clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(() => {
                    fetchChecklistData();
                    if (tasks.length > 0 && session?.user?.id) {
                        fetchProgress();
                    }
                }, 500); // Wait 500ms trước khi refresh
            }
        };

        const handleFocus = () => {
            // Chỉ refresh khi really cần thiết và không spam
            if (document.visibilityState === 'visible') {
                console.log('📍 Page focused, scheduling refresh...');
                clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(() => {
                    fetchChecklistData();
                }, 1000); // Wait 1s để tránh spam
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearTimeout(refreshTimeout);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [session?.user?.id, tasks.length]); // Dependencies ít hơn và stable hơn

    const handleToggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.isLocked) return; // Don't toggle if task is locked (completed from database)

        // For tasks that require navigation (tests), don't toggle manually
        if (task.linkTo) {
            router.push(task.linkTo);
            return;
        }

        // Update task locally first (optimistic UI)
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        ));

        // Sync with database
        try {
            const response = await fetch('/api/student/checklist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId,
                    isCompleted: !task.isCompleted
                })
            });

            if (!response.ok) {
                // Revert if API call failed
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, isCompleted: task.isCompleted } : t
                ));
                console.error('Failed to toggle task');
            } else {
                console.log('✅ Task toggled successfully');
            }
        } catch (error) {
            // Revert if API call failed
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, isCompleted: task.isCompleted } : t
            ));
            console.error('Error toggling task:', error);
        }
    };

    const handleToggleTaskExpansion = async (taskId: string) => {
        setExpandedTaskIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    // Handle task click - navigate to test page if task has linkTo and is not completed
    const handleTaskClick = (task: Task) => {
        // Ưu tiên expand cho task cần upload file
        if (task.requiresFile) {
            handleToggleTaskExpansion(task.id);
        } else if (task.linkTo && !task.isCompleted) {
            router.push(task.linkTo);
        } else {
            handleToggleTaskExpansion(task.id);
        }
    };

    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingCV(true);
        setScanningCV(true);
        setCvScanError('');

        try {
            console.log('📁 Uploading CV file:', file.name);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', session?.user?.id || '');
            formData.append('category', 'cv');

            // Upload file to server
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file');
            }

            const uploadResult = await uploadResponse.json();

            if (uploadResult.success && uploadResult.url) {
                console.log('✅ File uploaded successfully:', uploadResult.url);

                // Update task with uploaded file
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? {
                        ...t,
                        uploadedFile: file.name,
                        isCompleted: false, // Not completed yet, needs review
                        status: 'SUBMITTED' // Set to submitted for review
                    } : t
                ));

                // Submit task with file URL to complete it
                const submitResponse = await fetch('/api/student/checklist/submit-file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        taskId,
                        fileUrl: uploadResult.url,
                        studentId: session?.user?.id
                    })
                });

                if (submitResponse.ok) {
                    console.log('✅ Task completed and submitted to database');

                    // Try AI scanning (optional, won't fail the upload)
                    try {
                        const text = await file.text();
                        const profile = await scanCVWithAI(text);

                        if (profile) {
                            setScannedProfile(profile);
                            setTasks(prev => prev.map(t =>
                                t.id === taskId ? {
                                    ...t,
                                    feedback: `✅ AI đã scan thành công! Tìm thấy: ${profile.name}, GPA: ${profile.gpa}, ${profile.extracurriculars?.length || 0} hoạt động ngoại khóa, ${profile.achievements?.length || 0} thành tích.`
                                } : t
                            ));
                        }
                    } catch (scanError) {
                        console.warn('AI scanning failed, but file upload succeeded:', scanError);
                        // Don't show error since upload was successful
                    }
                } else {
                    console.error('File uploaded but failed to submit task');
                    setCvScanError('File đã upload nhưng không thể cập nhật trạng thái task.');
                }
            } else {
                throw new Error(uploadResult.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading CV:', error);
            setCvScanError('Lỗi khi upload file. Vui lòng thử lại.');

            // Reset task state on error
            setTasks(prev => prev.map(t =>
                t.id === taskId ? {
                    ...t,
                    uploadedFile: undefined,
                    isCompleted: false
                } : t
            ));
        } finally {
            setUploadingCV(false);
            setScanningCV(false);
        }
    };

    const handleUnlockNextStage = () => {
        const nextStageId = activeStageId + 1;
        if (nextStageId <= 3) {
            setStages(prev => prev.map(s =>
                s.id === nextStageId ? {...s, isUnlocked: true} : s
            ));
            setActiveStageId(nextStageId);
            localStorage.setItem('activeStageId', nextStageId.toString());
            console.log(`🔓 Unlocked and moved to stage: ${nextStageId}`);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    // Calculate the latest available stage (highest unlocked or with progress)
    const getLatestAvailableStage = useCallback((stagesData: Stage[], tasksData: Task[]) => {
        // First try to get from localStorage
        const savedStageId = localStorage.getItem('activeStageId');
        if (savedStageId) {
            const savedId = parseInt(savedStageId);
            // Validate that saved stage exists and is reasonable
            if (stagesData.find(s => s.id === savedId)) {
                console.log(`📍 Using saved stage from localStorage: ${savedId}`);
                return savedId;
            }
        }

        // Calculate progress for each stage
        const stageProgress = stagesData.map(stage => {
            const stageTasks = tasksData.filter(t => t.stageId === stage.id);
            const completedTasks = stageTasks.filter(t => t.isCompleted).length;
            const totalTasks = stageTasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return {
                stageId: stage.id,
                progress,
                hasStartedTasks: stageTasks.some(t => t.status === 'SUBMITTED' || t.status === 'COMPLETED'),
                isUnlocked: stage.isUnlocked
            };
        });

        // Find the latest stage with progress or unlocked
        let latestStage = 1; // Default to stage 1

        // Logic: Go to highest stage that either:
        // 1. Has been completed (100% progress)
        // 2. Has started tasks (some progress > 0 or submitted tasks)
        // 3. Is explicitly unlocked
        for (const stage of stageProgress.reverse()) { // Start from highest stage
            if (stage.progress === 100 || stage.hasStartedTasks || stage.isUnlocked) {
                latestStage = stage.stageId;
                break;
            }
        }

        console.log('📊 Stage progress analysis:', stageProgress);
        console.log(`📍 Auto-selected latest available stage: ${latestStage}`);

        return latestStage;
    }, []);
    const currentStageTasks = useMemo(() =>
        tasks.filter(t => t.stageId === activeStageId),
        [tasks, activeStageId]
    );

    const calculateProgress = useCallback((stageId: number) => {
        const stageTasks = tasks.filter(t => t.stageId === stageId);
        if (stageTasks.length === 0) return 0;
        const completed = stageTasks.filter(t => t.isCompleted).length;
        return (completed / stageTasks.length) * 100;
    }, [tasks]);

    const currentProgress = useMemo(() => calculateProgress(activeStageId), [activeStageId, calculateProgress]);

    const completedStages = useMemo(() => {
        return stages
            .filter(s => calculateProgress(s.id) === 100)
            .map(s => s.id);
    }, [stages, calculateProgress]);

    const canAdvance = currentProgress >= 90 && activeStageId < 3 && !stages.find(s => s.id === activeStageId + 1)?.isUnlocked;
    const isNextStageAlreadyUnlocked = stages.find(s => s.id === activeStageId + 1)?.isUnlocked;

    const tasksByCategory = useMemo(() => {
        const groups: { [key: string]: Task[] } = {};
        currentStageTasks.forEach(task => {
            const cat = task.category || 'Chung';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(task);
        });
        return groups;
    }, [currentStageTasks]);

    // Handle stage change with localStorage persistence
    const handleStageChange = useCallback((stageId: number) => {
        console.log(`📍 User selected stage: ${stageId}`);
        setActiveStageId(stageId);
        localStorage.setItem('activeStageId', stageId.toString());
    }, []);

    const orderedCategories = ['Khởi động', 'Khám phá bản thân', 'Chung', 'Hồ sơ học thuật', 'Tài liệu cần thiết', 'Cá nhân hóa (Mục tiêu Mỹ)'];

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Checklist Hồ sơ</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý các đầu việc cần làm để hoàn thiện hồ sơ du
                    học của bạn.</p>
            </div>

            {loadingProgress ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải tiến độ...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <StageNavigation
                            stages={stages}
                            currentStageId={activeStageId}
                            onSelectStage={handleStageChange}
                            completedStages={completedStages}
                        />
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${activeStageId === 1 ? 'bg-blue-100 text-blue-600' : activeStageId === 2 ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {activeStageId === 1 ? <Rocket size={24}/> : activeStageId === 2 ?
                                                <AlertCircle size={24}/> : <Trophy size={24}/>}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                                Giai đoạn {activeStageId}: {stages[activeStageId - 1].name}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                                {stages[activeStageId - 1].description}
                                            </p>
                                        </div>
                                    </div>

                                    {canAdvance && (
                                        <button
                                            onClick={handleUnlockNextStage}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium animate-pulse"
                                        >
                                            Mở khóa Giai đoạn {activeStageId + 1} <ArrowRight size={18}/>
                                        </button>
                                    )}

                                    {!canAdvance && isNextStageAlreadyUnlocked && (
                                        <button
                                            onClick={() => setActiveStageId(activeStageId + 1)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all font-medium text-sm"
                                        >
                                            Đến Giai đoạn {activeStageId + 1} <ArrowRight size={16}/>
                                        </button>
                                    )}
                                </div>
                                <ProgressBar percentage={currentProgress}/>
                            </div>

                            <div className="p-6 bg-gray-50/30 dark:bg-gray-900/30 min-h-[400px]">
                                {orderedCategories.filter(cat => tasksByCategory[cat]).map((category) => (
                                    <div key={category} className="mb-8 last:mb-0">
                                        {category !== 'Chung' && (
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                {category}
                                            </h3>
                                        )}

                                        <div className="space-y-3">
                                            {tasksByCategory[category].map((task) => {
                                                const deadlineStatus = getDaysRemaining(task.deadline);
                                                const isExpanded = expandedTaskIds.has(task.id);
                                                const needsFile = task.requiresFile;

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`group bg-white dark:bg-gray-800 border rounded-xl transition-all duration-300 cursor-pointer ${
                                                            task.isCompleted
                                                                ? 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
                                                                : `border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg ${isExpanded ? 'ring-1 ring-blue-300 shadow-md' : 'hover:-translate-y-0.5'}`
                                                        } ${task.linkTo && !task.isCompleted ? 'hover:border-purple-400 hover:ring-1 hover:ring-purple-200' : ''}`}
                                                        onClick={() => handleTaskClick(task)}
                                                    >
                                                        <div className="flex items-center justify-between p-4">
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (!task.isLocked) {
                                                                            handleToggleTask(task.id);
                                                                        }
                                                                    }}
                                                                    disabled={task.isLocked || (task.id === '1-2' && !task.uploadedFile)}
                                                                    title={
                                                                        task.isLocked
                                                                            ? '✅ Đã xác nhận từ database - không thể thay đổi thủ công'
                                                                            : task.id === '1-2' && !task.uploadedFile
                                                                                ? 'Vui lòng upload CV trước để hoàn thành task này'
                                                                                : ''
                                                                    }
                                                                    className={`flex-shrink-0 transition-all duration-300 transform ${
                                                                        task.isCompleted
                                                                            ? 'text-blue-600 scale-100 rotate-0'
                                                                            : task.status === 'SUBMITTED'
                                                                                ? 'text-yellow-500 scale-100 rotate-0'
                                                                                : task.status === 'NEEDS_REVISION'
                                                                                    ? 'text-red-500 scale-100 rotate-0'
                                                                                    : task.id === '1-2' && !task.uploadedFile
                                                                                        ? 'text-gray-200 dark:text-slate-600 cursor-not-allowed'
                                                                                        : 'text-gray-300 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 hover:scale-110'
                                                                    }`}
                                                                >
                                                                    {task.isCompleted ? (
                                                                        <CheckSquare size={24}
                                                                                     className={`transition-all duration-300 ease-out ${
                                                                                         task.isLocked ? 'fill-green-50' : 'fill-blue-50'
                                                                                     }`}/>
                                                                    ) : task.status === 'SUBMITTED' ? (
                                                                        <Clock size={24} className="fill-yellow-50"/>
                                                                    ) : task.status === 'NEEDS_REVISION' ? (
                                                                        <div className="relative">
                                                                            <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center">
                                                                                <AlertTriangle size={14} className="text-red-500 fill-red-500"/>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <Square size={24}/>
                                                                    )}
                                                                </button>

                                                                <span
                                                                    className={`font-medium text-base transition-all duration-300 ${
                                                                        task.isCompleted ? 'text-gray-400 dark:text-slate-500 line-through decoration-gray-300 dark:decoration-slate-600' : 'text-gray-800 dark:text-slate-200'
                                                                    }`}>
                                                                {task.title}
                                                            </span>
                                                                {task.isLocked && task.isCompleted && (
                                                                    <span
                                                                        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                                        title="Task này đã được xác nhận từ database">
                                                                    <CheckSquare size={12}/>
                                                                    Đã xác nhận
                                                                </span>
                                                                )}
                                                                {task.linkTo && !task.isCompleted && (
                                                                    <span
                                                                        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                                    <Sparkles size={12}/>
                                                                    Làm bài test
                                                                </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center ml-4">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleTaskExpansion(task.id);
                                                                    }}
                                                                    className={`p-1.5 rounded-full transition-all duration-200 ${
                                                                        isExpanded
                                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rotate-180'
                                                                            : 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-400 group-hover:bg-gray-100 dark:group-hover:bg-slate-600 group-hover:text-gray-600 dark:group-hover:text-slate-300'
                                                                    }`}
                                                                >
                                                                    <ChevronDown size={20}/>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                            <div className="px-4 pb-6 md:px-6 md:pl-14 pt-0 space-y-5">
                                                                <div
                                                                    className="flex flex-wrap items-center gap-y-2 gap-x-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                                                    <div
                                                                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        <Calendar size={16} className="text-gray-400"/>
                                                                        <span>Hạn chót: <span
                                                                            className="font-semibold text-gray-800 dark:text-gray-200">{task.deadline}</span></span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                                                                                task.isCompleted 
                                                                                    ? 'bg-green-50 text-green-700 ring-green-200' 
                                                                                    : task.status === 'SUBMITTED'
                                                                                        ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                                                                                        : task.status === 'NEEDS_REVISION'
                                                                                            ? 'bg-red-50 text-red-700 ring-red-200'
                                                                                            : deadlineStatus.color
                                                                            }`}>
                                                                            {task.isCompleted ? (
                                                                                <CheckSquare size={12}/>
                                                                            ) : task.status === 'SUBMITTED' ? (
                                                                                <Clock size={12}/>
                                                                            ) : task.status === 'NEEDS_REVISION' ? (
                                                                                <AlertTriangle size={12}/>
                                                                            ) : (
                                                                                <Clock size={12}/>
                                                                            )}
                                                                            {task.isCompleted
                                                                                ? 'Đã hoàn thành'
                                                                                : task.status === 'SUBMITTED'
                                                                                    ? 'Đang review'
                                                                                    : task.status === 'NEEDS_REVISION'
                                                                                        ? 'Cần sửa lại'
                                                                                        : deadlineStatus.text
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Mentor Note - hiển thị khi có feedback từ mentor */}
                                                                {task.feedback && (task.status === 'NEEDS_REVISION' || task.status === 'SUBMITTED' || task.status === 'COMPLETED') && (
                                                                    <div className={`p-3 rounded-lg border-l-4 ${
                                                                        task.status === 'NEEDS_REVISION' 
                                                                            ? 'bg-red-50 border-red-400' 
                                                                            : task.status === 'SUBMITTED'
                                                                                ? 'bg-yellow-50 border-yellow-400'
                                                                                : 'bg-green-50 border-green-400'
                                                                    }`}>
                                                                        <div className="flex items-start gap-2">
                                                                            <MessageSquare size={16} className={`mt-0.5 ${
                                                                                task.status === 'NEEDS_REVISION' 
                                                                                    ? 'text-red-600' 
                                                                                    : task.status === 'SUBMITTED'
                                                                                        ? 'text-yellow-600'
                                                                                        : 'text-green-600'
                                                                            }`}/>
                                                                            <div className="flex-1">
                                                                                <p className={`text-xs font-semibold mb-1 ${
                                                                                    task.status === 'NEEDS_REVISION' 
                                                                                        ? 'text-red-800' 
                                                                                        : task.status === 'SUBMITTED'
                                                                                            ? 'text-yellow-800'
                                                                                            : 'text-green-800'
                                                                                }`}>
                                                                                    {task.status === 'NEEDS_REVISION' ? '💬 Nhận xét từ mentor - Cần sửa lại:' : '💬 Nhận xét từ mentor:'}
                                                                                </p>
                                                                                <p className={`text-sm ${
                                                                                    task.status === 'NEEDS_REVISION' 
                                                                                        ? 'text-red-700' 
                                                                                        : task.status === 'SUBMITTED'
                                                                                            ? 'text-yellow-700'
                                                                                            : 'text-green-700'
                                                                                }`}>
                                                                                    {task.feedback}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {needsFile && (
                                                                    <div>
                                                                        {task.id === '1-2' && !task.uploadedFile && !scanningCV && (
                                                                            <div
                                                                                className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                                                                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                                                                    ℹ️ Task này sẽ hoàn thành ngay khi bạn
                                                                                    upload CV. AI sẽ tự động scan để trích
                                                                                    xuất thông tin.
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        {scanningCV && task.id === '1-2' ? (
                                                                            <div
                                                                                className="flex items-center justify-center p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                                                                                <div
                                                                                    className="flex flex-col items-center gap-4">
                                                                                    <Loader2
                                                                                        className="w-10 h-10 text-purple-600 animate-spin"/>
                                                                                    <div className="text-center">
                                                                                        <p className="text-base font-bold text-purple-700">AI
                                                                                            đang scan CV của bạn...</p>
                                                                                        <p className="text-sm text-gray-600 mt-1">Vui
                                                                                            lòng đợi trong giây lát</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : task.uploadedFile ? (
                                                                            <div
                                                                                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                                                                                <div
                                                                                    className="flex items-center gap-3 mb-3">
                                                                                    <div
                                                                                        className="p-2 bg-white rounded-lg border border-green-200 shadow-sm text-green-600">
                                                                                        <FileText size={20}/>
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                    <span
                                                                                        className="text-sm font-bold text-gray-800 block">{task.uploadedFile}</span>
                                                                                        <span
                                                                                            className="text-xs text-gray-500">CV đã được AI xử lý thành công</span>
                                                                                    </div>
                                                                                </div>
                                                                                {scannedProfile && task.id === '1-2' && (
                                                                                    <div
                                                                                        className="bg-white rounded-lg p-4 border border-green-100">
                                                                                        <p className="text-xs font-bold text-green-700 mb-2">✨
                                                                                            Thông tin đã trích xuất:</p>
                                                                                        <div
                                                                                            className="grid grid-cols-2 gap-2 text-xs">
                                                                                            <div><span
                                                                                                className="text-gray-500">Họ tên:</span>
                                                                                                <span
                                                                                                    className="font-semibold"> {scannedProfile.name}</span>
                                                                                            </div>
                                                                                            <div><span
                                                                                                className="text-gray-500">Email:</span>
                                                                                                <span
                                                                                                    className="font-semibold"> {scannedProfile.email}</span>
                                                                                            </div>
                                                                                            <div><span
                                                                                                className="text-gray-500">GPA:</span>
                                                                                                <span
                                                                                                    className="font-semibold"> {scannedProfile.gpa}/{scannedProfile.gpaScale}</span>
                                                                                            </div>
                                                                                            <div><span
                                                                                                className="text-gray-500">Tiếng Anh:</span>
                                                                                                <span
                                                                                                    className="font-semibold"> {scannedProfile.englishLevel}</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="col-span-2"><span
                                                                                                className="text-gray-500">Hoạt động ngoại khóa:</span>
                                                                                                <span
                                                                                                    className="font-semibold"> {scannedProfile.extracurriculars.length} hoạt động</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="col-span-2"><span
                                                                                                className="text-gray-500">Thành tích:</span>
                                                                                                <span
                                                                                                    className="font-semibold"> {scannedProfile.achievements.length} thành tích</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <label htmlFor={`cv-upload-${task.id}`}
                                                                                   className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl p-6 transition-colors cursor-pointer group/upload block">
                                                                                <input
                                                                                    id={`cv-upload-${task.id}`}
                                                                                    type="file"
                                                                                    accept=".pdf,.doc,.docx,.txt"
                                                                                    className="hidden"
                                                                                    onChange={(e) => handleCVUpload(e, task.id)}
                                                                                    disabled={uploadingCV}
                                                                                />
                                                                                <div
                                                                                    className="flex flex-col items-center justify-center text-center gap-2">
                                                                                    <div
                                                                                        className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-400 group-hover/upload:text-blue-500 transition-colors">
                                                                                        <UploadCloud size={24}/>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover/upload:text-blue-700">
                                                                                            {task.id === '1-2' ? 'Upload CV - AI sẽ tự động scan' : 'Upload file'}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-400 mt-1">PDF,
                                                                                            DOCX, TXT lên tới 10MB</p>
                                                                                    </div>
                                                                                </div>
                                                                            </label>
                                                                        )}
                                                                        {cvScanError && (
                                                                            <div
                                                                                className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                                <p className="text-xs text-red-700">{cvScanError}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}


                                                                {task.category === 'Tài liệu cần thiết' && task.feedback && (
                                                                    <div className="mt-2">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <MessageSquare size={16}
                                                                                           className="text-orange-500"/>
                                                                            <span
                                                                                className="text-sm font-bold text-gray-700 dark:text-gray-300">Nhận xét từ người hướng dẫn</span>
                                                                        </div>
                                                                        <div
                                                                            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl p-4 relative">
                                                                            <div
                                                                                className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                                                                {task.feedback}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {task.category === 'Khám phá bản thân' && (
                                                                    <div className="mt-2">
                                                                        {task.feedback && (
                                                                            <div
                                                                                className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl">
                                                                                <div
                                                                                    className="flex items-center gap-2 mb-2">
                                                                                    <Sparkles size={16}
                                                                                              className="text-purple-500 dark:text-purple-400"/>
                                                                                    <span
                                                                                        className="text-sm font-bold text-purple-700 dark:text-purple-300">Mô tả bài test</span>
                                                                                </div>
                                                                                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                                                                                    {task.feedback}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        {task.linkTo && !task.isCompleted && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    router.push(task.linkTo!);
                                                                                }}
                                                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 dark:shadow-purple-900/30 transition-all transform hover:scale-[1.02]"
                                                                            >
                                                                                <Sparkles size={18}/>
                                                                                Làm bài test ngay
                                                                                <ArrowRight size={18}/>
                                                                            </button>
                                                                        )}
                                                                        {task.isCompleted && (
                                                                            <div
                                                                                className={`p-4 ${
                                                                                    task.isLocked
                                                                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                                                        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                                                } rounded-xl`}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <CheckSquare size={18}
                                                                                                 className="text-green-600 dark:text-green-400"/>
                                                                                    <span
                                                                                        className="text-sm font-bold text-green-700 dark:text-green-300">
                                                                                    {task.isLocked
                                                                                        ? '✅ Bài test đã hoàn thành và được xác nhận từ database!'
                                                                                        : 'Bạn đã hoàn thành bài test này!'}
                                                                                </span>
                                                                                </div>
                                                                                {task.isLocked && (
                                                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 ml-6">
                                                                                        Tiến độ này được đồng bộ tự động từ hệ thống. Không thể thay đổi thủ công.
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {currentStageTasks.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400 dark:text-slate-500">Không có công việc nào trong giai đoạn này.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeStageId === 1 && (
                                <div
                                    className="bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-purple-900/20 dark:via-blue-900/20 dark:to-slate-800 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white">
                                            <Sparkles size={20}/>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">✨ AI CV
                                                Scanning</h4>
                                            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
                                                Upload CV của bạn và để AI tự động trích xuất <span
                                                className="font-bold">tất cả thông tin</span>:
                                            </p>
                                            <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-1.5">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-purple-500 mt-0.5">✓</span>
                                                    <span>Thông tin cá nhân (tên, email, số điện thoại, địa chỉ)</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-purple-500 mt-0.5">✓</span>
                                                    <span>Học vấn (GPA, trình độ tiếng Anh, SAT)</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-purple-500 mt-0.5">✓</span>
                                                    <span>Hoạt động ngoại khóa và vai trò</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-purple-500 mt-0.5">✓</span>
                                                    <span>Thành tích và giải thưởng</span>
                                                </li>
                                            </ul>
                                            <div
                                                className="mt-4 p-3 bg-white dark:bg-slate-700 rounded-lg border border-purple-100 dark:border-purple-800">
                                                <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                                                    💡 Tiết kiệm thời gian: Không cần nhập thủ công!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div
                                className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Flag size={20}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Lời
                                            khuyên Giai đoạn {activeStageId}</h4>
                                        <p className="text-sm text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
                                            {activeStageId === 1 && "Đây là giai đoạn nền tảng. Hãy dành thời gian hiểu rõ bản thân và tìm hiểu kỹ về các trường đại học mục tiêu."}
                                            {activeStageId === 2 && "Chất lượng hơn số lượng. Tập trung vào bài luận cá nhân và các hoạt động ngoại khóa có chiều sâu lãnh đạo."}
                                            {activeStageId === 3 && "Kiểm tra kỹ hạn visa và yêu cầu nhập cảnh. Đừng quên mang theo bản sao các giấy tờ quan trọng."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChecklistPage;