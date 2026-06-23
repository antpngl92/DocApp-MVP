# Security And Privacy

## Principles

- collect only data required for appointment booking and operations
- enforce authorization on the server
- keep practice ownership explicit even in a single-practice database
- keep payment, identity, and calendar secrets server-side
- avoid medical data throughout the MVP
- audit sensitive administrative and lifecycle actions

## Access Boundaries

- admin controls the practice, cabinets, integrations, staff, settings, appointments, and authorized refunds
- receptionist receives only explicitly allowed booking operations across cabinets
- patient accesses only their own profile and appointments

The target architecture has no doctor role or Doctor ownership scope.

Every server action, route, and query must derive the actor from the authenticated session and verify local `OrganizationMember` or `PatientProfile` state. Never trust client-provided roles, organization IDs, patient IDs, or cabinet ownership.

## Practice And Cabinet Scoping

Each deployment contains one practice, represented technically by `Organization`. Practice-owned records should be constrained/scoped by `organizationId`; cabinet-owned records must also verify the cabinet belongs to that practice.

This protects against IDOR mistakes and untrusted webhook/action input even without cross-practice UI.

## Patient Data

Allowed data is minimal identity/contact and appointment-management information. Do not store symptoms, diagnoses, treatment notes, prescriptions, lab results, insurance data, medical files, or chat in MVP.

Optional booking notes must explicitly discourage medical details.

## Integrations

Stripe metadata must use opaque local references and no medical details. Stripe webhook signatures and server-side amount validation are mandatory.

Google credentials are server-only. Calendar titles/descriptions must contain only safe operational details. A cabinet mapping must be validated locally before event creation.

Clerk authenticates identities; local membership/profile records authorize access. Public or user-controlled metadata must never grant staff permissions.

## Slot-Hold Abuse Prevention

Use persisted short holds plus:

- one active hold per anonymous browser/session by default
- replacement/release when selecting another slot
- conservative IP-hash active-hold limits
- creation rate limits
- automatic expiry and cleanup
- no patient/contact data in holds
- transaction/constraint protection during conversion

## Refund And Cancellation Boundary

Patient cancellation requests are policy-controlled and do not initiate refunds. Admin-only refund operations require authorization, reason, and audit history. Receptionists cannot issue money refunds by default.

## Audit And Logs

Audit staff invitations, role/status changes, cabinet/settings changes, manual bookings, appointment state changes, payment/refund actions, and calendar retries. Avoid secrets and unnecessary patient data in audit payloads.

Do not store every backend request in the application database. Evaluate an external observability service after release for request logs, errors, and alerts.

## Secrets

Never commit `.env`, Clerk/Stripe secrets, Google credentials, refresh tokens, database URLs, webhook secrets, or API keys. Never print them in logs or expose them to client bundles.

## Legal Pages

Before pilot, provide privacy, terms, cancellation, refund, and cookie policy content. Add cookie consent only when non-essential cookies, analytics, tracking pixels, or third-party embeds actually require it.
