'use server'

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with Service Role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const BUCKET_NAME = 'hoex-documents'

interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Server Action: Upload file to Supabase Storage using Service Role
 * This bypasses RLS policies and ensures reliable uploads
 */
export async function uploadFileServerAction(formData: FormData): Promise<UploadResult> {
    try {
        console.log('🚀 [ServerAction] Starting file upload...')

        // Extract data from FormData
        const file = formData.get('file') as File
        const userId = formData.get('userId') as string
        const category = formData.get('category') as string || 'applications'

        // Debug formData contents
        console.log('📝 FormData contents:')
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`   ${key}: File (${value.name}, ${value.size} bytes, ${value.type})`)
            } else {
                console.log(`   ${key}: ${value}`)
            }
        }

        // Enhanced validation
        if (!file) {
            console.error('❌ No file provided in FormData')
            return {
                success: false,
                error: 'No file selected. Please select a file to upload.'
            }
        }

        if (!userId || userId.trim() === '') {
            console.error('❌ No userId provided:', { userId, trimmed: userId?.trim() })
            return {
                success: false,
                error: 'User ID is required. Please login and try again.'
            }
        }

        // Additional file validation
        if (file.size === 0) {
            console.error('❌ Empty file uploaded')
            return {
                success: false,
                error: 'Cannot upload empty file. Please select a valid file.'
            }
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 10MB`
            }
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png'
        ]

        if (!allowedTypes.includes(file.type)) {
            return {
                success: false,
                error: 'File type not allowed. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG files.'
            }
        }

        console.log('📄 File info:', {
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            type: file.type,
            userId,
            category
        })

        // Generate unique filename with timestamp
        const timestamp = Date.now()
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase()
        const filePath = `${userId}/${category}/${timestamp}_${cleanFileName}`

        console.log('📁 Upload path:', filePath)

        // Convert File to ArrayBuffer for Supabase
        const fileArrayBuffer = await file.arrayBuffer()
        const fileBuffer = new Uint8Array(fileArrayBuffer)

        // Upload to Supabase Storage using Service Role (bypasses RLS)
        const { data, error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                cacheControl: '3600', // Cache for 1 hour
                upsert: false // Don't overwrite existing files
            })

        if (uploadError) {
            console.error('❌ Supabase upload error:', uploadError)
            return {
                success: false,
                error: `Upload failed: ${uploadError.message}`
            }
        }

        console.log('✅ Upload successful:', data)

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
            console.error('❌ Failed to get public URL')
            return {
                success: false,
                error: 'Failed to generate public URL for uploaded file'
            }
        }

        const publicUrl = urlData.publicUrl
        console.log('🔗 Public URL:', publicUrl)

        return {
            success: true,
            url: publicUrl,
            path: filePath
        }

    } catch (error) {
        console.error('❌ [ServerAction] Upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error'
        }
    }
}

/**
 * Server Action: Delete file from Supabase Storage
 */
export async function deleteFileServerAction(filePath: string): Promise<{success: boolean, error?: string}> {
    try {
        console.log('🗑️ [ServerAction] Deleting file:', filePath)

        const { error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        if (error) {
            console.error('❌ Delete error:', error)
            return {
                success: false,
                error: error.message
            }
        }

        console.log('✅ File deleted successfully')
        return { success: true }

    } catch (error) {
        console.error('❌ [ServerAction] Delete error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown delete error'
        }
    }
}