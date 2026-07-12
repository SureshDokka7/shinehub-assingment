import { terminalCommandStatuses } from '../constants/statuses.js';

export function createBatchService(repository) {
  async function updateBatchSummary(batchId) {
    const batch = await repository.getBatchById(batchId);
    if (!batch) return null;

    const related = await repository.getCommandsByBatchId(batchId);
    batch.summary = related.reduce((acc, command) => {
      acc[command.status] = (acc[command.status] || 0) + 1;
      return acc;
    }, {});

    const terminalCount = related.filter((command) => terminalCommandStatuses.has(command.status)).length;
    if (related.length > 0 && terminalCount === related.length) {
      batch.status = 'completed';
      const event = await repository.getEventById(batch.eventId);
      if (event) {
        event.status = 'completed';
        await repository.saveEvent(event);
      }
    } else if (related.some((command) => ['queued', 'publishing', 'sent', 'acked', 'executed'].includes(command.status))) {
      batch.status = 'dispatching';
    }

    batch.updatedAt = new Date().toISOString();
    await repository.saveBatch(batch);
    return batch;
  }

  async function serializeBatch(batch) {
    if (!batch) return null;
    const event = await repository.getEventById(batch.eventId);
    return { ...batch, event };
  }

  async function getBatch(batchId) {
    const batch = await repository.getBatchById(batchId);
    if (!batch) return null;
    await updateBatchSummary(batchId);
    return await serializeBatch(batch);
  }

  async function getBatchAudit(batchId) {
    const batch = await repository.getBatchById(batchId);
    if (!batch) return null;
    const commands = await repository.getCommandsByBatchId(batch.id);
    const commandIds = commands.map((command) => command.id);
    const entityIds = new Set([batch.id, batch.eventId, ...commandIds]);
    return await repository.getAuditForEntityIds(entityIds);
  }

  return { updateBatchSummary, serializeBatch, getBatch, getBatchAudit };
}

