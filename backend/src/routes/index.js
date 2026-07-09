import { Router } from 'express';
import { createBatchRoutes } from './batchRoutes.js';
import { createCommandRoutes } from './commandRoutes.js';
import { createEventRoutes } from './eventRoutes.js';
import { createFleetRoutes } from './fleetRoutes.js';
import { createHealthRoutes } from './healthRoutes.js';
import { createRecoveryRoutes } from './recoveryRoutes.js';
import { createTelemetryRoutes } from './telemetryRoutes.js';

export function createApiRoutes(controllers) {
  const router = Router();

  router.use(createHealthRoutes(controllers.healthController));
  router.use(createFleetRoutes(controllers.fleetController));
  router.use(createEventRoutes(controllers.eventController));
  router.use(createBatchRoutes(controllers.batchController));
  router.use(createCommandRoutes(controllers.commandController));
  router.use(createTelemetryRoutes(controllers.telemetryController));
  router.use(createRecoveryRoutes(controllers.recoveryController));

  return router;
}

