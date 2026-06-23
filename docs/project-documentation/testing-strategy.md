# Testing Strategy

## Standard

Every implementation task adds or updates focused tests for the code it changes. Repository coverage thresholds remain above 95% as configured; Phase 17 audits cross-feature gaps rather than postponing tests.

When a production symbol changes, search for and update every test, mock, fixture, and generated reference that uses it.

## Unit Coverage

Prioritize:

- admin/receptionist/patient authorization
- practice ownership and cabinet ownership guards
- cabinet-service assignment validation
- cabinet slot generation, duration, buffers, breaks, holidays, and timezone boundaries
- hold ownership, expiry, replacement, abuse limits, and conversion
- server-side price/deposit calculations
- appointment/payment/calendar state transitions
- Stripe webhook idempotency
- Google payload privacy and retry idempotency
- cancellation/refund authorization

## Component Coverage

Test role-aware dashboard navigation, cabinet/service forms, availability controls, public cabinet/service/time steps, hold states, checkout status states, patient ownership states, and manual booking controls.

Tests should assert behavior and accessible UI, not implementation details.

## Integration Coverage

Add integration tests for:

- Clerk identity sync and local membership authority
- receptionist invitation/acceptance
- patient registration/profile ownership
- practice/cabinet-scoped reads and mutations
- cabinet availability with appointments and holds
- hold-to-pending-appointment transaction behavior
- Stripe webhook fulfillment and duplicate delivery
- cabinet Google mapping and sync failure/retry
- notification idempotency
- manual booking and payment/appointment state separation

## Manual End-To-End Flow

1. Provision admin and sign in.
2. Invite and activate a receptionist.
3. Create Pleven and Pordim cabinets.
4. Create services and assign them to cabinets.
5. Configure different schedules for the two cabinets.
6. Optionally connect one Google account and map a distinct calendar to each cabinet.
7. As a public visitor, select Pordim and verify only its services/schedule appear.
8. Hold a slot and verify a second browser cannot hold/book it.
9. Verify changing slots releases/replaces the first hold.
10. Verify multiple tabs/IP limits cannot block all slots.
11. Register/sign in and confirm the hold survives the auth redirect.
12. Complete Stripe test payment.
13. Verify only the webhook marks the order paid and appointment confirmed.
14. Verify the event is created in the Pordim calendar, not Pleven.
15. Force calendar failure and verify the paid local appointment remains confirmed and retry works once.
16. Verify the patient sees only their own appointment.
17. Create a receptionist manual booking for Pleven and verify availability/payment states.
18. Verify receptionist cannot change practice, Stripe, Google, staff, or admin-only cabinet settings.
19. Verify cancellation policy and that patients cannot initiate refunds.

## Test Data

Use one practice, one admin, one receptionist, two cabinets with different schedules, several services with different cabinet assignments, two patients, and representative appointment/payment/sync states.

## Handoff Checks

Run the repository's lockfile install verification where relevant, lint, typecheck, unit/integration tests, coverage, build, and any focused E2E checks. If a dev server is started for verification, stop it before handoff and verify the process/port is no longer running.
