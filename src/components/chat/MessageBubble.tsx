"use client";

import React, { useState, memo } from "react";
import { CheckCheck, Clock, AlertCircle, FileText, File, Download } from "lucide-react";
import { Message, Attachment } from "./types";
import { formatMessageTime } from "./utils";
import { getSignedUrlFromFullUrl } from "@/actions/storage";
import { toast } from "sonner";
import FilePreviewModal from "@/components/common/FilePreviewModal";
import { UserAvatar } from "./UserAvatar";

interface MessageBubbleProps {
    message: Message;
}

// URL regex pattern - matches http, https, www links
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

// Helper function: Parse text and convert URLs to clickable links
const parseTextWithLinks = (text: string, isMine: boolean): React.ReactNode[] => {
    if (!text) return [];

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Reset regex lastIndex
    URL_REGEX.lastIndex = 0;

    while ((match = URL_REGEX.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Get the URL
        let url = match[0];
        const displayUrl = url;

        // Add https:// if URL starts with www.
        if (url.startsWith('www.')) {
            url = 'https://' + url;
        }

        // Add the link element
        parts.push(
            <a
                key={`link-${match.index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                    // Only open link if Ctrl/Cmd is pressed
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        toast.info('Giữ Ctrl + Click để mở link', { duration: 2000 });
                    }
                }}
                className={`font-semibold underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity ${
                    isMine 
                        ? 'text-white decoration-white/70' 
                        : 'text-blue-600 dark:text-blue-400 decoration-blue-500/50'
                }`}
                title="Giữ Ctrl + Click để mở link"
            >
                {displayUrl}
            </a>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    // If no links found, return original text
    if (parts.length === 0) {
        return [text];
    }

    return parts;
};

// Helper function: Format file size from bytes to human readable format
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Helper function: Get file icon based on file type
const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("document") || fileType.includes("word")) return FileText;
    if (fileType.includes("sheet") || fileType.includes("excel")) return FileText;
    return File;
};

// Helper function: Check if file is an image
const isImageFile = (fileType: string): boolean => {
    return fileType.startsWith("image/");
};

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
    const hasContent = message.content && message.content.trim().length > 0;

    // State for file preview modal
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [previewName, setPreviewName] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // State for image URLs (signed URLs for display)
    const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    // Separate images from other files
    const images = message.attachments?.filter((att: Attachment) => isImageFile(att.type || "")) || [];
    const files = message.attachments?.filter((att: Attachment) => !isImageFile(att.type || "")) || [];

    /**
     * Generate signed URL for image display
     */
    const getImageUrl = async (attachment: Attachment): Promise<string> => {
        // Check cache first
        if (imageUrls.has(attachment.id)) {
            return imageUrls.get(attachment.id)!;
        }

        // Check if already loading
        if (loadingImages.has(attachment.id)) {
            return attachment.url; // Return original URL while loading
        }

        try {
            setLoadingImages(prev => new Set(prev).add(attachment.id));

            // Try to generate signed URL
            const result = await getSignedUrlFromFullUrl(attachment.url);

            if (result.success && result.signedUrl) {
                const signedUrl = result.signedUrl;
                setImageUrls(prev => new Map(prev).set(attachment.id, signedUrl));
                return signedUrl;
            } else {
                console.warn('⚠️ Failed to get signed URL, using original:', result.error);
                return attachment.url; // Fallback to original URL
            }
        } catch (error) {
            console.error('❌ Error getting image URL:', error);
            return attachment.url; // Fallback to original URL
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(attachment.id);
                return newSet;
            });
        }
    };

    /**
     * Handle file/image click - Generate signed URL and open preview
     */
    const handleFileClick = async (
        e: React.MouseEvent,
        attachment: Attachment
    ) => {
        e.preventDefault();

        setIsLoadingPreview(true);
        toast.loading('Đang tải file...', { id: 'file-preview' });

        try {

            // Get signed URL from server
            const result = await getSignedUrlFromFullUrl(attachment.url);

            if (!result.success || !result.signedUrl) {
                throw new Error(result.error || 'Failed to generate signed URL');
            }

            toast.success('File đã sẵn sàng!', { id: 'file-preview' });

            // Set preview data and open modal
            setPreviewUrl(result.signedUrl);
            setPreviewName(attachment.name);
            setIsModalOpen(true);
        } catch (error) {
            console.error('❌ Error opening file:', error);
            toast.error('Không thể mở file', { id: 'file-preview' });

            // Fallback: Try to open original URL in new tab
            window.open(attachment.url, '_blank', 'noopener,noreferrer');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    /**
     * Close preview modal
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPreviewUrl("");
        setPreviewName("");
    };

    /**
     * Image component with signed URL support
     */
    const ImageDisplay: React.FC<{ image: Attachment; className?: string }> = ({ image, className }) => {
        const [currentUrl, setCurrentUrl] = useState<string>(image.url);
        const [isLoading, setIsLoading] = useState(false);
        const [hasError, setHasError] = useState(false);

        // Load signed URL on mount
        React.useEffect(() => {
            const loadImage = async () => {
                setIsLoading(true);
                try {
                    const signedUrl = await getImageUrl(image);
                    setCurrentUrl(signedUrl);
                    setHasError(false);
                } catch (error) {
                    console.error('Error loading image:', error);
                    setHasError(true);
                } finally {
                    setIsLoading(false);
                }
            };

            loadImage();
        }, [image.id]);

        if (hasError) {
            return (
                <div className={`${className} bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                    <div className="text-center p-4">
                        <AlertCircle size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Không thể tải ảnh</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative">
                {isLoading && (
                    <div className={`${className} bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                        <Clock size={24} className="text-gray-400 animate-spin" />
                    </div>
                )}
                <img
                    src={currentUrl}
                    alt="Hình ảnh"
                    className={`${className} ${isLoading ? 'hidden' : 'block'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={(e) => {
                        console.error('Image load error for image attachment:', currentUrl);
                        setHasError(true);
                        setIsLoading(false);
                    }}
                />
            </div>
        );
    };

    return (
        <div
            className={`flex items-end gap-2 ${
                message.isMine ? "flex-row-reverse" : ""
            } ${message.isSending ? "opacity-70" : ""}`}
        >
            {/* Sender Avatar */}
            {!message.isMine && (
                <UserAvatar
                    avatarUrl={message.senderAvatar}
                    name={message.senderName}
                    size="sm"
                />
            )}

            <div
                className={`max-w-[75%] md:max-w-[70%] ${
                    message.isMine ? "items-end" : "items-start"
                } space-y-2`}
            >
                {/* Main Message Bubble */}
                {(hasContent || files.length > 0) && (
                    <div
                        className={`rounded-xl md:rounded-2xl overflow-hidden ${
                            message.isMine
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-slate-200 rounded-bl-md shadow-sm"
                        } ${message.isError ? "border-red-500 border-2" : ""}`}
                    >
                        {/* Text Content */}
                        {hasContent && (
                            <div className="px-3 py-2 md:px-4 md:py-3">
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                    {parseTextWithLinks(message.content || '', message.isMine)}
                                </p>
                            </div>
                        )}

                        {/* File Attachments (non-images) */}
                        {files.length > 0 && (
                            <div className={`${hasContent ? "px-3 pb-2 md:px-4 md:pb-3 pt-0" : "p-3 md:p-4"} space-y-2`}>
                                {files.map((file: Attachment) => {
                                    const FileIcon = getFileIcon(file.type || "");

                                    return (
                                        <button
                                            key={file.id}
                                            onClick={(e) => handleFileClick(e, file)}
                                            disabled={isLoadingPreview}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] ${
                                                message.isMine
                                                    ? "bg-white/20 hover:bg-white/30"
                                                    : "bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500"
                                            } ${isLoadingPreview ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                        >
                                            {/* File Icon */}
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    message.isMine
                                                        ? "bg-white/30"
                                                        : "bg-blue-100 dark:bg-blue-900/30"
                                                }`}
                                            >
                                                <FileIcon
                                                    size={20}
                                                    className={
                                                        message.isMine
                                                            ? "text-white"
                                                            : "text-blue-600 dark:text-blue-400"
                                                    }
                                                />
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-sm font-medium truncate ${
                                                        message.isMine
                                                            ? "text-white"
                                                            : "text-gray-900 dark:text-slate-100"
                                                    }`}
                                                >
                                                    {file.name}
                                                </p>
                                                <p
                                                    className={`text-xs ${
                                                        message.isMine
                                                            ? "text-white/80"
                                                            : "text-gray-500 dark:text-slate-400"
                                                    }`}
                                                >
                                                    {formatFileSize(file.size || 0)}
                                                </p>
                                            </div>

                                            {/* Download Icon */}
                                            {isLoadingPreview ? (
                                                <Clock size={18} className="animate-spin text-gray-400" />
                                            ) : (
                                                <Download
                                                    size={18}
                                                    className={
                                                        message.isMine
                                                            ? "text-white/80"
                                                            : "text-gray-400 dark:text-slate-400"
                                                    }
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Image Attachments */}
                {images.length > 0 && (
                    <div
                        className={`${
                            images.length > 1 ? "grid grid-cols-2 gap-2" : ""
                        }`}
                    >
                        {images.map((image: Attachment) => (
                            <button
                                key={image.id}
                                onClick={(e) => handleFileClick(e, image)}
                                disabled={isLoadingPreview}
                                className={`block group relative rounded-lg overflow-hidden ${
                                    isLoadingPreview ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                                }`}
                            >
                                <ImageDisplay
                                    image={image}
                                    className={`rounded-lg object-cover transition-all group-hover:scale-105 ${
                                        images.length > 1
                                            ? "w-full h-32 md:h-40"
                                            : "max-w-[300px] max-h-[300px]"
                                    }`}
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg flex items-center justify-center">
                                    {isLoadingPreview && (
                                        <Clock size={24} className="text-white animate-spin" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Timestamp and Status */}
                <div
                    className={`flex items-center gap-1 ${
                        message.isMine ? "justify-end" : "justify-start"
                    }`}
                >
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                        {formatMessageTime(message.timestamp)}
                    </span>
                    {message.isMine && (
                        <>
                            {message.isError ? (
                                <AlertCircle size={14} className="text-red-500" />
                            ) : message.isSending ? (
                                <Clock size={14} className="text-gray-400 animate-pulse" />
                            ) : (
                                <CheckCheck
                                    size={14}
                                    className={
                                        message.isRead
                                            ? "text-blue-500 dark:text-blue-400"
                                            : "text-gray-400 dark:text-slate-500"
                                    }
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* File Preview Modal */}
            <FilePreviewModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                fileUrl={previewUrl}
                fileName={previewName}
            />
        </div>
    );
});