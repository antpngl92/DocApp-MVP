# Google Calendar Flow

## Overview

DocApp creates Google Calendar events for confirmed appointments.

Google Calendar is an operational sync target, not the source of truth.

Google Calendar configuration should be built early in the MVP foundation so clinic resources/doctors can be mapped before booking behavior depends on it.

## Clinic And Google Account Relationship

The local `Organization` is the clinic profile and product source of truth for this single-clinic deployment. It is not the Google account.

For MVP:

- the deployed clinic may have one active connected Google account
- the connected Google account may expose multiple calendars
- each calendar may be mapped to an existing local doctor, resource/cabinet, or documented clinic-default purpose
- only authorized owner/admin roles may connect, disconnect, replace, or configure the clinic Google account and calendar mappings
- doctor, resource, service, availability, and booking settings remain local

Disconnecting Google Calendar must not delete or invalidate local clinic records. The integration can be reconnected or replaced while preserving local operations and history.

## Prototype Reference

The existing prototype already includes:

- a shared Google OAuth2 client
- refresh-token based server access
- calendar list fetching
- Google Calendar creation
- Google Calendar event insertion
- basic collision check before event insertion
- admin email notification when event creation fails
- a helper script for getting a refresh token

The rebuild can reuse this integration knowledge, but must correct these prototype issues:

- The OAuth route requests `calendar.readonly`, while calendar creation/event insertion requires write-capable scopes.
- Google Calendar event creation currently happens from the checkout success page.
- Google Calendar event IDs are not stored locally.
- Calendar sync status and retry state are not modeled.
- Failed sync only sends an admin email; it does not create durable retry state.
- Event payloads currently include more patient contact details than the MVP should place in Google Calendar.

Do not copy the prototype `Calendar` / `CalendarEvent` / `EventOrder` shape directly. The MVP should keep doctor/resource/service/availability/appointment/order data local-first, then map confirmed local appointments to Google events through integration and sync records. Google Calendar should fit the local model, not define it.

## Core Rule

Create Google Calendar events only after payment has been confirmed through the Stripe webhook or after an authorized clinic-side user creates or confirms a manual appointment.

Do not create final Google Calendar events for unpaid public booking attempts.

## Event Creation Timing

For public paid bookings:

1. Patient completes Stripe Checkout.
2. Stripe webhook marks order paid.
3. Stripe webhook marks appointment confirmed.
4. Calendar sync service creates Google Calendar event.
5. App stores external Google Calendar event ID.
6. App stores sync status.

For manual admin bookings:

1. Authorized clinic-side user creates appointment in the admin/control panel.
2. Appointment is confirmed, pay-at-clinic, paid externally, no-deposit-required, or internal/free depending on workflow.
3. Payment/order state is recorded separately from appointment state.
4. Calendar sync service creates or updates the Google Calendar event after authorized manual confirmation.
5. App stores sync status and external event ID.

Manual bookings do not require Stripe Checkout when the clinic marks the appointment as pay-at-clinic, paid externally, or no deposit required.

## Event Payload Privacy

Google Calendar event titles and descriptions must avoid sensitive medical information.

Preferred event title options:

```txt
Appointment - {Patient First Name}
Appointment #{Appointment Reference}
Booked appointment
```

Avoid including:

- symptoms
- diagnoses
- medical notes
- reason for visit if sensitive
- detailed patient health information

## Sync State

Store sync status locally:

```txt
not_created
created
failed
retry_pending
```

Do not use `calendar_sync_failed` as an appointment status. The appointment can remain `confirmed` while the calendar sync record is `failed`.

Store:

- external Google Calendar event ID
- last attempt timestamp
- last success timestamp
- error code/message
- retry count

## Failure Handling

If Google Calendar event creation fails after payment succeeds:

- do not mark payment failed
- do not cancel the appointment automatically
- keep the local appointment confirmed
- mark calendar sync failed
- notify admin
- provide admin retry action

## Cancellation Sync

When an appointment is cancelled by an authorized clinic-side user, DocApp should update Google Calendar consistently.

Depending on clinic policy and implementation phase, cancellation sync may:

- update the Google Calendar event title/description to indicate cancellation
- delete the Google Calendar event
- leave the event in place but mark local sync/action history

Paid appointments should remain visible in DocApp history even if the external Google Calendar event is updated or removed.

## Retry Rules

Retry should be idempotent.

Before creating a new Google Calendar event, check whether the appointment already has an external event ID.

If an event ID exists, avoid creating a duplicate unless the retry action explicitly handles missing/deleted external events.

## Calendar Configuration

Calendars may be configured per:

- doctor
- cabinet/resource
- clinic default

The exact MVP mapping should be documented in `data-model.md` and implemented consistently.

Provider account credentials/tokens should live in a server-side `GoogleAccountConnection` or equivalent connection record. Provider-specific calendar IDs and doctor/resource mappings should live in `CalendarIntegration`, `CalendarMapping`, or equivalent mapping records, not directly on `Doctor` or `Resource`. A doctor/resource can be mapped to one or more provider integrations over time without changing the core resource model.

The setup dependency order is:

1. Create/provision the local organization and authorized owner/admin membership.
2. Create local doctor and resource/cabinet records.
3. Connect the clinic Google account.
4. Discover/list calendars from that account.
5. Map calendars to local doctors/resources.
6. Configure local booking behavior for those doctors/resources.

## Safe Event Description

The event description may include operational details such as:

- appointment reference
- service name
- deposit paid flag
- remaining balance
- clinic-facing note if non-sensitive

Avoid medical detail and excessive personal data.

## Admin Recovery

Admin should be able to:

- see sync status
- see user-safe error summary
- retry failed sync
- copy appointment reference
- manually create calendar event if needed during early pilots
