'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, FileText, History, ShieldAlert, ShieldCheck, Sparkles, TrendingUp, X, Zap } from 'lucide-react';

import { apiGenerateAiReport, apiHealthCheck, apiScanHistory, apiScanWebsite } from '@/lib/api';
import { demoDashboardStats, demoScanSteps } from '@/lib/demo-data';

type ScanRisk = {
  name: string;
  severity: string;
  description: string;
  recommendation: string;
};

type ScanResult = {
  url?: string;
  score: number;
  risks: ScanRisk[];
  reachable: boolean;
  status_code?: number;
  response_time_ms?: number;
};

type ScanRecord = ScanResult & {
  id: string;
  scannedAt: string;
};

export default function DashboardPage() {
  const [siteUrl, setSiteUrl] = useState('https://company-demo.com');
  const [scanProgress, setScanProgress] = useState(0);
  const [status, setStatus] = useState('就绪');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState('');
  const [fixedRiskNames, setFixedRiskNames] = useState<Set<string>>(new Set());
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [report, setReport] = useState<ScanRecord | null>(null);
  const [showReportIndex, setShowReportIndex] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [scanFinished, setScanFinished] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    apiHealthCheck().then(() => setStatus('在线')).catch(() => setStatus('演示模式'));
    apiScanHistory().then(setScanHistory).catch(() => undefined);
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setStatus('检测中');
    setScanProgress(0);
    setScanError('');
    setScanResult(null);
    setScanFinished(false);
    setCompletedSteps(0);
    setFixedRiskNames(new Set());
    const scanStartedAt = Date.now();

    const interval = setInterval(() => setCompletedSteps((current) => Math.min(current + 1, demoScanSteps.length)), 1000);

    try {
      const result = await apiScanWebsite(siteUrl);
      const remainingTime = Math.max(0, demoScanSteps.length * 1000 - (Date.now() - scanStartedAt));
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
      setScanResult(result);
      const record: ScanRecord = {
        ...result,
        url: result.url || siteUrl,
        id: `${Date.now()}-${siteUrl}`,
        scannedAt: new Date().toISOString(),
      };
      setScanHistory((current) => {
        const next = [record, ...current.filter((item) => item.url !== record.url)].slice(0, 12);
        return next;
      });
      setStatus(result.reachable ? '检测完成' : '目标无法访问');
      setCompletedSteps(demoScanSteps.length);
      setScanProgress(100);
      setScanFinished(true);
    } catch (error) {
      setStatus('检测失败');
      setScanError(error instanceof Error ? error.message : '检测请求失败，请检查 URL 后重试');
    } finally {
      clearInterval(interval);
      setIsScanning(false);
    }
  };

  const generateAiReport = async () => {
    if (!report) return;
    setIsGeneratingAi(true);
    try {
      const result = await apiGenerateAiReport({ url: report.url ?? '', score: report.score, risks: report.risks });
      setAiReport(result.report);
    } catch {
      setAiReport('AI 报告需要后端配置 DEEPSEEK_API_KEY。配置后可生成总体判断、风险优先级、整改计划与复测建议。');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const summary = scanResult?.risks ?? [];

  const stats = scanResult
    ? [
        { label: '安全评分', value: String(scanResult.score), tone: 'text-cyan-300' },
        { label: '高危风险', value: String(summary.filter((item) => item.severity === 'High').length), tone: 'text-orange-300' },
        { label: '中危风险', value: String(summary.filter((item) => item.severity === 'Medium').length), tone: 'text-yellow-300' },
        { label: '已修复', value: String(fixedRiskNames.size), tone: 'text-emerald-300' },
      ]
    : demoDashboardStats;

  const markRiskFixed = (riskName: string) => {
    setFixedRiskNames((current) => {
      const next = new Set(current);
      if (next.has(riskName)) {
        next.delete(riskName);
      } else {
        next.add(riskName);
      }
      return next;
    });
  };

  const reportRisks = report?.risks ?? [];
  const reportHost = report?.url?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? '';
  const safeProjects = scanHistory.filter((record) => record.reachable && record.score >= 80 && !record.risks.some((risk) => risk.severity === 'High'));
  const unsafeProjects = scanHistory.filter((record) => !safeProjects.includes(record));

  const openProjectReport = (record: ScanRecord) => {
    setShowReportIndex(false);
    setReport(record);
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-400">站点检测</div>
            <h1 className="text-2xl font-bold">{siteUrl.replace(/^https?:\/\//, '')}</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn-secondary">返回首页</Link>
            <Link href="/account" className="btn-secondary">个人后台</Link>
            <input
              value={siteUrl}
              onChange={(event) => setSiteUrl(event.target.value)}
              className="min-w-[260px] rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-400/60"
            />
            <button onClick={handleScan} disabled={isScanning} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
              {isScanning ? '检测中...' : '开始安全检测'}
            </button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="glass-card p-4">
              <div className="text-sm text-slate-400">{item.label}</div>
              <div className={`mt-3 text-3xl font-bold ${item.tone}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_1.35fr]">
          <div className="glass-card border-cyan-400/20 p-5"><div className="mb-3 flex items-center gap-2 text-lg font-semibold"><Clock3 className="h-5 w-5 text-cyan-300" />每日安全巡检</div><p className="mb-4 text-sm leading-6 text-slate-400">定时扫描已迁移到个人后台，登录后可绑定站点并管理任务。</p><Link href="/account" className="btn-primary px-4 py-2 text-sm">进入个人后台<ArrowRight className="ml-2 h-4 w-4" /></Link></div>
          <div className="glass-card border-white/10 p-5"><div className="mb-3 flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5 text-violet-300" />检测策略</div><div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3"><div className="rounded-xl bg-white/[0.04] p-3"><b className="text-white">规则引擎</b><p className="mt-1 text-xs leading-5 text-slate-500">先验证可复现的安全信号</p></div><div className="rounded-xl bg-white/[0.04] p-3"><b className="text-white">逐项呈现</b><p className="mt-1 text-xs leading-5 text-slate-500">安全项与风险项完整留痕</p></div><div className="rounded-xl bg-white/[0.04] p-3"><b className="text-white">持续跟踪</b><p className="mt-1 text-xs leading-5 text-slate-500">每日结果汇入趋势曲线</p></div></div></div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Zap className="h-5 w-5 text-cyan-300" />
                {status}
              </div>
              <div className="text-sm text-cyan-300">{Math.round((completedSteps / demoScanSteps.length) * 100)}%</div>
            </div>

            {scanResult && (
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-slate-800 px-3 py-1">HTTP {scanResult.status_code ?? '--'}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1">响应 {scanResult.response_time_ms ?? '--'} ms</span>
                <span className={scanResult.reachable ? 'rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300' : 'rounded-full bg-red-500/15 px-3 py-1 text-red-300'}>
                  {scanResult.reachable ? '目标可访问' : '目标不可访问'}
                </span>
              </div>
            )}

            {scanError && <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{scanError}</div>}

            <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500" style={{ width: `${Math.round((completedSteps / demoScanSteps.length) * 100)}%` }} />
            </div>

            <div className="space-y-3">
              {demoScanSteps.map((step, index) => {
                const done = index < completedSteps;
                const matchingRisk = scanFinished && scanResult?.risks.find((risk) => (index === 1 && (risk.name.includes('HTTPS') || risk.name.includes('HSTS'))) || (index === 3 && (risk.name.includes('Content') || risk.name.includes('点击劫持'))) || (index === 4 && risk.name.includes('Cookie')));
                const stepLabel = !done ? '等待检测' : !scanFinished ? '分析中' : matchingRisk ? '发现风险' : '安全';
                return <div key={step} className={`flex items-center gap-3 rounded-xl border p-3 transition ${done && matchingRisk ? 'border-orange-400/30 bg-orange-400/[0.06]' : done ? 'border-emerald-400/20 bg-emerald-400/[0.05]' : 'border-white/10 bg-slate-900/60'}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] ${done && matchingRisk ? 'bg-orange-500/20 text-orange-300' : done && scanFinished ? 'bg-emerald-500/20 text-emerald-300' : done ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>{done ? (matchingRisk ? '!' : scanFinished ? '✓' : '…') : `${index + 1}`}</div>
                  <div className="min-w-0 text-sm text-slate-200">{String(index + 1).padStart(2, '0')} {step}<span className={`ml-2 text-xs ${done && matchingRisk ? 'text-orange-300' : done && scanFinished ? 'text-emerald-300' : done ? 'text-cyan-300' : 'text-slate-500'}`}>{stepLabel}</span></div>
                  {done && <CheckCircle2 className={`ml-auto h-4 w-4 ${matchingRisk ? 'text-orange-300' : 'text-emerald-300'}`} />}
                </div>
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <ShieldAlert className="h-5 w-5 text-orange-300" />
                发现风险摘要
              </div>
              <div className="space-y-3 text-sm text-slate-200">
                {!scanFinished ? <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-sm text-cyan-200">检测完成后将显示风险分析结果。</div> : summary.length === 0 ? <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-300">本次检测未发现风险。</div> : summary.map((item) => (
                  <div key={item.name} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{item.name}</span>
                      <span className={item.severity === 'High' ? 'shrink-0 text-orange-300' : 'shrink-0 text-yellow-300'}>{item.severity}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{item.description}</p>
                    <p className="mt-2 border-l-2 border-cyan-400/60 pl-3 text-xs leading-5 text-cyan-100"><span className="font-semibold text-cyan-300">修复建议：</span>{item.recommendation}</p>
                    {scanResult && (
                      <button
                        type="button"
                        onClick={() => markRiskFixed(item.name)}
                        className={fixedRiskNames.has(item.name) ? 'mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300' : 'mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300'}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {fixedRiskNames.has(item.name) ? '已标记修复' : '标记为已修复'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-emerald-300" />
                安全趋势
              </div>
              <div className="h-32 rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-3">
                <div className="flex h-full items-end gap-3">
                  {[45, 52, 58, 62, 68, 74, 67].map((value) => (
                    <div key={value} className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400" style={{ height: `${value}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-green-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5" />
            {scanResult ? `当前安全评分：${scanResult.score} / 100` : '演示数据仅用于竞赛展示，不代表真实站点状态。'}
          </div>
          <button onClick={() => setShowReportIndex(true)} disabled={scanHistory.length === 0} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40">
            查看报告 <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <section className="relative mt-8 overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(34,211,238,0.08)]">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><History className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">SCAN ARCHIVE</div>
                <h2 className="text-xl font-semibold">检测项目档案</h2>
              </div>
            </div>
            <span className="text-xs text-slate-500">已保存 {scanHistory.length} 个项目</span>
          </div>
          {scanHistory.length === 0 ? (
            <div className="relative py-10 text-center text-sm text-slate-500">完成第一次检测后，项目报告会自动出现在这里。</div>
          ) : (
            <div className="relative mt-4 grid gap-3 md:grid-cols-2">
              {scanHistory.map((record) => {
                const highCount = record.risks.filter((risk) => risk.severity === 'High').length;
                const mediumCount = record.risks.filter((risk) => risk.severity === 'Medium').length;
                return (
                  <div key={record.id} className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.05]">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-100">{record.url}</div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{new Date(record.scannedAt).toLocaleString('zh-CN')}</span>
                        <span className="text-orange-300">高危 {highCount}</span>
                        <span className="text-yellow-300">中危 {mediumCount}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right"><div className="text-2xl font-bold text-cyan-300">{record.score}</div><div className="text-[10px] uppercase text-slate-600">score</div></div>
                      <button onClick={() => setReport(record)} title="查看检测报告" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/20"><FileText className="h-4 w-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showReportIndex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-cyan-400/30 bg-slate-950 p-6 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
            <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-5">
              <div><div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">SECURITY ARCHIVE</div><h2 className="mt-2 text-2xl font-bold">安全报告总览</h2><p className="mt-1 text-sm text-slate-500">共归档 {scanHistory.length} 个检测项目，按当前评分和风险状态分类。</p></div>
              <button onClick={() => setShowReportIndex(false)} title="关闭报告总览" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
                <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold text-emerald-300"><ShieldCheck className="h-5 w-5" />安全项目</h3><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">{safeProjects.length}</span></div>
                <div className="space-y-3">
                  {safeProjects.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">暂时没有达到安全标准的项目</p> : safeProjects.map((record) => (
                    <button key={record.id} onClick={() => openProjectReport(record)} className="flex w-full items-center justify-between rounded-lg border border-emerald-400/10 bg-slate-950/50 p-3 text-left transition hover:border-emerald-400/40">
                      <span className="min-w-0"><span className="block truncate text-sm text-slate-100">{record.url}</span><span className="mt-1 block text-xs text-slate-500">{new Date(record.scannedAt).toLocaleString('zh-CN')}</span></span><span className="ml-3 text-xl font-bold text-emerald-300">{record.score}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-orange-400/20 bg-orange-400/[0.04] p-4">
                <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold text-orange-300"><ShieldAlert className="h-5 w-5" />风险项目</h3><span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-xs text-orange-300">{unsafeProjects.length}</span></div>
                <div className="space-y-3">
                  {unsafeProjects.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">暂时没有风险项目</p> : unsafeProjects.map((record) => (
                    <button key={record.id} onClick={() => openProjectReport(record)} className="flex w-full items-center justify-between rounded-lg border border-orange-400/10 bg-slate-950/50 p-3 text-left transition hover:border-orange-400/40">
                      <span className="min-w-0"><span className="block truncate text-sm text-slate-100">{record.url}</span><span className="mt-1 block text-xs text-slate-500">{new Date(record.scannedAt).toLocaleString('zh-CN')} · {record.risks.length} 项风险</span></span><span className="ml-3 text-xl font-bold text-orange-300">{record.score}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-cyan-400/30 bg-slate-950 p-6 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
            <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-5">
              <div><div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">SECURITY REPORT</div><h2 className="mt-2 text-2xl font-bold">{reportHost}</h2><p className="mt-1 text-xs text-slate-500">检测时间：{new Date(report.scannedAt).toLocaleString('zh-CN')}</p></div>
              <div className="flex items-center gap-2"><button onClick={generateAiReport} disabled={isGeneratingAi} className="btn-primary px-3 py-2 text-xs disabled:opacity-60"><Sparkles className="mr-1.5 h-3.5 w-3.5" />{isGeneratingAi ? 'AI 分析中...' : 'AI 检测报告'}</button><button onClick={() => setReport(null)} title="关闭报告" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4"><div className="text-xs text-slate-400">安全评分</div><div className="mt-1 text-3xl font-bold text-cyan-300">{report.score}</div></div>
              <div className="rounded-xl border border-orange-400/20 bg-orange-400/10 p-4"><div className="text-xs text-slate-400">高危风险</div><div className="mt-1 text-3xl font-bold text-orange-300">{reportRisks.filter((risk) => risk.severity === 'High').length}</div></div>
              <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4"><div className="text-xs text-slate-400">中危风险</div><div className="mt-1 text-3xl font-bold text-yellow-300">{reportRisks.filter((risk) => risk.severity === 'Medium').length}</div></div>
            </div>
            <div className="space-y-3">
              {reportRisks.length === 0 ? <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-300">未发现已配置检测项之外的风险，建议继续保持安全策略。</div> : reportRisks.map((risk) => (
                <div key={risk.name} className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between gap-3"><span className="font-medium">{risk.name}</span><span className={risk.severity === 'High' ? 'text-orange-300' : risk.severity === 'Medium' ? 'text-yellow-300' : 'text-slate-400'}>{risk.severity}</span></div><p className="mt-2 text-sm leading-6 text-slate-400">{risk.description}</p><p className="mt-3 border-l-2 border-cyan-400/60 pl-3 text-sm leading-6 text-cyan-100"><span className="font-semibold text-cyan-300">修复建议：</span>{risk.recommendation}</p></div>
              ))}
            </div>
            {aiReport ? <div className="mt-5 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-4"><div className="mb-2 flex items-center gap-2 font-semibold text-violet-200"><Sparkles className="h-4 w-4" />AI 检测报告</div><div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{aiReport}</div></div> : null}
          </div>
        </div>
      )}
    </main>
  );
}
