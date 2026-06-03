# Authentication And Access Control

## Overview

DocApp uses Clerk for authentication and local Prisma records for app-specific user, organization, membership, and role state.

Authentication proves who the user is. Authorization decides what clinic data and actions they can access.

## Goals

- Support clinic owner/admin registration and secure admin login.
- Support staff registration through clinic invitation or approved clinic assignment for receptionist, doctor, and manager/admin users.
- Support patient registration/login for booking and appointment management.
- Sync Clerk users into a local `User` table.
- Scope all admin data to an organization/clinic.
- Support owner/admin/manager/receptionist/doctor/patient access boundaries.
- Enforce access control on the server.

## Local User Sync

The app should store a local user record mapped to the Clerk user ID.

Minimum local fields:

- id
- clerkUserId
- email
- name
- createdAt
- updatedAt

Clerk webhook sync should create/update local users.

## Organization/Clinic Membership

Users access clinic data through membership records.

Suggested model:

```txt
Organization
User
OrganizationMember
```

`OrganizationMember` should include:

- organizationId
- userId
- role
- status
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

Patients do not need an `OrganizationMember` record unless the implementation chooses that for consistency. A patient account should be represented locally and linked to appointments through a patient profile or user ownership field.

## Registration Flows

MVP should support these flows:

- clinic owner/admin creates the clinic account
- owner/admin invites or creates staff users
- staff user accepts invite and registers/logs in
- staff user is attached to the clinic only through invitation or owner/admin approval
- staff users cannot publicly self-register into arbitrary clinics or staff roles
- patient registers/logs in before completing a paid booking
- patient registration can be public
- patient profile is created or updated from booking contact details

Patient accounts are appointment-management accounts only. They must not expose medical records, prescriptions, diagnoses, treatment notes, insurance workflows, chat, or file uploads.

## Refund Permissions

Refunds are privileged clinic-side actions.

Default permission guidance:

- owner can issue refunds and override refund rules
- admin/manager can issue refunds if explicitly granted permission
- receptionist can cancel appointments or flag refund review, but cannot issue money refunds by default
- doctor can mark appointment outcome where allowed, but cannot issue refunds by default

Patients cannot request or self-initiate refunds.

## Route Protection

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

- Shared database tenancy requires repeated ownership checks.
- Clerk auth does not automatically protect server actions if they query data without scoping.
- Webhook handlers need separate validation and idempotency.
