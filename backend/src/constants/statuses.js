export const terminalCommandStatuses = new Set([
  'executed',
  'publish_failed',
  'ack_timeout',
  'execution_timeout',
  'execution_failed',
  'offline_expired',
  'skipped_conflict',
  'cancelled',
]);

export const retryableCommandStatuses = new Set([
  'publish_failed',
  'ack_timeout',
  'execution_timeout',
  'execution_failed',
  'offline_expired',
]);

export const staleRecoveryStatuses = new Set(['pending', 'queued', 'publishing']);

