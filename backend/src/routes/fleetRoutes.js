import { Router } from 'express';

export function createFleetRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/devices:
   *   get:
   *     summary: List Fleet Devices
   *     description: Returns all registered devices in the VPP fleet.
   *     responses:
   *       200:
   *         description: A list of devices
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 devices:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Device'
   */
  router.get('/devices', controller.listDevices);

  /**
   * @openapi
   * /api/groups:
   *   get:
   *     summary: List Saved Fleet Groups
   *     description: Returns predefined target groups of devices.
   *     responses:
   *       200:
   *         description: A list of groups
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 groups:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Group'
   */
  router.get('/groups', controller.listGroups);
  return router;
}

