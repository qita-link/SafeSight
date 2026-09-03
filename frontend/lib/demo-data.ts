export type DemoRisk = {
  name: string;
  site: string;
  level: 'High' | 'Medium' | 'Low';
  status: '待处理' | '处理中' | '已修复';
  discoveredAt: string;
};

export const demoHealth = {
  status: 'ok',
  service: 'SafeSight AI',
  version: '0.1.0',
  demo_mode: true,
};

export const demoLoginResponse = {
  access_token: 'demo-access-token',
  token_type: 'bearer',
  user: {
    id: 'demo-user-001',
    email: 'user@safesight.ai',
    username: 'demo-user',
    plan: 'professional',
  },
};

export const demoScanSteps = [
  '域名解析检查',
  'HTTPS安全检查',
  'SSL证书检查',
  'HTTP响应头检查',
  'Cookie安全策略检查',
  '网站基础配置检查',
  '技术栈识别',
  'CMS风险提示',
  '第三方组件风险匹配',
  '安全策略检查',
  '页面基础风险分析',
  'AI风险综合分析',
  '生成安全报告',
];

export const demoRisks: DemoRisk[] = [
  { name: '缺失 Content-Security-Policy', site: 'company-demo.com', level: 'Medium', status: '待处理', discoveredAt: '2026-09-02' },
  { name: 'HSTS 未启用', site: 'shop-demo.com', level: 'High', status: '处理中', discoveredAt: '2026-09-02' },
  { name: 'Cookie 缺少 Secure 属性', site: 'school-demo.edu', level: 'Medium', status: '已修复', discoveredAt: '2026-09-01' },
  { name: 'Server 版本信息暴露', site: 'company-demo.com', level: 'Low', status: '待处理', discoveredAt: '2026-09-01' },
  { name: '弱 TLS 配置', site: 'demo-store.io', level: 'High', status: '待处理', discoveredAt: '2026-08-30' },
];

export const demoSummary = {
  total: 43,
  critical: 2,
  high: 6,
  medium: 18,
  low: 17,
};

export const demoRiskSummary = demoSummary;

export const demoDashboardStats = [
  { label: '安全评分', value: '67', tone: 'text-cyan-300' },
  { label: '高危风险', value: '2', tone: 'text-orange-300' },
  { label: '中危风险', value: '5', tone: 'text-yellow-300' },
  { label: '已修复', value: '4', tone: 'text-emerald-300' },
];
