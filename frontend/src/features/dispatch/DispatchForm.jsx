import { AlertTriangle, Play, ShieldCheck, Zap } from 'lucide-react';
import { eventTypes, regions, vendors } from '../../constants/formOptions.js';

export function DispatchForm({ form, groups, validation, busy, onChange, onDispatch }) {
  const fieldClass =
    'grid gap-1.5 text-sm font-bold text-slate-700 lg:gap-1';
  const inputClass =
    'min-h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15 lg:min-h-9';

  return (
    <aside className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 lg:h-full lg:overflow-hidden lg:p-4 lg:gap-3">
      <div className="flex items-center gap-2.5">
        <Zap size={20} />
        <h2 className="text-lg font-bold leading-tight">Configure Event</h2>
      </div>

      <label className={fieldClass}>
        Target mode
        <select className={inputClass} value={form.targetMode} onChange={(event) => onChange('targetMode', event.target.value)}>
          <option value="region">Region</option>
          <option value="vendor">Vendor</option>
          <option value="group">Saved group</option>
        </select>
      </label>

      {form.targetMode === 'region' && (
        <label className={fieldClass}>
          Region
          <select className={inputClass} value={form.region} onChange={(event) => onChange('region', event.target.value)}>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      )}

      {form.targetMode === 'vendor' && (
        <label className={fieldClass}>
          Vendor
          <select className={inputClass} value={form.vendor || vendors[0]} onChange={(event) => onChange('vendor', event.target.value)}>
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </label>
      )}

      {form.targetMode === 'group' && (
        <label className={fieldClass}>
          Saved group
          <select className={inputClass} value={form.groupId || groups[0]?.id || ''} onChange={(event) => onChange('groupId', event.target.value)}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={fieldClass}>
        Event type
        <select className={inputClass} value={form.type} onChange={(event) => onChange('type', event.target.value)}>
          {eventTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={fieldClass}>
          Power kW
          <input className={inputClass} type="number" min="0" step="0.5" value={form.powerKw} onChange={(event) => onChange('powerKw', event.target.value)} />
        </label>
        <label className={fieldClass}>
          Duration min
          <input className={inputClass} type="number" min="1" step="5" value={form.durationMinutes} onChange={(event) => onChange('durationMinutes', event.target.value)} />
        </label>
      </div>

      <label className={fieldClass}>
        Start time
        <input className={inputClass} type="datetime-local" value={form.startAt} onChange={(event) => onChange('startAt', event.target.value)} />
      </label>

      <div className={`grid gap-2 rounded-lg border p-3.5 lg:p-3 ${validation?.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        <div className="flex items-center gap-2">
          {validation?.ok ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
          <strong>{validation?.ok ? 'Safety validation passed' : 'Safety validation needs attention'}</strong>
        </div>
        <p className="m-0 text-sm opacity-85">{validation ? `${validation.targetCount || 0} targets, ${validation.offlineCount || 0} currently offline.` : 'Checking target safety...'}</p>
        {!!validation?.warnings?.length && validation.warnings.map((item) => <small className="block leading-relaxed" key={item}>{item}</small>)}
        {!!validation?.errors?.length && validation.errors.map((item) => <small className="block leading-relaxed" key={item}>{item}</small>)}
      </div>

      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-45 lg:min-h-10" type="button" disabled={!validation?.ok || busy} onClick={onDispatch}>
        <Play size={18} />
        {busy ? 'Dispatching...' : 'Create and Dispatch'}
      </button>
    </aside>
  );
}
