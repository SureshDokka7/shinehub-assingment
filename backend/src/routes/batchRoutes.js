import { Router } from 'express';

export function createBatchRoutes(controller) {
  const router = Router();
  router.post('/batches/:batchId/dispatch', controller.dispatch);
  router.get('/batches/:batchId', controller.show);
  router.get('/batches/:batchId/commands', controller.listCommands);
  router.get('/batches/:batchId/audit', controller.audit);
  return router;
}

