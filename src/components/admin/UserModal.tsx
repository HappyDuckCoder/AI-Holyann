import { useState, useEffect } from 'react'
import { User, UserFormData } from '@/types/admin'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: UserFormData) => void
    user: User | null
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [formData, setFormData] = useState<UserFormData>({
        full_name: '',
        email: '',
        phone_number: '',
        role: 'STUDENT',
        is_active: true,
        password: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number || '',
                role: user.role,
                is_active: user.is_active,
                password: ''
            })
        } else {
            setFormData({
                full_name: '',
                email: '',
                phone_number: '',
                role: 'STUDENT',
                is_active: true,
                password: ''
            })
        }
        setErrors({})
    }, [user, isOpen])

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Vui lòng nhập tên'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ'
        }

        if (!user && !formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu'
        } else if (!user && formData.password && formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onSave(formData)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                        </h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className={`input-holyann w-full ${errors.full_name ? 'border-red-500' : ''}`}
                            placeholder="Nhập họ và tên"
                        />
                        {errors.full_name && (
                            <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`input-holyann w-full ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="email@example.com"
                            disabled={!!user}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            className="input-holyann w-full"
                            placeholder="0123456789"
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`input-holyann w-full ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="Nhập mật khẩu"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Vai trò
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            className="input-holyann w-full"
                        >
                            <option value="STUDENT">Học viên</option>
                            <option value="MENTOR">Mentor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="is_active" className="text-sm font-semibold text-foreground">
                            Tài khoản hoạt động
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {user ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
