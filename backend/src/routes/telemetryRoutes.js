import { Router } from 'express';

export function createTelemetryRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/telemetry:
   *   post:
   *     summary: Mock Telemetry Ingestion
   *     description: Simulates external telemetry reports (e.g. MQTT callbacks) modifying a command status manually. Use this to simulate successes or failures during development.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - commandId
   *               - status
   *             properties:
   *               commandId:
   *                 type: string
   *                 example: cmd-1234
   *               status:
   *                 type: string
   *                 enum:
   *                   - queued
   *                   - publishing
   *                   - publish_failed
   *                   - sent
   *                   - acked
   *                   - ack_timeout
   *                   - executed
   *                   - execution_timeout
   *                   - execution_failed
   *                   - offline_expired
   *                 example: executed
   *               reason:
   *                 type: string
   *                 example: Manual telemetry simulation report.
   *     responses:
   *       200:
   *         description: Command updated by telemetry
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 command:
   *                   $ref: '#/components/schemas/Command'
   *       404:
   *         description: Command not found
   */
  router.post('/telemetry', controller.ingest);
  return router;
}

