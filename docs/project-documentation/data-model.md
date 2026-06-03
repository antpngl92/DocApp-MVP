# Data Model

This document describes the intended DocApp MVP data model.

Model names are suggestions and may change during implementation, but the concepts should remain stable.

## Core Tenancy

## Prototype Schema Reference

The current prototype schema contains these models:

- `User`
- `Calendar`
- `CalendarSettings`
- `DayConfiguration`
- `CalendarEvent`
- `EventOrder`

These proved useful concepts, but they are not sufficient for the MVP rebuild as-is.

Important prototype gaps to correct:

- No `Organization` / `Clinic` tenant model.
- No membership or role model beyond Clerk metadata checks.
- No separate doctor model.
- No separate cabinet/resource model beyond `Calendar`.
- No service model; pricing is based on day configuration rate or fallback amount.
- No separate appointment lifecycle status.
- Payment status is stored on `EventOrder`, but appointment state and calendar sync state are not separated.
- No explicit pending lock expiration field.
- No stored Google Calendar event ID or durable calendar sync record.
- No notification log or audit/event log.

The rebuild should treat prototype `Calendar` roughly as evidence that a bookable resource/cabinet with a Google Calendar ID is useful, but the production-shaped model should use explicit organization, service, appointment, order, and sync records.

### Organization

Represents a clinic or business account.

Suggested fields:

- id
- name
- slug
- timezone
- defaultCurrency
- status
- createdAt
- updatedAt

### ClinicSettings

Stores configurable operational policy for the clinic.

Suggested fields:

- id
- organizationId
- timezone
- defaultCurrency
- shortSlotHoldMinutes
- pendingPaymentLockMinutes
- cancellationPolicy
- cancellationRequestCutoffMinutes
- refundPolicyText
- bookingRateLimitConfig
- createdAt
- updatedAt

Organization can keep simple default fields, but operational behavior should be centralized in clinic settings as it grows.

### User

Local user synced from Clerk.

Suggested fields:

- id
- clerkUserId
- email
- name
- createdAt
- updatedAt

### OrganizationMember

Connects users to organizations and roles.

Suggested fields:

- id
- organizationId
- userId
- role
- status
- createdAt
- updatedAt

### PatientProfile

Represents a patient account for booking and appointment management.

Suggested fields:

- id
- userId
- email
- name
- phone
- createdAt
- updatedAt

Patient profile data must stay minimal. Do not store medical records, symptoms, diagnoses, prescriptions, treatment notes, insurance data, chat history, or file uploads in MVP.

## Clinic Resources

### Doctor

Represents a doctor/practitioner.

Suggested fields:

- id
- organizationId
- userId
- organizationMemberId
- name
- email
- phone
- specialty
- isActive
- createdAt
- updatedAt

A doctor can exist as a clinic operational profile before the doctor registers. Once the doctor registers or accepts an invitation, link the doctor profile to the local `User` and/or `OrganizationMember`.

Receptionists, managers, and non-doctor staff can exist through `OrganizationMember` without a separate operational profile unless the product needs one later.

Patient users exist through `PatientProfile`, not `OrganizationMember`, unless a later implementation intentionally chooses a unified membership model.

### Resource / Cabinet

Represents a cabinet, room, office, or bookable calendar/resource.

Suggested fields:

- id
- organizationId
- name
- isActive
- createdAt
- updatedAt

The product can call this a cabinet/room in the UI while using a generic `Resource` model internally.

Google Calendar IDs should not live directly on `Resource`. Store provider-specific calendar mapping in `CalendarIntegration`.

### Service

Represents a bookable appointment type.

Suggested fields:

- id
- organizationId
- name
- description
- durationMinutes
- fullPriceCents
- depositAmountCents
- depositPercentage
- currency
- bufferBeforeMinutes
- bufferAfterMinutes
- isActive
- createdAt
- updatedAt

Use either fixed deposit amount or percentage. Start with fixed deposit amount if simpler.

### ServiceAssignment

Required join model that defines which doctor/resource/calendar combination can provide an active service.

Suggested fields:

- id
- organizationId
- serviceId
- doctorId
- resourceId

Each active service must have at least one valid bookable assignment. This prevents the booking flow from offering services that have no clinic-approved doctor/resource/calendar combination.

## Availability

### SlotHold

Represents a short temporary hold created when a patient selects a time slot before submitting the booking form.

Suggested fields:

- id
- organizationId
- serviceId
- doctorId
- resourceId
- patientProfileId
- userId
- sessionId
- startTime
- endTime
- timezone
- status
- token
- ipHash
- expiresAt
- releasedAt
- convertedAppointmentId
- createdAt
- updatedAt

Possible status values:

```txt
active
released
expired
converted
```

Hold duration should be configurable per clinic. Closing the booking modal/form should attempt immediate release, but expiry and cleanup are the source of truth. Before creating Checkout, the server must validate the hold token plus matching user/session/slot details.

If a hold is created before login/register, the hold token/session must survive the authentication redirect and then be safely attached to the authenticated patient before Checkout creation. A hold must not be attachable to a different user/session without server validation.

### AvailabilityRule

Represents recurring weekly availability.

Suggested fields:

- id
- organizationId
- doctorId
- resourceId
- weekday
- startTime
- endTime
- isActive
- createdAt
- updatedAt

Depending on implementation, availability may belong to a doctor, resource, or doctor-resource combination.

### AvailabilityException

Optional MVP/future model for closed days or one-off changes.

Suggested fields:

- id
- organizationId
- doctorId
- resourceId
- date
- startTime
- endTime
- type
- reason

### BlockedTime

Represents unavailable periods such as doctor vacation, clinic holiday, lunch break, sick day, cabinet maintenance, private blocked time, or internal meeting.

Suggested fields:

- id
- organizationId
- doctorId
- resourceId
- startsAt
- endsAt
- reason
- isActive
- createdAt
- updatedAt

## Appointments

### Appointment

Represents the local appointment after a temporary hold has been converted or after an authorized clinic-side user creates a manual booking.

Suggested fields:

- id
- organizationId
- serviceId
- doctorId
- resourceId
- patientProfileId
- createdByUserId
- createdByRole
- source
- patientName
- patientEmail
- patientPhone
- patientNote
- startTime
- endTime
- timezone
- status
- paymentMode
- visibleToPatient
- pendingExpiresAt
- paymentConfirmedAt
- cancellationRequestedAt
- cancellationRequestReason
- confirmedAt
- cancelledAt
- noShowAt
- completedAt
- createdAt
- updatedAt

Possible status values:

```txt
pending_payment
confirmed
cancel_requested
cancelled
expired
no_show
completed
```

Avoid storing sensitive health details in `patientNote`.

`slot_held` is a temporary booking UI/computed state derived from an active `SlotHold`. It does not have to be stored as `Appointment.status`. Appointments begin once a hold is converted into a `pending_payment` booking or when an authorized clinic-side user creates a manual confirmed/pay-at-clinic booking.

For manual bookings, `patientProfileId` can be set when staff selects an existing patient account. If staff only enters contact details, keep `patientProfileId` empty and store minimal `patientName`, `patientEmail`, and `patientPhone`. Later historical linking by email/phone can be added, but automatic linking is not required in MVP.

### AppointmentOrder

Represents payment/deposit state.

Suggested fields:

- id
- organizationId
- appointmentId
- status
- currency
- fullAmountCents
- depositAmountCents
- remainingAmountCents
- paymentMode
- paymentSource
- markedPaidByUserId
- stripeCheckoutSessionId
- stripePaymentIntentId
- stripeCustomerEmail
- paidAt
- cancelledAt
- expiredAt
- refundedAt
- refundRequiredAt
- refundReason
- refundIssuedByUserId
- refundStripeId
- createdAt
- updatedAt

Possible status values:

```txt
pending
paid
cancelled
expired
refunded
failed
```

## Google Calendar Sync

### CalendarIntegration

Stores Google Calendar configuration for an organization/resource/doctor.

Suggested fields:

- id
- organizationId
- doctorId
- resourceId
- googleCalendarId
- providerAccountId
- displayName
- isActive
- createdAt
- updatedAt

### CalendarSyncRecord

Stores sync state for an appointment.

Suggested fields:

- id
- organizationId
- appointmentId
- provider
- status
- externalEventId
- lastAttemptAt
- lastSuccessAt
- errorCode
- errorMessage
- retryCount
- createdAt
- updatedAt

Possible status values:

```txt
not_created
created
failed
retry_pending
```

## Notifications And Audit

### NotificationLog

Suggested fields:

- id
- organizationId
- appointmentId
- type
- recipient
- idempotencyKey
- status
- providerMessageId
- errorMessage
- sentAt
- createdAt
- updatedAt

Use `idempotencyKey` to prevent duplicate booking confirmations, cancellation notices, refund notices, and admin failure alerts.

### AuditEvent

Suggested fields:

- id
- organizationId
- actorUserId
- action
- targetType
- targetId
- metadata
- createdAt

Do not store unnecessary patient details in audit metadata.

## Indexes

Add indexes for:

- organizationId on all clinic-scoped models
- appointment start/end time
- appointment status
- order status
- Stripe Checkout Session ID
- Stripe Payment Intent ID
- Google external event ID
- notification idempotency key
- doctor/resource/date lookup for availability

## Ownership And Safety

Every clinic-scoped record should include `organizationId` unless it is globally shared.

Webhooks should resolve records by trusted internal IDs stored in metadata and verify that related records belong together.
