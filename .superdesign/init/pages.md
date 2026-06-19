# Pages

## `/` Home Page

Entry: `src/app/(marketing)/page.tsx`

Current dependencies:

- `src/app/layout.tsx`
- `src/app/globals.css`
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

Current render summary:

- `MarketingLayout` renders `PublicShell`.
- `PublicShell` renders `AppShell` with public navigation.
- `AppShell` renders `AppHeader`, then centered `main`.
- `AppHeader` renders the DocApp icon/name, public navigation, Clerk auth controls, and language selector.
- The page renders `LocalizedFoundationOverview` using `HOME_PANEL_DEFINITIONS`.
- `LocalizedFoundationOverview` renders `FoundationOverview`.
- `FoundationOverview` renders `PageIntro` plus two `FoundationPanel` cards.

Current content summary:

- Eyebrow: "Clinic booking foundation"
- Title: "Booking that clinics can trust"
- Description: "A focused foundation for clinic booking, appointment deposits, and recoverable Google Calendar sync."
- Panels: "For patients" and "For clinics"

Phase 7 goal:

- Replace the placeholder foundation view with a polished SuperDesign-approved homepage.
- Keep the public navbar but refine it as needed.
- Add a primary booking CTA to `ROUTES.bookingDemo`.
- Do not implement the full booking flow in Phase 7.

## `/support`

Entry: `src/app/(marketing)/support/page.tsx`

Uses the same public shell and foundation overview pattern as `/`, with support-specific translated
copy.

## `/booking/sofia-care`

Entry: `src/app/(public)/booking/[clinicSlug]/page.tsx`

Current dependencies:

- `src/app/(public)/booking/[clinicSlug]/page.tsx`
- `src/features/app-foundation/components/LocalizedFoundationOverview/index.tsx`
- `src/features/app-foundation/constants.ts`

Current status:

- Placeholder route foundation only.
- Full booking flow is later and must not be implemented during Phase 7.

## `/account`

Entry: `src/app/(patient)/account/page.tsx`

Protected patient account foundation. Uses `PatientShell`, not public homepage layout.

## `/dashboard`

Entry: `src/app/(admin)/dashboard/page.tsx`

Protected staff dashboard foundation. Uses `AdminShell` and `DashboardSidebar`, not public homepage
layout.

## Phase 7 SuperDesign Context Rule

When generating homepage drafts, use the full dependency list under `/` plus:

- `.superdesign/design-system.md`
- `docs/MVP.md`
- `docs/DECISIONS.md`
- `docs/project-documentation/ui-direction.md`
- `docs/project-documentation/superdesign-integration.md`

