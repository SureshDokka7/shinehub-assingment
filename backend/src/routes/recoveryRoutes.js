import { Router } from 'express';

export function createRecoveryRoutes(controller) {
  const router = Router();
  router.post('/recovery/run', controller.run);
  return router;
}

