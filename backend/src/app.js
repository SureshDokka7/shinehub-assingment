import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createBatchController } from './controllers/batchController.js';
import { createCommandController } from './controllers/commandController.js';
import { createEventController } from './controllers/eventController.js';
import { createFleetController } from './controllers/fleetController.js';
import { createHealthController } from './controllers/healthController.js';
import { createRecoveryController } from './controllers/recoveryController.js';
import { createTelemetryController } from './controllers/telemetryController.js';
import { createInMemoryVppRepository } from './repositories/inMemoryVppRepository.js';
import { createMongoVppRepository } from './repositories/mongoVppRepository.js';
import { createApiRoutes } from './routes/index.js';
import { createBatchService } from './services/batchService.js';
import { createCommandService } from './services/commandService.js';
import { createDispatchService } from './services/dispatchService.js';
import { createEventService } from './services/eventService.js';

export function createApp({ useMongo = false } = {}) {
  const app = express();
  const repository = useMongo ? createMongoVppRepository() : createInMemoryVppRepository();

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

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ShineHub VPP Batch Event Dispatch API',
        version: '1.0.0',
        description: 'API documentation and interactive test client for the Virtual Power Plant (VPP) Batch Event Dispatch server. This console is dynamically compiled using swagger-jsdoc from annotations in the router code.'
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Local VPP Server'
        }
      ],
      components: {
        schemas: {
          Device: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              siteId: { type: 'string' },
              region: { type: 'string' },
              vendor: { type: 'string' },
              onlineState: { type: 'string', enum: ['online', 'offline'] },
              capabilities: {
                type: 'array',
                items: { type: 'string' }
              },
              lastSeenAt: { type: 'string', format: 'date-time' }
            }
          },
          Group: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              selector: {
                type: 'object',
                properties: {
                  region: { type: 'string' },
                  vendor: { type: 'string' }
                }
              }
            }
          },
          EventPayload: {
            type: 'object',
            required: [
              'targetSelector',
              'type',
              'powerKw',
              'startAt',
              'durationMinutes'
            ],
            properties: {
              targetSelector: {
                type: 'object',
                properties: {
                  region: { type: 'string', example: 'NSW' },
                  vendor: { type: 'string', example: 'Tesla' },
                  groupId: { type: 'string', example: 'group-battery-vic' }
                }
              },
              type: {
                type: 'string',
                enum: ['discharge', 'charge', 'curtail_solar'],
                example: 'discharge'
              },
              powerKw: {
                type: 'number',
                example: 5.5
              },
              startAt: {
                type: 'string',
                format: 'date-time',
                example: '2026-07-10T12:00:00.000Z'
              },
              durationMinutes: {
                type: 'number',
                example: 30
              }
            }
          },
          CreateEventPayload: {
            allOf: [
              { $ref: '#/components/schemas/EventPayload' },
              {
                type: 'object',
                properties: {
                  createdBy: {
                    type: 'string',
                    example: 'ops.lead@shinehub.local'
                  }
                }
              }
            ]
          },
          Event: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              targetSelector: { type: 'object' },
              type: { type: 'string' },
              powerKw: { type: 'number' },
              startAt: { type: 'string', format: 'date-time' },
              endAt: { type: 'string', format: 'date-time' },
              durationMinutes: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          Batch: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              eventId: { type: 'string' },
              status: { type: 'string', enum: ['ready', 'dispatching', 'completed', 'failed'] },
              summary: {
                type: 'object',
                additionalProperties: { type: 'integer' }
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          Command: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              eventId: { type: 'string' },
              batchId: { type: 'string' },
              deviceId: { type: 'string' },
              attempt: { type: 'integer' },
              status: { type: 'string' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          AuditEntry: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              actor: { type: 'string' },
              action: { type: 'string' },
              entityType: { type: 'string' },
              entityId: { type: 'string' },
              before: { type: 'object', nullable: true },
              after: { type: 'object' },
              metadata: { type: 'object' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          ValidationResult: {
            type: 'object',
            properties: {
              ok: {
                type: 'boolean',
                example: true
              },
              targetCount: {
                type: 'integer',
                example: 36
              },
              offlineCount: {
                type: 'integer',
                example: 2
              },
              unsupportedCount: {
                type: 'integer',
                example: 0
              },
              conflicts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    deviceId: { type: 'string' },
                    commandId: { type: 'string' },
                    batchId: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              errors: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    apis: [
      path.resolve(__dirname, './routes/*.js')
    ]
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api', createApiRoutes(controllers));

  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({
      message: error.message || 'Unexpected server error.',
      details: error.details,
    });
  });

  return app;
}

