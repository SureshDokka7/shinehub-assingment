import { Activity, AlertTriangle, BatteryCharging, CheckCircle2, Clock3 } from 'lucide-react';
import { Stat } from '../../components/Stat.jsx';
import { StatusPill } from '../../components/StatusPill.jsx';

export function ProgressPanel({ batch, commands, validation, summary, progress }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold leading-tight">{batch ? 'Live Batch Progress' : 'No Active Batch'}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {batch?.event
              ? `${batch.event.type.replaceAll('_', ' ')} ${batch.event.powerKw} kW from ${new Date(batch.event.startAt).toLocaleString()}`
              : 'Create a dispatch to start the simulation.'}
          </p>
        </div>
        {batch && <StatusPill status={batch.status} />}
      </div>

      <div className="my-4 h-3 w-full overflow-hidden rounded-full bg-slate-200" aria-label="Terminal command progress">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={BatteryCharging} label="Targets" value={commands.length || validation?.targetCount || 0} />
        <Stat icon={Clock3} label="Pending/Sent" value={(summary.pending || 0) + (summary.queued || 0) + (summary.publishing || 0) + (summary.sent || 0)} />
        <Stat icon={Activity} label="Acked" value={summary.acked || 0} tone="info" />
        <Stat icon={CheckCircle2} label="Executed" value={summary.executed || 0} tone="success" />
        <Stat
          icon={AlertTriangle}
          label="Needs Review"
          value={(summary.publish_failed || 0) + (summary.ack_timeout || 0) + (summary.execution_timeout || 0) + (summary.execution_failed || 0)}
          tone="risk"
        />
      </div>
    </div>
  );
}
