# Keyhook Booking System

A proof-of-concept booking system built for the Keyhook technical test. The project demonstrates a React/TypeScript frontend, a Node.js/Express backend, SQLite persistence, WebSocket-based real-time updates, and server-side booking invariants designed to protect the core scheduling rules.

The goal is not only to provide a working booking UI, but also to show how a small full-stack application can be structured around clear business rules: availability belongs to managers, tenants can book only valid available slots, active bookings cannot be duplicated, and booking history is preserved through explicit status changes.

## Tech stack

### Frontend

- React 18
- TypeScript
- Redux Toolkit
- Material UI
- Tailwind CSS
- Parcel
- Axios
- WebSocket / optional SignalR client support
- `react-hot-toast` for user notifications
- `react-error-boundary` for render-level error handling

### Backend

- Node.js
- Express
- TypeScript
- Sequelize
- SQLite
- WebSocket (`ws`)
- Day.js with timezone support

## Project structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── contexts/          # Current user context
│   │   ├── hooks/             # WebSocket dispatch hook
│   │   ├── layouts/           # Page-level layout
│   │   ├── services/          # API and error handling services
│   │   ├── store/             # Redux state and typed hooks
│   │   ├── types/             # Client-side DTOs and domain types
│   │   └── utils/             # Date/time and DTO transformation helpers
│   └── package.json
│
└── server/
    ├── lib/                   # Infrastructure helpers: DB, seed, broadcast, date setup
    ├── middleware/            # Validation, role checks, error handling
    ├── routes/                # Express route definitions
    ├── services/              # Business logic and server-side invariants
    ├── types/                 # Shared server constants and event types
    ├── models.ts              # Sequelize models and associations
    ├── app.ts                 # Express app configuration
    ├── server.ts              # HTTP + WebSocket server startup
    └── package.json
```

## Local setup

Install dependencies for both applications:

```bash
cd server
npm install

cd ../client
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:1234
API:      http://localhost:4000/api
WebSocket ws://localhost:4000
```

## Environment variables

The application works with local defaults, but these values can be configured if needed.

### Client

```env
API_URL=http://localhost:4000/api
WS_URL=ws://localhost:4000
SERVER_TYPE=node
```

`SERVER_TYPE=dotnet` is supported by the client code for SignalR experiments, but the Node/Express backend in this project uses a plain WebSocket server.

### Server

```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:1234
```

`ALLOWED_ORIGINS` accepts a comma-separated list.

## What the application supports

- Switch between seeded demo users: tenants and managers.
- Add new demo users from the UI.
- Managers can create availability by specific date or by weekdays.
- Managers can edit and delete availability when it has no active bookings.
- Tenants can view available slots, book slots, and cancel their own bookings.
- Managers can view bookings for their own slots and cancel those bookings.
- Active bookings are synchronized between browser sessions through WebSocket events.
- The frontend displays timezone-aware slot labels.
- The backend stores cancelled bookings as status changes rather than deleting booking history.

## Server-side booking invariants

The backend is responsible for protecting the business rules. 
The frontend performs convenience validation, but the server is the source of truth.

Current server-side rules include:

- Only users with the `tenant` role can create bookings.
- A booking can only be created for an existing availability slot.
- A booking can only be created for a date on which the selected slot actually occurs.
- A booking cannot be created for a slot that is already in the past.
- Only one active booking can exist for the same slot and booking date.
- Database uniqueness is used as a final protection against double-booking races.
- Booking conflicts are returned as `409` responses rather than generic server failures.
- Tenants can cancel only their own bookings.
- Managers can cancel only bookings for availability slots they own.
- Active booking uniqueness is enforced per slot/date, while cancelled bookings are preserved as history.
- Cancelled bookings cannot be cancelled again, but the same slot/date can be booked again after cancellation.
- Availability with active bookings cannot be edited or deleted.
- Availability changes are restricted to the manager who owns the slot.
- WebSocket events are broadcast after successful write operations.

These rules are intentionally enforced on the server because direct API calls should not be able to bypass the UI.

## Real-time update model

The application uses REST for confirmed writes and WebSocket events for cross-client synchronization.

The intended flow is:

```text
User action
→ REST request
→ server validates invariants
→ database write succeeds
→ REST response updates current client
→ WebSocket event updates other connected clients
```

This avoids relying on WebSocket as the only source of local UI updates.

## Error handling model

The client uses a small error service to keep components focused on user actions rather than Axios error details.

The pattern is:

```text
component
→ handleApiAction(...)
→ apiService request
→ typed success/failure result
→ toast + console logging handled consistently
```

This keeps repeated `try/catch`, toast handling, and API error extraction out of the components.

## Demo flow

1. Start the server and client.
2. Open `http://localhost:1234`.
3. Select a tenant and review available slots.
4. Switch to a manager and create a new availability slot.
5. Switch back to a tenant and book that slot.
6. Open the app in another browser window to see real-time updates.
7. Try cancelling as the tenant who owns the booking.
8. Try cancelling as the manager who owns the slot.
9. Try editing or deleting a slot with an active booking and confirm that the server blocks it.
10. Try creating overlapping or duplicate availability and confirm validation behaviour.

## API overview

### Users

```text
GET  /api/users
POST /api/users
```

### Availability

```text
GET    /api/availability
POST   /api/availability
PUT    /api/availability/:id
DELETE /api/availability/:id?managerId=:managerId
```

### Bookings

```text
GET    /api/bookings
POST   /api/book
DELETE /api/book/:id?cancelledBy=:userId
```

`/api/book` is kept as a convenience alias for booking actions.

## Data model summary

### User

```text
id
name
role: tenant | manager
```

### Availability

```text
id
managerId
selectedDate
weekday pattern
startTime
endTime
timezone
```

### Booking

```text
id
slotId
tenantId
bookDate
status: active | cancelled_by_tenant | cancelled_by_manager
cancelledAt
```

## Known trade-offs

This is a proof of concept, so several production concerns are intentionally simplified:

- Authentication and authorization are simulated through selected demo users.
- SQLite is used for local portability; PostgreSQL would be a better production default.
- WebSocket connections are unauthenticated in the demo.
- WebSocket reconnection/backoff is basic.
- The project needs a fuller test suite covering unit, integration, and E2E scenarios.
- The UI is intentionally simple and focused on booking behaviour rather than visual polish.

## Recommended next improvements

- Add integration tests for booking invariants.
- Add a concurrency test where two tenants try to book the same slot simultaneously.
- Add authentication and session-based user identity.
- Replace selected-user demo permissions with authenticated authorization.
- Move from SQLite sync to explicit database migrations.
- Add structured API error codes to the README and document expected responses.
- Add WebSocket authentication and reconnection/backoff strategy.
- Add CI checks for TypeScript, Biome, and tests.

## Why this project matters

This project is deliberately small, but it exercises the kind of decisions that matter in real booking systems:

- What must be protected on the server?
- What should happen when two users act at the same time?
- How should real-time updates behave if the current request succeeds but WebSocket is delayed?
- How do we preserve booking history while still allowing cancellations?
- How do frontend validation, API validation, and database constraints work together?

The implementation is therefore less about simply rendering a calendar and more about protecting the core booking invariants end to end.
