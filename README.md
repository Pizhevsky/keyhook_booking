# Keyhook Booking System

This is a proof-of-concept project for the Keyhook tech test.
It includes a TypeScript, React, Tailwind and MaterialUI frontend (Parcel) and 
a TypeScript and Express backend using SQLite and Sequelize.

## Quick start (locally)
1. From the project root:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```
2. Run dev servers concurrently:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:1234
   - API: http://localhost:4000

## What I implemented
- Ability to switch between users 2 tenants and 2 managers for testing purposes.
- Managers can add availability slots by specific date and by the weekday.
- Tenants can view and book and cancel slots.
- Managers can view booked slots and cancel them.
- Managers can edit and delete availabilities.
- Server prevents double-booking via UNIQUE constraint and additional checks.
- Timezone-aware labels (frontend uses user's timezone).

## Production notes
For production needs some improvements: 
slot's time periods intersections, errors validation, Typescript on backend,
auth, PostgreSQL, WebSockets security, unit + integration + E2E tests.

## Demo steps
1. Start servers: `npm run dev`
2. Open frontend: http://localhost:1234
3. You can see defult slots for booking as tenant.
4. Switch to manager and click 'Add slot'. It is necessary to choose at least one day of the week or the current date. If you don't do it, when saving, the current date would be checked automatically. Click 'Save', and the slot appears on the accordingly selected days.
5. Switch to tenant. Click 'Book' for the newly added slot.
6. Switch back to manager. Slot is marked 'Booked'.
7. Try to cancel booking as tenant and as manager.
8. Try to delete slots as manager.
9. To add users and initial slots check file server.ts, modify bulkCreate functions and restart.


Talking points:
- Timezone implementing.
- Functionality and process logic.
- Code quality.