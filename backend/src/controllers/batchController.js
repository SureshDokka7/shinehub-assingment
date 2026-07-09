export function createBatchController(repository, batchService, dispatchService) {
  return {
    dispatch(req, res) {
      const batch = dispatchService.dispatchBatch(req.params.batchId);
      if (!batch) return res.status(404).json({ message: 'Batch not found.' });
      return res.json({ batch });
    },

    show(req, res) {
      const batch = batchService.getBatch(req.params.batchId);
      if (!batch) return res.status(404).json({ message: 'Batch not found.' });
      return res.json({ batch });
    },

    listCommands(req, res) {
      res.json({ commands: repository.getCommandsByBatchId(req.params.batchId) });
    },

    audit(req, res) {
      const audit = batchService.getBatchAudit(req.params.batchId);
      if (!audit) return res.status(404).json({ message: 'Batch not found.' });
      return res.json({ audit });
    },
  };
}

