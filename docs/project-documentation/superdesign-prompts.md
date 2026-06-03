# SuperDesign Prompts

This file provides DocApp-specific prompts for Phase 3 SuperDesign exploration.

Use these prompts in SuperDesign as design references. Generated output must be reviewed against `docs/MVP.md`, `docs/DECISIONS.md`, `docs/project-documentation/ui-direction.md`, and all payment/privacy rules before implementation.

## Base Style Prompt

```txt
Design a calm, trustworthy clinic booking SaaS interface for DocApp.

Product context:
DocApp helps small private clinics configure services, doctors, rooms, availability, appointment deposits, patient accounts, and Google Calendar sync. It is not a public doctor marketplace and not a medical-record system.

Visual direction:
Use a light neutral background, white/off-white surfaces, soft borders, restrained shadows, readable typography, muted clinical blue and green accents, and clear status badges. The interface should feel operational, reliable, and healthcare-adjacent without looking like a hospital records system.

Avoid:
ads, flashy marketplace styling, heavy gradients, decorative blobs, purple AI startup aesthetics, medical diagnosis imagery, chat/medical-record panels, and unnecessary visual noise.

Core UI rules:
Payment amounts must be obvious. Show "Deposit due now" and "Remaining balance at clinic." Patient cancellation is "Request cancellation", not "Cancel and refund." Calendar sync failure is a secondary sync state, not an appointment status.
```

## Public Booking Flow Prompt

```txt
Create a mobile-first public booking flow for DocApp using the approved calm clinic SaaS style.

Screens/states to include:
1. Clinic-branded booking page
2. Service selection where the patient chooses the service
3. Doctor/resource selection where the patient chooses a doctor/provider or resource that can perform the selected service
4. Date/time slot selection
5. Slot selected by current patient
6. Slot held by another patient
7. Current hold expiring soon with countdown/warning
8. Hold expired with clear recovery action
9. Patient login/register step while preserving the selected hold
10. Patient details review
11. Price review with full price, deposit due now, and remaining balance
12. Stripe Checkout handoff

Constraints:
Do not include medical records, symptoms, diagnosis fields, or ads. The optional note must be clearly non-sensitive. Use fewer day/time columns on mobile and more context on desktop.
```

## Booking Time Slot Picker Prompt

```txt
Create the Service and Time steps for the DocApp public booking flow.

Step 1 - Service:
The patient chooses a service, then chooses a doctor/provider or resource assigned to that service. Service cards should show duration, full appointment price, deposit due now, remaining balance at clinic, and assigned doctors/resources.

Step 2 - Time:
Create a calendar-style slot picker.

Step 1 and Step 2 must be separate wizard pages or must visually behave like separate wizard pages in a one-page wizard. Do not combine service selection and time selection into one screen.

Keep the public booking wizard stepper consistent with the accepted Details page direction:

- Service
- Time
- Details

Keep the booking header consistent with the accepted Details page direction: clinic logo/name plus simple `Services` and `About` navigation.

Desktop:
Show the current week. The first row is the days of the week from Monday to Sunday. Add arrow icon buttons on the left and right to move to previous/next week. Each day is a column. Under each day column, list all available slots as clickable slot buttons with the time text inside the slot.

Mobile:
Show exactly 3 columns instead of 7. The first column is today, the second is tomorrow, and the third is the day after tomorrow. Each column lists available slot buttons.

Slot states:
available, selected by current patient, held by another patient, current hold expiring soon, hold expired, no slots available.

Constraints:
Do not include booking fee, processing fee, platform fee, refund request, medical records, symptoms, diagnosis fields, chat, file uploads, ads, or rescheduling.
```

## Checkout Status Prompt

```txt
Create checkout status screens for DocApp.

States:
1. Payment pending
2. Deposit paid and appointment confirmed
3. Checkout cancelled
4. Checkout expired
5. Appointment confirmed but Google Calendar sync failed

Rules:
The success page is read-only and must not imply it finalizes payment. Make it clear that Stripe webhook/payment confirmation is the source of truth. Calendar sync failure must not imply the appointment is cancelled.

Copy to include:
"Deposit paid"
"Remaining balance at clinic"
"Appointment confirmed"
"Payment is still processing"
"Appointment is confirmed, but calendar sync failed"
```

## Patient Dashboard Prompt

```txt
Create a simple patient account dashboard for DocApp.

Focus:
upcoming appointments, past appointments, appointment status, payment/deposit status, remaining balance, cancellation policy, and request-cancellation action when clinic policy allows it.

Constraints:
Do not show medical records, prescriptions, diagnosis history, insurance workflows, chat, file uploads, treatment notes, clinic admin-only payment internals, or refund request actions.

Include:
An appointment detail state, empty upcoming appointments state, cancellation requested state, and manual booking attached to the patient account.
```

## Admin Dashboard Prompt

```txt
Create a desktop-friendly clinic admin dashboard for DocApp.

Dashboard cards:
today's bookings, upcoming bookings, pending payments, active slot holds, failed syncs, paid deposits, cancellations, and no-shows.

Views:
daily agenda, appointment table, failed Google Calendar sync alert, and appointment detail panel.

Rules:
Use dense but readable operational UI. Do not use marketing hero sections. Show appointment status, payment status, deposit paid, remaining balance, and calendar sync status separately.
```

## Manual Booking Prompt

```txt
Create an admin-only manual booking flow for DocApp.

Use case:
Authorized clinic staff creates an appointment for a patient who contacted the clinic by phone, message, or in person.

Flow:
1. Search/select existing patient account
2. Or enter minimal patient contact details: name, email, phone
3. Select service
4. Select doctor/resource
5. Select date/time
6. Show availability conflicts
7. Select payment mode: pay at clinic, paid externally, no deposit required, internal/free
8. Confirm booking
9. Show Google Calendar sync status

Rules:
Manual booking should respect availability by default. If override is allowed, show a warning and require a reason. Payment state must be separate from appointment state. Audit-sensitive actions should feel deliberate.
```

## Failed Calendar Sync Prompt

```txt
Create failed Google Calendar sync UI for DocApp.

Context:
The appointment is paid and confirmed locally, but Google Calendar event creation failed.

UI needs:
clear warning, appointment remains confirmed, failed sync badge, retry action for authorized staff, last attempt timestamp, safe error summary, and no sensitive medical details.

Do not:
show raw credentials, tokens, sensitive patient notes, or imply the booking is lost.
```

## Design Review Checklist

Use this checklist before accepting any generated design:

- Matches calm clinic SaaS direction.
- No ads.
- No medical-record features.
- No patient refund request action.
- Rescheduling is not introduced.
- Deposit due now and remaining balance are clear.
- Non-refundable default policy is visible where payment is shown.
- Appointment, payment, hold, and sync states are separate.
- Calendar sync failure does not cancel the appointment in the UI.
- Patient account is appointment-management only.
- Admin manual booking is clinic-side only.
- Mobile booking is usable.
- Admin dashboard is desktop-friendly.
- Status is not communicated by color alone.
- Generated HTML is treated as reference, not directly copied without adaptation.

