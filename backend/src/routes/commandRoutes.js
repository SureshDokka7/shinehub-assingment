import { Router } from 'express';

export function createCommandRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/commands/{commandId}/retry:
   *   post:
   *     summary: Retry Failed/Timed Out Command
   *     description: Attempts to retry a command that failed execution, failed to publish, or timed out. Re-queues the command with a bumped attempt number.
   *     parameters:
   *       - name: commandId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Command requeued successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 command:
   *                   $ref: '#/components/schemas/Command'
   *       400:
   *         description: Command is not eligible for retry
   *       404:
   *         description: Command not found
   */
  router.post('/commands/:commandId/retry', controller.retry);
  return router;
}

