import { v4 as uuid } from 'uuid';
import { terminalCommandStatuses } from '../constants/statuses.js';
import { createSeedDevices, createSeedGroups } from '../data/seedData.js';

export function createInMemoryVppRepository() {
  const store = {
    devices: createSeedDevices(),
    groups: createSeedGroups(),
    events: [],
    batches: [],
    commands: [],
    audits: [],
  };

  function createAudit(action, entityType, entityId, after, metadata = {}, actor = 'ops.lead@shinehub.local', before = null) {
    const entry = {
      id: uuid(),
      actor,
      action,
      entityType,
      entityId,
      before,
      after,
      metadata,
      createdAt: new Date().toISOString(),
    };
    store.audits.unshift(entry);
    return entry;
  }

  function selectDevices(selector = {}) {
    let selected = [...store.devices];
    if (selector.groupId) {
      const group = store.groups.find((item) => item.id === selector.groupId);
      selected = group ? selectDevices(group.selector) : [];
    }
    if (selector.region) selected = selected.filter((device) => device.region === selector.region);
    if (selector.vendor) selected = selected.filter((device) => device.vendor === selector.vendor);
    return selected;
  }

  function findConflicts(deviceIds, startAt, endAt, excludeBatchId = null) {
    const requestedStart = new Date(startAt).getTime();
    const requestedEnd = new Date(endAt).getTime();

    return store.commands
      .filter((command) => {
        if (excludeBatchId && command.batchId === excludeBatchId) return false;
        if (terminalCommandStatuses.has(command.status)) return false;
        if (!deviceIds.includes(command.deviceId)) return false;
        const event = store.events.find((item) => item.id === command.eventId);
        if (!event) return false;
        return new Date(event.startAt).getTime() < requestedEnd && new Date(event.endAt).getTime() > requestedStart;
      })
      .map((command) => ({
        deviceId: command.deviceId,
        commandId: command.id,
        batchId: command.batchId,
        status: command.status,
      }));
  }

  function createEventGraph({ event, batch, commands }) {
    store.events.push(event);
    store.batches.push(batch);
    store.commands.push(...commands);
    return { event, batch, commands };
  }

  return {
    store,
    createAudit,
    selectDevices,
    findConflicts,
    createEventGraph,
    saveBatch: async (batch) => batch,
    saveEvent: async (event) => event,
    saveCommand: async (command) => command,
    getGroups: () => store.groups,
    getBatchById: (batchId) => store.batches.find((batch) => batch.id === batchId) || null,
    getEventById: (eventId) => store.events.find((event) => event.id === eventId) || null,
    getDeviceById: (deviceId) => store.devices.find((device) => device.id === deviceId) || null,
    getCommandById: (commandId) => store.commands.find((command) => command.id === commandId) || null,
    getCommandsByBatchId: (batchId) => store.commands.filter((command) => command.batchId === batchId),
    getPendingCommandsByBatchId: (batchId) => store.commands.filter((command) => command.batchId === batchId && command.status === 'pending'),
    getCommandsByStatuses: (statuses) => store.commands.filter((command) => statuses.has(command.status)),
    getAuditForEntityIds: (entityIds, limit = 120) => store.audits.filter((entry) => entityIds.has(entry.entityId)).slice(0, limit),
  };
}

