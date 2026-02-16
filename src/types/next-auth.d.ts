import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
    interface User {
        accessToken?: string
        role?: string
        id?: string
        email?: string
        name?: string
        full_name?: string
        image?: string
        student?: {
            user_id: string
            current_school?: string | null
            current_grade?: string | null
            intended_major?: string | null
            target_country?: string | null
            date_of_birth?: Date | null
            current_address?: string | null
        } | null  // ✅ Allow null
    }

    interface Session {
        user: {
            name?: string | null
            email?: string | null
            image?: string | null
            accessToken?: string
            role?: string
            id?: string
            user_id?: string  // Alias for compatibility
            full_name?: string
        }
        student?: {
            user_id: string
            current_school?: string | null
            current_grade?: string | null
            intended_major?: string | null
            target_country?: string | null
            date_of_birth?: Date | null
            current_address?: string | null
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string
        role?: string
        id?: string
        email?: string
        name?: string
        full_name?: string
        picture?: string
        student?: {
            user_id: string
            current_school?: string | null
            current_grade?: string | null
            intended_major?: string | null
            target_country?: string | null
            date_of_birth?: Date | null
            current_address?: string | null
        }
    }
}

