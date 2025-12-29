import {DatabaseService} from './database.service'
import {JWTService} from './jwt.service'
import {RegisterData, LoginData, AuthResponse, AuthProvider} from '@/lib/types/auth.types'

export class AuthService {
    /**
     * Đăng ký user mới
     */
    static async register(data: RegisterData): Promise<AuthResponse> {
        try {
            // Kiểm tra email đã tồn tại
            const existingUser = await DatabaseService.findUserByEmail(data.email)
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email đã được sử dụng'
                }
            }

            // Tạo user mới
            const user = await DatabaseService.createUser(data)
            if (!user) {
                return {
                    success: false,
                    message: 'Không thể tạo tài khoản'
                }
            }

            // Tạo JWT token
            const token = JWTService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role
            })

            return {
                success: true,
                message: 'Đăng ký thành công',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    avatar_url: user.avatar_url
                },
                token
            }
        } catch (error: any) {
            console.error('Error in register:', error)
            return {
                success: false,
                message: error?.message || 'Đã xảy ra lỗi khi đăng ký'
            }
        }
    }

    /**
     * Đăng nhập
     */
    static async login(data: LoginData): Promise<AuthResponse> {
        try {
            // Tìm user
            const user = await DatabaseService.findUserByEmail(data.email)
            if (!user) {
                return {
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                }
            }

            // Kiểm tra auth provider
            if (user.auth_provider !== 'LOCAL') {
                return {
                    success: false,
                    message: `Tài khoản này đã đăng ký bằng ${user.auth_provider}. Vui lòng sử dụng phương thức đó để đăng nhập.`
                }
            }

            // Xác thực password
            if (!user.password_hash) {
                return {
                    success: false,
                    message: 'Tài khoản không hợp lệ'
                }
            }

            const isValidPassword = await DatabaseService.verifyPassword(
                data.password,
                user.password_hash
            )

            if (!isValidPassword) {
                return {
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                }
            }

            // Tạo JWT token
            const token = JWTService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role
            })

            return {
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    avatar_url: user.avatar_url
                },
                token
            }
        } catch (error) {
            console.error('Error in login:', error)
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi đăng nhập'
            }
        }
    }

    /**
     * Đăng nhập/Đăng ký bằng OAuth
     */
    static async oauthLogin(
        email: string,
        full_name: string,
        provider: AuthProvider,
        providerId: string,
        avatarUrl?: string
    ): Promise<AuthResponse> {
        try {
            console.log('🔵 [AuthService] Starting OAuth login:', {email, provider});
            
            // Kiểm tra user đã tồn tại
            let user = await DatabaseService.findUserByEmail(email)
            console.log('🔍 [AuthService] User lookup result:', {
                found: !!user,
                userId: user?.id,
                userProvider: user?.auth_provider
            });

            // Nếu chưa tồn tại, tạo mới
            if (!user) {
                console.log('📝 [AuthService] Creating new OAuth user...');
                user = await DatabaseService.createOAuthUser(
                    email,
                    full_name,
                    provider,
                    providerId,
                    avatarUrl
                )

                if (!user) {
                    console.error('❌ [AuthService] Failed to create OAuth user');
                    return {
                        success: false,
                        message: 'Không thể tạo tài khoản'
                    }
                }
                console.log('✅ [AuthService] OAuth user created:', user.id);
            } else {
                // Kiểm tra provider có khớp không
                if (user.auth_provider !== provider) {
                    console.error('❌ [AuthService] Provider mismatch:', {
                        expected: provider,
                        got: user.auth_provider
                    });
                    return {
                        success: false,
                        message: `Tài khoản này đã đăng ký bằng ${user.auth_provider}. Vui lòng sử dụng phương thức đó để đăng nhập.`
                    }
                }
                console.log('✅ [AuthService] User already exists:', user.id);
            }

            // Tạo JWT token
            const token = JWTService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role
            })

            console.log('✅ [AuthService] JWT token generated for:', user.email);

            return {
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    avatar_url: user.avatar_url
                },
                token
            }
        } catch (error) {
            console.error('❌ [AuthService] Exception in oauthLogin:', error)
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi đăng nhập'
            }
        }
    }

    /**
     * Xác thực token và lấy thông tin user
     */
    static async verifyToken(token: string): Promise<AuthResponse> {
        try {
            const payload = JWTService.verifyToken(token)
            if (!payload) {
                return {
                    success: false,
                    message: 'Token không hợp lệ'
                }
            }

            const user = await DatabaseService.findUserById(payload.userId)
            if (!user) {
                return {
                    success: false,
                    message: 'Người dùng không tồn tại'
                }
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    avatar_url: user.avatar_url
                },
                token
            }
        } catch (error) {
            console.error('Error in verifyToken:', error)
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi xác thực'
            }
        }
    }
}
