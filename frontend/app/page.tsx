 'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bot, ChartNoAxesCombined, ShieldCheck, Sparkles, CheckCircle2, LockKeyhole, Radar, Cpu } from 'lucide-react';

const stats = [
  { label: '今日检测网站', value: '1286', suffix: '+' },
  { label: '累计检测次数', value: '46820', suffix: '+' },
  { label: '发现风险数量', value: '9231', suffix: '+' },
  { label: 'AI生成整改方案', value: '7415', suffix: '+' },
];

const riskCards = [
  { label: '严重风险', value: 1, tone: 'text-red-400' },
  { label: '高风险', value: 2, tone: 'text-orange-400' },
  { label: '中风险', value: 5, tone: 'text-yellow-400' },
  { label: '低风险', value: 11, tone: 'text-sky-400' },
];

const scanItems = ['SSL', 'HTTP Header', 'Cookie', 'DNS', '开放服务', 'Web配置', 'CMS', '第三方组件', '安全策略'];

export default function HomePage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  useEffect(() => { const stored = localStorage.getItem('safe_user'); if (stored) setUser(JSON.parse(stored)); }, []);
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-6">
        <header className="glass-card mb-8 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">安盾云检</div>
              <div className="text-xs text-slate-400">SafeSight AI</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="#">首页</Link>
            <Link href="/dashboard">安全检测</Link>
            {user?.role === 'super_admin' ? <Link href="/admin">管理后台</Link> : user ? <Link href="/account">个人后台</Link> : null}
            <Link href="/risks">风险中心</Link>
            <Link href="/dashboard">安全报告</Link>
            <Link href="/solutions">解决方案</Link>
            <Link href="https://safeblog.qita.link/" target="_blank">安全知识库</Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? <Link href={user.role === 'super_admin' ? '/admin' : '/account'} className="btn-secondary">进入控制台</Link> : <><Link href="/login" className="btn-secondary">登录</Link><Link href="/register" className="btn-secondary">注册</Link></>}
            <Link href="/dashboard" className="btn-primary">免费检测</Link>
          </div>
        </header>

        <section className="grid gap-10 pb-14 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI + 规则引擎双驱动的安全治理平台
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              AI驱动的网站安全风险智能检测平台
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              让中小企业无需专业安全团队，也能快速发现网站风险、理解安全问题并获得智能整改建议。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard" className="btn-primary">
                立即免费检测 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#showcase" className="btn-secondary">查看演示</Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="glass-card px-4 py-4">
                  <div className="text-3xl font-bold text-white">{item.value}</div>
                  <div className="mt-2 text-xs text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="glass-card relative w-full max-w-xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">安全评分</div>
                  <div className="mt-2 text-5xl font-bold text-cyan-300">86</div>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  良好
                </div>
              </div>

              <div className="scan-ring mx-auto my-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900/70 text-cyan-200 shadow-glow">
                  <Radar className="h-8 w-8" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {riskCards.map((risk) => (
                  <div key={risk.label} className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                    <div className="text-sm text-slate-400">{risk.label}</div>
                    <div className={`mt-2 text-2xl font-bold ${risk.tone}`}>{risk.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">扫描中</div>
                <div className="flex flex-wrap gap-2">
                  {scanItems.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="showcase" className="grid gap-5 pb-10 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'AI安全解释', description: '把术语翻译成老板和站长都能看懂的风险说明。' },
            { icon: Bot, title: 'AI整改建议', description: '根据已检测出风险生成优先级建议和整改计划。' },
            { icon: ChartNoAxesCombined, title: '安全趋势', description: '持续追踪网站安全分数、增减风险和整改成效。' },
          ].map((item) => (
            <div key={item.title} className="glass-card p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mb-12 border-y border-white/10 py-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div><div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">WHY SAFESIGHT</div><h2 className="mt-3 text-3xl font-bold">把一次检测，变成持续的安全判断。</h2><p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">安盾云检先用可验证的规则检查站点暴露面，再用清晰的语言解释影响。登录后还可以每天自动复测，观察评分和风险是否真的改善。</p></div>
            <div className="grid gap-3 sm:grid-cols-3"><div className="border-l border-cyan-400/40 pl-4"><div className="text-2xl font-bold text-cyan-300">01</div><div className="mt-2 text-sm font-medium">看见信号</div><div className="mt-1 text-xs leading-5 text-slate-500">响应头、HTTPS、Cookie 等关键面</div></div><div className="border-l border-violet-400/40 pl-4"><div className="text-2xl font-bold text-violet-300">02</div><div className="mt-2 text-sm font-medium">理解影响</div><div className="mt-1 text-xs leading-5 text-slate-500">按严重程度排列，给出可执行建议</div></div><div className="border-l border-emerald-400/40 pl-4"><div className="text-2xl font-bold text-emerald-300">03</div><div className="mt-2 text-sm font-medium">持续复测</div><div className="mt-1 text-xs leading-5 text-slate-500">每日趋势记录整改后的变化</div></div></div>
          </div>
        </section>

        <section className="grid gap-5 pb-12 lg:grid-cols-2">
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-cyan-300" />
              <div className="text-lg font-semibold">安全检测闭环</div>
            </div>
            <div className="space-y-4">
              {['检测 → 分析 → 解释 → 整改 → 复测 → 监控'].map((step, idx) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">{idx + 1}</div>
                  <span className="text-slate-200">{step}</span>
                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <Cpu className="h-5 w-5 text-violet-300" />
              <div className="text-lg font-semibold">我们的创新</div>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="font-medium text-white">创新 1：AI 安全翻译器</div>
                把复杂漏洞术语转换为中小企业真正能理解的内容。
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="font-medium text-white">创新 2：规则引擎 + AI 双引擎</div>
                规则负责评分，AI负责解释与建议，降低幻觉风险。
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="font-medium text-white">创新 3：安全数字画像</div>
                为每个站点建立持续变化的安全评分和成长曲线。
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
