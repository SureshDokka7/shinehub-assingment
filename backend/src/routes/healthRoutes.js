import { Router } from 'express';

export function createHealthRoutes(controller) {
  const router = Router();
  router.get('/health', controller.show);
  return router;
}

