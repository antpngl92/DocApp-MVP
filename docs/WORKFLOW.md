# DocApp Development Workflow

This document defines how features, fixes, and documentation changes should be implemented.

## Core Rule

Do not implement meaningful product or architecture changes directly on `main`.

Use a separate branch for each feature, fix, refactor, test, chore, or documentation update.

## Branch Naming

Do not use generic agent-generated branch prefixes such as:

- `codex/...`
- `ai/...`
- `agent/...`

Use one of the approved branch prefixes:

- `feature/...` for product features
- `fix/...` for bug fixes
- `docs/...` for documentation-only changes
- `test/...` or `tests/...` for test-only changes
- `refactor/...` for internal code restructuring without behavior changes
- `chore/...` for setup, tooling, configuration, dependency, or project maintenance work

Examples:

- `feature/clinic-admin-foundation`
- `feature/service-configuration`
- `feature/public-booking-flow`
- `feature/stripe-webhook-fulfillment`
- `feature/google-calendar-sync`
- `fix/pending-slot-expiry`
- `docs/update-payment-flow`
- `test/availability-generation`
- `refactor/booking-services`
- `chore/create-nextjs-app`
- `chore/prisma-setup`

Branch names should describe the task, not the tool that created them.

## Feature Workflow

For each feature:

1. Start from latest `main`.
2. Create a new branch.
3. Read the relevant docs.
4. Write or update the feature plan.
5. Implement the smallest useful slice.
6. Add or update focused tests for every new or changed component and every new or changed unit of application or business logic.
7. Run lint, typecheck, tests, and build where available.
8. Commit the changes.
9. Push the branch.
10. Open a PR/MR or review the diff before merging.

## Codex Workflow

When using Codex:

1. Ask Codex to inspect the repo and relevant docs first.
2. Ask Codex to propose a plan before editing.
3. Review the plan.
4. Let Codex implement only the approved scope.
5. Ask Codex to run available checks.
6. If Codex starts a local development server for checks, Codex must stop that server before handoff unless the user explicitly asks to keep it running.
7. Review the diff manually.
8. Commit and push only after review.

Codex should not make broad unrelated changes.

## Mandatory Pre-Handoff Checklist

Before handoff, Codex must verify and report:

- External docs checked for every touched external library/API, or state that no external library/API was touched.
- Layout semantics checked when UI/layout changed: one page-level `<main>`, no accidental nested page landmarks, global header/navigation outside `<main>`, and no nested full-viewport layout inside an existing shell unless intentionally documented.
- Focused tests added or updated for changed components/logic, or explain why not applicable.
- Checks run: lint, typecheck, tests, format, and build where appropriate.
- Dev server status: not started, or started and stopped.

## Documentation Updates

Before meaningful implementation work, read the relevant docs in `docs/`.

If the implementation changes product behavior, architecture, data flow, API behavior, access rules, payment behavior, Google Calendar behavior, privacy behavior, or user-facing workflow, update the relevant file under `docs/project-documentation/` before or alongside the code.

Examples:

- auth changes should update `docs/project-documentation/authentication.md`
- data model changes should update `docs/project-documentation/data-model.md`
- booking behavior changes should update `docs/project-documentation/booking-flow.md`
- Stripe changes should update `docs/project-documentation/payment-flow.md`
- Google Calendar changes should update `docs/project-documentation/google-calendar-flow.md`
- privacy/security changes should update `docs/project-documentation/security-privacy.md`
- UI direction changes should update `docs/project-documentation/ui-direction.md`

At handoff, list any documentation files that were updated. If no documentation update was needed, say why.

## Implementation Standards

Implementation branches must follow:

- `docs/project-documentation/project-structure.md`
- `docs/project-documentation/code-style.md`

Key expectations:

- keep route/page files thin
- move shell, layout, and navigation into reusable components
- use folder-per-component structure for meaningful reusable components
- use PascalCase component folders
- put component implementations in `index.tsx`
- put component prop types and component-specific types in `types.ts` when needed
- put component-only constants in `constants.ts` when needed
- put child components used only by one parent inside the parent component’s `components/` folder
- put component tests inside the component folder’s `__tests__/` folder
- use section-level barrel exports such as `src/components/layout/index.ts`
- component folders should default export their main component from `index.tsx`
- section barrel files should re-export public components as named exports
- move meaningful constants out of page components
- use arrow function components by default
- use explicit `Readonly` prop types
- use Server Components by default
- add `"use client"` only when needed
- keep shared React hooks in `src/hooks`
- keep feature-specific hooks inside the relevant feature folder
- do not put React hooks inside `src/lib`
- keep server-only code in `src/server`
- keep each branch scoped to the approved task

## External Library Rule

Before adding, changing, or using APIs from an external library, SDK, service package, or integration provider, check the relevant official documentation for the installed/current version whenever practical.

Do not substitute a homegrown or "equivalent" implementation when the library provides a documented component, helper, hook, middleware, or API for the behavior being implemented.

For external integrations such as Clerk, Stripe, Google Calendar, Prisma, Next.js, FullCalendar, email providers, and SuperDesign:

- prefer documented official APIs and examples over assumptions
- verify version-specific exports and props against installed package types or official docs
- document any intentional deviation from official guidance before implementing it
- keep secrets and server-only integration code out of client components

## Worktree Workflow

Use Codex Worktree mode for isolated feature work when possible.

Each worktree should focus on one task or feature.

Within an implementation phase, complete and hand off one `docs/TASKS.md` checklist task at a time unless the user explicitly approves a larger scope.

Good examples:

- implement Prisma schema foundation
- implement availability generation
- implement service configuration
- implement Stripe webhook fulfillment
- implement Google Calendar sync retry
- implement admin appointment table

Avoid giving one Codex worktree a vague task like:

- build the whole app
- implement all booking logic
- finish the MVP

## Commit Rules

Commits should be small and meaningful.

Use commit messages such as:

- `docs: define development workflow`
- `chore: create Next.js app`
- `feat: add clinic data model`
- `feat: add service configuration`
- `feat: add stripe webhook fulfillment`
- `fix: expire stale pending appointments`
- `test: add availability generation tests`

## Review Checklist

Before merging a branch, check:

- Does it match `docs/MVP.md`?
- Does it respect `docs/DECISIONS.md`?
- Does it update relevant documentation?
- Does it follow `docs/project-documentation/project-structure.md`?
- Does it follow `docs/project-documentation/code-style.md`?
- Are organization/clinic ownership checks enforced where relevant?
- Are errors handled clearly?
- Are payment states handled correctly?
- Are appointment states handled correctly?
- Are Google Calendar sync states handled correctly?
- Are secrets kept out of Git?
- Does Stripe fulfillment happen only through webhooks?
- Does the success page avoid mutating payment state?
- Does availability exclude confirmed and non-expired pending appointments?
- Are patient data and calendar payloads privacy-conscious?
- Do route/page files stay thin and compose reusable components?
- Are shell, layout, and navigation components outside route/page files?
- Are meaningful reusable components placed in their own PascalCase folders?
- Does each meaningful component use `index.tsx` as the component entry file?
- Are component prop types placed in `types.ts` when needed?
- Are component-only constants placed in `constants.ts` when needed?
- Are child components that belong only to one parent placed inside the parent component’s `components/` folder?
- Does every new or changed component have focused tests in its component folder’s `__tests__/` folder?
- Does every new or changed unit of application or business logic have focused tests?
- Do component folders default export their main component?
- Do section-level `index.ts` files re-export public components as named exports?
- Are imports using section barrel files where appropriate?
- Are external library APIs implemented with the provider's documented components, hooks, helpers, middleware, or SDK methods?
- If an external library's documented API was not used, is the deviation explicitly justified in docs or handoff notes?
- For layout-sensitive UI, do tests guard against invalid page landmarks or accidental nested `<main>` elements where practical?
- Are navigation data, status definitions, limits, labels, and meaningful constants outside page components?
- Are shared hooks placed in `src/hooks` instead of `src/lib`?
- Are feature-specific hooks kept inside the relevant feature folder?
- Does the branch stay scoped to the approved task without overbuilding unrelated product UI?
- Did lint/typecheck/tests/build run where available?
- If a local development server was started, was it stopped before handoff?

Documentation-only branches do not require tests. If a technical blocker prevents a required test, the task remains incomplete until the blocker is resolved or the user explicitly changes the requirement.

## Main Branch Rule

`main` should stay stable.

Only merge reviewed work into `main`.

## Task Checklist Updates

`docs/TASKS.md` is the master implementation checklist.

When a task is completed in a branch, the branch may update the relevant checkbox from `[ ]` to `[x]`.

A task is considered completed in a branch only when:

- the implementation exists in that branch
- the relevant checks were run, or Codex clearly explains why they could not be run
- the implementation matches the approved task scope
- the task is not only partially done

Rules:

- Only mark tasks as complete if they were actually implemented in the current branch.
- Do not mark future/planned tasks as complete.
- Do not mark a whole phase complete unless every item in the phase is complete.
- If implementation partially completes a task, leave it unchecked and add a note if needed.
