import { v4 as uuid } from 'uuid';
import { httpError } from '../utils/httpError.js';

export function createEventService(repository) {
  function validateEvent(payload) {
    const targetDevices = repository.selectDevices(payload.targetSelector);
    const startAt = new Date(payload.startAt);
    const durationMinutes = Number(payload.durationMinutes);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);
    const errors = [];
    const warnings = [];

    if (targetDevices.length < 10) errors.push('Select at least 10 devices for a batch dispatch.');
    if (targetDevices.length > 5000) errors.push('Target group exceeds the 5,000 device safety limit.');
    if (!payload.type) errors.push('Control event type is required.');
    if (!Number.isFinite(Number(payload.powerKw)) || Number(payload.powerKw) <= 0) {
      errors.push('Power level must be a positive kW value.');
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      errors.push('Duration must be greater than zero minutes.');
    }
    if (Number.isNaN(startAt.getTime()) || startAt.getTime() < Date.now() - 60_000) {
      errors.push('Start time must be now or in the future.');
    }

    const unsupported = targetDevices.filter((device) => !device.capabilities.includes(payload.type));
    if (unsupported.length) {
      warnings.push(`${unsupported.length} devices do not advertise ${payload.type}; they will be skipped unless vendor mapping supports fallback.`);
    }

    const conflicts = repository.findConflicts(
      targetDevices.map((device) => device.id),
      startAt,
      endAt,
    );
    if (conflicts.length) {
      errors.push(`${conflicts.length} selected devices already have an overlapping active event.`);
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      targetCount: targetDevices.length,
      offlineCount: targetDevices.filter((device) => device.onlineState === 'offline').length,
      unsupportedCount: unsupported.length,
      conflicts,
      window: Number.isNaN(startAt.getTime()) ? null : { startAt: startAt.toISOString(), endAt: endAt.toISOString() },
    };
  }

  function createEvent(payload) {
    const validation = validateEvent(payload);
    if (!validation.ok) {
      throw httpError(422, 'Event validation failed.', validation);
    }

    const selectedDevices = repository.selectDevices(payload.targetSelector);
    const event = {
      id: uuid(),
      type: payload.type,
      powerKw: Number(payload.powerKw),
      startAt: validation.window.startAt,
      endAt: validation.window.endAt,
      durationMinutes: Number(payload.durationMinutes),
      createdBy: payload.createdBy || 'ops.lead@shinehub.local',
      targetSelector: payload.targetSelector,
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    const batch = {
      id: uuid(),
      eventId: event.id,
      requestedBy: event.createdBy,
      status: 'ready',
      targetCount: selectedDevices.length,
      safetyHash: `${event.type}:${event.startAt}:${event.endAt}:${selectedDevices.map((device) => device.id).join(',')}`,
      createdAt: new Date().toISOString(),
      summary: {},
    };

    const commands = selectedDevices.map((device) => {
      const supported = device.capabilities.includes(event.type);
      return {
        id: uuid(),
        batchId: batch.id,
        eventId: event.id,
        deviceId: device.id,
        siteId: device.siteId,
        region: device.region,
        vendor: device.vendor,
        attempt: 1,
        idempotencyKey: `${event.id}:${device.id}:1`,
        status: supported ? 'pending' : 'skipped_conflict',
        terminalReason: supported ? null : 'Device capability does not support this event type.',
        commandPayload: {
          eventId: event.id,
          type: event.type,
          powerKw: event.powerKw,
          startAt: event.startAt,
          endAt: event.endAt,
        },
        history: [
          {
            status: supported ? 'pending' : 'skipped_conflict',
            at: new Date().toISOString(),
            reason: supported ? 'Command persisted before publish.' : 'Capability mismatch.',
          },
        ],
        createdAt: new Date().toISOString(),
      };
    });

    repository.createEventGraph({ event, batch, commands });
    repository.createAudit('event.created', 'ControlEvent', event.id, event, { batchId: batch.id, targetCount: selectedDevices.length }, event.createdBy);
    repository.createAudit('batch.created', 'BatchDispatch', batch.id, batch, { eventId: event.id }, event.createdBy);

    return { event, batch, validation };
  }

  return { validateEvent, createEvent };
}

