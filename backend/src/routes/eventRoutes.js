import { Router } from 'express';

export function createEventRoutes(controller) {
  const router = Router();
  /**
   * @openapi
   * /api/events/validate:
   *   post:
   *     summary: Validate Event Payload
   *     description: Evaluates safety validation rules, checks device availability, and searches for overlapping command schedules (conflicts) without creating the event.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EventPayload'
   *     responses:
   *       200:
   *         description: Validation results
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationResult'
   */
  router.post('/events/validate', controller.validate);

  /**
   * @openapi
   * /api/events:
   *   post:
   *     summary: Create VPP Event and Batch
   *     description: Validates the payload and, if validation passes, creates a persistent VPP Event, its associated Dispatch Batch, and Pending Commands for each target device.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEventPayload'
   *     responses:
   *       201:
   *         description: Event and batch successfully created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 event:
   *                   $ref: '#/components/schemas/Event'
   *                 batch:
   *                   $ref: '#/components/schemas/Batch'
   *                 validation:
   *                   $ref: '#/components/schemas/ValidationResult'
   *       400:
   *         description: Validation failed, event not created
   */
  router.post('/events', controller.create);
  return router;
}

