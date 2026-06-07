# Code Style

This document defines DocApp code style and implementation expectations.

## Core Principles

- Write clean, maintainable TypeScript.
- Prefer clear code over clever abstractions.
- Keep files focused.
- Keep components small.
- Use the folder-per-component structure defined in `docs/project-documentation/project-structure.md`.
- Separate UI, business logic, validation, mappers, and server-side effects.
- Avoid messy conditional rendering.
- Add tests when code changes are testable.
- Leave touched code cleaner than before.
- Keep each branch scoped to the approved task.
- Treat booking, payment, and Google Calendar lifecycle code as business-critical.
- Keep patient data minimal and avoid sensitive health details.

## Component Style

Use arrow function components by default.

Preferred:

```tsx
import type { EmptyStateProps } from "./types";

const EmptyState = ({ message }: EmptyStateProps) => {
  return <div>{message}</div>;
};

export default EmptyState;
```

For Next.js page files, prefer:

```tsx
const HomePage = () => {
  return <main>DocApp</main>;
};

export default HomePage;
```

Avoid default function declarations unless there is a specific reason:

```tsx
export default function Home() {
  return <main>DocApp</main>;
}
```

## Component Folder Convention

Meaningful reusable components must live in their own PascalCase folder.

Preferred:

```txt
ComponentName/
├── index.tsx
├── types.ts
├── constants.ts
├── components/
│   └── ChildComponent/
│       ├── index.tsx
│       ├── types.ts
│       └── __tests__/
│           └── ChildComponent.test.tsx
└── __tests__/
    └── ComponentName.test.tsx
```

Rules:

- `index.tsx` contains the component implementation.
- `index.tsx` should default export the main component.
- `types.ts` contains prop types and component-specific types when needed.
- `constants.ts` contains constants used only by this component when needed.
- `components/` contains child components used only by this component.
- `__tests__/` contains tests for the component.
- Do not create empty `types.ts`, `constants.ts`, or `__tests__/` files/folders if they are not needed yet.
- Do not define multiple meaningful reusable components in one file.

## Props

Define explicit prop types.

Use `Readonly` for component props.

For meaningful or reusable components, put prop types in the component folder’s `types.ts`.

Preferred:

```tsx
// types.ts
type StatusRowProps = Readonly<{
  label: string;
  value: string;
}>;

export type { StatusRowProps };
```

```tsx
// index.tsx
import type { StatusRowProps } from "./types";

const StatusRow = ({ label, value }: StatusRowProps) => {
  return null;
};

export default StatusRow;
```

## Exports

DocApp uses default exports from component folder entry files and named re-exports from section barrel files.

Component folder entry file:

```tsx
// src/components/layout/AppHeader/index.tsx
const AppHeader = () => {
  return <header />;
};

export default AppHeader;
```

Section barrel file:

```ts
// src/components/layout/index.ts
export { default as AppHeader } from "./AppHeader";
export { default as AppShell } from "./AppShell";
export { default as AppNavigation } from "./AppNavigation";
```

Preferred import from section barrel:

```tsx
import { AppHeader, AppShell } from "@/components/layout";
```

## Constants

Move constants out of components when they are meaningful, reused, or likely to grow.

Move constants to `constants.ts` when they represent:

- navigation items
- status labels
- UI labels/options
- validation limits
- booking limits
- payment statuses
- appointment statuses
- calendar sync statuses
- business rules
- values reused by child components
- values likely to grow

Do not bury these inside page files:

- appointment status maps
- order status maps
- service duration options
- time-slot labels
- deposit/price validation limits
- Google Calendar sync statuses

## Hooks

Shared React hooks live in `src/hooks`.

Feature-specific hooks live inside the relevant feature folder.

Do not put React hooks inside `src/lib`.

Preferred shared hook:

```txt
src/hooks/useMediaQuery.ts
```

Preferred feature hook:

```txt
src/features/booking/hooks/useBookingFormState.ts
src/features/appointments/hooks/useAppointmentFilters.ts
```

Rules:

- Hooks must start with `use`.
- Hooks should not hide server-only side effects.
- Hooks should not be used to store server state globally when server-state caching is more appropriate.
- Keep hooks focused on one concern.

## Conditional Rendering

Avoid deeply nested conditional rendering inside JSX.

Prefer derived variables, small helper components, or separate components.

Avoid:

```tsx
{isPaid ? (
  hasCalendarEvent ? (
    <Confirmed />
  ) : (
    <CalendarFailed />
  )
) : isPending ? (
  <Pending />
) : null}
```

Prefer splitting status display into focused components:

```tsx
<AppointmentStatusPanel appointment={appointment} />
<PaymentStatusPanel order={order} />
<CalendarSyncStatusPanel sync={calendarSync} />
```

## Server And Client Components

Use Server Components by default.

Add `"use client"` only when the component needs:

- state
- effects
- browser APIs
- event handlers
- client-side libraries

Do not mark large route trees as client components unnecessarily.

Do not add `"use client"` just because a component renders UI.

Do not import server-only code into client components.

Do not import Prisma Client into browser/client components. Keep Prisma Client usage in server-side modules, route handlers, server actions, or scripts.

## External Libraries And SDKs

When using external libraries, SDKs, or provider integrations, follow the official documentation for the installed/current version.

Rules:

- Check official docs before implementing or changing behavior that depends on an external library.
- Prefer the library's documented components, hooks, helpers, middleware, SDK clients, and recommended patterns.
- Verify version-specific props, exports, and APIs against installed package types or official docs.
- Do not replace a documented library API with a custom or "equivalent" implementation unless there is an approved reason.
- Document any intentional deviation from official guidance before or alongside the code.
- Keep provider secrets, credentials, webhooks, and server-only clients out of client components.

Examples:

- use Clerk's documented auth components/hooks for auth controls and authentication flows
- use Stripe's documented Checkout and webhook verification APIs for payment flow
- use Google Calendar's documented OAuth/token and event APIs for calendar sync
- use Prisma's documented schema/client/migration workflows for database work
- use FullCalendar's documented components/plugins for calendar UI behavior

## Page And Layout Files

Keep Next.js route/page files thin.

Page files should compose components from `components/` or `features/`.

Global shell, header, and navigation should live in layout components, not inside page files.

Do not place global header/navigation inside the `<main>` landmark.

Each rendered page should have one clear page-level `<main>` landmark owned by the route page or shell. Components rendered inside an existing shell must not add another page-level `<main>` unless the layout intentionally requires it and the reason is documented.

Do not nest `min-h-screen`, `h-screen`, or other full-viewport layout wrappers inside an existing app shell unless the behavior is intentional and tested. Prefer shell-relative spacing and sizing so header/navigation remains visible and browser scroll restoration does not hide the page chrome.

When changing layout-sensitive components, add or update focused tests that guard against invalid page landmarks or accidental nested `<main>` elements where practical.

## Business Logic

Do not put business logic directly inside React components when it can be extracted.

Move logic to:

```txt
mappers/
validators/
services/
schemas/
utils/
```

Examples:

```txt
src/features/availability/services/generate-available-slots.ts
src/features/booking/validators/validate-booking-request.ts
src/features/payments/services/fulfill-checkout-session.ts
src/features/calendar/mappers/map-appointment-to-google-event.ts
```

React components should focus on rendering and user interaction.

Server-side effects should live in server-side modules, server actions, route handlers, or job handlers depending on the feature.

## Payment And Booking Rules

Never finalize payment in a React component or checkout success page.

Never trust client-provided price, deposit, duration, clinic ID, doctor ID, resource ID, or slot availability without server-side validation.

Before creating a Stripe Checkout Session, server code must re-check:

- organization/clinic ownership
- active service
- active doctor/resource
- service price/deposit
- slot availability
- pending lock rules

Webhook handlers must be idempotent.

## Error Handling

Do not silently ignore errors.

Use clear error handling and user-readable messages.

For external side effects, record:

- status
- step
- error code/message
- retryability when known
- user-safe summary

For UI errors:

- show a useful message
- avoid exposing sensitive technical details
- keep technical details in logs where appropriate

For server errors:

- preserve enough context for debugging
- avoid leaking tokens, secrets, raw credentials, patient notes, Stripe payload secrets, or Google credentials

## Comments

Prefer code that explains itself.

Use comments only for:

- non-obvious business rules
- API limitations
- security-sensitive decisions
- privacy-sensitive decisions
- temporary workarounds with TODOs

Good:

```ts
// Payment fulfillment must stay webhook-driven because the success page is not reliable.
```

Bad:

```ts
// Set status to paid
order.status = "paid";
```

## Testing

Every implementation branch should add or update tests when the changed code is testable.

When changing shared config, components, helpers, schemas, or exported APIs, search for dependent tests and usages and update them in the same branch. Do not only test the new file if existing tests still duplicate or depend on the old shape.

Use React Testing Library for component behavior.

Use focused unit tests for:

- validators
- mappers
- formatters
- access-control checks
- availability generation
- pending lock expiration
- appointment status transitions
- order status transitions
- payment webhook idempotency
- Google Calendar event payload mapping
- Google Calendar sync failure handling

Component tests should live inside the component folder.

Feature/domain tests may live in the feature folder:

```txt
src/features/availability/__tests__/generate-available-slots.test.ts
src/features/payments/__tests__/fulfill-checkout-session.test.ts
src/features/calendar/__tests__/map-appointment-to-google-event.test.ts
```

Do not add low-value tests that only assert implementation details.

If tests are not added, explain why in the handoff summary.

## Naming

Use PascalCase for component folders and component names:

```txt
AppHeader/
EmptyState/
AppointmentStatusBadge/
```

Use camelCase for variables and functions:

```ts
const availableSlots = generateAvailableSlots(input);
```

Use UPPER_SNAKE_CASE for constants that represent stable config-like values:

```ts
const DEFAULT_PENDING_LOCK_MINUTES = 15;
```

Use descriptive names. Avoid vague names such as `data`, `item`, `thing`, `stuff`, or `handleClick` when a clearer domain name exists.

## Scope Discipline

Do not implement unrelated UI or product features in setup, foundation, or tooling branches.

Examples:

- A testing setup branch should not redesign the homepage.
- A linting branch should not create dashboard UI.
- A database schema branch should not add marketing copy.
- A base shell branch should create reusable shell structure, not a polished product dashboard.

Keep each branch focused on the approved task.

If Codex identifies an improvement outside the approved scope, it should mention it as a follow-up instead of implementing it immediately.

## What Not To Do

Do not define meaningful reusable components inside `src/app/page.tsx`.

Do not place constants such as navigation items, status maps, limits, labels, or business rules inside page files.

Do not create component files like:

```txt
src/components/layout/AppHeader.tsx
src/components/ui/EmptyState.tsx
```

Use folder-per-component structure instead:

```txt
src/components/layout/AppHeader/index.tsx
src/components/ui/EmptyState/index.tsx
```

Do not put shared React hooks inside `src/lib`.

Do not import server-only code into client components.

Do not create one-off project structures per branch.
