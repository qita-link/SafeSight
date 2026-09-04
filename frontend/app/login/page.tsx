'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import { apiLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await apiLogin(email, password);
      localStorage.setItem('safe_token', response.access_token);
      localStorage.setItem('safe_user', JSON.stringify(response.user));
      router.push(response.user.role === 'super_admin' ? '/admin' : '/account');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-950 lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 lg:flex">
        <div className="grid-bg relative h-[520px] w-[520px] rounded-full border border-blue-400/30 bg-slate-900/40 p-12 backdrop-blur-md">
          <div className="scan-ring mx-auto my-auto">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-950/80 text-cyan-200">
              <ShieldCheck className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_40px_rgba(59,130,246,0.12)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">欢迎回来</div>
            <div className="mt-2 text-sm text-slate-400">登录到 安盾云检 控制台</div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">邮箱</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none ring-0 focus:border-blue-400/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">密码</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none ring-0 focus:border-blue-400/60"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2"><input type="checkbox" /> 记住我</label>
              <Link href="#" className="text-blue-300">忘记密码</Link>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            还没有账号？ <Link href="/register" className="text-blue-300">立即注册</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
