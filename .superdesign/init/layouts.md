# Layouts

## Root Layout

- Path: `src/app/layout.tsx`
- Description: Next.js root layout. It provides Clerk, next-intl, global CSS, and the global toaster.

```tsx
<html lang={locale}>
  <body>
    <ClerkProvider
      signInUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      signInFallbackRedirectUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL}
      signUpFallbackRedirectUrl={publicEnv.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL}
    >
      <NextIntlClientProvider>
        {children}
        <AppToaster />
      </NextIntlClientProvider>
    </ClerkProvider>
  </body>
</html>
```

## Clinic Public Layout

- Path: `src/app/(public)/layout.tsx`
- Uses: `src/components/layout/PublicShell/index.tsx`
- Current scope: home page and support page.

```tsx
const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return <PublicShell>{children}</PublicShell>;
};
```

## Public Shell

- Path: `src/components/layout/PublicShell/index.tsx`
- Uses `PUBLIC_NAVIGATION` from `src/config/navigation.ts`
- Wraps children with `AppShell`.

```tsx
<AppShell contextLabel={contextLabel} navigation={PUBLIC_NAVIGATION}>
  {children}
</AppShell>
```

## App Shell

- Path: `src/components/layout/AppShell/index.tsx`
- Provides the public/patient page frame.
- Shows `AppHeader`, then a centered `main` container.
- Can optionally display the current authenticated user's name for patient pages.

```tsx
<div className="min-h-screen bg-[var(--background)]">
  <AppHeader
    contextLabel={contextLabel}
    currentUserName={currentUserName}
    navigation={navigation}
  />
  <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
    {children}
  </main>
</div>
```

## App Header

- Path: `src/components/layout/AppHeader/index.tsx`
- Public/patient header with DocApp mark, navigation links, Clerk auth controls, and language selector.
- Uses `CalendarHeart` icon as the current brand mark.
- Uses translations from `navigation`.

Current visual structure:

- white header
- bottom border
- max-width centered content
- DocApp icon/name on the left
- optional context label under brand name
- navigation links, auth controls, and language selector on the right

## Patient Shell

- Path: `src/components/layout/PatientShell/index.tsx`
- Uses `AppShell` with patient navigation, context label, and current user name.
- Not used for public homepage design.

## Admin/Dashboard Layout

- `src/app/(admin)/layout.tsx`
- `src/components/layout/AdminShell/index.tsx`
- `src/components/layout/DashboardSidebar/index.tsx`

Dashboard routes use a dedicated sidebar layout with no public/customer navbar. Keep this separate
from Phase 7 homepage design.

## Phase 7 Homepage Layout Direction

Phase 7 should create a polished public marketing homepage under the existing marketing route group.
Use the current `PublicShell`/`AppHeader` only as source context. The approved SuperDesign homepage
may require a refined public navbar and homepage-specific layout components.

