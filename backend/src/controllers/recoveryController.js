export function createRecoveryController(dispatchService) {
  return {
    run(_req, res) {
      res.json({ recovered: dispatchService.runRecovery() });
    },
  };
}

