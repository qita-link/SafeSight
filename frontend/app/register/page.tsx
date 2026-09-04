'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { apiRegister, apiSendVerificationCode } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '', verification_code: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const sendCode = async () => {
    if (!form.email) return setError('请先填写邮箱');
    setSending(true); setError('');
    try {
      const result = await apiSendVerificationCode(form.email);
      setMessage(result.dev_code ? `开发模式验证码：${result.dev_code}` : result.message);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : '验证码发送失败'); }
    finally { setSending(false); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try {
      const result = await apiRegister(form);
      localStorage.setItem('safe_token', result.access_token); localStorage.setItem('safe_user', JSON.stringify(result.user)); router.push('/account');
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : '注册失败'); }
    finally { setSubmitting(false); }
  };

  return <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[0.9fr_1.1fr]">
    <section className="hidden overflow-hidden border-r border-white/10 bg-gradient-to-br from-slate-950 via-cyan-950/50 to-blue-950 p-12 lg:flex lg:flex-col lg:justify-between"><Link href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300"><ShieldCheck className="h-5 w-5" /></span><span className="font-semibold">安盾云检</span></Link><div><div className="mb-4 text-xs uppercase tracking-[0.28em] text-cyan-300/70">PERSONAL SECURITY CLOUD</div><h1 className="max-w-md text-5xl font-bold leading-tight">让每一次登录，都成为安全治理的起点。</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">注册后可保存检测报告、设置每日巡检，并持续查看站点安全指标。</p></div><div className="text-xs text-slate-500">只检测你主动提交且获得授权的网站</div></section>
    <section className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md"><Link href="/login" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">返回登录</Link><div className="mb-8"><div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">CREATE ACCOUNT</div><h2 className="mt-3 text-3xl font-bold">创建个人账户</h2><p className="mt-2 text-sm text-slate-400">使用邮箱注册，开启站点持续监控。</p></div><form onSubmit={submit} className="space-y-4"><input required placeholder="称呼" value={form.username} onChange={(event) => update('username', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400/60" /><input required type="email" placeholder="工作邮箱" value={form.email} onChange={(event) => update('email', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400/60" /><div className="flex gap-2"><input required placeholder="邮箱验证码" value={form.verification_code} onChange={(event) => update('verification_code', event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400/60" /><button type="button" onClick={sendCode} disabled={sending} className="rounded-xl border border-cyan-400/30 px-3 text-xs text-cyan-300 disabled:opacity-50">{sending ? '发送中' : '获取验证码'}</button></div><input required minLength={8} type="password" placeholder="设置密码（至少 8 位）" value={form.password} onChange={(event) => update('password', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400/60" /><input required minLength={8} type="password" placeholder="确认密码" value={form.confirm_password} onChange={(event) => update('confirm_password', event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400/60" />{message && <div className="rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-300">{message}</div>}{error && <div className="rounded-xl bg-red-400/10 p-3 text-xs text-red-200">{error}</div>}<button disabled={submitting} className="btn-primary w-full">{submitting ? '创建中...' : '创建账户'}<ArrowRight className="ml-2 h-4 w-4" /></button></form><div className="mt-6 flex items-center gap-2 text-xs text-slate-500"><Mail className="h-4 w-4" />邮箱仅用于验证账户与发送安全提醒</div></div></section>
  </main>;
}
