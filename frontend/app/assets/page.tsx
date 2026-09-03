import { Globe, ShieldCheck, Trash2 } from 'lucide-react';

const assets = [
  { domain: 'company-demo.com', score: 67, status: '监控中', risk: 7 },
  { domain: 'shop-demo.com', score: 81, status: '监控中', risk: 4 },
  { domain: 'school-demo.edu', score: 73, status: '待检测', risk: 5 },
];

export default function AssetsPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">资产中心</div>
            <h1 className="text-3xl font-bold">网站资产</h1>
          </div>
          <button className="btn-primary">新增资产</button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {assets.map((asset) => (
            <div key={asset.domain} className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{asset.status}</span>
              </div>
              <div className="text-xl font-semibold">{asset.domain}</div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <span>安全评分</span>
                <span className="text-cyan-300">{asset.score}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                <span>风险数量</span>
                <span>{asset.risk}</span>
              </div>
              <div className="mt-5 flex gap-3">
                <button className="btn-secondary flex-1">立即扫描</button>
                <button className="rounded-xl border border-white/10 bg-slate-900/60 p-2 text-slate-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
