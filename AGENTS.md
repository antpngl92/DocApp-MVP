# AGENTS.md

## Project

DocApp is an MVP for small private clinics and appointment-based healthcare practices. It lets clinic owners/admins configure doctors, staff, cabinets/rooms, services, availability, patient accounts, and deposit-based bookings that sync to Google Calendar after successful payment.

DocApp is not a public doctor marketplace, medical-record system, prescription system, or hospital-management platform. The MVP focuses on a stable booking, deposit, and Google Calendar workflow.

## Current phase

The project is in MVP foundation/rebuild mode. Use the existing prototype only as reference. Do not copy fragile payment, booking, or Google Calendar logic without rechecking it against the docs.

Useful prototype assets may be carried forward after review, including environment variable names, package choices, helper scripts, visual components, and integration setup. Do not carry forward prototype lifecycle shortcuts such as success-page payment finalization, success-page calendar sync, schema/action mismatches, or ad surfaces in patient/admin flows.

Do not add production complexity before the MVP scope is clear, but build the payment and booking lifecycle in a production-shaped way from the start.

## Working rules

- Before implementing, inspect the repo and propose a short plan.
- Read `docs/MVP.md`, `docs/DECISIONS.md`, `docs/TASKS.md`, and `docs/WORKFLOW.md` before meaningful work.
- For feature-specific work, also read the relevant file under `docs/project-documentation/`.
- Keep changes small and easy to review.
- Do not add new dependencies without explaining why.
- Do not change auth, billing, database migrations, Stripe payment flow, or Google Calendar integration without approval.
- Never commit secrets, API keys, tokens, `.env` values, private credentials, Stripe keys, Clerk keys, Google credentials, or webhook secrets.
- Prefer TypeScript, explicit types, and simple architecture over clever abstractions.
- Keep patient-facing and admin-facing code clearly separated.
- Patient accounts are part of the MVP. They are for booking, appointment history, payment/deposit status, and cancellation requests only.
- Support owner/admin setup, staff invitation/approved assignment, and patient registration/login in the foundation.
- Staff must join a clinic only through owner/admin invitation or explicit admin approval. Do not allow open public self-registration into arbitrary clinic staff roles.
- Do not store medical notes, symptoms, diagnoses, documents, or other health details unless explicitly added to scope later.
- Do not place sensitive appointment details in Google Calendar event titles.
- Payment finalization must happen through Stripe webhooks only.
- Checkout success and cancel pages must be read-only status/convenience pages, not the source of truth.
- Patients must not be able to request or self-initiate refunds. Refunds are privileged clinic-side actions only.
- Patient cancellation request behavior is configurable per clinic, but cancellation requests must not imply refund requests.
- Temporary slot holds should start with polling for MVP. Full realtime infrastructure requires an explicit decision.
- Use two-stage slot locking: a short temporary hold when a slot/form is opened, then a longer pending-payment appointment lock after form submission and Checkout creation.
- Temporary hold release on modal close is a best-effort convenience; expiry and cleanup are the source of truth.
- Google Calendar foundation and resource/calendar mapping should be implemented early, not postponed until after the booking flow is complete.
- Do not use `calendar_sync_failed` as an appointment status. Keep appointment lifecycle and calendar sync lifecycle separate.
- Keep rescheduling out of scope unless a later decision explicitly adds it.
- SuperDesign may be used for UI exploration, but approved project docs remain the source of truth and generated designs require review before implementation.
- Use the documented SuperDesign CLI/agent workflow for project UI exploration before implementing important booking, patient, and admin screens.
- Do not migrate the prototype Radix/shadcn UI setup or reusable UI/components. New UI should be guided by approved SuperDesign explorations.
- Keep FullCalendar available for MVP calendar workflows.
- Do not add ads anywhere in the app.
- Real `.env` values and Google credential JSON files are needed locally but must never be committed.

## Expected stack

- Next.js App Router with `src/`
- TypeScript
- Prisma
- PostgreSQL
- Clerk
- Stripe Checkout, later Stripe Connect if multi-clinic payments require it
- Google Calendar API
- Tailwind CSS
- FullCalendar where useful for MVP calendar views
- Resend or equivalent for email notifications

## Verification

When commands exist, run:

- lint
- typecheck
- tests if available
- build before major handoff

If a command does not exist yet, state that clearly instead of inventing one.

If a local development server is started for verification, stop that server before handoff unless the user explicitly asks to keep it running. Do not leave localhost servers running after checks.

## Handoff format

At the end of each task, summarize:

- files changed
- what was implemented
- commands run
- docs updated
- risks or TODOs
- confirmation that any local dev server started by Codex was stopped

## Development workflow

- Do not implement meaningful changes directly on `main`.
- Use a separate branch for each feature, fix, refactor, test, chore, or documentation update.
- Before editing, read the relevant docs and propose a short plan.
- Implement only the approved scope.
- Run available checks before handoff.
- Add or update focused tests in the same branch for every new or changed component and every new or changed unit of application or business logic.
- Update `docs/TASKS.md` checkboxes only for work actually completed in the current branch.

## Documentation context

Before planning or implementing meaningful changes, read:

- `docs/MVP.md` for product scope
- `docs/DECISIONS.md` for product and architecture decisions
- `docs/TASKS.md` for implementation phase/checklist
- `docs/WORKFLOW.md` for branch, review, and handoff workflow

For feature-specific work, also read the relevant project documentation:

- `docs/project-documentation/architecture.md`
- `docs/project-documentation/authentication.md`
- `docs/project-documentation/data-model.md`
- `docs/project-documentation/booking-flow.md`
- `docs/project-documentation/payment-flow.md`
- `docs/project-documentation/patient-account.md`
- `docs/project-documentation/google-calendar-flow.md`
- `docs/project-documentation/security-privacy.md`
- `docs/project-documentation/ui-direction.md`
- `docs/project-documentation/superdesign-integration.md`
- `docs/project-documentation/superdesign-prompts.md`
- `docs/project-documentation/superdesign-review.md`
- `docs/project-documentation/demo-data.md`
- `docs/project-documentation/testing-strategy.md`
- `docs/project-documentation/project-structure.md`
- `docs/project-documentation/code-style.md`

If implementation changes product behavior, architecture, data flow, API behavior, access rules, security posture, payment behavior, calendar sync behavior, or user-facing workflow, update the relevant documentation before or alongside the code.

## Branch naming

Use approved branch prefixes only:

- `feature/...`
- `fix/...`
- `docs/...`
- `test/...` or `tests/...`
- `refactor/...`
- `chore/...`

Do not create branches with tool-specific names such as `codex/...`, `ai/...`, or `agent/...`.

Branch names should describe the work, not the tool.

## Testing

- Every branch/task that adds or changes a component must add or update focused component tests in the same branch.
- Every branch/task that adds or changes application or business logic must add or update focused logic tests in the same branch.
- Use React Testing Library for React component behavior.
- Use focused unit tests for validators, mappers, services, and business logic.
- Add tests for appointment lifecycle transitions, availability generation, slot locking, payment webhook idempotency, and Google Calendar sync failure handling.
- For bug fixes, add a regression test when practical.
- Documentation-only changes do not require tests.
- If a technical blocker makes a required test impossible, leave the task incomplete and explain the blocker in the handoff summary.

## Project structure and code style

Before creating or modifying code, follow:

- `docs/project-documentation/project-structure.md`
- `docs/project-documentation/code-style.md`

Key rules:

- Use Next.js App Router with the `src/` directory.
- Keep route/page files thin.
- Do not place meaningful constants, navigation data, status definitions, limits, labels, or business rules inside page components.
- Move shell, layout, and navigation into reusable layout components.
- Do not put global headers/navigation inside the `<main>` landmark.
- Use the folder-per-component structure for meaningful reusable components.
- Use PascalCase component folders.
- Put component implementations in `index.tsx`.
- Component folders should default export their main component from `index.tsx`.
- Put component prop types and component-specific types in `types.ts` when needed.
- Put component-only constants in `constants.ts` when needed.
- Put child components used only by one parent inside the parent component’s `components/` folder.
- Put component tests inside the component folder’s `__tests__/` folder when tests exist.
- Use section-level barrel exports such as `src/components/layout/index.ts` and `src/components/ui/index.ts`.
- Use arrow function components by default.
- Use explicit `Readonly` prop types.
- Use Server Components by default.
- Add `"use client"` only when needed.
- Keep shared React hooks in `src/hooks`.
- Keep feature-specific hooks inside the relevant feature folder.
- Do not put React hooks inside `src/lib`.
- Keep server-only code in `src/server`.
- Keep branch changes scoped to the approved task.
- Do not redesign product UI in setup/tooling branches.
