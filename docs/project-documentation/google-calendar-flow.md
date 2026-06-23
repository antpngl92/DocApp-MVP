# Google Calendar Flow

## Overview

Google Calendar is an optional synchronization target. Local practice, cabinet, availability, appointment, and payment records remain authoritative.

Bookings must work without Google integration. A disconnected or failing Google account must not erase or invalidate local appointments.

## Account And Calendar Model

For MVP, one practice may connect one active Google account. That account can contain multiple calendars, normally one calendar per cabinet.

Store separately:

- the practice-owned Google account connection and refresh credentials
- discovered calendar references
- explicit cabinet-to-calendar mappings
- per-appointment sync records and external event IDs

Do not model the practice as a Google account or attach calendar IDs to a separate provider profile. Map calendars explicitly to cabinets.

## Configuration Flow

1. Admin connects the practice Google account through a server-side OAuth flow.
2. Server stores/refreshes credentials securely.
3. Server lists calendars visible to the connected account.
4. Admin maps each cabinet to the intended calendar.
5. Local cabinet settings continue to define services and availability.

Only admin may connect, disconnect, replace, or map calendars. Receptionists may see safe sync status where operationally useful but cannot manage credentials/mappings.

## Event Timing

Create an event only after:

- Stripe-webhook-confirmed payment, or
- authorized manual appointment confirmation.

Never create the final event from slot selection, hold creation, Checkout creation, success-page loading, or client-side payment claims.

## Payload

Use operational, non-sensitive content:

- safe appointment title
- cabinet name/location
- start/end and timezone
- service name if safe and approved
- internal appointment reference
- minimal patient contact only when operationally necessary and policy-approved

Never include symptoms, diagnoses, treatment notes, medical documents, payment secrets, or private staff data.

## Sync State And Failure

Track status, event ID, attempts, timestamps, and sanitized errors locally. Event creation and retry must be idempotent.

If sync fails:

1. keep the local paid appointment confirmed
2. store failed sync state
3. notify/show the admin
4. allow an idempotent retry

Cancellation updates should follow the same durable retry pattern and must not hide local appointment history.

## Security

- credentials and refresh tokens are server-only
- request only documented scopes required by the approved flow
- never commit credential JSON or tokens
- never accept a client-provided calendar ID without validating the local cabinet mapping
- revoke/replace connection without deleting local cabinets or appointments
