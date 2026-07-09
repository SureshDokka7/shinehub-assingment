# Backend Architecture

This backend follows an MVC/service/repository structure:

- `src/server.js`: process entrypoint.
- `src/app.js`: Express app composition and dependency injection.
- `src/routes`: endpoint definitions only.
- `src/controllers`: request/response mapping only.
- `src/services`: business rules for validation, dispatch, retry, recovery, and lifecycle transitions.
- `src/repositories`: persistence boundary. The prototype uses `inMemoryVppRepository`; production can replace it with MongoDB repositories.
- `src/models`: Mongoose schemas and production indexes.
- `src/data`: local seed data for runnable demo behavior.

The in-memory repository exists so the hiring team can run the project without provisioning MongoDB. The production data model is still represented in `src/models/vppModels.js`.

