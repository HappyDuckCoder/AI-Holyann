'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface UploadFileInput {
  file: File;
  userId: string;
  roomId: string;
}

export async function uploadChatFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const roomId = formData.get('roomId') as string;

    if (!file) {
      throw new Error('Không có file được tải lên');
    }

    // Giới hạn kích thước file (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Kích thước file vượt quá 10MB');
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${roomId}/${userId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('chat-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('chat-uploads').getPublicUrl(data.path);

    // Tạo thumbnail nếu là ảnh
    let thumbnailUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      const thumbnailPath = `${roomId}/${userId}/thumb_${Date.now()}.${fileExt}`;

      // TODO: Implement image resizing logic
      // Có thể dùng sharp hoặc jimp
      thumbnailUrl = publicUrl; // Temporary, dùng URL gốc
    }

    return {
      success: true,
      data: {
        fileUrl: publicUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: BigInt(file.size),
        thumbnailUrl,
      },
    };
  } catch (error: unknown) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải file',
    };
  }
}

export async function deleteChatFile(fileUrl: string) {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('chat-uploads') + 1).join('/');

    const { error } = await supabaseAdmin.storage.from('chat-uploads').remove([filePath]);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Đã xóa file thành công',
    };
  } catch (error: unknown) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
