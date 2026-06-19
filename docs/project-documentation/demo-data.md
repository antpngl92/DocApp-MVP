# Demo And Pilot Data

This file defines safe demo data for local testing and pilot walkthroughs.

Do not use real patient data in seeds, screenshots, demos, or SuperDesign prompts.

## Demo Clinic

```txt
Clinic name: Sofia Care Clinic
Timezone: Europe/Sofia
Currency: BGN
Booking page slug: sofia-care
Contact email: hello@example-clinic.test
Contact phone: +359 2 000 0000
```

## Demo Roles

```txt
Owner: Clinic Owner
Manager: Clinic Manager
Receptionist: Front Desk
Doctor: Dr. Elena Petrova
Patient: Alex Ivanov
```

Use fake emails under reserved/example-style domains.

## Demo Resources

```txt
Room: Consultation Room 1
Room: Consultation Room 2
Calendar: Main Clinic Calendar
Calendar: Dr. Petrova Calendar
Calendar: Consultation Room 1 Calendar
```

## Demo Services

```txt
Service: Initial consultation
Duration: 30 minutes
Full price: 80 BGN
Deposit due now: 20 BGN
Remaining balance at clinic: 60 BGN

Service: Follow-up consultation
Duration: 20 minutes
Full price: 50 BGN
Deposit due now: 15 BGN
Remaining balance at clinic: 35 BGN

Service: Physiotherapy session
Duration: 45 minutes
Full price: 90 BGN
Deposit due now: 25 BGN
Remaining balance at clinic: 65 BGN
```

Every active demo service should have at least one valid bookable assignment.

## Demo Appointment States

Include examples for:

- pending payment
- confirmed with deposit paid
- confirmed with pay-at-clinic manual booking
- cancellation requested
- cancelled
- no-show
- completed
- confirmed with failed Google Calendar sync

## Demo Slot Hold States

Include examples for:

- available slot
- selected in this browser/session
- active hold in this browser/session
- this browser/session's hold expiring soon
- this browser/session's hold expired
- held by another browser/session
- pending payment lock

## Pilot Setup Checklist

Before a real pilot clinic uses DocApp:

- Confirm clinic legal/business name.
- Confirm clinic timezone.
- Confirm default currency.
- Confirm public booking page slug.
- Confirm clinic contact email and phone.
- Confirm owner/admin account.
- Confirm staff invitation process.
- Confirm doctors and resources.
- Confirm Google Calendar mapping strategy.
- Confirm services, durations, prices, deposits, and remaining balances.
- Confirm cancellation policy text.
- Confirm refund policy text.
- Confirm non-refundable deposit copy shown to patients.
- Confirm manual booking payment modes allowed for staff.
- Confirm whether manual override is allowed and which roles can use it.
- Confirm support/contact email.
- Run booking, payment, webhook, and calendar sync test in test mode.

## Admin Handoff Notes

Pilot clinic admins should understand:

- Patient bookings require deposit payment unless the clinic creates an approved manual booking mode.
- Checkout success pages are read-only status pages.
- Stripe webhooks confirm payment.
- Google Calendar events are created only after payment confirmation or authorized manual confirmation.
- If Google Calendar sync fails, the appointment remains confirmed locally and staff can retry sync.
- Patients can request cancellation only when clinic policy allows it.
- Patients cannot request or self-initiate refunds in DocApp.
- Refunds are privileged clinic-side actions and should be audited.
- Manual bookings can be attached to existing patient accounts or created with manually entered contact details.
- Medical records, diagnoses, prescriptions, chat, and file uploads are not part of the MVP.

