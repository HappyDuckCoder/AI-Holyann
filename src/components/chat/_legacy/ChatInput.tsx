'use client';

import { useState, useRef, KeyboardEvent, useCallback } from 'react';
import { Send, Image, Paperclip, Smile, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Aa',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce typing indicator để giảm số lần gọi API
  const debouncedTyping = useDebouncedCallback(() => {
    onTyping?.();
  }, 500);

  const handleSend = useCallback(() => {
    if (!message.trim() && attachedFiles.length === 0) return;
    if (disabled) return;

    onSendMessage(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setMessage('');
    setAttachedFiles([]);
    inputRef.current?.focus();
  }, [message, attachedFiles, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    setShowActions(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    debouncedTyping();
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }, [debouncedTyping]);

  return (
    <div className="bg-white border-t px-4 py-3 flex-shrink-0">
      {/* File Attachments Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 max-w-[200px] truncate">
                {file.name}
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Thêm tùy chọn"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Actions Menu */}
          {showActions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border p-2 flex gap-2">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowActions(false);
                }}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đính kèm file"
              >
                <Paperclip className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowActions(false);
                }}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đính kèm ảnh"
              >
                <Image className="w-5 h-5 text-green-600" />
              </button>
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 flex items-center gap-2">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-500 max-h-[120px]"
            style={{ minHeight: '24px' }}
          />
          
          {/* Emoji Button */}
          <button
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
            aria-label="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
          className={cn(
            'p-2 rounded-full transition-colors flex-shrink-0',
            message.trim() || attachedFiles.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-gray-400 cursor-not-allowed'
          )}
          aria-label="Gửi"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx"
      />
    </div>
  );
}
