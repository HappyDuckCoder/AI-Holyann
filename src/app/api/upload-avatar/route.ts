import { NextRequest, NextResponse } from 'next/server'
import { uploadFileServerAction } from '@/actions/upload'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const avatar = formData.get('avatar') as File
    const userId = formData.get('userId') as string

    if (!avatar) {
      return NextResponse.json(
        { success: false, error: 'No avatar file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!avatar.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File phải là hình ảnh' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (avatar.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Kích thước file không được vượt quá 5MB' },
        { status: 400 }
      )
    }

    // Prepare formData for upload action
    const uploadFormData = new FormData()
    uploadFormData.append('file', avatar)
    uploadFormData.append('folder', 'avatars') // Store avatars in avatars folder
    uploadFormData.append('userId', userId)

    // Use existing upload action
    const result = await uploadFileServerAction(uploadFormData)

    if (result.success) {
      // TODO: Update user avatar_url in database
      // You can add database update logic here
      // For example:
      // await updateUserAvatar(userId, result.url)

      return NextResponse.json({
        success: true,
        url: result.url,
        message: 'Avatar uploaded successfully'
      })
    } else {
      console.error('❌ Avatar upload failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Avatar upload API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      },
      { status: 500 }
    )
  }
}
