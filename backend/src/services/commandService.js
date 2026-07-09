import { retryableCommandStatuses, terminalCommandStatuses } from '../constants/statuses.js';
import { httpError } from '../utils/httpError.js';

export function createCommandService(repository, batchService) {
  function transitionCommand(commandId, status, metadata = {}) {
    const command = repository.getCommandById(commandId);
    if (!command) return null;
    if (terminalCommandStatuses.has(command.status) && status !== 'pending') return command;

    const before = { status: command.status, attempt: command.attempt };
    command.status = status;
    command.updatedAt = new Date().toISOString();
    command.history.push({ status, at: command.updatedAt, ...metadata });

    if (status === 'sent') command.sentAt = command.updatedAt;
    if (status === 'acked') command.ackedAt = command.updatedAt;
    if (status === 'executed') command.executedAt = command.updatedAt;
    if (status.includes('failed') || status.includes('timeout') || status.includes('expired')) {
      command.failedAt = command.updatedAt;
      command.terminalReason = metadata.reason || status;
    }

    repository.createAudit('command.status_changed', 'DeviceCommand', command.id, { status, attempt: command.attempt }, metadata, 'system.dispatcher', before);
    batchService.updateBatchSummary(command.batchId);
    return command;
  }

  function retryCommand(commandId) {
    const command = repository.getCommandById(commandId);
    if (!command) return null;

    const event = repository.getEventById(command.eventId);
    if (!event || new Date(event.endAt).getTime() < Date.now()) {
      throw httpError(409, 'Retry blocked because the event window has ended.');
    }
    if (!retryableCommandStatuses.has(command.status)) {
      throw httpError(409, `Retry is not allowed from ${command.status}.`);
    }

    const conflicts = repository.findConflicts([command.deviceId], event.startAt, event.endAt, command.batchId);
    if (conflicts.length) {
      throw httpError(409, 'Retry blocked by an overlapping active command.');
    }

    command.attempt += 1;
    command.idempotencyKey = `${event.id}:${command.deviceId}:${command.attempt}`;
    command.terminalReason = null;
    transitionCommand(command.id, 'pending', { reason: 'Operator retry requested.' });
    repository.createAudit('command.retry_requested', 'DeviceCommand', command.id, { attempt: command.attempt }, { eventId: event.id }, 'ops.lead@shinehub.local');
    return command;
  }

  return { transitionCommand, retryCommand };
}

