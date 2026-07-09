# Frontend Architecture

The frontend is a React/Vite/Tailwind Admin Portal organized by feature and built mobile-first:

- `src/api`: API client boundary.
- `src/components`: reusable UI primitives.
- `src/constants`: static option/status lists.
- `src/features/dispatch`: event configuration workflow.
- `src/features/batches`: live batch progress and command table.
- `src/features/audit`: audit trail display.
- `src/hooks`: workflow/data-fetching hooks.
- `src/layouts`: reusable page shells.
- `src/pages`: routed page components.
- `src/routes`: route composition.
- `src/App.jsx`: routing entry only.
