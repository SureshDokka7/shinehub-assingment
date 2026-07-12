export function createEventController(eventService) {
  return {
    async validate(req, res) {
      try {
        const result = await eventService.validateEvent(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    async create(req, res, next) {
      try {
        const result = await eventService.createEvent(req.body);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
  };
}

