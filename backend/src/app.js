import cors from 'cors';
import express from 'express';
import { createBatchController } from './controllers/batchController.js';
import { createCommandController } from './controllers/commandController.js';
import { createEventController } from './controllers/eventController.js';
import { createFleetController } from './controllers/fleetController.js';
import { createHealthController } from './controllers/healthController.js';
import { createRecoveryController } from './controllers/recoveryController.js';
import { createTelemetryController } from './controllers/telemetryController.js';
import { createInMemoryVppRepository } from './repositories/inMemoryVppRepository.js';
import { createApiRoutes } from './routes/index.js';
import { createBatchService } from './services/batchService.js';
import { createCommandService } from './services/commandService.js';
import { createDispatchService } from './services/dispatchService.js';
import { createEventService } from './services/eventService.js';

export function createApp() {
  const app = express();
  const repository = createInMemoryVppRepository();

  const batchService = createBatchService(repository);
  const commandService = createCommandService(repository, batchService);
  const dispatchService = createDispatchService(repository, batchService, commandService);
  const eventService = createEventService(repository);

  const controllers = {
    healthController: createHealthController(),
    fleetController: createFleetController(repository),
    eventController: createEventController(eventService),
    batchController: createBatchController(repository, batchService, dispatchService),
    commandController: createCommandController(dispatchService),
    telemetryController: createTelemetryController(commandService),
    recoveryController: createRecoveryController(dispatchService),
  };

  app.use(cors());
  app.use(express.json());
  app.use('/api', createApiRoutes(controllers));

  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({
      message: error.message || 'Unexpected server error.',
      details: error.details,
    });
  });

  return app;
}

