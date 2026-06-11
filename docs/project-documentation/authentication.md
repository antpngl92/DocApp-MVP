# Authentication And Access Control

## Overview

DocApp uses Clerk for authentication and local Prisma records for app-specific user, organization, membership, and role state.

Authentication proves who the user is. Authorization decides what clinic data and actions they can access.

MVP deployment is single-clinic. Each clinic has its own app deployment and database, so local membership represents access to this deployment's clinic only. The app should not expose cross-clinic switching or multiple clinic memberships for one local user in MVP.

## Implementation Order

Authentication and authorization must be implemented in dependency order:

1. Configure Clerk identity, login, logout, session handling, and basic signed-in route boundaries.
2. Configure Prisma/database access and create the minimum local identity models: `User`, `Organization`, `OrganizationMember`, and `PatientProfile`.
3. Sync Clerk identities into the local `User` table through unique `User.clerkUserId`.
4. Implement trusted owner/admin provisioning, staff invitations, clinic membership, roles, and patient ownership.
5. Enforce local membership/role/ownership authorization on private routes and server-side operations.

Clerk authentication can exist before the local identity schema, but local-user lookup, clinic membership checks, role checks, invitations, and patient ownership checks cannot be implemented safely until their database models exist.

## Goals

- Support trusted clinic owner/admin provisioning and secure admin login.
- Support one staff-user registration/onboarding flow through clinic invitation or approved clinic assignment, with receptionist, doctor, manager, admin, and owner represented as roles.
- Support patient registration/login for booking and appointment management.
- Sync Clerk users into a local `User` table.
- Scope all admin data to the local organization/clinic.
- Support owner/admin/manager/receptionist/doctor/patient access boundaries.
- Enforce access control on the server.

## Local User Sync

The app should store a local user record mapped to the Clerk user ID.

The mapping must use a unique `User.clerkUserId` and webhook processing must be idempotent so repeated Clerk events update the same local user instead of creating duplicates.

Minimum local fields:

- id
- clerkUserId
- email
- name
- createdAt
- updatedAt

Clerk webhook sync should create/update local users.

Implemented MVP behavior:

- `POST /api/clerk/webhook` verifies Clerk/Svix signatures with `@clerk/nextjs/webhooks`.
- Use `CLERK_WEBHOOK_SIGNING_SECRET` for the webhook secret. `CLERK_WEBHOOK_SECRET` is kept only as a legacy compatibility fallback.
- `user.created` and `user.updated` events upsert a local `User` by unique `User.clerkUserId`.
- The primary Clerk email is normalized to lowercase before storing locally. If Clerk does not provide a primary email, the first email address is used.
- Duplicate webhook deliveries are idempotent because they update the same `User.clerkUserId` instead of creating another local user.
- Unsupported Clerk events are acknowledged but ignored.
- `user.deleted` must not delete local appointment, payment, patient, or audit history until a dedicated retention/anonymization policy is implemented.
- Do not log raw Clerk webhook payloads, signing secrets, or full provider headers.

Identity sync does not grant staff permissions. Staff/admin access still requires a trusted local `OrganizationMember` record and role validation in later tasks.

## Current Authenticated User Helper

Server-side code can use the current-authenticated-user helper to connect the active Clerk session to the local `User` table.

Implemented MVP behavior:

- The helper reads the active session with Clerk's App Router server `auth()` helper.
- If no Clerk user is signed in, it returns `signed_out`.
- If Clerk has a signed-in user but the local `User` row does not exist yet, it returns `missing_local_user`.
- If the local row exists, it returns `authenticated` with the local user record.
- The helper looks up local users by unique `User.clerkUserId`.
- The helper does not create missing users, assign roles, activate memberships, or grant patient ownership.

Later route guards should decide how to handle `signed_out` and `missing_local_user` for each surface. Staff/admin authorization still requires an active local `OrganizationMember`; patient ownership still requires `PatientProfile` and appointment ownership checks.

## Local User Lookup Helper

Server-side identity and authorization code should reuse the local-user lookup helper when resolving a Clerk identity to the local `User` table.

Implemented MVP behavior:

- The helper accepts a Clerk user ID.
- The helper queries the local `User` table by unique `User.clerkUserId`.
- The helper returns the local user record or `null`.
- The helper does not create users, assign permissions, activate staff memberships, or create patient profiles.

This keeps the Prisma query shape centralized for current-user resolution, trusted owner/admin provisioning, staff invitation acceptance, membership guards, and patient ownership guards.

## Organization/Clinic Membership

Staff users access clinic data through membership records.

Suggested model:

```txt
Organization
User
OrganizationMember
```

`OrganizationMember` should include:

- organizationId
- userId, nullable while an invitation is pending
- role
- status
- invitedEmail
- createdAt
- updatedAt

Possible roles:

```txt
owner
admin
manager
receptionist
doctor
```

Clinic-side MVP permissions can start simple, but the data model should support role expansion from the foundation.

A linked local `User` should have at most one `OrganizationMember` in this deployment. Patients do not use `OrganizationMember`; a patient account should be represented locally and linked to appointments through `PatientProfile` or patient ownership fields.

## Registration Flows

MVP should support these flows:

- clinic owner/admin authentication accounts are provisioned only through the Clerk Dashboard or a controlled database provisioning process
- no public owner/admin registration route is exposed
- owner/admin invites staff users, preferably through Clerk Invitations
- staff user accepts invite and registers/logs in
- staff user is attached to the clinic only through invitation or owner/admin approval
- staff users cannot publicly self-register into arbitrary clinics or staff roles
- patient registers/logs in before completing a paid booking
- patient registration can be public
- patient profile is created or updated from booking contact details

### Clinic Owner And Admin Provisioning

Clinic owner/admin accounts must not be created through a public registration form.

For MVP, an owner/admin authentication identity is created through the Clerk Dashboard or another controlled administrative provisioning process. If a database record is provisioned directly, it must be linked to a trusted Clerk identity before the person can authenticate.

Owner/admin roles, organization membership, and clinic access must be assigned through controlled server-side or administrative processes. User-controlled metadata, public form input, or a self-selected role must never grant clinic-side access.

Implemented MVP bootstrap behavior:

1. Create the trusted owner/admin identity in Clerk Dashboard.
2. Add Clerk private metadata:

```json
{
  "docapp": {
    "bootstrapRole": "owner"
  }
}
```

Allowed bootstrap roles are `owner` and `admin` only.

On authenticated admin app access, DocApp first resolves the Clerk identity to the local `User`. If the local `User` does not exist yet, DocApp may fetch the trusted Clerk Backend user, create or update the local `User` from Clerk ID, primary email, and display name, then continue bootstrap.

DocApp reads Clerk private metadata server-side through Clerk's Backend API only when the local user has no existing `OrganizationMember`. If the local user has no existing membership and the deployment has an active local `Organization`, DocApp creates an active local owner/admin membership and writes an audit event.

The admin route shell must not render for a signed-in user unless bootstrap returns or finds an active local membership with role `owner` or `admin`. A regular patient user with no `OrganizationMember`, or a staff user with another role/status, must not be able to render `/admin`.

Clerk private metadata is a one-time bootstrap hint only. Once a local membership exists, DocApp ignores the bootstrap metadata and keeps `OrganizationMember.role` and `OrganizationMember.status` as the source of truth for authorization. Do not expose private metadata in UI, API responses, logs, public metadata, or session claims.

Patient accounts are appointment-management accounts only. They must not expose medical records, prescriptions, diagnoses, treatment notes, insurance workflows, chat, or file uploads.

### Staff Invitations With Clerk

Clerk Invitations are the preferred MVP mechanism for onboarding clinic-side staff users. Managers, receptionists, doctors, admins, and owners are roles or memberships under this staff-user flow, not separate onboarding products.

Recommended flow:

1. Authorized owner/admin creates a staff invitation from DocApp.
2. The invitation form requires a staff email input and a role dropdown.
3. Owner/admin selects the intended role, such as admin, manager, receptionist, or doctor.
4. DocApp validates that the inviting user can assign the selected role.
5. DocApp creates a pending local invitation or `OrganizationMember` record with organization, intended role, status, invited email, and inviter/audit details.
6. DocApp creates a Clerk Invitation for that email from a server-only action or route.
7. Clerk sends the invitation email and handles account acceptance/sign-in.
8. Clerk webhook sync creates or updates the local `User` by unique `User.clerkUserId`.
9. DocApp validates the pending local invitation or membership before activating clinic access.
10. DocApp activates the local `OrganizationMember` and assigns the intended role.

A staff member with role `doctor` may also be linked to a `Doctor` operational profile when that person is a bookable provider. Receptionists, managers, and other non-doctor staff normally need only the `OrganizationMember` record unless the product later adds a separate operational profile for them.

Implemented MVP foundation:

- After a staff user accepts a Clerk invitation and the Clerk webhook has synced a local `User`, server-side onboarding can activate the pending local `OrganizationMember`.
- Activation requires a signed-in Clerk session, an existing local `User`, a pending local membership with `status = invited`, and a normalized invited email matching the local user email.
- Activation links `OrganizationMember.userId` to the local user, changes membership status to `active`, and writes an audit event.
- If the user is signed out, missing locally, already active, disabled/removed, missing a pending invitation, mismatched by email, or assigned an invalid role, staff access is not activated.
- A regular patient account with no pending local invitation remains a patient-only account and receives no clinic-side staff access.
- The admin overview includes the staff invitation form with a staff email field and role dropdown. It validates input locally and submits through a server action.
- Staff invitation role options are centralized and intentionally limited to `admin`, `manager`, `receptionist`, and `doctor`; `owner` is not exposed as a selectable invitation role.
- The staff invitation server action validates the signed-in local user, active owner/admin membership, active local organization, invite email, and inviteable role before calling Clerk.
- The staff invitation server action uses Clerk's Backend API `clerkClient().invitations.createInvitation` from `@clerk/nextjs/server`. This must remain server-only because it depends on the Clerk secret key.
- The invitation `redirectUrl` must be an absolute application URL built from `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. A relative path is resolved against Clerk's Account Portal domain, so the invitation email would send staff to the hosted portal sign-up instead of the app's sign-up page.
- This branch sends the Clerk invitation email. Persisting the returned Clerk invitation ID/status and passing non-authoritative metadata are handled by the following invitation persistence tasks.

Implementation note:

```ts
await clerkClient.invitations.createInvitation({
  emailAddress: staffEmail,
  // Absolute URL from NEXT_PUBLIC_APP_URL + NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  // e.g. http://localhost:3000/sign-up in development.
  redirectUrl: staffInvitationRedirectUrl,
});
```

The Clerk Backend API endpoint is `POST /v1/invitations`. It requires the Clerk secret key and must never run in a client component. Clerk sends the invitation email by default. Store the returned Clerk invitation ID and status locally so DocApp can track pending, accepted, expired, and revoked invitations.

Clerk invitation metadata may include references such as `organizationId`, `membershipId`, or intended role, but it must be treated only as a hint. Local database records remain the source of truth for clinic membership, role, status, and permissions.

Never grant staff permissions from user-controlled Clerk metadata, public form input, or invitation acceptance alone. If the local invitation is missing, expired, revoked, or mismatched, the signed-in user must not receive clinic-side access.

## Refund Permissions

Refunds are privileged clinic-side actions.

Default permission guidance:

- owner can issue refunds and override refund rules
- admin/manager can issue refunds if explicitly granted permission
- receptionist can cancel appointments or flag refund review, but cannot issue money refunds by default
- doctor can mark appointment outcome where allowed, but cannot issue refunds by default

Patients cannot request or self-initiate refunds.

## Route Protection

The Phase 5 authentication foundation protects private routes in two places:

- `clerkMiddleware` protects configured private route patterns before route rendering.
- Private admin and account route-group layouts call a shared server-side session helper that delegates to Clerk's documented `auth.protect()` API before rendering shell content.

This is an authentication boundary only. Local user lookup, clinic membership, role checks, and patient ownership checks are added after the database identity models exist.

Authenticated admin routes must require:

- signed-in user
- active local user record
- active organization membership
- appropriate role for the action

Patient account routes must require:

- signed-in user
- active local user record
- ownership of the patient profile/appointment being read or changed

The public booking surface may allow browsing clinic availability, but final booking submission, Checkout Session creation, appointment status access, and cancellation requests should be tied to the authenticated patient account or a public-safe token/reference flow where explicitly documented.

## Server-Side Authorization

Do not rely only on UI hiding.

Every server action, route handler, and database query that reads or mutates clinic data must enforce organization ownership.

Examples:

- creating a service
- editing availability
- viewing appointments
- cancelling appointments
- retrying calendar sync
- reading payment order details
- viewing patient appointment details
- requesting cancellation as a patient

## Webhook Authorization

Stripe webhooks are not authenticated by Clerk. They must verify Stripe signatures and then resolve local order/appointment records through trusted metadata and database state.

Webhook handlers must not accept arbitrary clinic/user IDs from untrusted input.

## Audit Events

Create audit events for sensitive actions:

- member added/removed
- role changed
- service price/deposit changed
- availability changed
- appointment cancelled
- no-show marked
- payment/order state changed
- Google Calendar sync retried
- patient cancellation requested
- refund issued or recorded

## Risks

- Single-clinic deployment still requires explicit local ownership checks so future features do not accidentally read or mutate records outside the intended clinic profile.
- Clerk auth does not automatically protect server actions if they query data without scoping.
- Webhook handlers need separate validation and idempotency.
