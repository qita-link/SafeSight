'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, ArrowRight, CalendarClock, CheckCircle2, Gauge, LogOut, ShieldCheck } from 'lucide-react';
import { apiGetSchedule, apiScanHistory, apiSetSchedule, Schedule } from '@/lib/api';

type ScanRecord = { id: string; url?: string; score: number; risks: Array<{ severity: string }>; scannedAt: string };

export default function AccountPage() {
  const [user, setUser] = useState<{ username?: string; email?: string; email_verified?: boolean } | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [scheduleUrl, setScheduleUrl] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('safe_token');
    if (!token) { window.location.href = '/login'; return; }
    const storedUser = localStorage.getItem('safe_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    apiScanHistory().then(setHistory).catch(() => undefined);
    apiGetSchedule().then(setSchedule).catch(() => undefined);
  }, []);

  const addSchedule = async () => {
    setScheduleError('');
    if (!scheduleUrl.trim()) { setScheduleError('请输入站点 URL'); return; }
    try { setSchedule(await apiSetSchedule(scheduleUrl.trim(), true)); setScheduleUrl(''); }
    catch (error) { setScheduleError(error instanceof Error ? error.message : '添加失败，请重新登录'); }
  };
  const average = history.length ? Math.round(history.reduce((total, item) => total + item.score, 0) / history.length) : 0;
  const riskCount = history.reduce((total, item) => total + item.risks.length, 0);
  const signOut = () => { localStorage.removeItem('safe_token'); localStorage.removeItem('safe_user'); window.location.href = '/login'; };

  return <main className="min-h-screen px-6 py-8"><div className="mx-auto max-w-6xl">
    <header className="mb-10 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">PERSONAL COMMAND CENTER</div><h1 className="mt-2 text-3xl font-bold">个人安全后台</h1><p className="mt-2 text-sm text-slate-400">{user?.username || '安全用户'} · {user?.email || '加载中'}</p></div><div className="flex gap-3"><Link href="/" className="btn-secondary px-4 py-2 text-sm">返回首页</Link><Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">开始检测<ArrowRight className="ml-2 h-4 w-4" /></Link><button onClick={signOut} title="退出登录" className="rounded-xl border border-white/10 px-3 text-slate-400 hover:text-white"><LogOut className="h-4 w-4" /></button></div></header>
    <div className="mb-8 grid gap-4 sm:grid-cols-3"><div className="glass-card p-5"><Gauge className="h-5 w-5 text-cyan-300" /><div className="mt-4 text-xs text-slate-500">平均安全评分</div><div className="mt-1 text-3xl font-bold text-cyan-300">{average || '--'}</div></div><div className="glass-card p-5"><Activity className="h-5 w-5 text-violet-300" /><div className="mt-4 text-xs text-slate-500">已完成检测</div><div className="mt-1 text-3xl font-bold text-white">{history.length}</div></div><div className="glass-card p-5"><ShieldCheck className="h-5 w-5 text-orange-300" /><div className="mt-4 text-xs text-slate-500">累计风险信号</div><div className="mt-1 text-3xl font-bold text-orange-300">{riskCount}</div></div></div>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><section className="glass-card p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">已添加的定时扫描</h2><p className="mt-1 text-sm text-slate-500">每天自动复测并更新安全趋势</p></div><CalendarClock className="h-6 w-6 text-cyan-300" /></div>{schedule?.enabled ? <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4"><div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" />每日巡检已开启</div><div className="mt-3 truncate text-lg font-medium text-white">{schedule.url}</div><div className="mt-2 text-xs text-slate-500">{schedule.next_scan}</div></div> : <div className="rounded-xl border border-dashed border-white/15 p-5"><div className="text-sm text-slate-400">还没有定时扫描任务</div><div className="mt-4 flex gap-2"><input value={scheduleUrl} onChange={(event) => setScheduleUrl(event.target.value)} placeholder="https://your-site.com" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-400/60" /><button onClick={addSchedule} className="btn-primary px-4 py-2 text-sm">添加站点</button></div>{scheduleError ? <div className="mt-3 text-xs text-orange-300">{scheduleError}</div> : null}</div>}</section>
    <section className="glass-card p-6"><h2 className="text-xl font-semibold">安全指标</h2><p className="mt-1 text-sm text-slate-500">基于本账户最近保存的检测</p><div className="mt-6 space-y-5"><div><div className="mb-2 flex justify-between text-sm"><span>评分稳定度</span><span className="text-cyan-300">{average ? `${average}%` : '--'}</span></div><div className="h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${average}%` }} /></div></div><div><div className="mb-2 flex justify-between text-sm"><span>邮箱验证</span><span className={user?.email_verified === false ? 'text-orange-300' : 'text-emerald-300'}>{user?.email_verified === false ? '待验证' : '已验证'}</span></div><div className="h-2 rounded-full bg-slate-800"><div className={`h-full rounded-full ${user?.email_verified === false ? 'w-1/2 bg-orange-400' : 'w-full bg-emerald-400'}`} /></div></div></div></section></div>
    <section className="mt-6 glass-card p-6"><h2 className="mb-4 text-xl font-semibold">最近检测</h2>{history.length ? <div className="space-y-2">{history.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between border-b border-white/10 py-3 text-sm"><span className="truncate text-slate-300">{item.url}</span><span className="text-slate-500">{new Date(item.scannedAt).toLocaleDateString('zh-CN')} · <b className="text-cyan-300">{item.score}</b></span></div>)}</div> : <p className="text-sm text-slate-500">完成检测后，记录会出现在这里。</p>}</section>
  </div></main>;
}
