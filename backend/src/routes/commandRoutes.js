import { Router } from 'express';

export function createCommandRoutes(controller) {
  const router = Router();
  router.post('/commands/:commandId/retry', controller.retry);
  return router;
}

