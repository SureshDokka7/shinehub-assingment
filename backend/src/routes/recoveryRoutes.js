import { Router } from 'express';

export function createRecoveryRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/recovery/run:
   *   post:
   *     summary: Trigger Crash Recovery Scan
   *     description: Scans all commands in transition states (queued, publishing, sent) that have timed out or become stale, resetting them to pending and rescheduling them.
   *     responses:
   *       200:
   *         description: Recovery scan summary
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 recovered:
   *                   type: integer
   *                   example: 2
   */
  router.post('/recovery/run', controller.run);
  return router;
}

