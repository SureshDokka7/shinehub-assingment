import { staleRecoveryStatuses, terminalCommandStatuses } from '../constants/statuses.js';

export function createDispatchService(repository, batchService, commandService) {
  const activeTimers = new Map();

  function scheduleCommand(command) {
    if (activeTimers.has(command.id)) return;

    const device = repository.getDeviceById(command.deviceId);
    const timers = [];
    activeTimers.set(command.id, timers);

    const transitionLater = (delay, status, metadata = {}) => {
      const timer = setTimeout(() => {
        commandService.transitionCommand(command.id, status, metadata);
        if (terminalCommandStatuses.has(status)) activeTimers.delete(command.id);
      }, delay);
      timers.push(timer);
    };

    transitionLater(150, 'queued', { reason: 'Command leased by dispatch worker.' });
    transitionLater(450, 'publishing', { reason: 'Publishing to MQTT command topic.' });

    const publishFails = command.deviceId.endsWith('7') && command.attempt === 1;
    if (publishFails) {
      transitionLater(850, 'publish_failed', { reason: 'Simulated broker publish failure.' });
      return;
    }

    transitionLater(850, 'sent', { messageId: `mqtt-${command.id.slice(0, 8)}` });

    if (device?.onlineState === 'offline') {
      transitionLater(2_400, 'ack_timeout', { reason: 'Device offline past acknowledgement cutoff.' });
      return;
    }

    const numericId = Number(command.deviceId.split('-')[1]);
    transitionLater(1_400 + (numericId % 5) * 120, 'acked', { reason: 'Device acknowledgement telemetry received.' });

    if (numericId % 29 === 0 && command.attempt === 1) {
      transitionLater(3_100, 'execution_timeout', { reason: 'Ack received but no execution telemetry arrived.' });
      return;
    }
    if (numericId % 19 === 0 && command.attempt === 1) {
      transitionLater(2_900, 'execution_failed', { reason: 'Device reported execution_failed telemetry.' });
      return;
    }

    transitionLater(2_500 + (numericId % 7) * 150, 'executed', { reason: 'Device reported executed telemetry.' });
  }

  function dispatchBatch(batchId) {
    const batch = repository.getBatchById(batchId);
    if (!batch) return null;

    batch.status = 'dispatching';
    batch.updatedAt = new Date().toISOString();
    repository.getPendingCommandsByBatchId(batchId).forEach(scheduleCommand);
    batchService.updateBatchSummary(batchId);
    return batchService.serializeBatch(batch);
  }

  function retryAndSchedule(commandId) {
    const command = commandService.retryCommand(commandId);
    if (command) scheduleCommand(command);
    return command;
  }

  function runRecovery() {
    const stale = repository.getCommandsByStatuses(staleRecoveryStatuses);
    stale.forEach((command) => {
      activeTimers.delete(command.id);
      commandService.transitionCommand(command.id, 'pending', { reason: 'Crash recovery requeued stale command.' });
      scheduleCommand(command);
    });
    return stale.length;
  }

  return { dispatchBatch, retryAndSchedule, runRecovery };
}

