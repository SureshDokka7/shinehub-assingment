import { Router } from 'express';

export function createTelemetryRoutes(controller) {
  const router = Router();
  router.post('/telemetry', controller.ingest);
  return router;
}

