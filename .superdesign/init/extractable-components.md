# Extractable Components

## Summary

The MVP now has reusable shell/layout components that can be useful as SuperDesign reusable
components. Basic UI primitives remain simple enough to keep inline in drafts.

Do not extract old prototype UI components.

## Strong Candidates For Extraction

### Public App Header

- Source: `src/components/layout/AppHeader/index.tsx`
- Purpose: Public/patient top navigation with DocApp mark, navigation links, auth controls, and language selector.
- Relevant props for a SuperDesign component:
  - `contextLabel`
  - `currentUserName`
  - `activeItem`
  - `homeHref`
  - `bookingHref`
  - `supportHref`
  - `showAuthControls`
  - `showLanguageSelector`

Use for Phase 7 homepage design if SuperDesign component extraction is helpful.

### Dashboard Sidebar

- Source: `src/components/layout/DashboardSidebar/index.tsx`
- Purpose: Staff dashboard sidebar with role-specific items, collapse state, selected item, and logout.
- Not relevant to Phase 7 homepage design.
- Keep available for later dashboard design work.

## Usually Keep Inline In Drafts

- `src/components/ui/PageIntro/index.tsx`
- `src/components/ui/FoundationPanel/index.tsx`
- `src/components/ui/EmptyState/index.tsx`
- `src/features/auth/components/AuthControls/index.tsx`
- `src/components/i18n/LanguageSelector/index.tsx`

These are simple enough to reproduce inline in SuperDesign drafts unless a later design flow needs
strict reuse.

## Phase 7 Extraction Guidance

For the homepage, prefer passing source files as context first. Extract `AppHeader` only if the
SuperDesign draft workflow needs a reusable navbar across multiple home/marketing variations.

