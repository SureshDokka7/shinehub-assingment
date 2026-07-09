import { Router } from 'express';

export function createFleetRoutes(controller) {
  const router = Router();
  router.get('/devices', controller.listDevices);
  router.get('/groups', controller.listGroups);
  return router;
}

