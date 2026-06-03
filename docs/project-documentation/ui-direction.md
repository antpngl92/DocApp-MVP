# UI Direction

This file defines the approved DocApp UI direction before app screens are implemented.

SuperDesign can be used for visual exploration, but these docs remain the product source of truth. Generated UI must be reviewed against this file before implementation.

## Product Feeling

DocApp should feel calm, trustworthy, clean, and operational.

It should not feel like a flashy marketplace, generic landing-page template, experimental AI product, or ad-heavy consumer site.

## Visual Direction

Use a neutral healthcare-adjacent SaaS direction:

- light background
- white or off-white surfaces
- soft borders
- restrained shadows
- readable typography
- muted clinical blue and green accents
- clear primary actions
- quiet warning colors for payment, hold expiry, and sync failure
- compact but breathable admin layouts

Avoid:

- heavy gradients as the main visual identity
- decorative blobs, bokeh, or unrelated illustrations
- purple-heavy AI startup styling
- dark, flashy, or marketplace-style UI
- ad placements anywhere in the app
- medical imagery that implies diagnosis, treatment notes, or clinical records

## UI Principles

- Patient booking should be simple and mobile-friendly.
- Patient account screens should be simple, private, and appointment-focused.
- Admin screens should be clear and desktop-friendly.
- Payment/deposit amounts should be obvious.
- Remaining balance should be obvious.
- Appointment, payment, hold, and sync statuses should be visible.
- Failure states should explain what happened and what the user can do next.
- Status should never be communicated by color alone.
- Route/page files should stay thin once UI is implemented.
- Do not port prototype Radix/shadcn UI components or old reusable UI components.

## SuperDesign Workflow

Use SuperDesign (`https://app.superdesign.dev/`) for Phase 3 design exploration before Phase 4 app screens are implemented.

Based on SuperDesign documentation, the workflow should be:

1. Start with a style prompt to lock the DocApp visual direction.
2. Generate multiple variations for the key screen group.
3. Review variations against product, payment, privacy, and accessibility rules.
4. Once visual direction is approved, use SuperDesign Flow for connected user journeys.
5. Export or copy HTML only as design reference, not as unquestioned production code.
6. Translate approved designs into maintainable Next.js components that follow `project-structure.md` and `code-style.md`.

SuperDesign output must not override:

- Stripe webhook-only payment finalization
- Google Calendar creation after payment/manual confirmation only
- clinic and patient data scoping
- minimal patient data collection
- no medical records in MVP
- no ads
- no patient-initiated refunds
- rescheduling out of scope

## Required SuperDesign Explorations

Create and review explorations for:

- public booking page
- service and slot selection
- slot held by current patient
- slot held by another patient
- hold expiring soon
- hold expired
- patient booking form
- login/register during booking while preserving a hold
- Stripe Checkout handoff
- checkout success/status page
- checkout cancel/expired page
- patient dashboard
- patient appointment detail
- patient cancellation request state
- admin clinic dashboard
- admin daily agenda
- admin appointment details
- manual booking flow
- failed Google Calendar sync state

## Patient Booking UI

The patient flow should emphasize:

- clinic identity
- selected service
- doctor/resource if relevant
- available dates and times
- current slot hold state
- patient contact details
- full price
- deposit due now
- remaining balance at clinic
- cancellation/refund policy
- secure payment handoff

Patients should register or log in before final booking submission and Checkout creation. The UI should make this feel like part of booking, not like a separate heavy portal.

Mobile booking should show fewer days and fewer time columns. Desktop can show a wider weekly view when useful.

## Slot Hold UI States

The booking UI should clearly represent:

- available
- selected by current patient
- held by current patient
- held by another patient
- hold expiring soon
- hold expired
- pending payment
- booking confirmed
- booking confirmed with calendar sync failed

If a slot is held by another patient, it should look unavailable without requiring a full page refresh. MVP can use polling to update this state.

If the current patient's hold is expiring soon, show a simple countdown or warning. If the patient closes the booking modal/form, release the hold immediately where possible. This immediate release is a convenience; the UI must still tolerate expiry-driven cleanup if the browser closes, network drops, or the user abandons the form.

`slot_held` is a computed UI state from an active `SlotHold`. It is not required to be an appointment status.

## Payment And Policy Copy

Use clear copy:

- "Full appointment price"
- "Deposit due now"
- "Remaining balance at clinic"
- "Deposit paid"
- "Payment pending"
- "This deposit is non-refundable by default if you do not attend."
- "Clinics choose policy text appropriate to their business and jurisdiction."
- "Request cancellation"

Avoid:

- "booking fee"
- "cancel and refund"
- "refund request" in patient flows
- vague error messages such as "Something went wrong" without context

## Status Design

Create consistent labels and badges for appointment states:

- pending payment
- confirmed
- cancellation requested
- cancelled
- expired
- no-show
- completed

Create consistent labels and badges for payment states:

- payment pending
- deposit paid
- checkout expired
- refunded
- paid externally
- pay at clinic
- no deposit required

Create consistent labels and badges for calendar sync states:

- calendar not created
- calendar created
- calendar sync failed
- retry pending

Do not treat `calendar sync failed` as an appointment status. Display it as a secondary sync state beside the appointment state.

## Patient Account UI

The patient account should emphasize:

- upcoming appointments
- past appointments
- payment/deposit status
- remaining balance
- clinic cancellation policy
- request-cancellation action when allowed
- appointment status

Do not show:

- medical records
- prescriptions
- diagnosis history
- insurance workflows
- chat
- file uploads
- treatment notes
- clinic admin-only payment internals

Manual bookings can appear in the patient dashboard when attached to that patient account and visibility rules allow it.

## Admin UI

The admin UI should emphasize:

- today's appointments
- upcoming appointments
- active slot holds
- pending payments
- paid deposits
- remaining balances
- doctors/resources
- failed Google Calendar syncs
- cancellation requests
- no-shows

Admin pages should favor tables, daily agenda views, filters, and dense but readable information. Avoid marketing-style hero sections inside the admin app.

Pilot dashboard cards should include:

- today's bookings
- upcoming bookings
- pending payments
- active slot holds
- failed syncs
- paid deposits
- cancellations
- no-shows

## Manual Booking UI

Manual booking should be clearly clinic-side only.

The admin manual booking flow should support:

- selecting an existing patient account
- entering patient name, email, and phone when no patient account exists
- selecting service, doctor/resource, date, and time
- showing availability conflicts
- showing payment mode options such as pay at clinic, paid externally, no deposit required, or internal/free
- warning and reason capture if an authorized override is allowed
- showing calendar sync status after manual confirmation

Manual booking payment state must stay separate from appointment state.

## Empty, Loading, And Error States

Use calm, specific states:

- Empty dashboard: no appointments today.
- Empty patient account: no upcoming appointments yet.
- Empty service list: create the first service before enabling booking.
- Loading availability: checking available times.
- Slot conflict: this slot is no longer available.
- Checkout error: payment setup failed; try again or contact the clinic.
- Calendar sync failure: appointment is confirmed, but calendar sync failed and can be retried by staff.

## Forms

Forms should be readable and direct.

Service/admin forms should use sections for:

- basic details
- pricing and deposit
- duration and buffer
- availability and assignment
- status

Keep labels visible. Do not rely only on placeholders.

## Accessibility

- Use semantic buttons and labels.
- Keep form labels visible.
- Ensure contrast is sufficient.
- Make mobile booking usable with thumb-friendly controls.
- Ensure status is not communicated by color alone.
- Keep destructive and financial actions visually distinct and confirmed.
