import { ShieldCheck } from 'lucide-react';

export function AuditPanel({ audit }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="flex items-center gap-2.5">
        <ShieldCheck size={20} />
        <h2 className="text-lg font-bold leading-tight">Audit Trail</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {audit.slice(0, 16).map((entry) => (
          <div className="grid gap-1 border-b border-slate-100 py-2.5 text-sm sm:grid-cols-[96px_minmax(180px,1fr)_minmax(160px,220px)] sm:items-center sm:gap-3" key={entry.id}>
            <time className="text-slate-500">{new Date(entry.createdAt).toLocaleTimeString()}</time>
            <strong>{entry.action}</strong>
            <span className="text-slate-500">{entry.actor}</span>
          </div>
        ))}
        {!audit.length && <p className="px-3 py-8 text-center text-slate-500">Audit entries will appear after event creation.</p>}
      </div>
    </div>
  );
}
