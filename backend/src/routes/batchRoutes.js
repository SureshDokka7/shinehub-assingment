import { Router } from 'express';

export function createBatchRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/batches/{batchId}/dispatch:
   *   post:
   *     summary: Dispatch Batch Commands
   *     description: Triggers the dispatch of all pending commands in a batch, starting the simulated device MQTT flow.
   *     parameters:
   *       - name: batchId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Batch set to dispatching state
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 batch:
   *                   $ref: '#/components/schemas/Batch'
   *       404:
   *         description: Batch not found
   */
  router.post('/batches/:batchId/dispatch', controller.dispatch);

  /**
   * @openapi
   * /api/batches/{batchId}:
   *   get:
   *     summary: Get Batch Details
   *     description: Returns the status, summary stats, and target information for a specific dispatch batch.
   *     parameters:
   *       - name: batchId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Batch details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 batch:
   *                   $ref: '#/components/schemas/Batch'
   *       404:
   *         description: Batch not found
   */
  router.get('/batches/:batchId', controller.show);

  /**
   * @openapi
   * /api/batches/{batchId}/commands:
   *   get:
   *     summary: List Batch Commands
   *     description: Returns all device commands linked to a specific dispatch batch, including their execution status and retry attempts.
   *     parameters:
   *       - name: batchId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A list of commands for the batch
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 commands:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Command'
   *       404:
   *         description: Batch not found
   */
  router.get('/batches/:batchId/commands', controller.listCommands);

  /**
   * @openapi
   * /api/batches/{batchId}/audit:
   *   get:
   *     summary: Get Batch Audit Trail
   *     description: Returns the list of audit events recorded for the batch and its child commands.
   *     parameters:
   *       - name: batchId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Audit trail log
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 audit:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AuditEntry'
   */
  router.get('/batches/:batchId/audit', controller.audit);
  return router;
}

