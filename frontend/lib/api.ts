import { demoHealth, demoLoginResponse, demoRisks, demoSummary } from '@/lib/demo-data';

type AiReportRisk = { name: string; severity: string; description: string; recommendation: string };
export type AuthResponse = { access_token: string; token_type: string; user: { id: string; email: string; username: string; plan: string; role?: string; email_verified?: boolean } };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('safe_token') : null;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new Error(`无法连接后端服务，请确认 API 已启动（${API_BASE_URL}）`);
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export type Schedule = { url: string; enabled: boolean; cadence: string; next_scan: string };

export async function apiGetSchedule() {
  return requestJson<Schedule | null>('/api/v1/scan/schedule');
}

export async function apiSetSchedule(url: string, enabled: boolean) {
  return requestJson<Schedule>('/api/v1/scan/schedule', { method: 'PUT', body: JSON.stringify({ url, enabled }) });
}

export async function apiScanHistory() {
  return requestJson<Array<{ id: string; url?: string; score: number; risks: AiReportRisk[]; reachable: boolean; status_code?: number; response_time_ms?: number; scannedAt: string }>>('/api/v1/scan/history');
}

export async function apiGenerateAiReport(result: { url: string; score: number; risks: AiReportRisk[] }) {
  return requestJson<{ report: string; model: string }>('/api/v1/scan/ai-report', { method: 'POST', body: JSON.stringify(result) });
}

export async function apiHealthCheck() {
  try {
    return await requestJson<typeof demoHealth>('/health');
  } catch {
    return demoHealth;
  }
}

export async function apiLogin(email: string, password: string) {
  return requestJson<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function apiSendVerificationCode(email: string) {
  return requestJson<{ message: string; dev_code?: string }>('/api/v1/auth/verification-code', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function apiRegister(payload: { username: string; email: string; password: string; confirm_password: string; verification_code: string }) {
  return requestJson<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function apiRiskSummary() {
  try {
    return await requestJson<typeof demoSummary>('/api/v1/health');
  } catch {
    return demoSummary;
  }
}

export async function apiRiskList() {
  try {
    return await requestJson<typeof demoRisks>('/api/v1/risks');
  } catch {
    return demoRisks;
  }
}

export async function apiScanWebsite(url: string) {
  type ScanResponse = {
    url: string;
    score: number;
    risks: Array<{ name: string; severity: string; description: string; recommendation: string }>;
    reachable: boolean;
    status_code?: number;
    response_time_ms?: number;
  };

  try {
    return await requestJson<ScanResponse>('/api/v1/scan', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  } catch (error) {
    if (error instanceof Error && /Request failed: 4\d\d/.test(error.message)) {
      throw new Error('URL 无效或目标地址不被允许');
    }
    throw error;
  }
}

export async function apiAdminOverview() {
  return requestJson<{
      total_users: number;
      total_scans: number;
      system_status: Record<string, string>;
      recent_activity: string[];
    }>('/api/v1/admin/overview');
}

export type AdminSettings = { registration_enabled: boolean; email_verification_enabled: boolean; guest_scan_enabled: boolean };
export type AdminUser = { id: string; email: string; username: string; plan: string; email_verified: boolean; schedule?: Schedule };

export async function apiAdminSettings() { return requestJson<AdminSettings>('/api/v1/admin/settings'); }
export async function apiUpdateAdminSettings(payload: Partial<AdminSettings>) { return requestJson<AdminSettings>('/api/v1/admin/settings', { method: 'PUT', body: JSON.stringify(payload) }); }
export async function apiAdminUsers() { return requestJson<AdminUser[]>('/api/v1/admin/users'); }
export async function apiUpdateUserVerification(email: string, email_verified: boolean) { return requestJson<{ email: string; email_verified: boolean }>(`/api/v1/admin/users/${encodeURIComponent(email)}/verification`, { method: 'PATCH', body: JSON.stringify({ email_verified }) }); }
export async function apiAdminSchedules() { return requestJson<Array<{ user: string } & Schedule>>('/api/v1/admin/schedules'); }
export async function apiAdminDailyTasks() { return requestJson<Array<{ user: string; url: string; status: string; date: string }>>('/api/v1/admin/daily-tasks'); }
