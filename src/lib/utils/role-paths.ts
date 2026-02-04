/**
 * Get the base URL path for the current user role
 * @param role - User role (ADMIN, MENTOR, STUDENT, etc.)
 * @returns Base URL path (e.g., '/admin', '/mentor', '/student')
 */
export function getRoleBasePath(role?: string | null): string {
  if (!role) return '/student';
  
  const normalizedRole = role.toUpperCase();
  
  switch (normalizedRole) {
    case 'ADMIN':
      return '/admin';
    case 'MENTOR':
      return '/mentor';
    case 'STUDENT':
    case 'USER':
    default:
      return '/student';
  }
}

/**
 * Get the dashboard URL for the current user role
 * @param role - User role
 * @returns Dashboard URL (e.g., '/admin/dashboard')
 */
export function getRoleDashboardPath(role?: string | null): string {
  return `${getRoleBasePath(role)}/dashboard`;
}

/**
 * Get the chat URL for the current user role
 * @param role - User role
 * @returns Chat URL (e.g., '/admin/chat')
 */
export function getRoleChatPath(role?: string | null): string {
  return `${getRoleBasePath(role)}/chat`;
}

/**
 * Get a specific page URL for the current user role
 * @param role - User role
 * @param page - Page path (e.g., 'profile', 'tests')
 * @returns Full page URL
 */
export function getRolePagePath(role?: string | null, page: string): string {
  return `${getRoleBasePath(role)}/${page}`;
}
