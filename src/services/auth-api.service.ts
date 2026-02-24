/**
 * Client-side auth API: gọi /api/auth/* với Bearer token (session.accessToken).
 * Component truyền token từ useSession(); 401 → redirect login.
 */

const API = '/api/auth';

export type AccountMe = {
  email: string;
  provider: 'local' | 'google';
  createdAt: string | null;
  hasPassword: boolean;
};

export type ChangePasswordBody = { oldPassword: string; newPassword: string };
export type SetPasswordBody = { newPassword: string };
export type DeleteAccountBody = { password?: string; confirmIrreversible: true };

export type AuthApiResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

type AuthFetchOptions = Omit<RequestInit, 'body'> & { body?: object };

async function authFetch(
  token: string | undefined,
  path: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }
  const { method = 'GET', body, ...rest } = options;
  const headers: HeadersInit = {
    ...(rest.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };
  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method ?? '')) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  return fetch(`${API}${path}`, {
    ...rest,
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export const authApi = {
  async getMe(token: string | undefined): Promise<AuthApiResult<AccountMe>> {
    const res = await authFetch(token, '/me');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, message: (data as { message?: string }).message ?? 'Failed to load account' };
    }
    return { ok: true, data: data as AccountMe };
  },

  async changePassword(token: string | undefined, body: ChangePasswordBody): Promise<AuthApiResult<{ message: string }>> {
    const res = await authFetch(token, '/change-password', { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, message: (data as { message?: string }).message ?? 'Change password failed' };
    }
    return { ok: true, data: data as { message: string } };
  },

  async setPassword(token: string | undefined, body: SetPasswordBody): Promise<AuthApiResult<{ message: string }>> {
    const res = await authFetch(token, '/set-password', { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, message: (data as { message?: string }).message ?? 'Set password failed' };
    }
    return { ok: true, data: data as { message: string } };
  },

  async deleteAccount(token: string | undefined, body: DeleteAccountBody): Promise<AuthApiResult<{ message: string }>> {
    const res = await authFetch(token, '/delete-account', { method: 'DELETE', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, message: (data as { message?: string }).message ?? 'Delete account failed' };
    }
    return { ok: true, data: data as { message: string } };
  },
};
