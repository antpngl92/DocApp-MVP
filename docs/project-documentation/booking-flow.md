# Booking Flow

## Overview

The booking flow is cabinet-centered. Patients choose where they want the appointment, then choose a service offered by that cabinet and an available time.

```txt
Cabinet -> Service -> Date and time -> Sign in/register -> Details -> Deposit -> Status
```

There is no separate provider-selection step in the target MVP.

## Public Patient Flow

1. Open the practice booking page.
2. Choose an active, booking-enabled cabinet.
3. Choose an active service assigned to that cabinet.
4. View server-generated availability for the cabinet/service.
5. Select a slot; the server creates a short anonymous hold.
6. Sign in or register if needed while preserving the hold token.
7. Confirm contact details and optional non-sensitive note.
8. Review cabinet/location, service, time, full price, deposit, remaining balance, and policies.
9. Server revalidates the hold, cabinet, assignment, price, and availability.
10. Convert the hold into a pending appointment/order.
11. Create and redirect to Stripe Checkout.
12. Stripe webhook confirms payment and the local appointment.
13. Create the event in the cabinet's mapped Google Calendar when configured.
14. Show local appointment/payment state on the status and patient account pages.

## Availability

Generate slots from:

- cabinet weekday rules
- cabinet breaks, blocked time, and holidays
- selected service duration and buffers
- confirmed appointments
- active temporary holds
- non-expired pending-payment appointments
- practice/cabinet timezone policy

Google Calendar is not the source of local availability rules. If external busy-time import is later approved, it must be reconciled explicitly and cannot silently replace local state.

## Temporary Holds

A persisted hold prevents concurrent visitors from taking the same cabinet/time. Polling updates public availability for MVP; WebSockets are not required for correctness.

The hold stores only cabinet/service/time, opaque anonymous ownership, lifecycle state, and expiry. It must not store patient contact or medical data.

Default protections:

- one active hold per anonymous browser/session
- selecting another slot releases/replaces the prior hold
- conservative active-hold limits by IP hash
- rate-limited hold creation
- immediate best-effort release when the form closes
- automatic expiry cleanup
- transaction/constraint-backed conversion

## Pending Payment Lock

After details are submitted, convert the short hold into a longer pending-payment appointment lock. This keeps the slot unavailable during Stripe Checkout and expires if payment is abandoned.

Payment status, appointment status, and calendar sync status remain separate.

## Manual Booking

Admin and authorized receptionist users can create a booking for a selected cabinet from the dashboard.

Manual booking may use an existing patient account or minimal entered contact details. It normally respects availability. It may be marked pay-at-appointment, paid externally, or no-deposit according to authorized workflow; payment state remains separate from appointment state.

After authorized confirmation, synchronize to the cabinet's mapped Google Calendar when configured.

## Cancellation

Patients may request cancellation only when practice policy permits. They cannot directly cancel/refund or initiate a refund. Admin handles privileged refund decisions; receptionists cannot issue money refunds by default.

Rescheduling remains outside MVP until explicitly approved.

## Privacy

The optional note must discourage symptoms, diagnoses, treatment information, or other medical details. Calendar payloads and notifications must contain only operational appointment information.

## Failure Rules

- unavailable or expired hold: return a clear error and refresh availability
- Stripe creation failure: keep local state recoverable and do not mark paid
- payment success page: read-only
- duplicate webhook: idempotent no-op after fulfillment
- Google sync failure: keep the paid appointment confirmed and expose retry to admin
