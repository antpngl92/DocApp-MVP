# Project Structure

This document defines the DocApp project structure conventions.

DocApp uses Next.js App Router with a `src/` directory.

## Core Principles

- Keep route/page files thin.
- Keep reusable UI components outside route/page files.
- Use a folder-per-component structure for meaningful reusable components.
- Keep constants, config, and data definitions out of page components when they are meaningful, reused, or likely to grow.
- Keep component-specific constants close to the component that owns them.
- Prefer clear feature/domain folders over dumping everything into generic folders.
- Keep server-only logic separate from client/UI logic.
- Keep React hooks separate from generic utility functions.
- Do not create large page files with many nested helper components.
- Do not invent a new structure per feature. Follow this document.

## Recommended Root Structure

```txt
.
├── docs/
│   ├── MVP.md
│   ├── DECISIONS.md
│   ├── TASKS.md
│   ├── WORKFLOW.md
│   └── project-documentation/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── server/
│   ├── styles/
│   ├── types/
│   └── test/
├── AGENTS.md
├── package.json
└── README.md
```

## Prototype Structure Notes

The existing prototype uses root-level folders such as `app/`, `components/`, `hooks/`, `lib/`, `prisma/`, `store/`, `styles/`, and `types/`.

The rebuild should move to `src/` as defined above. When porting useful prototype code:

- move route handlers and pages from `app/` to `src/app/`
- do not port prototype reusable UI/components as-is
- move domain-specific booking/payment/calendar code into `src/features/`
- move server-only Prisma, Stripe, Clerk, Google, and Resend logic into `src/server/`
- move shared hooks into `src/hooks/`
- avoid recreating a broad `store/` folder unless a small client UI store is genuinely needed
- avoid bringing `GoogleAds/` or ad containers into the MVP booking/admin app
- keep scripts that are still useful, such as refresh-token or seed/backfill scripts, under `scripts/`

Do not migrate the prototype Radix/shadcn component setup. New UI components should be created for the rebuild and guided by approved SuperDesign explorations.

## `src/app`

Use `src/app` for routing, layouts, route groups, route handlers, loading files, error files, and page entry points.

Route/page files should stay small and compose components from `components/` or `features/`.

Example:

```txt
src/app/
├── layout.tsx
├── globals.css
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── support/
│   │   └── page.tsx
│   ├── booking/
│   │   └── page.tsx
│   └── checkout/
│       ├── success/
│       │   └── page.tsx
│       └── cancel/
│           └── page.tsx
├── (patient)/
│   ├── layout.tsx
│   └── account/
│       ├── page.tsx
│       └── appointments/
│           └── page.tsx
├── (admin)/
│   ├── layout.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── cabinets/
│       │   └── page.tsx
│       ├── services/
│       │   └── page.tsx
│       ├── availability/
│       │   └── page.tsx
│       └── appointments/
│           └── page.tsx
└── api/
    ├── health/
    │   └── route.ts
    └── stripe/
        └── webhook/
            └── route.ts
```

## Page Structure

Page files should mainly compose feature/components.

Good:

```tsx
import { AdminShell } from "@/components/layout";
import { AppointmentOverview } from "@/features/appointments/components";

const AppointmentsPage = () => {
  return (
    <AdminShell>
      <AppointmentOverview />
    </AdminShell>
  );
};

export default AppointmentsPage;
```

Avoid large page files containing constants, header, nav, cards, panels, helper components, and business logic.

## Semantic Layout

Do not put global headers or navigation inside the `<main>` element.

Use:

```tsx
<div>
  <AppHeader />
  <main>{children}</main>
</div>
```

Do not use:

```tsx
<main>
  <header />
  {children}
</main>
```

## `src/components`

Use `src/components` for reusable, app-wide UI components.

These components should be new rebuild components. Do not copy the old prototype `components/ui/*` or Radix/shadcn wrappers into the new app.

Approved top-level component groups:

```txt
src/components/
├── layout/
├── ui/
└── feedback/
```

Each section folder inside `src/components` must include an `index.ts` file that re-exports the public components from that section.

Example:

```txt
src/components/layout/AppHeader/index.tsx
src/components/layout/AppShell/index.tsx
src/components/layout/AdminShell/index.tsx
src/components/layout/index.ts
```

## Component Folder Convention

Meaningful reusable components must live in their own PascalCase folder.

Preferred structure:

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
- Use PascalCase folder names for components.
- Do not define multiple meaningful reusable components in one file.
- Do not place reusable components directly inside route/page files.
- Do not create empty `types.ts`, `constants.ts`, or `__tests__/` folders/files if they are not needed yet.

## Section Barrel Exports

Each section folder inside `src/components` must have an `index.ts` barrel file.

Example:

```ts
export { default as AppHeader } from "./AppHeader";
export { default as AppShell } from "./AppShell";
export { default as AdminShell } from "./AdminShell";
```

Preferred import:

```tsx
import { AdminShell } from "@/components/layout";
```

Avoid deep imports from unrelated areas:

```tsx
import AdminShell from "@/components/layout/AdminShell";
```

## `src/features`

Use `src/features` for domain-specific product areas.

Recommended feature folders:

```txt
src/features/
├── auth/
├── practice/
├── cabinets/
├── services/
├── availability/
├── booking/
├── patients/
├── appointments/
├── payments/
├── calendar/
├── notifications/
├── audit/
└── home/
```

A feature may contain:

```txt
src/features/booking/
├── components/
│   ├── BookingForm/
│   │   ├── index.tsx
│   │   ├── types.ts
│   │   └── __tests__/
│   │       └── BookingForm.test.tsx
│   └── index.ts
├── constants/
├── hooks/
├── mappers/
├── schemas/
├── services/
├── validators/
├── types.ts
└── __tests__/
```

Feature components should follow the folder-per-component convention.

Use `src/features/patients/` for patient profile, patient dashboard, appointment ownership, and cancellation-request UI/services.

## `src/hooks`

Use `src/hooks` for shared React hooks that are not tied to one specific feature.

Examples:

```txt
src/hooks/useDebouncedValue.ts
src/hooks/useMediaQuery.ts
src/hooks/useMounted.ts
```

Rules:

- Shared reusable hooks live in `src/hooks`.
- Feature-specific hooks live inside the relevant feature folder.
- Do not put React hooks inside `src/lib`.
- Do not put feature-specific hooks in the global `src/hooks` folder.
- Do not use hooks for server-only logic.

## `src/lib`

Use `src/lib` for shared utilities that are not tied to one feature.

Example:

```txt
src/lib/
├── cn.ts
├── env.ts
├── dates.ts
└── errors.ts
```

Use this folder for small, shared, framework-safe utilities and pure helper functions.

Do not put React hooks inside `src/lib`.

Do not put server-only code in `src/lib` if it may accidentally be imported into client components.

## `src/config`

Use `src/config` for shared app-wide configuration that is not environment-secret specific.

Example:

```txt
src/config/
├── navigation.ts
├── routes.ts
└── site.ts
```

Do not move component-owned constants into `src/config`.

Environment validation and environment variable access should live in `src/lib/env.ts` or a dedicated server-safe env module.

## `src/server`

Use `src/server` for server-only application code.

Example:

```txt
src/server/
├── auth/
├── db/
├── stripe/
├── google-calendar/
├── access-control/
├── audit/
└── notifications/
```

Server-only code must not be imported into client components.

Server-side concerns include:

- authentication helpers
- database access
- Stripe clients and webhook verification
- Google Calendar clients
- access-control checks
- audit logging
- secret handling
- server-side validation before payment/session creation

## Server And Client Boundaries

Use Server Components by default.

Add `"use client"` only when a component needs:

- state
- effects
- browser APIs
- event handlers
- client-only libraries

Do not mark a component as client-side just because it renders UI.

Do not import server-only code into client components.

## Public Assets

Use `public/` for static assets such as logos and icons.

Preferred structure:

```txt
public/
├── images/
│   └── brand/
│       ├── docapp-logo-full.png
│       ├── docapp-logo-icon.png
│       └── docapp-logo-cropped.png
└── favicon.ico
```

Do not create unrelated new logo assets unless the brand direction is intentionally revisited.

## Tests

Tests should live near the feature/component being tested.

Component tests should live inside the component folder:

```txt
src/components/ui/EmptyState/
├── index.tsx
├── types.ts
└── __tests__/
    └── EmptyState.test.tsx
```

Feature/domain tests may live in the feature folder:

```txt
src/features/availability/__tests__/generate-available-slots.test.ts
src/features/payments/__tests__/fulfill-checkout-session.test.ts
src/features/calendar/__tests__/map-appointment-to-google-event.test.ts
```

Shared test setup belongs in:

```txt
src/test/
```

## Import Expectations

Use section-level barrel imports for shared component sections.

Preferred:

```tsx
import { AppShell } from "@/components/layout";
import { EmptyState, Panel } from "@/components/ui";
```

Use feature-level imports for feature components.

Preferred:

```tsx
import { BookingFlow } from "@/features/booking/components";
```

Use relative imports inside the same component folder:

```tsx
import type { AppHeaderProps } from "./types";
import { APP_NAVIGATION_ITEMS } from "./constants";
```

Avoid importing shared components through deep implementation paths from unrelated areas.

## What Not To Do

Do not create files like this for meaningful reusable components:

```txt
src/components/layout/AppHeader.tsx
src/components/ui/EmptyState.tsx
src/components/ui/StatusRow.tsx
```

Use this instead:

```txt
src/components/layout/AppHeader/index.tsx
src/components/ui/EmptyState/index.tsx
src/components/ui/StatusRow/index.tsx
```

Do not define meaningful components like `Panel`, `EmptyState`, `StatusRow`, `Navbar`, or `AppHeader` inside `src/app/page.tsx`.

Do not put navigation arrays, status maps, limits, labels, or business rules inside page files.

Do not put shared React hooks inside `src/lib`.

Do not create one-off project structures per branch.
