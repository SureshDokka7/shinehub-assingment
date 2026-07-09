# ShineHub VPP Batch Event Dispatch

MERN-style take-home prototype and design submission for the ShineHub Full Stack Engineer Admin Portal exercise.

## What This Includes

- Requirement analysis in `task.md`
- Design document in `docs/design-doc.md`
- AI worklog in `docs/ai-worklog.md`
- Final submission documents in `documents/`
- Data-flow explanation in `docs/data-flow.md`
- Backend in `backend/` using MVC plus service/repository layers
- Frontend in `frontend/` using React, Vite, and Tailwind CSS with a mobile-first layout
- Express API with safety validation, dispatch simulation, retry handling, recovery endpoint, and audit trail
- Mongoose schemas showing production MongoDB collections and indexes
- React Admin Portal for creating a batch event and tracking per-device command status

## Run Locally

```bash
npm install
npm run dev
```

- Portal: `http://127.0.0.1:5173`
- API: `http://localhost:4000/api/health`

The prototype uses an in-memory repository so it runs without MongoDB. `backend/src/models/vppModels.js` contains the production MongoDB/Mongoose model definitions and safety indexes.

## Run With Docker

```bash
docker compose up --build
```

- Portal: `http://localhost:8080`
- API health: `http://localhost:4000/api/health`

The frontend container uses nginx and proxies `/api` requests to the backend container.

## Project Structure

```text
backend/
  src/
    controllers/
    routes/
    services/
    repositories/
    models/
frontend/
  src/
    api/
    components/
    constants/
    features/
    utils/
docs/
documents/
```

## Hiring Submission Documents

- `documents/shinehub-vpp-design-document.md`
- `documents/shinehub-vpp-ai-worklog.md`
- `documents/requirement-coverage-checklist.md`

## Demo Flow

1. Select a target by region, vendor, or saved group.
2. Configure event type, power, start time, and duration.
3. Confirm safety validation passes.
4. Click `Create and Dispatch`.
5. Watch per-device statuses move through pending, sent, acked, executed, and failure states.
6. Retry eligible failed or timeout commands.
7. Review the audit stream.

## Production Notes

In production, the in-memory repository would be replaced with MongoDB transactions, a durable queue, MQTT publish adapter, telemetry ingestion consumers, and WebSocket/SSE live updates.
