'use client';

import { useEffect, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, ListChecks, Settings2, UserRound } from 'lucide-react';

import { AdminSettings, AdminUser, apiAdminDailyTasks, apiAdminOverview, apiAdminSchedules, apiAdminSettings, apiAdminUsers, apiUpdateAdminSettings, apiUpdateUserVerification } from '@/lib/api';

export default function AdminPage() {
  const [overview, setOverview] = useState<{
    total_users: number;
    total_scans: number;
    system_status: Record<string, string>;
    recent_activity: string[];
  }>({
    total_users: 18240,
    total_scans: 48220,
    system_status: {
      api: '正常',
      postgresql: '正常',
      redis: '正常',
      ai_service: '正常',
    },
    recent_activity: ['demo-company@safe.ai 完成检测'],
  });
  const [settings, setSettings] = useState<AdminSettings>({ registration_enabled: true, email_verification_enabled: true, guest_scan_enabled: true });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [schedules, setSchedules] = useState<Array<{ user: string; url: string; enabled: boolean }>>([]);
  const [tasks, setTasks] = useState<Array<{ user: string; url: string; status: string; date: string }>>([]);

  useEffect(() => {
    apiAdminOverview().then(setOverview).catch(() => undefined);
    apiAdminSettings().then(setSettings).catch(() => undefined);
    apiAdminUsers().then(setUsers).catch(() => undefined);
    apiAdminSchedules().then(setSchedules).catch(() => undefined);
    apiAdminDailyTasks().then(setTasks).catch(() => undefined);
  }, []);

  const updateSetting = async (key: keyof AdminSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(await apiUpdateAdminSettings({ [key]: next[key] }));
  };

  const toggleVerification = async (user: AdminUser) => {
    const result = await apiUpdateUserVerification(user.email, !user.email_verified);
    setUsers((current) => current.map((item) => item.email === user.email ? { ...item, email_verified: result.email_verified } : item));
  };

  const stats = [
    { label: '总用户', value: overview.total_users.toLocaleString() },
    { label: '累计检测', value: overview.total_scans.toLocaleString() },
    { label: '数据库状态', value: overview.system_status.postgresql },
    { label: 'AI 服务状态', value: overview.system_status.ai_service },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">运营后台</div>
            <h1 className="text-3xl font-bold">控制台</h1>
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">系统正常</div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="glass-card p-4">
              <div className="text-sm text-slate-400">{item.label}</div>
              <div className="mt-3 text-3xl font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              最近30天检测趋势
            </div>
            <div className="flex h-56 items-end gap-3">
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">趋势数据将在完成每日扫描后生成</div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-emerald-300" />
                系统状态
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                {Object.entries(overview.system_status).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span>{key === 'api' ? 'API' : key === 'postgresql' ? 'PostgreSQL' : key === 'redis' ? 'Redis' : 'AI 服务'}</span>
                    <span className="text-emerald-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <UserRound className="h-5 w-5 text-violet-300" />
                最新活动
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                {overview.recent_activity.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="glass-card p-5"><div className="mb-4 flex items-center gap-2 text-lg font-semibold"><Settings2 className="h-5 w-5 text-cyan-300" />平台策略</div><div className="space-y-3">{([['registration_enabled', '开放新用户注册'], ['email_verification_enabled', '注册需要邮箱验证码'], ['guest_scan_enabled', '允许访客使用扫描']] as const).map(([key, label]) => <button key={key} onClick={() => updateSetting(key)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-3 text-left"><span className="text-sm text-slate-200">{label}</span><span className={`h-5 w-10 rounded-full p-0.5 transition ${settings[key] ? 'bg-emerald-400' : 'bg-slate-700'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${settings[key] ? 'translate-x-5' : ''}`} /></span></button>)}</div></section>
          <section className="glass-card p-5"><div className="mb-4 flex items-center gap-2 text-lg font-semibold"><UserRound className="h-5 w-5 text-violet-300" />用户邮箱状态</div><div className="space-y-2">{users.length ? users.map((user) => <div key={user.email} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-3"><div><div className="text-sm text-slate-200">{user.username}</div><div className="text-xs text-slate-500">{user.email}</div></div><button onClick={() => toggleVerification(user)} className={user.email_verified ? 'text-xs text-emerald-300' : 'text-xs text-orange-300'}>{user.email_verified ? '已验证 · 改为未验证' : '未验证 · 直接通过'}</button></div>) : <p className="text-sm text-slate-500">登录管理员账号后加载用户。</p>}</div></section>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="glass-card p-5"><div className="mb-4 flex items-center gap-2 text-lg font-semibold"><ListChecks className="h-5 w-5 text-cyan-300" />定时扫描任务</div>{schedules.length ? schedules.map((item) => <div key={`${item.user}-${item.url}`} className="flex justify-between border-b border-white/10 py-3 text-sm"><span className="truncate">{item.url}<small className="ml-2 text-slate-500">{item.user}</small></span><span className={item.enabled ? 'text-emerald-300' : 'text-slate-500'}>{item.enabled ? '每日开启' : '已暂停'}</span></div>) : <p className="text-sm text-slate-500">暂无任务</p>}</section><section className="glass-card p-5"><div className="mb-4 flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-300" />今日扫描任务</div>{tasks.length ? tasks.map((item) => <div key={`${item.user}-${item.url}`} className="border-b border-white/10 py-3 text-sm"><div className="truncate text-slate-200">{item.url}</div><div className="mt-1 text-xs text-slate-500">{item.user} · {item.date} · {item.status}</div></div>) : <p className="text-sm text-slate-500">今天暂无任务记录</p>}</section></div>
      </div>
    </main>
  );
}
