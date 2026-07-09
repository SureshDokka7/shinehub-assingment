import { RefreshCcw } from 'lucide-react';
import { StatusPill } from '../../components/StatusPill.jsx';
import { retryableStatuses } from '../../constants/formOptions.js';

export function CommandTable({ commands, onRetry }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold leading-tight">Device Commands</h2>
          <p className="mt-2 text-sm text-slate-500">Each row is an immutable command lineage with current attempt and retry eligibility.</p>
        </div>
      </div>
      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Site</th>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Region</th>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Vendor</th>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Attempt</th>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Last update</th>
              <th className="border-b border-slate-200 px-2.5 py-3 text-left text-xs font-bold uppercase text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {commands.slice(0, 80).map((command) => (
              <tr key={command.id}>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">{command.siteId}</td>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">{command.region}</td>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">{command.vendor}</td>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">{command.attempt}</td>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">
                  <StatusPill status={command.status} />
                </td>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">{new Date(command.updatedAt || command.createdAt).toLocaleTimeString()}</td>
                <td className="border-b border-slate-100 px-2.5 py-3 text-sm">
                  <button className="inline-flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40" disabled={!retryableStatuses.includes(command.status)} onClick={() => onRetry(command.id)} title="Retry command">
                    <RefreshCcw size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!commands.length && (
              <tr>
                <td colSpan="7" className="px-3 py-8 text-center text-slate-500">
                  Dispatch a valid event to populate device command status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
