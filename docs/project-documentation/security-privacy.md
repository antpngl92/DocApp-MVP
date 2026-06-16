# Security And Privacy

## Overview

DocApp handles healthcare-adjacent booking data, patient contact information, appointment payments, and calendar sync. The MVP should collect minimal patient data and avoid medical-record scope.

MVP deployment is single-clinic: each clinic has its own app deployment and database. Still keep local clinic ownership explicit with `organizationId` where records belong to the clinic so server checks and future migrations stay clear.

## Privacy Principles

- Collect only what is needed for booking and payment.
- Avoid medical details in MVP.
- Do not store symptoms, diagnoses, documents, prescriptions, insurance data, or medical history.
- Do not put sensitive details in Google Calendar.
- Do not put sensitive details in Stripe metadata.
- Keep secrets server-side only.
- Enforce local organization/clinic ownership everywhere.
- Enforce patient ownership for patient account pages and appointment status pages.

## Patient Data In MVP

Allowed MVP patient data:

- name
- email
- phone
- selected service
- selected doctor/resource/time
- payment/order status
- optional non-sensitive note

Patient accounts are in MVP, but only for appointment management. They must not become medical records.

Manual admin-created bookings may store the same minimal contact details when a patient account does not exist. If an existing patient account is selected, access still depends on patient ownership and appointment visibility rules.

Avoid collecting:

- medical symptoms
- diagnoses
- treatment details
- medical files
- prescriptions
- insurance numbers
- national IDs unless explicitly required and legally reviewed

## Cancellation And Refund Boundaries

Patients may be allowed to request cancellation only according to clinic policy.

Supported clinic policy options:

- cancellation request allowed only N days/hours before appointment
- cancellation request allowed anytime
- cancellation request not allowed

Patients must not be able to request or self-initiate refunds through the app. Refunds are clinic-side privileged actions only.

Patient-facing pages and emails should clearly state that the online deposit is non-refundable by default if the patient does not attend.

The default non-refundable deposit behavior is a product default, not universal legal advice. Clinics are responsible for choosing policy text appropriate to their business and jurisdiction.

## Optional Note Copy

Use copy such as:

> Optional note for the clinic. Do not include medical details, symptoms, diagnoses, or sensitive information here.

## Google Calendar Privacy

Google Calendar event titles/descriptions must be minimal.

Do not include symptoms, diagnoses, or medical notes.

## Stripe Privacy

Stripe metadata should contain internal references only, such as:

```txt
appointmentOrderId
organizationId if needed
```

Do not include medical details or long patient notes.

## Secrets

Never commit:

- `.env` values
- local credential JSON files such as `Google Calendar API Credentials.json`
- Clerk secrets
- Stripe secret keys
- Stripe webhook secrets
- Google client secrets
- Google refresh tokens
- database URLs
- Resend/API email keys

## Authorization

Every clinic-scoped query and mutation must check organization membership and role.

Public booking routes must only expose availability and booking actions that are safe for public use.

Patient routes must check that the signed-in user owns the patient profile or appointment being accessed. A patient must never be able to access another patient's appointments, payment status, cancellation request, or contact details by changing an ID in the URL.

Checkout status pages should use a public-safe reference or token. Do not expose raw internal IDs where that would allow enumeration.

Admin routes must require authenticated users with membership.

Manual booking creation must require an authorized clinic-side user. Receptionists and doctors should only get the actions their role allows. Manual override of availability or double-booking rules, if allowed, should require elevated admin permission, a visible warning, an override reason, and audit logging.

Webhook routes must verify provider signatures and never trust arbitrary user input.

Clerk user-sync webhooks must verify with the Clerk/Svix signing secret before touching the local `User` table. The handler may create or update identity fields only; it must not assign clinic roles, activate staff membership, or mutate appointment/payment records from Clerk payload data alone.

## Audit Logging

Audit important actions:

- service price/deposit changes
- availability changes
- appointment creation/cancellation
- manual booking creation
- manual booking payment marking
- manual booking availability override
- no-show/completed status changes
- payment/order status changes
- Google Calendar sync retries
- admin role/membership changes
- refund actions
- patient cancellation requests

Keep audit metadata minimal and avoid unnecessary patient details.

Audit metadata must not store secrets, raw provider credential material, raw webhook payloads, medical details, or long patient notes. Prefer stable internal IDs, short reason codes, before/after role/status values, and user-safe summaries.

## Rate Limiting

Add basic rate limiting where appropriate:

- public booking submission
- temporary slot hold creation/release
- checkout session creation
- public checkout/status token lookups
- admin login-sensitive workflows if relevant
- webhook endpoint monitoring/logging

Prevent one user/session/IP from holding many slots at once. CAPTCHA can be considered later if abuse appears, but basic abuse prevention should be planned from the MVP.

## Production Checklist

Before pilot:

- verify all sensitive env values are server-only
- verify no patient health details are stored in calendar events
- verify webhook signature verification works
- verify admin data is clinic-scoped
- verify logs do not leak secrets or sensitive patient data
- verify privacy policy and cancellation/refund policy exist
- verify patient ownership checks on patient account pages
- verify public status references cannot be enumerated
- verify rate limits or abuse controls around slot holds and Checkout creation
