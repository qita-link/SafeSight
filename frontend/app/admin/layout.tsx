'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { LayoutDashboard, ListChecks, Settings2, ShieldCheck, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = localStorage.getItem('safe_user');
    if (!localStorage.getItem('safe_token')) window.location.href = '/login';
    else if (!user || JSON.parse(user).role !== 'super_admin') window.location.href = '/account';
  }, []);
  return <div className="min-h-screen"><aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-white/10 bg-slate-950/90 p-5 lg:block"><Link href="/" className="mb-10 flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-cyan-300" />安盾云检后台</Link><nav className="space-y-2 text-sm text-slate-400">{[[LayoutDashboard, '总览', '/admin'], [Users, '用户管理', '/admin/users'], [Settings2, '平台设置', '/admin/settings'], [ListChecks, '扫描任务', '/admin/tasks']].map(([Icon, label, href]) => <Link key={href as string} href={href as string} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/10 hover:text-white"><Icon className="h-4 w-4" />{label as string}</Link>)}</nav></aside><div className="lg:pl-60">{children}</div></div>;
}
