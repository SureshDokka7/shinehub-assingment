import { v4 as uuid } from 'uuid';
import {
  DeviceModel,
  ControlEventModel,
  BatchDispatchModel,
  DeviceCommandModel,
  AuditLogModel,
  SavedGroupModel
} from '../models/vppModels.js';
import { terminalCommandStatuses } from '../constants/statuses.js';
import { createSeedDevices, createSeedGroups } from '../data/seedData.js';

// Helper to map Mongoose document to plain object with string id
function mapDoc(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  return { ...obj, id: obj.id ?? obj._id?.toString?.() ?? obj._id };
}

export function createMongoVppRepository() {
  
  // Auto-seed initial fleet if database is empty
  async function seedIfNeeded() {
    try {
      const deviceCount = await DeviceModel.countDocuments();
      if (deviceCount === 0) {
        const devices = createSeedDevices();
        await DeviceModel.insertMany(devices.map(d => ({ ...d, _id: d.id })));
        console.log('Seeded devices collection in MongoDB.');
      }
      const groupCount = await SavedGroupModel.countDocuments();
      if (groupCount === 0) {
        const groups = createSeedGroups();
        await SavedGroupModel.insertMany(groups.map(g => ({ ...g, _id: g.id })));
        console.log('Seeded groups collection in MongoDB.');
      }
    } catch (err) {
      console.error('MongoDB auto-seeding error:', err);
    }
  }

  // Trigger background seeding verification
  seedIfNeeded();

  async function createAudit(action, entityType, entityId, after, metadata = {}, actor = 'ops.lead@shinehub.local', before = null) {
    const entry = new AuditLogModel({
      _id: uuid(),
      actor,
      action,
      entityType,
      entityId,
      before: before ? mapDoc(before) : null,
      after: mapDoc(after),
      metadata
    });
    const saved = await entry.save();
    return mapDoc(saved);
  }

  async function selectDevices(selector = {}) {
    if (selector.groupId) {
      const group = await SavedGroupModel.findById(selector.groupId);
      return group ? await selectDevices(group.selector) : [];
    }
    const query = {};
    if (selector.region) query.region = selector.region;
    if (selector.vendor) query.vendor = selector.vendor;
    const devices = await DeviceModel.find(query);
    return devices.map(mapDoc);
  }

  async function findConflicts(deviceIds, startAt, endAt, excludeBatchId = null) {
    const requestedStart = new Date(startAt);
    const requestedEnd = new Date(endAt);

    const query = {
      deviceId: { $in: deviceIds },
      status: { $nin: Array.from(terminalCommandStatuses) },
      'commandPayload.startAt': { $lt: requestedEnd.toISOString() },
      'commandPayload.endAt': { $gt: requestedStart.toISOString() }
    };
    if (excludeBatchId) {
      query.batchId = { $ne: excludeBatchId };
    }
    const conflicts = await DeviceCommandModel.find(query);
    return conflicts.map(c => ({
      deviceId: c.deviceId,
      commandId: c._id.toString(),
      batchId: c.batchId,
      status: c.status
    }));
  }

  async function createEventGraph({ event, batch, commands }) {
    await ControlEventModel.create({ ...event, _id: event.id });
    await BatchDispatchModel.create({ ...batch, _id: batch.id });
    await DeviceCommandModel.insertMany(commands.map(c => ({ ...c, _id: c.id })), { ordered: true });
    return { event, batch, commands };
  }

  async function saveBatch(batch) {
    await BatchDispatchModel.findByIdAndUpdate(batch.id, { ...batch, _id: batch.id }, { new: true });
    return batch;
  }

  async function saveEvent(event) {
    await ControlEventModel.findByIdAndUpdate(event.id, { ...event, _id: event.id }, { new: true });
    return event;
  }

  async function saveCommand(command) {
    await DeviceCommandModel.findByIdAndUpdate(command.id, { ...command, _id: command.id }, { new: true });
    return command;
  }

  return {
    createAudit,
    selectDevices,
    findConflicts,
    createEventGraph,
    saveBatch,
    saveEvent,
    saveCommand,
    getGroups: async () => {
      const groups = await SavedGroupModel.find();
      return groups.map(mapDoc);
    },
    getBatchById: async (batchId) => mapDoc(await BatchDispatchModel.findById(batchId)),
    getEventById: async (eventId) => mapDoc(await ControlEventModel.findById(eventId)),
    getDeviceById: async (deviceId) => mapDoc(await DeviceModel.findById(deviceId)),
    getCommandById: async (commandId) => {
      const cmd = await DeviceCommandModel.findById(commandId);
      return cmd ? mapDoc(cmd) : null;
    },
    getCommandsByBatchId: async (batchId) => {
      const commands = await DeviceCommandModel.find({ batchId });
      return commands.map(mapDoc);
    },
    getPendingCommandsByBatchId: async (batchId) => {
      const commands = await DeviceCommandModel.find({ batchId, status: 'pending' });
      return commands.map(mapDoc);
    },
    getCommandsByStatuses: async (statuses) => {
      const commands = await DeviceCommandModel.find({ status: { $in: Array.from(statuses) } });
      return commands.map(mapDoc);
    },
    getAuditForEntityIds: async (entityIds, limit = 120) => {
      const audits = await AuditLogModel.find({ entityId: { $in: Array.from(entityIds) } })
        .sort({ createdAt: -1 })
        .limit(limit);
      return audits.map(mapDoc);
    }
  };
}
