# SuperDesign Review

This file records the Phase 3 SuperDesign exploration for DocApp.

SuperDesign output is design reference only. Approved implementation must still follow `docs/MVP.md`, `docs/DECISIONS.md`, `docs/project-documentation/project-structure.md`, and `docs/project-documentation/code-style.md`.

## Project

```txt
Project: DocApp MVP Phase 3
Project ID: dd109293-d402-4aeb-9a9a-a570186b40be
Project URL: https://app.superdesign.dev/teams/77fd0ec7-d11c-4c10-b9a9-73e6904040a5/projects/dd109293-d402-4aeb-9a9a-a570186b40be
```

## Generated Drafts

### Public Booking Flow And Slot Holds

```txt
Draft: Updated Sofia Care Clinic Booking Summary
Draft ID: a02a067d-c6ea-4e08-9cf9-87fe98c7b22d
Preview: https://p.superdesign.dev/draft/a02a067d-c6ea-4e08-9cf9-87fe98c7b22d
```

Coverage:

- clinic-branded public booking flow
- service summary
- doctor/provider summary
- patient details form
- selected appointment date/time
- active slot hold warning
- slot state reference
- full appointment price
- deposit due now
- remaining balance at clinic
- non-refundable deposit copy
- Stripe Checkout handoff

Review notes:

- First generated version included `Booking processing`, which conflicted with the decision to avoid booking-fee/platform-fee language.
- The draft was updated in place to remove booking/processing/platform fee wording.
- Follow-up implementation should convert the slot state reference into actual booking-flow UI states rather than a visible reference panel.

### Booking Service And Time Steps

```txt
Draft: Sofia Care Clinic Booking Flow - Step 1 & 2
Draft ID: fc9ef42e-5d2d-4247-94f7-0dc860c89db5
Preview: https://p.superdesign.dev/draft/fc9ef42e-5d2d-4247-94f7-0dc860c89db5
```

Coverage:

- Service step where the patient chooses a service
- doctor/provider or resource selection for the chosen service
- service cards with duration, full appointment price, deposit due now, and remaining balance at clinic
- Time step with desktop weekly calendar view
- Monday-to-Sunday desktop columns
- previous/next week arrow icon buttons
- available slots listed as clickable time-slot buttons under each day
- mobile Time step with exactly three columns: today, tomorrow, and day after tomorrow
- available, selected, held, expiring, and no-slot states

Review notes:

- This draft is rejected structurally because it combines Step 1 Service and Step 2 Time into one screen.
- It also changed the header/stepper direction away from the accepted Details page visual baseline.
- The calendar view itself is accepted as a useful visual reference.
- Do not use this draft as the primary Service/Time implementation reference.

### Booking Step 1 - Service

```txt
Draft: Sofia Care Clinic - Step 1: Service Selection
Draft ID: cc293109-1124-41b6-a804-36a3aa977597
Preview: https://p.superdesign.dev/draft/cc293109-1124-41b6-a804-36a3aa977597
```

Coverage:

- separate Service wizard page
- accepted Details-page header direction
- simple `Services` and `About` navigation
- three-step `Service / Time / Details` wizard stepper
- service cards
- provider/resource selection
- duration, full appointment price, deposit due now, and remaining balance at clinic
- booking summary panel
- primary next action to choose time

Review notes:

- This draft should be used as the primary visual reference for Step 1.
- Do not include date/time slots on Step 1.
- Do not add phone-number navigation unless explicitly approved later.

### Booking Step 2 - Time

```txt
Draft: Sofia Care Clinic - Booking Step 2
Draft ID: 2935972f-988e-4cb8-ae21-4cb3703230c1
Preview: https://p.superdesign.dev/draft/2935972f-988e-4cb8-ae21-4cb3703230c1
```

Coverage:

- separate Time wizard page
- accepted Details-page header direction
- simple `Services` and `About` navigation
- three-step `Service / Time / Details` wizard stepper
- accepted calendar slot-picker visual direction
- desktop weekly view with Monday-to-Sunday columns
- previous/next week arrow icon buttons
- slot buttons with time text inside
- available, selected, held, expiring, and no-slot states
- booking summary panel
- primary next action to patient details

Review notes:

- This draft should be used as the primary visual reference for Step 2.
- The desktop Time step should use seven day columns.
- The mobile Time step should use exactly three day columns: today, tomorrow, and day after tomorrow.
- Do not include service cards or patient detail forms on Step 2.

### Checkout Status Pages

```txt
Draft: Clinic Checkout Status - Sofia Care Clinic
Draft ID: 97747020-590b-48ad-a4b9-cef36c615263
Preview: https://p.superdesign.dev/draft/97747020-590b-48ad-a4b9-cef36c615263
```

Coverage:

- payment pending
- deposit paid and appointment confirmed
- checkout cancelled
- checkout expired
- appointment confirmed with Google Calendar sync failed
- separate appointment, payment, and calendar sync states
- read-only status-page direction

Review notes:

- Keep the page read-only during implementation.
- Do not let status pages mutate order, payment, appointment, or calendar state.
- Calendar sync failure must remain a secondary sync status beside a confirmed appointment.

### Patient Dashboard And Appointment Detail

```txt
Draft: DocApp Patient Appointment Dashboard
Draft ID: c938d4b8-49c0-44a5-a448-ccc8dc600702
Preview: https://p.superdesign.dev/draft/c938d4b8-49c0-44a5-a448-ccc8dc600702
```

Coverage:

- upcoming appointments
- past appointments
- appointment detail panel
- appointment status
- payment/deposit status
- remaining balance at clinic
- cancellation policy
- request-cancellation state
- empty patient appointment state

Review notes:

- Patient dashboard direction is appointment-management only.
- Do not add medical-record, prescription, diagnosis, insurance, chat, file-upload, refund-request, or rescheduling UI during implementation.
- Manual bookings may appear only when attached to the patient account and visibility rules allow it.

### Admin Dashboard, Daily Agenda, Appointment Detail, Manual Booking, Failed Sync

```txt
Draft: DocApp Clinic Admin Dashboard
Draft ID: 01b8bb1b-0c25-4091-b043-9e0922888eca
Preview: https://p.superdesign.dev/draft/01b8bb1b-0c25-4091-b043-9e0922888eca
```

Coverage:

- clinic dashboard cards
- today's bookings
- upcoming bookings
- pending payments
- active slot holds
- failed syncs
- paid deposits
- cancellations
- no-shows
- daily agenda
- appointment table
- appointment detail panel
- failed Google Calendar sync alert and retry action
- admin-only manual booking flow
- manual booking with existing patient or manually entered contact details
- manual booking payment mode states
- override warning/audit direction

Review notes:

- Admin direction should remain desktop-friendly and operational.
- Do not introduce marketing hero layouts inside the admin app.
- Manual booking payment state must stay separate from appointment state.
- Calendar sync retry must not imply appointment cancellation.

## Automated Scope Scan

The generated drafts were scanned for obvious prohibited copy:

- `booking fee`
- `processing fee`
- `platform fee`
- `refund request`
- `Cancel and refund`
- `medical record`
- `diagnosis`
- `prescription`
- `insurance`
- `chat`
- `file upload`
- `reschedule`
- `ads`
- `Advertisement`

After updating the booking draft and adding the corrected separate Service and Time drafts, no scanned prohibited terms remained in the generated HTML.

## Implementation Implications

Phase 4+ implementation should:

- use the generated designs as reviewed UI references
- treat the separate Step 1 Service and Step 2 Time drafts as the public booking implementation references
- treat the combined Step 1 & 2 draft as rejected except for its calendar visual direction
- create new rebuild components rather than porting prototype components
- preserve separate appointment, payment, slot hold, and calendar sync states
- keep page files thin
- keep labels/status maps outside page files
- avoid external design shortcuts that conflict with the approved docs
- avoid direct copying of generated HTML when it would violate project structure or code style

## Open Questions

- Which visual direction from the generated drafts should be treated as the primary implementation baseline?
- Should admin manual booking override be disallowed in MVP or owner/admin-only?
- Should demo data become actual seed data in a later phase, or remain docs-only until the data model exists?
