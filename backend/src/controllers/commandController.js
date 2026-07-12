export function createCommandController(dispatchService) {
  return {
    async retry(req, res, next) {
      try {
        const command = await dispatchService.retryAndSchedule(req.params.commandId);
        if (!command) return res.status(404).json({ message: 'Command not found.' });
        return res.json({ command });
      } catch (error) {
        return next(error);
      }
    },
  };
}

