'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, FileText, X, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react'
import { uploadFileServerAction, deleteFileServerAction } from '@/actions/upload'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    userId: string
    onUploadComplete: (url: string | null) => void // Callback trả URL về cho form cha (null khi xóa)
    label?: string
    category?: 'profile' | 'academic' | 'applications' | 'chat'
    accept?: string // VD: ".pdf,.doc,.docx"
    currentFileUrl?: string // URL file hiện tại (nếu có)
    disabled?: boolean
}

export default function FileUpload({
    userId,
    onUploadComplete,
    label = "Tải tài liệu lên",
    category = "applications",
    accept = ".pdf,.doc,.docx,.txt,.jpg,.png",
    currentFileUrl,
    disabled = false
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [filePath, setFilePath] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sync internal state when prop changes (handles hydration and parent updates)
    useEffect(() => {
        if (currentFileUrl) {
            setFileUrl(currentFileUrl)
            // Extract filename from URL if possible
            try {
                const urlParts = currentFileUrl.split('/')
                const fileWithTimestamp = urlParts[urlParts.length - 1]
                // Remove timestamp prefix (e.g., "1738680505123_cv.pdf" -> "cv.pdf")
                const cleanFileName = fileWithTimestamp.replace(/^\d+_/, '')
                setFileName(decodeURIComponent(cleanFileName))
            } catch {
                setFileName('File đã tải lên')
            }
        } else {
            setFileUrl(null)
            setFileName(null)
            setFilePath(null)
        }
    }, [currentFileUrl])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setIsUploading(true)
        setFileName(file.name)

        try {
            // Validate userId
            if (!userId || userId.trim() === '') {
                throw new Error('User not authenticated. Please login and try again.')
            }

            // Prepare FormData for Server Action
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId.trim())
            formData.append('category', category)

            console.log('📤 Uploading file:', {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
                userId: userId.trim(),
                category
            })

            // Call Server Action (Runs on server with Admin permissions)
            const result = await uploadFileServerAction(formData)

            if (result.success && result.url) {
                console.log('✅ Upload successful:', result.url)
                setFileUrl(result.url)
                setFilePath(result.path || null)
                onUploadComplete(result.url)
            } else {
                console.error('❌ Upload failed:', result.error)
                setError(result.error || 'Upload failed')
                setFileName(null)
            }

        } catch (error) {
            console.error('❌ Upload error:', error)
            setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải file')
            setFileName(null)
        } finally {
            setIsUploading(false)
            // Reset input to allow re-uploading same file
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveFile = async () => {
        if (!fileUrl) return

        setIsDeleting(true)
        setError(null)

        try {
            // Delete from storage if we have the path
            if (filePath) {
                console.log('🗑️ Deleting file:', filePath)
                const deleteResult = await deleteFileServerAction(filePath)

                if (!deleteResult.success) {
                    console.warn('⚠️ Could not delete file from storage:', deleteResult.error)
                    // Continue anyway - might have been deleted already
                }
            }

            // Reset state
            setFileUrl(null)
            setFileName(null)
            setFilePath(null)

            // Notify parent component
            onUploadComplete(null)

        } catch (error) {
            console.error('❌ Delete error:', error)
            setError(error instanceof Error ? error.message : 'Có lỗi khi xóa file')
        } finally {
            setIsDeleting(false)
        }
    }

    // FILE VIEW MODE - Show uploaded file with "Chờ review" status
    if (fileUrl && !isUploading) {
        return (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 transition-all duration-200">
                <div className="flex items-center gap-3">
                    {/* File Icon */}
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm border border-amber-100">
                        <FileText className="w-6 h-6 text-amber-600" />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {fileName || 'File đã tải lên'}
                            </p>
                            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                Chờ review
                            </span>
                            <span className="text-xs text-gray-500">
                                Mentor sẽ xem xét và phê duyệt
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            <Eye size={14} />
                            Xem
                        </button>

                        {/* Remove Button */}
                        <button
                            onClick={handleRemoveFile}
                            disabled={isDeleting || disabled}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Xóa file và upload lại"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-700">{error}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // UPLOAD MODE - Show dropzone for new uploads
    return (
        <div className="space-y-3">
            {/* Upload Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer",
                    disabled || isUploading
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30",
                    error && "border-red-300 bg-red-50/30"
                )}
                onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || isUploading}
                />

                <div className="flex flex-col items-center gap-3">
                    {/* Upload Icon */}
                    <div className={cn(
                        "p-3 rounded-full",
                        isUploading
                            ? "bg-blue-100"
                            : error
                            ? "bg-red-100"
                            : "bg-gray-100"
                    )}>
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : error ? (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        ) : (
                            <Upload className="w-6 h-6 text-gray-600" />
                        )}
                    </div>

                    {/* Upload Text */}
                    <div>
                        <p className={cn(
                            "text-sm font-semibold mb-1",
                            isUploading ? "text-blue-700" : error ? "text-red-700" : "text-gray-700"
                        )}>
                            {isUploading ? `Đang tải lên ${fileName}...` : label}
                        </p>

                        <p className="text-xs text-gray-500">
                            {isUploading
                                ? "Vui lòng đợi..."
                                : "Kéo thả file vào đây hoặc click để chọn file"
                            }
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            Hỗ trợ PDF, DOC, DOCX, TXT, JPG, PNG (tối đa 10MB)
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Lỗi tải file</p>
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
            formData.append('file', file)
            formData.append('userId', userId.trim())
            formData.append('category', category)

            console.log('📤 Uploading file:', {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
                userId: userId.trim(),
                category
            })

            // Gọi Server Action (Chạy trên server với quyền Admin)
            const result = await uploadFileServerAction(formData)

            if (result.success && result.url) {
                console.log('✅ Upload successful:', result.url)
                setFileUrl(result.url)
                setFilePath(result.path || null)
                onUploadComplete(result.url)
            } else {
                console.error('❌ Upload failed:', result.error)
                setError(result.error || 'Upload failed')
                setFileName(null)
            }

        } catch (error) {
            console.error('❌ Upload error:', error)
            setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải file')
            setFileName(null)
        } finally {
            setIsUploading(false)
            // Reset input để có thể chọn file khác
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveFile = async () => {
        if (!fileUrl) return

        setIsDeleting(true)
        setError(null)

        try {
            // Nếu có filePath, thử xóa file khỏi storage
            if (filePath) {
                console.log('🗑️ Deleting file:', filePath)
                const deleteResult = await deleteFileServerAction(filePath)

                if (!deleteResult.success) {
                    console.warn('⚠️ Could not delete file from storage:', deleteResult.error)
                    // Vẫn tiếp tục xóa khỏi UI vì có thể file đã bị xóa trước đó
                }
            }

            // Reset state
            setFileUrl(null)
            setFileName(null)
            setFilePath(null)
            onUploadComplete(null)

            console.log('✅ File removed from UI')

        } catch (error) {
            console.error('❌ Remove error:', error)
            setError(error instanceof Error ? error.message : 'Có lỗi khi xóa file')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const files = e.dataTransfer.files
        if (files.length > 0 && !disabled && !isUploading) {
            const file = files[0]
            // Simulate file input change
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(file)
                fileInputRef.current.files = dataTransfer.files

                // Trigger change event
                const event = new Event('change', { bubbles: true })
                fileInputRef.current.dispatchEvent(event)
            }
        }
    }

    // Nếu đã có file được upload
    if (fileUrl) {
        return (
            <div className={cn(
                "border-2 border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg p-4",
                disabled && "opacity-50 cursor-not-allowed"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Tài liệu đã tải lên
                            </p>
                            {fileName && (
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    {fileName}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-green-600 dark:text-green-400">
                                    Tải lên thành công
                                </span>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:text-blue-700 underline ml-2"
                                >
                                    Xem tài liệu
                                </a>
                            </div>
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            onClick={handleRemoveFile}
                            disabled={isDeleting}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa file"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Giao diện upload
    return (
        <div className="space-y-2">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
                    disabled || isUploading
                        ? "border-gray-200 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500",
                    error && "border-red-300 bg-red-50 dark:bg-red-900/20"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || isUploading}
                />

                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className={cn(
                        "p-3 rounded-full transition-colors",
                        error
                            ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                            : "bg-white dark:bg-gray-700 text-gray-400 group-hover:text-blue-500"
                    )}>
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        ) : error ? (
                            <AlertCircle className="w-6 h-6" />
                        ) : (
                            <Upload className="w-6 h-6" />
                        )}
                    </div>

                    <div>
                        <p className={cn(
                            "text-sm font-medium",
                            error
                                ? "text-red-700 dark:text-red-300"
                                : "text-gray-600 dark:text-gray-300"
                        )}>
                            {isUploading ? (
                                fileName ? `Đang tải ${fileName}...` : 'Đang tải lên...'
                            ) : error ? (
                                'Có lỗi xảy ra'
                            ) : (
                                label
                            )}
                        </p>

                        {!isUploading && !error && (
                            <p className="text-xs text-gray-400 mt-1">
                                Kéo thả file vào đây hoặc click để chọn file
                                <br />
                                Hỗ trợ: PDF, DOC, DOCX, TXT, JPG, PNG (tối đa 10MB)
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            {error}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}