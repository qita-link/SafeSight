'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';

import { apiRiskList, apiRiskSummary } from '@/lib/api';
import { demoRiskSummary } from '@/lib/demo-data';

type RiskItem = Awaited<ReturnType<typeof apiRiskList>>[number];

type RiskSummary = Awaited<ReturnType<typeof apiRiskSummary>>;

export default function RisksPage() {
  const [query, setQuery] = useState('');
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [summary, setSummary] = useState<RiskSummary>(demoRiskSummary);

  useEffect(() => {
    apiRiskList()
      .then((data) => setRisks(data))
      .catch(() => setRisks([]));

    apiRiskSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(demoRiskSummary));
  }, []);

  const filteredRisks = risks.filter((risk) => {
    const text = `${risk.name} ${risk.site}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-400">风险中心</div>
            <h1 className="text-3xl font-bold">安全风险总览</h1>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索风险名称或网站"
              className="bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          {[
            ['总风险', String(summary.total)],
            ['Critical', String(summary.critical)],
            ['High', String(summary.high)],
            ['Medium', String(summary.medium)],
            ['Low', String(summary.low)],
          ].map(([label, value]) => (
            <div key={label} className="glass-card p-4">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.8fr] border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            <div>风险名称</div>
            <div>网站</div>
            <div>风险等级</div>
            <div>发现时间</div>
            <div>状态</div>
          </div>
          {filteredRisks.length > 0 ? filteredRisks.map((risk) => (
            <div key={risk.name} className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.8fr] items-center border-b border-white/10 px-4 py-4 text-sm text-slate-200 last:border-b-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-300" />
                {risk.name}
              </div>
              <div>{risk.site}</div>
              <div className={
                risk.level === 'High' ? 'text-orange-300' : risk.level === 'Medium' ? 'text-yellow-300' : 'text-sky-300'
              }>{risk.level}</div>
              <div className="text-slate-400">{risk.discoveredAt}</div>
              <div className="inline-flex w-fit rounded-full border border-white/10 bg-slate-800/80 px-2 py-1 text-xs text-slate-200">{risk.status}</div>
            </div>
          )) : (
            <div className="px-4 py-8 text-center text-sm text-slate-400">暂无匹配风险</div>
          )}
        </div>
      </div>
    </main>
  );
}
