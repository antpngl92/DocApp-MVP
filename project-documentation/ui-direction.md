# UI Direction

## Product Feeling

DocApp should feel calm, trustworthy, clean, and operational.

It should not feel like a flashy marketplace, generic landing-page template, or ad-heavy consumer site.

## UI Principles

- Patient booking should be simple and mobile-friendly.
- Patient account screens should be simple, private, and appointment-focused.
- Admin screens should be clear and desktop-friendly.
- Payment/deposit amounts should be obvious.
- Remaining balance should be obvious.
- Appointment and sync statuses should be visible.
- Failure states should explain what happened and what to do next.
- Avoid clutter and unnecessary visual effects.
- Do not show ads on booking/admin pages.

## Patient Booking UI

The patient flow should emphasize:

- selected service
- doctor/resource if relevant
- available dates/times
- contact details
- full price
- deposit due now
- remaining balance at clinic
- cancellation/refund policy
- secure payment

Patients should register or log in before final booking submission and Checkout creation. The UI should make this feel like part of booking, not a heavy separate portal.

Mobile should show fewer days/time columns. Desktop can show a wider weekly view.

## Slot Hold UI States

The booking UI should clearly represent slot state:

- available
- selected by current patient
- held by current patient
- held by another patient
- hold expiring soon
- hold expired
- pending payment
- booking confirmed
- booking confirmed but calendar sync failed

If a slot is held by another patient, it should look unavailable without requiring a full page refresh. MVP can use polling to update this state.

If the current patient's hold is expiring soon, show a simple countdown or warning. If the patient closes the booking modal/form, release the hold immediately where possible. This immediate release is a convenience; the UI should still tolerate expiry-driven cleanup if the browser closes, network drops, or the user abandons the form.

## Patient Account UI

The patient account should emphasize:

- upcoming appointments
- payment/deposit status
- remaining balance
- clinic cancellation policy
- request-cancellation action when allowed
- appointment status
- Google Calendar sync status only when useful and understandable

Do not show medical-record, prescription, diagnosis, insurance, chat, or file-upload areas in MVP.

## Admin UI

The admin UI should emphasize:

- today's appointments
- upcoming appointments
- doctors/resources
- paid deposits
- remaining balances
- Google Calendar sync status
- failed sync alerts
- no-show/cancellation information

Use tables and cards where appropriate, but avoid dense enterprise UI before it is needed.

## SuperDesign Workflow

Use SuperDesign (`https://app.superdesign.dev/`) as the design exploration tool for important DocApp screens and states.

SuperDesign should be used to generate and compare options for:

- public booking page
- realtime/polling slot hold states
- selected slot state
- unavailable slot state
- locked-by-another-user state
- active hold countdown
- patient booking form
- Stripe Checkout handoff
- checkout success/status page
- checkout cancel/expired page
- patient account dashboard
- patient appointment detail page
- patient cancellation request state
- admin daily agenda
- admin appointment details page
- clinic dashboard
- failed Google Calendar sync state

SuperDesign output is not the source of product truth. The approved docs remain the source of truth, and generated designs must be reviewed before implementation.

Generated designs should follow DocApp's approved direction: calm medical SaaS interface, mobile-first patient booking, desktop-first admin workflows, clear deposit and remaining balance display, accessible contrast, readable typography, no ads in the booking flow, and no unnecessary health-sensitive details.

Do not port prototype Radix/shadcn components, old reusable UI components, or old color schemes as the new design foundation. SuperDesign should guide the new website/app design and color system.

## Status Design

Create clear visual states for:

- pending payment
- confirmed
- cancellation requested
- cancelled
- expired
- no-show
- completed
- payment paid
- payment pending
- calendar sync created
- calendar sync failed
- retry pending

Status labels should be consistent across booking status pages and admin pages.

Do not treat `calendar sync failed` as an appointment status. It can be displayed as a secondary sync state beside a confirmed appointment.

## Forms

Forms should be readable and direct.

Service/admin forms should avoid putting too many unrelated settings in one long page. Use panels/sections for:

- basic details
- pricing/deposit
- duration/buffer
- availability/assignment
- status

## Copy Direction

Use concrete language:

- “Deposit due now”
- “Remaining balance at clinic”
- “Appointment confirmed”
- “Calendar sync failed — retry”
- “This slot is no longer available”

Avoid vague language:

- “booking fee”
- “processing thing”
- “something went wrong” without context

## Branding

A final brand direction can be refined later. For MVP, keep the UI neutral and professional.

Recommended direction:

- light background
- white/off-white cards
- soft borders
- muted clinical blue/green accent
- readable typography
- spacious forms
- clear primary buttons

## Accessibility

- Use semantic buttons and labels.
- Keep form labels visible.
- Ensure status is not communicated by color alone.
- Keep contrast sufficient.
- Make mobile booking usable with thumb-friendly controls.
