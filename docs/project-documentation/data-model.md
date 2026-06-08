# Data Model

This document describes the intended DocApp MVP data model.

Model names are suggestions and may change during implementation, but the concepts should remain stable.

## Single-Clinic Deployment Model

DocApp MVP is deployed per clinic. Each clinic has its own application deployment, database, Prisma configuration, and integration credentials.

The local `Organization` record is the clinic profile and product source of truth for that deployment. It is not one tenant in a shared multi-clinic database, and it is not a Google account.

Use `organizationId` on clinic-owned records as a local ownership and consistency boundary. Do not build cross-clinic switching, shared-database multi-tenant queries, or multiple active clinic memberships for one local user in the MVP.

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

- No local `Organization` / `Clinic` profile model.
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

Represents the clinic profile for this deployment.

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

An organization is the local clinic product source of truth. It does not represent a Google account. The clinic may connect a Google account through integration records after authorized membership, doctor, and resource records exist.

### User

Local user synced from Clerk.

Suggested fields:

- id
- clerkUserId
- email
- name
- createdAt
- updatedAt

`clerkUserId` must be unique. Clerk `user.created` and `user.updated` webhooks should upsert this model by `clerkUserId`, making repeated webhook deliveries safe. The local `User` record proves identity mapping only; clinic-side access still comes from `OrganizationMember`, and patient ownership still comes from `PatientProfile` plus appointment ownership fields.

### OrganizationMember

Connects a local staff user or pending staff invitation to the clinic and a clinic-side role.

Suggested fields:

- id
- organizationId
- userId, nullable while an invitation is pending
- role
- status
- invitedEmail
- createdAt
- updatedAt

Suggested roles:

```txt
owner
admin
manager
receptionist
doctor
```

Suggested statuses:

```txt
invited
active
disabled
removed
```

The MVP deployment supports one clinic. A linked local `User` should have at most one `OrganizationMember` record in that deployment. Pending invitations may exist without a linked user until Clerk creates/syncs the user.

Patients are not organization members. Patient access is represented through `PatientProfile` and patient-owned appointment records.

For staff invitations, the implementation may either use a separate `StaffInvitation` / `OrganizationInvitation` model later or represent pending access through `OrganizationMember.status = invited`.

Suggested invitation tracking fields:

- organizationId
- invitedEmail
- intendedRole
- status
- clerkInvitationId
- clerkInvitationStatus
- invitedByUserId
- acceptedByUserId
- expiresAt
- createdAt
- updatedAt

Clerk invitation metadata may contain organization, invitation/membership, and intended-role references, but local invitation or membership records remain the source of truth for role and access.

For trusted initial owner/admin bootstrap, Clerk private metadata may contain `docapp.bootstrapRole = owner | admin`. This metadata is a one-time server-side bootstrap hint only. Once an `OrganizationMember` exists for the local user, role and status changes must be controlled by local database state and audited application workflows, not continuous metadata sync.

### PatientProfile

Represents a patient account for booking and appointment management.

Suggested fields:

- id
- userId, unique
- email
- name
- phone
- createdAt
- updatedAt

Patient profile data must stay minimal. A patient profile is owned by one local `User` and must not grant clinic-side staff permissions. Do not store medical records, symptoms, diagnoses, prescriptions, treatment notes, insurance data, chat history, or file uploads in MVP.

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

### GoogleAccountConnection

Stores the clinic-owned Google account connection and server-side authorization state.

Suggested fields:

- id
- organizationId
- provider
- providerAccountId
- credential/token reference or encrypted token fields
- grantedScopes
- connectionStatus
- lastRefreshedAt
- createdAt
- updatedAt

For MVP, one organization may have one active connected Google account. Keep provider credentials/tokens server-side. The model should remain extensible so a clinic can reconnect or support additional provider accounts later.

### CalendarIntegration / CalendarMapping

Stores an individual discovered Google Calendar reference and its optional mapping to an organization/resource/doctor.

Suggested fields:

- id
- organizationId
- googleAccountConnectionId
- doctorId
- resourceId
- googleCalendarId
- displayName
- isActive
- createdAt
- updatedAt

Each discovered calendar may be mapped to a local doctor, a local resource/cabinet, or an explicitly documented clinic-default purpose. Keep calendar mappings separate from local doctor/resource settings. Disconnecting or replacing a Google account must not delete the organization, doctors, resources, services, availability rules, appointments, or booking policies.

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
- actorUserId, nullable for trusted system/provider events
- action
- targetType
- targetId, nullable when the target is not yet local or not applicable
- metadata, optional JSON
- createdAt

Audit events should support identity sync, membership creation/removal, invitation lifecycle, role changes, trusted owner/admin provisioning, and later sensitive appointment/payment actions. Index by clinic/time, actor, action, and target lookup.

Do not store unnecessary patient details, secrets, raw webhook payloads, or credential material in audit metadata.

## Indexes

Add indexes for:

- organizationId on all clinic-scoped models
- organization membership lookup by organizationId + userId
- organization staff list filtering by organizationId + status
- organization staff list filtering by organizationId + role
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
