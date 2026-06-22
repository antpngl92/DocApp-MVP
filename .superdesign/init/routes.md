# Routes

## Framework

DocApp uses Next.js App Router with `src/app`.

## Public Routes

| URL path | File path | Rendering | Notes |
| --- | --- | --- | --- |
| `/` | `src/app/(public)/page.tsx` | Server component | Clinic patient homepage. |
| `/support` | `src/app/(public)/support/page.tsx` | Server component | Public support/contact foundation. |
| `/booking/sofia-care` | `src/app/(public)/booking/[clinicSlug]/page.tsx` | Server component | Booking route placeholder. Full booking flow is later. |
| `/checkout/success` | `src/app/(public)/checkout/success/page.tsx` | Server component | Read-only checkout status placeholder. |
| `/checkout/cancel` | `src/app/(public)/checkout/cancel/page.tsx` | Server component | Read-only checkout status placeholder. |
| `/checkout/expired` | `src/app/(public)/checkout/expired/page.tsx` | Server component | Read-only checkout status placeholder. |
| `/checkout/status/[reference]` | `src/app/(public)/checkout/status/[reference]/page.tsx` | Server component | Read-only checkout status placeholder. |
| `/sign-in` | `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Server component with Clerk UI | Account login. |
| `/sign-up` | `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Server component with Clerk UI | Public account registration. |
| `/auth/after` | `src/app/(auth)/auth/after/page.tsx` | Server/client redirect handoff | Post-auth role-aware redirect. |

## Private Patient Routes

| URL path | File path | Notes |
| --- | --- | --- |
| `/account` | `src/app/(patient)/account/page.tsx` | Protected patient account foundation. |

## Private Staff Dashboard Routes

| URL path | File path | Notes |
| --- | --- | --- |
| `/dashboard` | `src/app/(admin)/dashboard/page.tsx` | Protected staff dashboard root. |
| `/dashboard/staff` | `src/app/(admin)/dashboard/staff/page.tsx` | Admin-only staff members foundation. |
| `/dashboard/notifications` | `src/app/(admin)/dashboard/notifications/page.tsx` | Staff notifications placeholder. |
| `/dashboard/logs` | `src/app/(admin)/dashboard/logs/page.tsx` | Admin logs placeholder. |
| `/dashboard/manual-booking` | `src/app/(admin)/dashboard/manual-booking/page.tsx` | Manual booking placeholder. |
| `/dashboard/settings` | `src/app/(admin)/dashboard/settings/page.tsx` | Booking settings placeholder. |
| `/dashboard/profile` | `src/app/(admin)/dashboard/profile/page.tsx` | Staff profile placeholder. |
| `/dashboard/schedule` | `src/app/(admin)/dashboard/schedule/page.tsx` | Receptionist schedule placeholder. |
| `/dashboard/onboarding/doctor-profile` | `src/app/(doctor-onboarding)/dashboard/onboarding/doctor-profile/page.tsx` | Required doctor profile onboarding. |

## API Routes

| URL path | File path | Notes |
| --- | --- | --- |
| `/api/health` | `src/app/api/health/route.ts` | Smoke/health endpoint. |
| `/api/clerk/webhook` | `src/app/api/clerk/webhook/route.ts` | Clerk webhook endpoint. |

## Route Constants

Route constants live in `src/config/routes.ts`.

Public route constants:

- `home`
- `bookingDemo`
- `checkoutSuccess`
- `checkoutCancel`
- `checkoutExpired`
- `checkoutStatusDemo`
- `signIn`
- `signUp`
- `postAuth`
- `support`

Private route constants:

- `dashboard`
- `dashboardLogs`
- `dashboardManualBooking`
- `dashboardNotifications`
- `dashboardProfile`
- `dashboardSchedule`
- `dashboardSettings`
- `dashboardStaff`
- `doctorProfileOnboarding`
- `patientAccount`

## Phase 7 Route Scope

Phase 7 should implement only `/` as the polished public home page. It may link to the existing booking
placeholder route through the CTA, but it must not implement the full booking flow.

