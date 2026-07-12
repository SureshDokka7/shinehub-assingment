import { useEffect, useMemo, useState } from 'react';
import {
  fetchGroups,
  validateEvent,
  fetchBatchById,
  fetchBatchCommands,
  fetchBatchAudit,
  createEvent,
  dispatchBatch,
  retryCommand,
} from '../api/vppApi.js';
import { defaultStartTime } from '../utils/date.js';

const terminalStatuses = ['executed', 'publish_failed', 'ack_timeout', 'execution_timeout', 'execution_failed', 'offline_expired', 'skipped_conflict'];

function initialFormState() {
  return {
    targetMode: 'region',
    region: 'NSW',
    vendor: '',
    groupId: '',
    type: 'discharge',
    powerKw: 5,
    startAt: defaultStartTime(),
    durationMinutes: 30,
  };
}

function toEventPayload(form, targetSelector) {
  return {
    targetSelector,
    type: form.type,
    powerKw: Number(form.powerKw),
    startAt: new Date(form.startAt).toISOString(),
    durationMinutes: Number(form.durationMinutes),
  };
}

export function useBatchDispatch() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [validation, setValidation] = useState(null);
  const [batch, setBatch] = useState(null);
  const [commands, setCommands] = useState([]);
  const [audit, setAudit] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const targetSelector = useMemo(() => {
    if (form.targetMode === 'region') return { region: form.region };
    if (form.targetMode === 'vendor') return { vendor: form.vendor || 'Tesla' };
    return { groupId: form.groupId || groups[0]?.id };
  }, [form, groups]);

  const summary = useMemo(() => {
    return commands.reduce((acc, command) => {
      acc[command.status] = (acc[command.status] || 0) + 1;
      return acc;
    }, {});
  }, [commands]);

  const progress = useMemo(() => {
    if (!commands.length) return 0;
    const terminalCount = commands.filter((command) => terminalStatuses.includes(command.status)).length;
    return Math.round((terminalCount / commands.length) * 100);
  }, [commands]);

  useEffect(() => {
    fetchGroups()
      .then((data) => setGroups(data.groups))
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    const payload = toEventPayload(form, targetSelector);
    const timer = setTimeout(() => {
      validateEvent(payload)
        .then(setValidation)
        .catch((err) => setValidation(err.details || { ok: false, errors: [err.message] }));
    }, 250);

    return () => clearTimeout(timer);
  }, [targetSelector, form.type, form.powerKw, form.startAt, form.durationMinutes]);

  useEffect(() => {
    if (!batch?.id) return undefined;

    const loadBatch = () => {
      Promise.all([fetchBatchById(batch.id), fetchBatchCommands(batch.id), fetchBatchAudit(batch.id)])
        .then(([batchData, commandData, auditData]) => {
          setBatch(batchData.batch);
          setCommands(commandData.commands);
          setAudit(auditData.audit);
        })
        .catch((err) => setError(err.message));
    };

    loadBatch();
    const interval = setInterval(loadBatch, 1000);
    return () => clearInterval(interval);
  }, [batch?.id]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createAndDispatch() {
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...toEventPayload(form, targetSelector),
        createdBy: 'ops.lead@shinehub.local',
      };
      const created = await createEvent(payload);
      const dispatched = await dispatchBatch(created.batch.id);
      setBatch(dispatched.batch);
      setCommands([]);
    } catch (err) {
      setError(err.details?.errors?.join(' ') || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function retry(commandId) {
    setError('');
    try {
      await retryCommand(commandId);
    } catch (err) {
      setError(err.message);
    }
  }

  return {
    audit,
    batch,
    busy,
    commands,
    error,
    form,
    groups,
    progress,
    retry,
    summary,
    validation,
    createAndDispatch,
    updateForm,
  };
}

