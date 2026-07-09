import { terminalCommandStatuses } from '../constants/statuses.js';

export function createBatchService(repository) {
  function updateBatchSummary(batchId) {
    const batch = repository.getBatchById(batchId);
    if (!batch) return null;

    const related = repository.getCommandsByBatchId(batchId);
    batch.summary = related.reduce((acc, command) => {
      acc[command.status] = (acc[command.status] || 0) + 1;
      return acc;
    }, {});

    const terminalCount = related.filter((command) => terminalCommandStatuses.has(command.status)).length;
    if (related.length > 0 && terminalCount === related.length) {
      batch.status = 'completed';
      const event = repository.getEventById(batch.eventId);
      if (event) event.status = 'completed';
    } else if (related.some((command) => ['queued', 'publishing', 'sent', 'acked', 'executed'].includes(command.status))) {
      batch.status = 'dispatching';
    }

    batch.updatedAt = new Date().toISOString();
    return batch;
  }

  function serializeBatch(batch) {
    if (!batch) return null;
    const event = repository.getEventById(batch.eventId);
    return { ...batch, event };
  }

  function getBatch(batchId) {
    const batch = repository.getBatchById(batchId);
    if (!batch) return null;
    updateBatchSummary(batchId);
    return serializeBatch(batch);
  }

  function getBatchAudit(batchId) {
    const batch = repository.getBatchById(batchId);
    if (!batch) return null;
    const commandIds = repository.getCommandsByBatchId(batch.id).map((command) => command.id);
    const entityIds = new Set([batch.id, batch.eventId, ...commandIds]);
    return repository.getAuditForEntityIds(entityIds);
  }

  return { updateBatchSummary, serializeBatch, getBatch, getBatchAudit };
}

