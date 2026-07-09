export function createEventController(eventService) {
  return {
    validate(req, res) {
      res.json(eventService.validateEvent(req.body));
    },

    create(req, res, next) {
      try {
        res.status(201).json(eventService.createEvent(req.body));
      } catch (error) {
        next(error);
      }
    },
  };
}

