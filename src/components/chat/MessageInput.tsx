"use client";

import React, { useRef, useState } from "react";
import { Send, Paperclip, Image, Smile, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFileServerAction } from "@/actions/upload";
import { sendMessageWithAttachment, getMessageTypeFromMime } from "@/actions/chat";

interface MessageInputProps {
    roomId: string;
    userId: string;
    messageInput: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
    onMessageSent?: () => void; // Callback after successful send
}

export const MessageInput: React.FC<MessageInputProps> = ({
    roomId,
    userId,
    messageInput,
    onInputChange,
    onSendMessage,
    onKeyPress,
    onMessageSent,
}) => {
    // File input refs
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Handle file selection and upload
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'file') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('File quá lớn! Kích thước tối đa là 10MB.');
            return;
        }

        // Validate image type if image upload
        if (fileType === 'image' && !file.type.startsWith('image/')) {
            toast.error('Vui lòng chỉ chọn file ảnh!');
            return;
        }

        setSelectedFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Step 1: Upload file to Supabase Storage
            toast.loading('Đang tải lên...', { id: 'upload' });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
            formData.append('category', 'chat'); // Chat category for storage

            const uploadResult = await uploadFileServerAction(formData);

            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || 'Upload failed');
            }

            setUploadProgress(50);
            console.log('✅ File uploaded:', uploadResult.url);

            // Step 2: Send message with attachment
            const messageType = await getMessageTypeFromMime(file.type);
            const content = messageInput.trim() || ""; // Don't use filename as content

            const result = await sendMessageWithAttachment(
                roomId,
                userId,
                content,
                messageType,
                {
                    url: uploadResult.url,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                }
            );

            if (!result.success) {
                throw new Error(result.error || 'Failed to send message');
            }

            setUploadProgress(100);
            toast.success('Đã gửi!', { id: 'upload' });

            // Clear input and state
            onInputChange('');
            setSelectedFile(null);

            // Trigger callback to refresh messages
            if (onMessageSent) {
                onMessageSent();
            }

            console.log('✅ Message sent with attachment:', result.message);
        } catch (error) {
            console.error('❌ Upload/send error:', error);
            toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra!', { id: 'upload' });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setSelectedFile(null);

            // Reset file input
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // Cancel upload
    const handleCancelUpload = () => {
        setIsUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-3 md:p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
            {/* Upload Progress Bar */}
            {isUploading && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {selectedFile?.type?.startsWith('image/') ? 'Đang tải lên ảnh...' : `Đang tải lên: ${selectedFile?.name}`}
                            </span>
                        </div>
                        <button
                            onClick={handleCancelUpload}
                            className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                        >
                            <X size={16} className="text-blue-600 dark:text-blue-400" />
                        </button>
                    </div>
                    <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-end gap-2 md:gap-3">
                {/* Hidden File Inputs */}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'image')}
                    disabled={isUploading}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'file')}
                    disabled={isUploading}
                />

                {/* Attachment Buttons */}
                <div className="flex items-center gap-0.5 md:gap-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`p-2 md:p-2.5 rounded-full transition-colors ${
                            isUploading
                                ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        title="Đính kèm file"
                    >
                        <Paperclip size={18} className="md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploading}
                        className={`p-2 md:p-2.5 rounded-full transition-colors ${
                            isUploading
                                ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        title="Đính kèm ảnh"
                    >
                        <Image size={18} className="md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Input Field */}
                <div className="flex-1 relative">
                    <textarea
                        value={messageInput}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyPress={onKeyPress}
                        placeholder="Nhập tin nhắn..."
                        rows={1}
                        disabled={isUploading}
                        className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-slate-700 rounded-xl md:rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-600 resize-none text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                    />
                    <button
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1 md:p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors text-gray-500 dark:text-slate-400 hidden sm:block"
                        disabled={isUploading}
                    >
                        <Smile size={18} className="md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Send Button */}
                <button
                    onClick={onSendMessage}
                    disabled={!messageInput.trim() || isUploading}
                    className={`p-2.5 md:p-3 rounded-full transition-all shrink-0 ${
                        messageInput.trim() && !isUploading
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                            : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                    }`}
                    title="Gửi tin nhắn"
                >
                    {isUploading ? (
                        <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" />
                    ) : (
                        <Send size={18} className="md:w-5 md:h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};