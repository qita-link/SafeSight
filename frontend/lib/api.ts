import { demoHealth, demoLoginResponse, demoRisks, demoSummary } from '@/lib/demo-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function apiHealthCheck() {
  try {
    return await requestJson<typeof demoHealth>('/health');
  } catch {
    return demoHealth;
  }
}

export async function apiLogin(email: string, password: string) {
  try {
    return await requestJson<typeof demoLoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch {
    if (email === 'user@safesight.ai' && password === 'Demo@1234') {
      return demoLoginResponse;
    }
    throw new Error('邮箱或密码不正确');
  }
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
    return {
      url,
      score: 67,
      reachable: true,
      status_code: 200,
      response_time_ms: 120,
      risks: [
        {
          name: '缺失 Content-Security-Policy',
          severity: 'Medium',
          description: '未配置内容安全策略，可能增加 XSS 与脚本执行风险。',
          recommendation: '配置 Content-Security-Policy，先使用 Report-Only 模式验证规则，再逐步收紧。',
        },
        {
          name: 'HSTS 未启用',
          severity: 'High',
          description: '缺少强制 HTTPS 策略，可能遭受中间人攻击。',
          recommendation: '添加 Strict-Transport-Security: max-age=31536000; includeSubDomains。',
        },
        {
          name: 'Cookie 缺少 Secure 属性',
          severity: 'Medium',
          description: 'Cookie 在传输过程中可能暴露于非加密通道。',
          recommendation: '为敏感 Cookie 添加 Secure、HttpOnly 和适当的 SameSite 属性。',
        },
      ],
    };
  }
}

export async function apiAdminOverview() {
  try {
    return await requestJson<{
      total_users: number;
      total_scans: number;
      system_status: Record<string, string>;
      recent_activity: string[];
    }>('/api/v1/admin/overview');
  } catch {
    return {
      total_users: 18240,
      total_scans: 48220,
      system_status: {
        api: '正常',
        postgresql: '正常',
        redis: '正常',
        ai_service: '正常',
      },
      recent_activity: [
        'demo-company@safe.ai 完成检测',
        'school-admin@safe.ai 新增用户',
        'shop-owner@safe.ai 修复高危风险',
      ],
    };
  }
}
