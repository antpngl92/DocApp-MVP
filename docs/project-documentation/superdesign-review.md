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

## Phase 7 Home Page Preparation

SuperDesign CLI access was confirmed for the project before starting homepage design work:

- CLI command: `superdesign.cmd`
- CLI version: `0.3.3`
- `superdesign.cmd --help` completed without an authentication error

Before generating homepage drafts, refresh or re-check `.superdesign/init/` context against the current app because the existing init snapshot was created earlier in the project and may not reflect the latest authenticated dashboard and patient-account route structure.

### Phase 7 Context Refresh

The `.superdesign/init/` files were refreshed before homepage draft generation to reflect the current MVP app structure:

- current marketing home route: `src/app/(marketing)/page.tsx`
- current public shell/header files: `PublicShell`, `AppShell`, `AppHeader`, `LanguageSelector`, `AuthControls`
- current placeholder homepage dependency tree
- current route map, including public, auth, patient, staff dashboard, doctor onboarding, and API routes
- current CSS token values from `src/app/globals.css`
- current extractable component candidates for SuperDesign, especially `AppHeader`

No homepage drafts were generated in this step.

### Phase 7 Homepage Explorations

```txt
Project: DocApp Phase 7 Home Page
Project ID: d8caa855-58d2-4fe0-8265-2d2779034123
Project URL: https://app.superdesign.dev/teams/77fd0ec7-d11c-4c10-b9a9-73e6904040a5/projects/d8caa855-58d2-4fe0-8265-2d2779034123
```

Ground-truth draft:

```txt
Draft: Current DocApp Home Page
Draft ID: c0d289fd-420a-4176-aca4-bc6598019d66
Preview: https://p.superdesign.dev/draft/c0d289fd-420a-4176-aca4-bc6598019d66
```

Generated explorations:

```txt
Draft: DocApp Homepage Exploration
Draft ID: 48f200a8-e6f9-4ae8-b4da-41b280401211
Preview: https://p.superdesign.dev/draft/48f200a8-e6f9-4ae8-b4da-41b280401211

Draft: DocApp | Home Mobile-First Exploration
Draft ID: 2e4c6a73-2405-4ebc-8758-3e70772173e3
Preview: https://p.superdesign.dev/draft/2e4c6a73-2405-4ebc-8758-3e70772173e3
```

Explored homepage sections/states:

- public marketing navbar
- primary booking CTA
- secondary support/learn-more CTA
- hero section with a configurable visual placeholder
- patient-facing booking value copy
- clinic-facing operations value copy
- deposit/remaining-balance messaging
- Google Calendar-aware operations messaging
- privacy-conscious appointment-management positioning
- footer/legal/support link areas
- admin-editable homepage marketing text areas, especially the large hero headline and supporting copy

Review notes before implementation:

- Neither exploration is approved for implementation yet.
- The desktop exploration has the stronger clinic-operations story and richer homepage section structure.
- The mobile-first exploration has useful compact CTA/nav treatment and better stacked mobile pacing.
- The desktop exploration introduced an unverified `80%` no-show metric. Do not implement invented statistics unless replaced with approved, sourced, or product-safe copy.
- The mobile-first exploration includes `Staff Login` footer copy. Do not expose staff/admin-specific account language on public marketing surfaces.
- Both explorations propose `Inter` via a Google Fonts import. Treat this as a theme proposal only; approve and document any font change before implementation.
- Booking CTA links must use the real route constant for the current booking placeholder, not generic `/booking`.
- Homepage implementation must not hardcode the large hero headline or other key marketing copy as permanent source-only text. Authorized admins should be able to change homepage marketing text through the approved content/settings model or a documented admin editing follow-up if the UI is not built in the same branch.
- The generated HTML remains design reference only and must be translated into maintainable Next.js components.

### Phase 7 Approved Theme Direction

Approved for Phase 7 implementation:

- Use the desktop homepage exploration as the primary structural baseline.
- Use the mobile-first exploration for responsive stacking, compact navbar behavior, and CTA pacing.
- Modernize beyond both drafts during implementation; the final page should feel more polished than the current foundation UI.
- Keep the calm clinical blue/green palette, but improve hierarchy through spacing, surfaces, stronger CTA treatment, and a more deliberate hero composition.
- Approve `Inter` as the target font direction, loaded through an approved app-level font strategy during implementation.
- Use a configurable hero visual area. The visual can be a generated bitmap-style product/clinic operations image, but must not imply diagnosis, treatment notes, prescriptions, or medical records.
- Use admin-editable homepage content for hero headline, supporting copy, key section copy, CTA labels, hero image URL, and hero image alt text.

Rejected or not approved:

- The current foundation panel grid as the final homepage design.
- The desktop exploration's invented `80%` no-show metric.
- The mobile exploration's `Staff Login` public footer copy.
- Generic `/booking` links instead of route constants.
- Heavy gradients, decorative blobs, marketplace-style doctor cards, ads, public refund-request copy, and medical-record-like copy.
