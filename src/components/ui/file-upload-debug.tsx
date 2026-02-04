'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
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
    const [fileUrl, setFileUrl] = useState<string | null>(currentFileUrl || null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [filePath, setFilePath] = useState<string | null>(null) // Lưu path để xóa
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

            console.log('🔍 Debug info:', {
                userId: userId.trim(),
                userIdLength: userId.trim().length,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                category
            })

            // Test API route first
            console.log('🧪 Testing API route...')

            const testFormData = new FormData()
            testFormData.append('file', file)
            testFormData.append('userId', userId.trim())
            testFormData.append('category', category)

            // Use relative URL to automatically use current domain and port
            const testResponse = await fetch('/api/test-upload', {
                method: 'POST',
                body: testFormData
            })

            console.log('🧪 Test API response status:', testResponse.status)

            let testResult
            try {
                testResult = await testResponse.json()
                console.log('🧪 Test API result:', testResult)
            } catch (parseError) {
                console.error('❌ Failed to parse test API response:', parseError)
                const responseText = await testResponse.text()
                console.log('📄 Raw response:', responseText)
                throw new Error('Invalid server response format')
            }

            if (!testResponse.ok) {
                throw new Error(`Test API failed (${testResponse.status}): ${testResult.error || testResult.message || 'Unknown error'}`)
            }

            // If test passes, try real upload via API route
            console.log('✅ Test API passed, proceeding with real upload via API route...')

            // Create FormData for upload API request
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)
            uploadFormData.append('userId', userId.trim())
            uploadFormData.append('category', category)

            // Use API route instead of server action for debugging
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            })

            console.log('📥 Upload API response status:', uploadResponse.status)

            let result
            try {
                result = await uploadResponse.json()
                console.log('📥 Upload API result:', result)
            } catch (parseError) {
                console.error('❌ Failed to parse upload API response:', parseError)
                const responseText = await uploadResponse.text()
                console.log('📄 Raw response:', responseText)
                throw new Error('Invalid upload response format')
            }

            if (uploadResponse.ok && result.success && result.url) {
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

            // Notify parent component
            onUploadComplete(null)

        } catch (error) {
            console.error('❌ Delete error:', error)
            setError(error instanceof Error ? error.message : 'Có lỗi khi xóa file')
        } finally {
            setIsDeleting(false)
        }
    }

    // Show current uploaded file
    if (fileUrl && !isUploading) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm border border-green-100">
                        <FileText className="w-6 h-6 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {fileName || 'File đã tải lên'}
                            </p>
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-gray-600">Tải lên thành công</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            Xem
                        </button>

                        <button
                            onClick={handleRemoveFile}
                            disabled={isDeleting}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

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

    // Show upload interface
    return (
        <div className="space-y-3">
            {/* Upload Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200",
                    disabled || isUploading
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer",
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
