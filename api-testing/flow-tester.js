/**
 * ShineHub VPP Event Dispatch - Automated CLI Flow Tester
 * 
 * This script runs a complete end-to-end simulation of the Virtual Power Plant (VPP)
 * event dispatch life-cycle using native Node.js fetch (Node 18+).
 * 
 * Usage:
 *   node api-testing/flow-tester.js
 */

const API_BASE = 'http://localhost:4000/api';

// Utility for delaying execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Color/style helper functions for pretty terminal prints
const style = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgBlue: '\x1b[44m',
  header: (text) => `\n\x1b[1m\x1b[36m=== ${text} ===\x1b[0m\n`,
  success: (text) => `\x1b[1m\x1b[32m✔ ${text}\x1b[0m`,
  info: (text) => `\x1b[34mℹ ${text}\x1b[0m`,
  warning: (text) => `\x1b[1m\x1b[33m⚠ ${text}\x1b[0m`,
  error: (text) => `\x1b[1m\x1b[31m✖ ${text}\x1b[0m`,
};

async function fetchJson(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status} error`);
    }
    return data;
  } catch (err) {
    console.error(style.error(`Request to ${url} failed: ${err.message}`));
    throw err;
  }
}

async function run() {
  console.log('\n' + style.bright + style.green + '===================================================' + style.reset);
  console.log(style.bright + style.green + '     ShineHub VPP Batch Event Flow Simulator       ' + style.reset);
  console.log(style.bright + style.green + '===================================================' + style.reset);

  // 1. Verify health
  console.log(style.header('1. Checking Server Health'));
  try {
    const health = await fetchJson('/health');
    console.log(style.success(`Server is online and healthy: service = "${health.service}", ok = ${health.ok}`));
  } catch (err) {
    console.log('\n' + style.warning('Could not connect to the API server.'));
    console.log(style.info('Please make sure your server is running. You can start it with:'));
    console.log(style.bright + '  npm run server' + style.reset + ' or ' + style.bright + 'npm run dev\n' + style.reset);
    process.exit(1);
  }

  // 2. Fetch Fleet info
  console.log(style.header('2. Fetching Groups & Devices'));
  const groupRes = await fetchJson('/groups');
  console.log(style.info(`Found ${groupRes.groups.length} saved fleet groups:`));
  groupRes.groups.forEach((g) => {
    console.log(`  - ID: ${style.bright}${g.id}${style.reset} (${g.name}) -> Selector: ${JSON.stringify(g.selector)}`);
  });

  const deviceRes = await fetchJson('/devices');
  console.log(style.info(`Found ${deviceRes.devices.length} total active devices in the seed fleet.`));

  // 3. Validate a proposed VPP Event
  console.log(style.header('3. Validating Proposed VPP Event'));
  // Let's target VIC Battery Fleet group (groupId: group-battery-vic) which targets region: 'VIC'
  const eventPayload = {
    targetSelector: { groupId: 'group-battery-vic' },
    type: 'discharge',
    powerKw: 6,
    startAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
    durationMinutes: 45
  };

  console.log(style.info(`Payload: target=${eventPayload.targetSelector.groupId}, type=${eventPayload.type}, power=${eventPayload.powerKw}kW`));
  const valRes = await fetchJson('/events/validate', {
    method: 'POST',
    body: JSON.stringify(eventPayload),
  });

  console.log(style.success(`Validation finished:`));
  console.log(`  - Success Status: ${valRes.ok ? style.green + 'PASSED' : style.red + 'FAILED'}${style.reset}`);
  console.log(`  - Matched Devices: ${style.bright}${valRes.targetCount}${style.reset}`);
  console.log(`  - Total Discharged Power capacity: ${style.bright}${valRes.targetCount * eventPayload.powerKw} kW${style.reset}`);
  console.log(`  - Conflicts Detected: ${style.bright}${valRes.conflicts.length}${style.reset}`);

  // 4. Create the Event and Batch
  console.log(style.header('4. Creating VPP Event & Batch'));
  const createPayload = {
    ...eventPayload,
    createdBy: 'cli.simulation.bot@shinehub.local',
  };
  const createRes = await fetchJson('/events', {
    method: 'POST',
    body: JSON.stringify(createPayload),
  });

  const event = createRes.event;
  const batch = createRes.batch;
  console.log(style.success(`VPP Event created: ID = ${style.bright}${event.id}${style.reset}`));
  console.log(style.success(`Dispatch Batch created: ID = ${style.bright}${batch.id}${style.reset}`));
  console.log(`  - Initial Batch Status: "${style.magenta}${batch.status}${style.reset}"`);
  console.log(`  - Summary Stats: ${JSON.stringify(batch.summary)}`);

  // 5. Dispatch the Batch
  console.log(style.header('5. Triggering Batch Dispatch'));
  console.log(style.info(`Starting dispatch workflow (initiating simulated MQTT broker queue)...`));
  const dispatchRes = await fetchJson(`/batches/${batch.id}/dispatch`, { method: 'POST' });
  console.log(style.success(`Dispatch started: batch state = "${style.magenta}${dispatchRes.batch.status}${style.reset}"`));

  // 6. Poll batch and commands to monitor transitions
  console.log(style.header('6. Monitoring Command Transitions (Simulated MQTT Broker)'));
  console.log(style.info('Polling device states over the simulated MQTT network for the next few seconds:'));
  
  for (let i = 1; i <= 6; i++) {
    await sleep(800);
    const progressRes = await fetchJson(`/batches/${batch.id}`);
    const commandList = await fetchJson(`/batches/${batch.id}/commands`);
    
    const summary = progressRes.batch.summary;
    const states = Object.entries(summary)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');

    console.log(`  [Poll #${i}] Batch Status: "${style.magenta}${progressRes.batch.status}${style.reset}"`);
    console.log(`           Device States: [ ${style.cyan}${states}${style.reset} ]`);
  }

  // 7. Inspect command states & perform a retry if any command failed/timed out
  console.log(style.header('7. Checking Failures & Retrying'));
  const commandsObj = await fetchJson(`/batches/${batch.id}/commands`);
  const commands = commandsObj.commands;

  const retryableStatuses = ['publish_failed', 'ack_timeout', 'execution_timeout', 'execution_failed'];
  const failedCommand = commands.find((c) => retryableStatuses.includes(c.status));

  if (failedCommand) {
    console.log(style.info(`Found retryable command: ID = ${style.bright}${failedCommand.id}${style.reset} (Device: ${failedCommand.deviceId}, Status: "${style.red}${failedCommand.status}${style.reset}", Attempt: ${failedCommand.attempt})`));
    console.log(style.info(`Triggering retry endpoint...`));
    
    const retryRes = await fetchJson(`/commands/${failedCommand.id}/retry`, { method: 'POST' });
    console.log(style.success(`Command successfully requeued:`));
    console.log(`  - New Status: "${style.magenta}${retryRes.command.status}${style.reset}"`);
    console.log(`  - Current Attempt Count: ${style.bright}${retryRes.command.attempt}${style.reset}`);

    // Wait a brief moment to watch it run again
    console.log(style.info('Waiting to let the retried command execute...'));
    await sleep(1500);
    const updatedCmd = await fetchJson(`/batches/${batch.id}/commands`);
    const freshCmd = updatedCmd.commands.find((c) => c.id === failedCommand.id);
    console.log(style.success(`Command after retry execution: ID = ${freshCmd.id}, Status = "${style.green}${freshCmd.status}${style.reset}"`));
  } else {
    console.log(style.success('All device commands executed successfully without errors. No retries needed.'));
  }

  // 8. View Audit Trail
  console.log(style.header('8. Reviewing Batch Audit Trail'));
  const auditRes = await fetchJson(`/batches/${batch.id}/audit`);
  console.log(style.info(`Retrieved ${auditRes.audit.length} audit entries for this batch lifecycle:`));
  
  // Display recent 5 audit logs
  auditRes.audit.slice(0, 8).reverse().forEach((log) => {
    const time = new Date(log.createdAt).toLocaleTimeString();
    console.log(`  [${time}] ${style.bright}${log.action}${style.reset} on ${log.entityType} (${log.entityId})`);
    if (log.metadata && log.metadata.reason) {
      console.log(`             └ Reason: "${style.dim}${log.metadata.reason}${style.reset}"`);
    } else if (log.metadata && log.metadata.status) {
      console.log(`             └ Transited status to: "${style.magenta}${log.metadata.status}${style.reset}"`);
    }
  });

  // 9. Run recovery simulation
  console.log(style.header('9. Triggering Crash Recovery Scan'));
  console.log(style.info('Executing VPP crash recovery worker to scan for any orphaned/stuck commands...'));
  const recoveryRes = await fetchJson('/recovery/run', { method: 'POST' });
  console.log(style.success(`Recovery run complete. Stuck commands re-queued: ${style.bright}${recoveryRes.recovered}${style.reset}`));

  console.log('\n' + style.bright + style.green + '===================================================' + style.reset);
  console.log(style.bright + style.green + '      API flow simulation completed successfully!  ' + style.reset);
  console.log(style.bright + style.green + '===================================================\n' + style.reset);
}

run().catch((err) => {
  console.error('\n' + style.error(`Simulation crashed due to an unexpected error: ${err.message}`));
});
