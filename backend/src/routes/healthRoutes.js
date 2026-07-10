import { Router } from 'express';

export function createHealthRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/health:
   *   get:
   *     summary: Check API Health
   *     description: Returns the status of the server.
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 ok:
   *                   type: boolean
   *                   example: true
   *                 service:
   *                   type: string
   *                   example: "shinehub-vpp-dispatch"
   */
  router.get('/health', controller.show);
  return router;
}

