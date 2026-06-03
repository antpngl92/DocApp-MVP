# Testing Strategy

## Overview

DocApp should use focused tests for business-critical logic and lightweight component tests for important UI behavior.

The highest-risk areas are availability generation, slot locking, payment webhook fulfillment, Google Calendar sync, authorization, and state transitions.

## Unit Tests

Add unit tests for:

- availability generation
- service duration and buffer handling
- temporary slot hold creation
- temporary slot hold token/session/user validation
- pre-login slot hold survival across registration/login redirect
- safe attachment of pre-login hold to authenticated patient
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
4. Create service with full price and deposit.
5. Configure weekday availability.
6. Open public booking page.
7. Select service/time.
8. Confirm short slot hold blocks the slot in another tab.
9. Register/log in as patient and confirm the selected hold survives the redirect.
10. Pay with Stripe test card.
11. Confirm webhook marks order paid.
12. Confirm appointment becomes confirmed.
13. Confirm Google Calendar event is created.
14. Confirm patient email is sent once.
15. Confirm patient account shows appointment/payment status.
16. Confirm admin can see payment/sync status.
17. Simulate failed Google Calendar sync and retry.
18. Simulate abandoned Checkout and pending expiry.
19. Confirm slot becomes available after expiry.
20. Confirm double booking is prevented.
21. Confirm patient cancellation request follows clinic policy and does not trigger refund.
22. Confirm admin-only refund flow.
23. Confirm cancel/no-show/admin flows.
24. Create manual booking from admin panel for an existing patient account.
25. Create manual booking from admin panel with entered patient contact details and no account.
26. Confirm manual bookings respect availability by default.
27. Confirm manual override requires authorized role and audit reason if enabled.
28. Confirm manual pay-at-clinic or paid-externally booking does not require Stripe Checkout.
29. Confirm manual confirmed booking creates or updates Google Calendar event.

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
- build

If a command does not exist yet, say so in the handoff.
