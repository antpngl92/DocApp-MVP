# Testing Strategy

## Overview

DocApp should use focused tests for business-critical logic and lightweight component tests for important UI behavior.

The highest-risk areas are availability generation, slot locking, payment webhook fulfillment, Google Calendar sync, authorization, and state transitions.

Focused tests must be added in the same task/branch as each new or changed component or unit of application/business logic. The final testing phase is for coverage auditing, cross-feature integration testing, manual E2E validation, and pilot hardening; it must not be used to defer feature tests.

Vitest coverage is required for implementation branches. Global statements, branches, functions, and lines coverage must stay at or above 95% for testable source modules. Do not lower coverage thresholds to make a branch pass; add focused tests or document a genuine untestable exception for user approval.

Coverage excludes generated files, test setup, Next route/page/layout wrappers, and framework glue that is better validated through integration or manual E2E checks. If those files gain meaningful business logic, move that logic into a testable module and cover it there.

## Unit Tests

Add unit tests for:

- availability generation
- service duration and buffer handling
- temporary slot hold creation
- one active temporary slot hold per anonymous browser/session
- previous temporary slot hold release/expiry when the same browser/session selects a different slot
- temporary anonymous slot hold token/session validation
- pre-login slot hold survival across registration/login redirect
- safe consumption of a validated pre-login hold when creating the authenticated patient's pending appointment
- temporary slot hold immediate release
- temporary slot hold expiration
- short hold conversion into pending-payment appointment lock
- pending appointment lock exclusion
- expired pending lock release
- concrete cleanup of stale holds and pending payments
- blocked time and holiday exclusion
- clinic timezone boundaries
- booking request validation
- manual booking authorization
- manual booking with existing patient account
- manual booking with manually entered patient contact details
- manual booking availability and override rules
- manual booking payment state separate from appointment state
- patient registration/login booking ownership
- stale or mismatched hold rejection after registration/login
- anonymous browser/session and IP-hash active hold limit enforcement
- patient profile update from booking contact details
- deposit/full price/remaining balance calculation
- appointment status transitions
- appointment status and calendar sync status separation
- order status transitions
- cancellation request policy rules
- admin-only refund permission checks
- refund status transitions
- Stripe webhook fulfillment idempotency
- notification idempotency
- Google Calendar payload mapping
- Google Calendar sync failure handling
- clinic Google account connection and organization ownership validation
- discovered calendar mapping to existing local doctor/resource records
- Google disconnect/reconnect without deleting local clinic records
- access-control helpers
- cross-patient data access denial
- public-safe status token/reference validation
- rate limiting or abuse prevention where practical

## Component Tests

Use React Testing Library for:

- booking form behavior
- service selection
- time-slot selection
- held-by-me and held-by-another-user slot states
- hold expiring/expired states
- appointment status badges
- payment status display
- admin appointment table filters
- empty/loading/error states

Do not write low-value tests that only assert implementation details.

## Integration Tests

Add integration tests where practical for:

- public booking server action/route
- Stripe webhook route with test fixture/signature strategy
- checkout success status loading
- Google Calendar retry server action
- admin appointment update actions
- manual admin booking action
- manual booking calendar sync after authorized confirmation
- patient appointment dashboard loading
- patient cancellation request action
- cleanup job/cron/service for expired holds and pending payments

## Manual E2E Test Plan

Before a pilot, manually test:

1. Create clinic.
2. Create doctor.
3. Create cabinet/resource.
4. Connect the clinic Google account as an authorized owner/admin.
5. Discover calendars and map them to the existing doctor/resource.
6. Create service with full price and deposit.
7. Configure weekday availability.
8. Open public booking page.
9. Select service/time.
10. Confirm short slot hold blocks the slot in another tab.
11. Register/log in as patient and confirm the selected hold survives the redirect.
12. Pay with Stripe test card.
13. Confirm webhook marks order paid.
14. Confirm appointment becomes confirmed.
15. Confirm Google Calendar event is created.
16. Confirm patient email is sent once.
17. Confirm patient account shows appointment/payment status.
18. Confirm admin can see payment/sync status.
19. Simulate failed Google Calendar sync and retry.
20. Simulate abandoned Checkout and pending expiry.
21. Confirm slot becomes available after expiry.
22. Confirm double booking is prevented.
23. Confirm patient cancellation request follows clinic policy and does not trigger refund.
24. Confirm admin-only refund flow.
25. Confirm cancel/no-show/admin flows.
26. Create manual booking from admin panel for an existing patient account.
27. Create manual booking from admin panel with entered patient contact details and no account.
28. Confirm manual bookings respect availability by default.
29. Confirm manual override requires authorized role and audit reason if enabled.
30. Confirm manual pay-at-clinic or paid-externally booking does not require Stripe Checkout.
31. Confirm manual confirmed booking creates or updates Google Calendar event.
32. Disconnect/reconnect the Google account and confirm local clinic records remain intact.

## Test Data

Use seed/demo data for:

- one organization/clinic
- one admin user
- two doctors
- two cabinets/resources
- several services
- sample availability rules
- sample appointments in different states

## Checks Before Handoff

When available, run:

- lint
- typecheck
- unit tests
- component tests
- coverage: `npm run test:coverage`
- build

If a command does not exist yet, say so in the handoff.
