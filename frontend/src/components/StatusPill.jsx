export function StatusPill({ status }) {
  const tones = {
    executed: 'bg-emerald-100 text-emerald-800',
    acked: 'bg-blue-100 text-blue-800',
    sent: 'bg-blue-100 text-blue-800',
    publish_failed: 'bg-amber-100 text-amber-800',
    ack_timeout: 'bg-amber-100 text-amber-800',
    execution_timeout: 'bg-amber-100 text-amber-800',
    execution_failed: 'bg-amber-100 text-amber-800',
    offline_expired: 'bg-amber-100 text-amber-800',
    skipped_conflict: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-bold ${tones[status] || 'bg-slate-200 text-slate-700'}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
