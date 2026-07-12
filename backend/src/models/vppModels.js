import mongoose from 'mongoose';

const { Schema } = mongoose;

export const deviceSchema = new Schema(
  {
    _id: { type: String },
    siteId: { type: String, required: true, unique: true },
    region: { type: String, required: true, index: true },
    vendor: { type: String, required: true, index: true },
    onlineState: { type: String, enum: ['online', 'offline'], required: true },
    capabilities: [{ type: String }],
    lastSeenAt: Date,
  },
  { timestamps: true },
);

export const controlEventSchema = new Schema(
  {
    _id: { type: String },
    type: { type: String, required: true },
    powerKw: { type: Number, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    createdBy: { type: String, required: true },
    targetSelector: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['draft', 'validating', 'ready', 'dispatching', 'completed', 'failed', 'expired', 'cancelled'],
      default: 'ready',
      index: true,
    },
  },
  { timestamps: true },
);

controlEventSchema.index({ startAt: 1, endAt: 1, status: 1 });

export const batchDispatchSchema = new Schema(
  {
    _id: { type: String },
    eventId: { type: String, ref: 'ControlEvent', required: true, index: true },
    requestedBy: { type: String, required: true },
    status: {
      type: String,
      enum: ['ready', 'dispatching', 'partially_dispatched', 'completed', 'failed', 'expired', 'cancelled'],
      required: true,
      index: true,
    },
    targetCount: { type: Number, required: true },
    summary: { type: Schema.Types.Mixed, default: {} },
    safetyHash: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const deviceCommandSchema = new Schema(
  {
    _id: { type: String },
    batchId: { type: String, ref: 'BatchDispatch', required: true, index: true },
    eventId: { type: String, ref: 'ControlEvent', required: true, index: true },
    deviceId: { type: String, ref: 'Device', required: true, index: true },
    siteId: { type: String },
    region: { type: String },
    vendor: { type: String },
    attempt: { type: Number, required: true, default: 1 },
    commandPayload: { type: Schema.Types.Mixed, required: true },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        'pending',
        'queued',
        'publishing',
        'sent',
        'acked',
        'executed',
        'publish_failed',
        'ack_timeout',
        'execution_timeout',
        'execution_failed',
        'offline_expired',
        'skipped_conflict',
        'cancelled',
      ],
      required: true,
      index: true,
    },
    publishMessageId: String,
    terminalReason: String,
    sentAt: Date,
    ackedAt: Date,
    executedAt: Date,
    failedAt: Date,
    history: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true },
);

deviceCommandSchema.index({ batchId: 1, status: 1 });
deviceCommandSchema.index({ deviceId: 1, eventId: 1, attempt: 1 }, { unique: true });
deviceCommandSchema.index({ deviceId: 1, status: 1, createdAt: 1 });

export const auditLogSchema = new Schema(
  {
    _id: { type: String },
    actor: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const savedGroupSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    selector: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const DeviceModel = mongoose.models.Device || mongoose.model('Device', deviceSchema);
export const ControlEventModel = mongoose.models.ControlEvent || mongoose.model('ControlEvent', controlEventSchema);
export const BatchDispatchModel = mongoose.models.BatchDispatch || mongoose.model('BatchDispatch', batchDispatchSchema);
export const DeviceCommandModel = mongoose.models.DeviceCommand || mongoose.model('DeviceCommand', deviceCommandSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export const SavedGroupModel = mongoose.models.SavedGroup || mongoose.model('SavedGroup', savedGroupSchema);

