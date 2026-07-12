export function createRecoveryController(dispatchService) {
  return {
    async run(_req, res) {
      try {
        const count = await dispatchService.runRecovery();
        res.json({ recovered: count });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
  };
}

