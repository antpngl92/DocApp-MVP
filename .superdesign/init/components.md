# Components

## Summary

DocApp now has a small rebuild component set under `src/components` plus feature-specific
components under `src/features`. These are new MVP components, not old prototype UI.

Do not port prototype Radix/shadcn wrappers, old reusable UI components, ad components, or
prototype payment/calendar shortcuts.

## Component Library

- Framework: React
- Meta-framework: Next.js App Router
- CSS approach: Tailwind CSS v4 via `@tailwindcss/postcss` and `src/app/globals.css`
- Component library: no general-purpose component library is used
- Icon package: `lucide-react`
- Auth UI: Clerk unstyled/headless button components where appropriate
- Calendar UI dependency available for later booking workflows: `@fullcalendar/*`

## Shared UI Components

### Feedback

- `src/components/feedback/AppToaster/index.tsx`
- `src/components/feedback/GlobalErrorState/index.tsx`
- `src/components/feedback/LoadingState/index.tsx`

### I18n

- `src/components/i18n/LanguageSelector/index.tsx`

The language selector is a compact top-nav dropdown with a `Languages` icon and language
abbreviations from `src/i18n`.

### Layout

- `src/components/layout/AppShell/index.tsx`
- `src/components/layout/AppHeader/index.tsx`
- `src/components/layout/PublicShell/index.tsx`
- `src/components/layout/PatientShell/index.tsx`
- `src/components/layout/AdminShell/index.tsx`
- `src/components/layout/DashboardSidebar/index.tsx`

For Phase 7 homepage design, the most relevant layout components are:

- `PublicShell`
- `AppShell`
- `AppHeader`
- `LanguageSelector`
- `AuthControls`

`AdminShell` and `DashboardSidebar` are staff dashboard-specific and should not appear on the
public homepage.

### Basic UI

- `src/components/ui/PageIntro/index.tsx`
- `src/components/ui/FoundationPanel/index.tsx`
- `src/components/ui/EmptyState/index.tsx`

The current homepage still uses the foundation placeholder components. Phase 7 should replace
the homepage experience with a polished SuperDesign-approved marketing page rather than extending
the placeholder card grid.

## Feature UI Components Relevant To Current Pages

- `src/features/app-foundation/components/FoundationOverview/index.tsx`
- `src/features/app-foundation/components/LocalizedFoundationOverview/index.tsx`
- `src/features/auth/components/AuthControls/index.tsx`
- `src/features/auth/components/AccountSignIn/index.tsx`
- `src/features/auth/components/PatientRegistration/index.tsx`
- `src/features/dashboard/components/DashboardPlaceholder/index.tsx`
- `src/features/doctor-profile/components/DoctorProfileOnboardingForm/index.tsx`
- `src/features/doctor-profile-approval/components/PendingDoctorApprovals/index.tsx`
- `src/features/staff/components/StaffInvitationForm/index.tsx`

## Phase 7 Homepage Context Files

Pass these implementation files as SuperDesign context when designing the homepage:

- `.superdesign/design-system.md`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(marketing)/layout.tsx`
- `src/app/(marketing)/page.tsx`
- `src/components/layout/PublicShell/index.tsx`
- `src/components/layout/AppShell/index.tsx`
- `src/components/layout/AppHeader/index.tsx`
- `src/components/i18n/LanguageSelector/index.tsx`
- `src/features/auth/components/AuthControls/index.tsx`
- `src/features/app-foundation/components/LocalizedFoundationOverview/index.tsx`
- `src/features/app-foundation/components/FoundationOverview/index.tsx`
- `src/components/ui/PageIntro/index.tsx`
- `src/components/ui/FoundationPanel/index.tsx`
- `src/features/app-foundation/constants.ts`
- `src/config/navigation.ts`
- `src/config/routes.ts`
- `src/config/site.ts`
- `src/i18n/messages/en.json`

Also pass the product/design docs listed in `docs/TASKS.md` Phase 7:

- `docs/MVP.md`
- `docs/DECISIONS.md`
- `docs/project-documentation/ui-direction.md`
- `docs/project-documentation/superdesign-integration.md`

