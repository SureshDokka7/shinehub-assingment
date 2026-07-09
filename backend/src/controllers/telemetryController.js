export function createTelemetryController(commandService) {
  return {
    ingest(req, res) {
      const { commandId, status, reason } = req.body;
      const command = commandService.transitionCommand(commandId, status, { reason: reason || 'Telemetry simulation endpoint.' });
      if (!command) return res.status(404).json({ message: 'Command not found.' });
      return res.json({ command });
    },
  };
}

