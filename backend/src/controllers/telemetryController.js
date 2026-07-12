export function createTelemetryController(commandService) {
  return {
    async ingest(req, res) {
      const { commandId, status, reason } = req.body;
      try {
        const command = await commandService.transitionCommand(commandId, status, { reason: reason || 'Telemetry simulation endpoint.' });
        if (!command) return res.status(404).json({ message: 'Command not found.' });
        return res.json({ command });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    },
  };
}

