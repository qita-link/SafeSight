'use client';

import { useEffect, useState } from 'react';
import { Activity, BarChart3, UserRound } from 'lucide-react';

import { apiAdminOverview } from '@/lib/api';

export default function AdminPage() {
  const [overview, setOverview] = useState({
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

  useEffect(() => {
    apiAdminOverview().then(setOverview).catch(() => undefined);
  }, []);

  const stats = [
    { label: '总用户', value: overview.total_users.toLocaleString() },
    { label: '今日新增用户', value: '312' },
    { label: '累计检测', value: overview.total_scans.toLocaleString() },
    { label: 'AI 调用次数', value: '18320' },
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
              {[32, 44, 37, 58, 60, 74, 80, 72, 90, 82, 96, 100].map((height, idx) => (
                <div key={idx} className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-500 to-violet-500" style={{ height: `${height}%` }} />
              ))}
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
      </div>
    </main>
  );
}
