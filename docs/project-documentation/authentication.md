# Authentication And Access Control

## Overview

Clerk authenticates identities. The local database authorizes access.

Never grant practice permissions from public form input, client-visible metadata, invitation metadata alone, or route visibility. Local `OrganizationMember` status and role are authoritative for staff access.

## Identity Flows

### Owner/Admin

The independent professional uses role `admin` and is provisioned through Clerk Dashboard or another controlled server/database process. There is no public owner/admin registration.

On authenticated access, DocApp resolves the Clerk user to local `User`, verifies an active local admin membership, and scopes access to the deployment's single `Organization` practice record.

### Receptionist

An admin invites a receptionist by email through the app. The server uses Clerk's Backend Invitation API and creates/tracks a pending local membership.

Invitation acceptance is matched against normalized invited email and local membership state. Clerk invitation metadata is unnecessary for MVP and must never be authoritative.

After acceptance:

1. synchronize/find the local `User`
2. find the matching invited local membership
3. link it to the user
4. mark it active and invitation accepted
5. create an audit event

The target MVP has no staff `doctor` role and no doctor-profile onboarding or approval gate.

### Patient

Patients may register publicly. They receive a local `User` and `PatientProfile`, not an `OrganizationMember`. Patient access is limited to their own profile and appointments.

## Target Roles

- `admin`: full practice, cabinet, integration, staff, settings, appointment, and authorized refund control
- `receptionist`: permitted appointment operations across cabinets; no staff administration, payment credential management, Google connection management, or admin-only settings
- patient access: own profile and appointments only

Fine-grained permissions should be checked for the action and target record, not inferred only from navigation.

## Shared Server Helpers

The server auth layer should provide focused helpers for:

- current authenticated Clerk/local user
- required local user
- current practice/organization
- active staff membership
- required admin access
- allowed receptionist operation
- required patient profile ownership
- required patient appointment ownership
- practice-owned record scoping

Use `practice` terminology in new helper names where practical. Existing `current-clinic` helpers should be renamed during the cabinet-focused reset without weakening their ownership checks.

## Route Protection

- public routes: available without authentication
- auth routes: sign-in, sign-up, and post-auth destination resolution
- dashboard routes: active local staff membership plus action-specific authorization
- patient routes: authenticated local user plus patient ownership

Unauthenticated or unauthorized access must not rely on hidden links. Enforce it on the server through middleware/layout/route/action boundaries as appropriate.

Post-auth routing should send active staff to `/dashboard` and patients to `/account`. It must not create privileges from the destination request.

## Clerk User Sync

Clerk webhooks create/update local users idempotently through unique `User.clerkUserId`. Webhooks may synchronize identity fields but must not accept arbitrary practice IDs, memberships, roles, appointment IDs, or payment authority from untrusted payload data.

Public registration, staff invitation, invitation acceptance, role change, suspension/revocation, and trusted admin provisioning should create safe audit events.

## Practice Scoping

Even with one practice per deployment, every practice-owned server query should verify `organizationId` or follow a relation rooted in the current practice. This prevents accidental IDOR bugs and keeps webhook/action code from trusting client-provided ownership IDs.

## Cabinet-Focused Reset

Remove from the current implementation:

- doctor membership role
- doctor onboarding and approval helpers
- Doctor-profile linkage requirements
- doctor-specific post-auth destinations
- doctor-scoped navigation and permissions

Preserve:

- controlled admin provisioning
- Clerk/local user mapping
- receptionist invitation security
- local membership authority
- patient ownership guards
- server-side practice scoping
- audit history

## Security Rules

- Never import Clerk secret APIs into client components.
- Never expose private Clerk metadata or auth-provider implementation details in public copy.
- Never authorize from user-controlled metadata.
- Never trust a client-provided role, organization ID, patient ID, or cabinet ownership claim.
- Do not rely on UI hiding as authorization.
- Keep session and role checks server-side for protected operations.
