export function Stat({ icon: Icon, label, value, tone = 'neutral' }) {
  const iconTone = {
    neutral: 'text-slate-600',
    info: 'text-blue-600',
    success: 'text-emerald-700',
    risk: 'text-amber-700',
  };

  return (
    <div className="flex min-h-18 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
      <Icon className={iconTone[tone]} size={18} />
      <div>
        <strong className="block text-2xl leading-none">{value}</strong>
        <span className="mt-1 block text-xs font-extrabold uppercase text-slate-500">{label}</span>
      </div>
    </div>
  );
}
