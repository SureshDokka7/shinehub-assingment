import { Router } from 'express';

export function createEventRoutes(controller) {
  const router = Router();
  router.post('/events/validate', controller.validate);
  router.post('/events', controller.create);
  return router;
}

