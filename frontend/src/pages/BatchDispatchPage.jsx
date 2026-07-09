import { AlertTriangle } from 'lucide-react';
import { AdminShell } from '../layouts/AdminShell.jsx';
import { useBatchDispatch } from '../hooks/useBatchDispatch.js';
import { AuditPanel } from '../features/audit/AuditPanel.jsx';
import { CommandTable } from '../features/batches/CommandTable.jsx';
import { ProgressPanel } from '../features/batches/ProgressPanel.jsx';
import { DispatchForm } from '../features/dispatch/DispatchForm.jsx';

export function BatchDispatchPage() {
  const dispatch = useBatchDispatch();

  return (
    <AdminShell>
      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(320px,390px)_minmax(0,1fr)]">
        <DispatchForm
          form={dispatch.form}
          groups={dispatch.groups}
          validation={dispatch.validation}
          busy={dispatch.busy}
          onChange={dispatch.updateForm}
          onDispatch={dispatch.createAndDispatch}
        />

        <section className="thin-scrollbar grid content-start gap-5 lg:max-h-full lg:overflow-y-auto lg:pr-2">
          {dispatch.error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 font-bold text-red-800">
              <AlertTriangle size={18} />
              {dispatch.error}
            </div>
          )}

          <ProgressPanel
            batch={dispatch.batch}
            commands={dispatch.commands}
            validation={dispatch.validation}
            summary={dispatch.summary}
            progress={dispatch.progress}
          />
          <CommandTable commands={dispatch.commands} onRetry={dispatch.retry} />
          <AuditPanel audit={dispatch.audit} />
        </section>
      </section>
    </AdminShell>
  );
}

