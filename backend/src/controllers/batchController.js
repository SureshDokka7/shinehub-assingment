export function createBatchController(repository, batchService, dispatchService) {
  return {
    async dispatch(req, res) {
      const batch = await dispatchService.dispatchBatch(req.params.batchId);
      if (!batch) return res.status(404).json({ message: 'Batch not found.' });
      return res.json({ batch });
    },

    async show(req, res) {
      const batch = await batchService.getBatch(req.params.batchId);
      if (!batch) return res.status(404).json({ message: 'Batch not found.' });
      return res.json({ batch });
    },

    async listCommands(req, res) {
      const commands = await repository.getCommandsByBatchId(req.params.batchId);
      res.json({ commands });
    },

    async audit(req, res) {
      const audit = await batchService.getBatchAudit(req.params.batchId);
      if (!audit) return res.status(404).json({ message: 'Batch not found.' });
      return res.json({ audit });
    },
  };
}

