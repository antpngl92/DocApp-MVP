# Booking Flow

## Overview

The booking flow lets a patient choose a service, doctor/cabinet, available slot, register or log in, confirm contact details, and pay an appointment deposit through Stripe Checkout.

The booking flow creates local state before payment, but the appointment is not confirmed until Stripe webhook fulfillment succeeds.

## Prototype Reference

The existing prototype booking flow already demonstrates:

- public `/booking` page
- active calendar/cabinet selection
- responsive slot display with fewer days on mobile and a wider desktop view
- weekday availability rules through `DayConfiguration`
- slot duration and buffer time
- local appointment creation before Stripe Checkout
- local order creation before Stripe Checkout
- Stripe Checkout redirect
- checkout success and cancel pages

Do not carry forward these prototype limitations:

- Slot availability is generated mostly client-side and must be revalidated server-side before Checkout.
- Pending bookings do not have explicit expiration.
- Payment success currently mutates local state from the success page.
- Google Calendar event creation currently runs from the success page.
- Pricing is daily-rate based; the MVP should be service/deposit based.
- Patient-facing optional text areas must discourage medical details.

## Patient Flow

1. Patient opens public booking page.
2. Patient selects service.
3. Patient selects doctor and/or cabinet/resource.
4. App displays available dates and time slots.
5. Patient selects a slot.
6. Server creates a short temporary slot hold.
7. Patient registers/logs in if not already authenticated.
8. Patient confirms or updates name, email, phone, and optional non-sensitive note.
9. App shows full appointment price, deposit due now, remaining balance, cancellation policy, and non-refundable deposit policy.
10. Patient submits the form.
11. Server validates the anonymous slot hold token/session and revalidates availability and price/deposit.
12. Server creates pending appointment and pending order.
13. Server converts the short slot hold into a longer pending-payment appointment lock.
14. Server creates Stripe Checkout Session.
15. Browser redirects to Stripe Checkout.
16. Stripe webhook confirms payment.
17. Appointment becomes confirmed.
18. Google Calendar sync runs.
19. Patient sees success/status page and receives confirmation.
20. Appointment appears in the patient account.

If the slot hold is created before login/register, the anonymous hold token/session must survive the authentication redirect. After authentication, the server consumes the validated hold when creating the pending appointment for the authenticated patient. The server must reject stale, mismatched, expired, or already-converted holds.

## Pending Appointment Creation

When creating a booking attempt, create:

- local `Appointment` with `status = pending_payment`
- local `AppointmentOrder` with `status = pending`
- `pendingExpiresAt` on the appointment

The pending appointment acts as the longer payment-stage slot lock.

Recommended durations:

- short slot hold: 2-5 minutes
- pending-payment lock: 15-30 minutes

Both durations should be configurable per clinic.

## Temporary Slot Holds

When a patient clicks/selects an available time slot, DocApp should immediately create a temporary slot hold.

For MVP, slot hold updates should start with polling every few seconds. WebSockets may be evaluated later for faster UI updates, but WebSockets would only notify clients about hold changes. They do not replace the persisted `SlotHold` record, because the database lock is the source of truth for double-booking prevention, expiry, conversion, and cleanup.

Slot hold requirements:

- hold duration is configurable per clinic
- selected slot becomes unavailable to other users quickly
- other open tabs/devices should see the slot as unavailable through polling
- closing the booking modal/form attempts to release the hold immediately
- release on modal close is best-effort; expiry and cleanup are the source of truth
- abandoned holds expire automatically
- submitting the form converts the hold into a pending-payment appointment
- failed or abandoned Checkout eventually releases the slot through expiration
- hold token/session ownership must be validated before booking submission without storing patient or contact details on the hold
- pre-login anonymous hold tokens must survive login/register redirects and be consumed safely when creating the authenticated patient's pending appointment
- one anonymous browser/session should normally have only one active hold at a time
- when the same browser/session selects a different slot, release or expire its previous active hold before creating the new one
- one anonymous browser/session/IP should not be able to hold many slots at once
- IP-hash based active hold limits should use a conservative MVP default, such as a small number of active holds per IP hash, to reduce abuse without blocking shared networks too aggressively

Slot states to support in UI:

- available
- selected in this browser/session
- held by this browser/session
- held by another browser/session
- hold expiring soon
- hold expired
- pending payment
- confirmed

## Server-Side Revalidation

Before creating a Checkout Session, the server must re-check:

- organization/clinic exists and is active
- service exists and is active
- doctor/resource exists and is active
- service belongs to the organization
- doctor/resource belongs to the organization
- selected slot is still available
- submitted SlotHold exists, is active, is not expired, matches slot/service/doctor/resource, and belongs to the current anonymous hold token/session
- pending locks do not conflict
- price/deposit are calculated from server-side service data

Do not trust client-provided prices, durations, or deposit amounts.

## Availability Exclusions

Available slots must exclude:

- confirmed appointments
- non-expired pending appointments
- active temporary slot holds
- inactive services/doctors/resources
- closed/unavailable hours
- blocked time and holidays
- unavailable doctor/cabinet periods
- buffer windows around appointments where applicable

Expired pending appointments should no longer block availability.

## Pending Cleanup

Cleanup must not rely only on browser redirects.

Use a concrete cleanup path:

- periodic job/cron/server task expires stale `SlotHold` records
- periodic job/cron/server task expires stale `pending_payment` appointments and pending orders
- `checkout.session.expired` webhook marks matching pending order/appointment expired when possible
- booking availability generation ignores expired holds and expired pending-payment locks

## Timezone Policy

Availability rules are interpreted in the clinic timezone. Store appointment start/end consistently and display patient/admin/doctor appointment times in clinic timezone unless a later decision adds per-user timezone display.

## Optional Patient Note

The optional note should be labeled carefully:

> Optional note for the clinic. Do not include medical details, symptoms, or sensitive information here.

This keeps the MVP outside medical-record scope.

## Success Page

The checkout success page should:

- read the Stripe session ID or local order reference
- fetch local order/appointment status
- show pending/confirmed/failed sync states
- optionally poll or refresh while webhook fulfillment is processing
- use a public-safe reference/token and never expose another patient's appointment details

The success page must not:

- mark orders paid
- confirm appointments
- create Google Calendar events

## Cancel Page

The cancel page should:

- show that checkout was cancelled or not completed
- fetch local order/appointment status if possible
- optionally mark a still-pending order/appointment as cancelled when safe

The cancel page must not be the only cleanup path.

## Patient Cancellation Requests

Patient cancellation behavior should be configurable per clinic.

Supported policy options:

- patient can request cancellation only N days/hours before the appointment
- patient can request cancellation anytime
- patient cannot request cancellation

Patients should request cancellation; they should not directly cancel confirmed appointments without clinic-side rules being applied.

Patient cancellation requests must not create refund requests automatically. Deposits are non-refundable by default unless an authorized admin explicitly issues or records a refund.

Rescheduling is out of scope unless explicitly added later.

## Manual Receptionist Booking

Manual bookings should be created by authorized clinic-side users inside the admin/control panel. This supports patients who contact the clinic outside the public booking flow, such as by phone, message, or in person.

Manual booking permissions are role and scope based:

- admin can create and review manual bookings clinic-wide
- receptionist can create manual bookings and review booking details for each doctor
- doctor can create manual bookings and review booking details only for their own linked `Doctor` profile
- patient cannot access manual booking workflows

Receptionists cannot edit doctor profiles, doctor booking settings, clinic settings, staff invitations, or calendar mappings. Doctors cannot perform admin-only actions or manage another doctor's bookings/settings.

Supported patient cases:

- existing patient account: staff can search/select an existing patient account from a dropdown or patient search field
- no patient account: staff can manually enter name, email, and phone

When an existing patient account is selected, the booking should be attached to that account so the patient can later see it in their patient dashboard if appointment visibility rules allow it.

When no patient account exists, the appointment should still be stored locally and linked to the clinic, doctor/resource, service, and appointment time. If the patient later creates an account using the same email/phone, the app may support linking that historical appointment later, but automatic linking is not required in MVP unless explicitly added.

Possible payment modes:

- pay at clinic
- deposit paid externally
- no deposit required
- internal/free appointment
- online payment link if added later

Manual bookings should not require Stripe Checkout when the clinic marks the booking as pay-at-clinic, paid externally, or no deposit required.

Manual bookings should still respect availability unless an authorized admin intentionally overrides.

Manual bookings should clearly track payment state separately from appointment state. Manual confirmed/pay-at-clinic bookings can trigger Google Calendar event creation after authorized manual confirmation.

Manual booking creation, payment marking, override, and cancellation actions should be audited.

Manual override should require:

- explicit permission
- visible warning about the conflict
- required override reason
- audit event

## Edge Cases

- Patient pays but closes tab before success page: webhook still confirms appointment.
- Patient opens success page before webhook completes: show processing state.
- Patient abandons Checkout: pending appointment expires.
- Two patients try same slot: server-side validation and pending locks prevent duplicate confirmation.
- Google Calendar sync fails: booking remains paid/confirmed locally and admin can retry sync.
