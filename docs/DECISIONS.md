# DocApp MVP Decisions

This document records product and technical decisions for the DocApp MVP.

The source of scope is `docs/MVP.md`. Decisions here should prevent the team from repeatedly reopening the same questions while building the first usable MVP.

## 001 - Build A Clinic-Focused MVP, Not A Generic Booking App

**Decision**

DocApp should initially target small private clinics and healthcare-adjacent appointment businesses such as dentists, physiotherapists, psychologists, and aesthetic clinics.

Do not position the MVP as a generic booking platform for every business.

**Reason**

Generic booking tools are saturated and often compete with free or low-cost scheduling products. The stronger wedge is deposit-based scheduling, Google Calendar sync, and manager control for small clinics.

**Implication**

Product copy, data model, workflows, and admin screens should use clinic language where helpful, while keeping the internal architecture generic enough to support adjacent verticals later.

## 002 - Build Around Appointment Deposits, Not Extra Booking Fees

**Decision**

The patient pays part of the appointment price upfront. The remaining balance is paid at the clinic.

Do not describe the payment as a separate platform booking fee charged to the patient.

**Reason**

Clinics already charge for appointments. A deposit reduces no-shows and makes the booking commitment stronger. A separate booking fee creates patient friction and weakens the pitch.

**Implication**

The booking UI must clearly show:

- full appointment price
- deposit paid now
- remaining balance due at clinic
- cancellation/refund policy

## 003 - Use Services Instead Of Daily Rate As The Pricing Core

**Decision**

The MVP should model bookable services with duration, full price, deposit amount/percentage, currency, and applicable resources.

A simple daily/default rate may exist as a fallback during early development, but it should not be the core product model.

**Reason**

Clinics commonly have different appointment types with different durations and prices. Service-based pricing also makes the patient flow clearer.

**Implication**

Availability and payment logic should be service-aware. Slot duration should normally come from the selected service, with optional per-calendar/resource overrides only where needed.

## 004 - Stripe Webhooks Are The Source Of Truth For Payment

**Decision**

Payment finalization must happen only in the Stripe webhook handler.

Checkout success pages must not mark orders paid or create Google Calendar events.

**Reason**

Browser redirects are not reliable proof of payment. A patient can pay successfully and close the browser before returning to the app. Stripe webhook events are the reliable server-side fulfillment mechanism.

**Implication**

The success page should read current local status and display a confirmation/progress state. The webhook should mark the order paid, confirm the appointment, and trigger Google Calendar sync.

## 005 - Checkout Cancel Pages Are Convenience Pages Only

**Decision**

The cancel page may mark a pending order/appointment as cancelled when safe, but it must not be the only cleanup mechanism.

**Reason**

Patients may close the browser, abandon Checkout, lose connectivity, or never hit the cancel URL.

**Implication**

DocApp must support pending appointment expiration and Stripe `checkout.session.expired` handling. Availability generation must treat expired pending appointments as unavailable no longer.

## 006 - Use Pending Appointment Locks To Prevent Double Booking

**Decision**

When a patient starts Checkout, DocApp should create a pending appointment lock with an expiration time.

Availability generation should exclude confirmed appointments and non-expired pending appointments.

**Reason**

Without slot locking, two patients can select the same time slot and both reach payment.

**Implication**

The data model should include pending expiration fields. The booking creation path should use transaction-safe checks where practical.

## 007 - Separate Appointment Status, Payment Status, And Calendar Sync Status

**Decision**

Do not overload one field to represent appointment state, payment state, and Google Calendar sync state.

Use separate status fields for:

- appointment lifecycle
- payment/order lifecycle
- Google Calendar sync lifecycle

**Reason**

A booking can be paid but fail Google Calendar sync. A booking can be pending payment but still lock a slot. Mixing states makes recovery and admin UX fragile.

**Implication**

Examples:

```txt
Appointment.status = pending_payment | confirmed | cancel_requested | cancelled | expired | no_show | completed
AppointmentOrder.status = pending | paid | cancelled | expired | refunded | failed
CalendarSync.status = not_created | created | failed | retry_pending
```

`slot_held` is a temporary booking UI/computed state derived from an active `SlotHold`. It does not have to be stored as `Appointment.status`. Appointments begin once a hold is converted into a `pending_payment` booking or when an authorized clinic-side user creates a manual confirmed/pay-at-clinic booking.

Do not use `calendar_sync_failed` as an appointment status. The UI may show a combined message such as `Confirmed - calendar sync failed`, but internally the appointment remains `confirmed` and calendar sync status is `failed`.

## 008 - Create Google Calendar Events After Payment Confirmation

**Decision**

Google Calendar events should be created only after successful payment confirmation through the Stripe webhook.

**Reason**

The clinic calendar should represent confirmed appointments, not unpaid attempts. Pending slot locks should live in DocApp, not as final Google Calendar events.

**Implication**

If Google Calendar creation fails, the appointment remains paid/confirmed locally, the sync failure is recorded, and admins are notified with a retry path.

## 009 - Google Calendar Is A Sync Target, Not The Source Of Truth

**Decision**

DocApp's database is the source of truth for appointments, payments, settings, and statuses. Google Calendar is an external operational calendar sync target.

**Reason**

External API calls can fail, and Google Calendar may be changed outside DocApp. The app needs a stable local state for payments and admin reporting.

**Implication**

Store local appointment state, Google Calendar event IDs, sync status, sync timestamps, and error messages.

## 010 - Keep Patient Health Data Out Of MVP

**Decision**

The MVP should not collect or store diagnoses, symptoms, medical notes, documents, prescriptions, insurance information, or medical history.

**Reason**

Health data creates higher privacy, compliance, and operational risk. The MVP only needs enough data to book and manage appointments.

**Implication**

The booking form should collect name, email, phone, and at most an optional non-sensitive note. Copy should discourage entering medical details.

## 011 - Do Not Put Sensitive Data In Google Calendar

**Decision**

Google Calendar event titles and descriptions must not include sensitive health information.

**Reason**

Google Calendar may be visible to more people/devices than the DocApp admin panel. Calendar events should not expose unnecessary personal or medical information.

**Implication**

Preferred event titles:

```txt
Appointment - Patient Name
Appointment #APP-1024
Booked appointment
```

Avoid titles like:

```txt
Anton - cardiology chest pain
```

## 012 - Use A Single-Clinic Deployment And Database For MVP

**Decision**

DocApp MVP should be deployed separately for each clinic.

Each clinic gets its own application deployment, database, Prisma configuration, and integration credentials.

Do not build shared-database multi-tenant behavior, cross-clinic switching, or marketplace operations in the MVP.

**Reason**

The product is sold to clinics individually, and each clinic operates its own isolated booking/payment/calendar environment. Separate deployments keep the MVP simpler to operate, easier to reason about, and safer while the core workflow is being stabilized.

**Implication**

Every deployment should normally have one local `Organization` record representing the clinic profile and product source of truth. Do not add UI or backend logic for switching between clinics or querying across clinics.

## 013 - Keep Organization IDs For Local Clinic Ownership, Not Cross-Clinic Operations

**Decision**

Models should still use `organizationId` or equivalent ownership fields where the record belongs to the clinic, even though the MVP database is single-clinic.

**Reason**

The local organization record anchors clinic settings, Google Calendar connection, staff membership, doctors, resources, services, appointments, orders, sync records, notification logs, and audit events. Keeping that ownership explicit makes joins, authorization, data export, support, and future migration safer without implying that one deployment serves many clinics.

**Implication**

Use `organizationId` as a local ownership boundary and consistency check. Do not build cross-clinic queries, clinic switching, or multiple active clinic memberships for one local user in the MVP.

## 014 - Keep Billing Simple For MVP

**Decision**

Do not build complex SaaS billing in the first MVP.

Initial pricing can be validated manually, with one simple clinic subscription plan and/or a setup fee. Appointment deposits may initially be collected through one Stripe account for controlled pilots only.

**Reason**

Complex billing and marketplace payment flows can slow the core booking/payment/calendar validation.

**Implication**

Do not build:

- multiple pricing tiers
- coupons
- usage-based billing
- advanced invoice management
- team billing
- complex trials

Normal Stripe Checkout without Stripe Connect is acceptable for the single-clinic deployment model when payment ownership and accounting are clear.

If DocApp later becomes a shared multi-clinic SaaS where patient deposits belong to different clinics, evaluate Stripe Connect or an equivalent platform payment architecture before building that model.

## 015 - Use Stripe Connect Only If A Later Shared Multi-Clinic Architecture Is Approved

**Decision**

For a later shared multi-clinic SaaS where patient deposits should flow to clinics and DocApp keeps a platform fee, plan for Stripe Connect or an equivalent platform-payment solution.

**Reason**

Collecting all patient deposits into the platform's own bank account and manually paying clinics creates legal, accounting, operational, and trust complexity.

**Implication**

The data model should store enough payment metadata to support migration later. The MVP should not build Stripe Connect or marketplace money movement while deployments remain single-clinic.

## 016 - Build A Production-Shaped Payment And Booking Foundation From The Start

**Decision**

The MVP should include production-shaped foundations for:

- local appointment and order records
- pending locks and expiry
- Stripe Checkout Session creation
- Stripe webhook verification
- idempotent webhook handling
- Google Calendar sync and retry
- admin failure notifications
- audit logging for critical state changes

**Reason**

Booking and payment workflows are stateful and failure-prone. Starting with a fragile success-page-driven flow will create rework immediately before pilots.

**Implication**

This foundation is part of MVP, not a future refactor.

## 017 - Keep Async Jobs Minimal But Use Durable State For External Effects

**Decision**

A full job queue is not required on day one, but external side effects such as Google Calendar event creation and email notifications should have durable state and retry paths.

**Reason**

External APIs can fail after payment succeeds. Admins need visibility and recovery.

**Implication**

Model sync attempts, notification attempts, errors, and retry state. A job runner can be added later if needed.

## 018 - Validate Booking And Payment Rules On Frontend And Backend

**Decision**

Frontend validation improves UX, but all important booking, availability, payment amount, and ownership checks must happen on the server.

**Reason**

Client-side data can be manipulated. Payment amounts and appointment slots must be trusted only after server-side validation.

**Implication**

Before creating a Checkout Session, the server must re-check service price, deposit amount, selected slot availability, clinic ownership, active doctor/resource state, and pending lock status.

## 019 - Store Stripe And Google IDs For Traceability

**Decision**

Store Stripe Checkout Session ID, Stripe Payment Intent ID where available, Google Calendar event ID, and relevant timestamps.

**Reason**

Support, refunds, reconciliation, and debugging require traceability.

**Implication**

Admin views may show internal references where useful, but avoid exposing unnecessary technical details to patients.

## 020 - Use Server-State Caching Instead Of A Large Redux Store

**Decision**

Do not fetch all clinic, doctor, booking, service, payment, and calendar data at login and store it in one large Redux store.

Use the database as the source of truth. Use server-state caching on the frontend for fetched data such as clinics, doctors, services, appointments, payments, sync states, and notifications.

Use a small client-side store or React context only for UI state such as selected date, open panels, filters that are not encoded in the URL, temporary form state, and toast display.

**Reason**

Most DocApp data is server state: scoped by clinic, changed by server actions/webhooks, and often stale.

**Implication**

After webhooks or external sync attempts update state, related queries should be invalidated/refetched.

## 021 - Use A Documentation-First Workflow

**Decision**

Document major product, architecture, and implementation decisions in `docs/` and `docs/project-documentation/` as the project grows.

The project should include documentation for important areas such as:

- product scope
- architecture
- authentication
- data model
- booking flow
- payment flow
- Google Calendar flow
- security/privacy
- UI direction
- testing strategy

**Reason**

DocApp has many interconnected flows: auth, clinic ownership, booking availability, payment webhooks, Google Calendar sync, privacy rules, and admin operations.

A documentation-first workflow helps keep the product consistent and gives Codex reliable context before it writes code.

**Implication**

When a major feature or architectural area is added, update or create the relevant documentation before or alongside implementation. Codex should read the relevant docs before planning or implementing.

## 022 - Define UI Direction Before Building Core Screens

**Decision**

DocApp should have a calm, trustworthy clinic-oriented UI direction before building the main dashboard and booking screens.

Do not let Codex randomly choose unrelated colors, layouts, or visual styles for each feature.

**Reason**

The product handles appointments and payments in a healthcare-adjacent context. It must feel reliable, clean, and professional.

**Implication**

Before core UI implementation, define direction for:

- layout
- navigation
- typography
- spacing
- forms
- calendar views
- booking states
- payment states
- warnings
- sync failure states
- admin tables

## 023 - Do Not Show Ads On Clinic Booking Pages

**Decision**

Do not include Google Ads or display ads in patient booking pages or clinic admin pages.

**Reason**

Ads would weaken trust, distract patients from booking/payment, and feel inappropriate in a medical booking context.

**Implication**

Remove or disable ad-related prototype features from the MVP unless a separate marketing site explicitly needs them.

## 024 - Support Manual Receptionist Booking In MVP

**Decision**

Authorized clinic-side users should be able to create appointments manually from the admin/control panel.

**Reason**

Clinics still receive phone calls, messages, and in-person scheduling requests. A booking tool that ignores receptionist workflows is less useful.

**Implication**

Manual bookings should support existing patient accounts and manually entered patient contact details. When an existing patient account is selected, the appointment should be attached to that account so it can appear in the patient dashboard if visibility rules allow it.

Manual bookings should support payment states such as pay-at-clinic, deposit paid externally, no deposit required, or internal/free booking. Manual booking should still respect availability and prevent double-booking unless an authorized admin intentionally overrides. Manual booking creation, payment marking, override, and cancellation actions should be audited.

## 025 - Keep Advanced Product Areas Out Of MVP

**Decision**

The following are not MVP features:

- public doctor marketplace
- patient reviews
- medical records
- prescriptions
- insurance
- AI scheduling optimization
- AI doctor matching
- complex analytics
- custom domains
- complex billing/subscription management
- automated SMS campaigns
- ads

**Reason**

These areas distract from validating the core deposit booking and calendar workflow.

**Implication**

Do not design screens, data models, or services around these features unless they are required to support the MVP booking/payment/calendar flow.

## 026 - Treat The Current Prototype As Reference, Not Foundation

**Decision**

Use the existing DocApp prototype as a reference for proven flows and UI ideas, but rebuild the foundation where necessary.

**Reason**

The prototype proved feasibility but includes fragile lifecycle assumptions, especially around success-page payment finalization.

**Implication**

Codex should not copy old modules blindly. Each copied idea should be reimplemented according to the new docs.

## 027 - Start Realtime Slot Holds With Polling

**Decision**

When a patient selects a time slot, DocApp should immediately create a short temporary hold for that slot.

For MVP, the patient booking UI should start with polling every few seconds to show slots held by other users as unavailable. WebSockets, Server-Sent Events, Supabase Realtime, Pusher, Ably, or similar realtime infrastructure can be evaluated later.

The slot hold duration should be configurable per clinic.

**Reason**

Immediate holds reduce double-booking risk while the patient fills the form. Polling is simpler than full realtime infrastructure and is enough for an MVP pilot.

**Implication**

The selected slot should become unavailable to other sessions quickly. If the patient closes the modal/form before submitting, the hold should be released immediately. If the patient abandons the flow without closing cleanly, the hold expires automatically.

## 028 - Patient Cancellation Is Configurable But Refunds Are Admin-Only

**Decision**

Patients should not be able to request or self-initiate refunds through the app.

Clinic cancellation policy should be configurable:

- patient can request cancellation only N days/hours before the appointment
- patient can request cancellation anytime
- patient cannot request cancellation

Patient cancellation is a request/status workflow, not a direct refund workflow.

Refunds can be issued only by authorized clinic-side users according to role/permission.

**Reason**

The deposit is intended to reduce no-shows. If the patient paid and does not show up, the deposit is non-refundable by default. Refunds are financial actions and need admin control, audit logging, and clinic policy context.

The default non-refundable deposit behavior is a product default and must be shown clearly to patients. Clinics are responsible for choosing policy text appropriate to their business and jurisdiction.

**Implication**

Patient-facing copy should clearly state the deposit policy before Checkout and in confirmation emails. Admin refund permissions should be explicit. Paid appointments should not be hard-deleted.

## 029 - Refund Permission Depends On Role

**Decision**

Refund access should be permission-based.

Default guidance:

- owner: can issue refunds and override refund rules
- admin/manager: can issue refunds if granted permission
- receptionist: can cancel appointments or flag refund review, but cannot issue money refunds by default
- doctor: can mark appointment outcome where allowed, but cannot issue refunds by default

**Reason**

Refunds affect money movement and require accountability.

**Implication**

Refund actions must require a reason, create audit events, update payment/order status, and keep appointment history visible.

## 030 - Use SuperDesign For UI Exploration, Not Product Authority

**Decision**

Use SuperDesign as an AI design exploration tool for important DocApp screens and states.

The approved `.md` files remain the source of product truth. SuperDesign output must be reviewed before implementation.

**Reason**

SuperDesign can help explore UI options quickly, but generated design output should not override product, security, payment, privacy, or accessibility rules.

**Implication**

Use SuperDesign for exploration of booking, slot states, checkout status pages, admin daily agenda, dashboard, appointment details, and failed sync states. Only approved UI patterns should be implemented.

## 031 - Do Not Port Prototype UI Component System

**Decision**

Do not migrate the prototype's Radix/shadcn UI component setup or reusable UI/components into the rebuild.

The new app should use SuperDesign to guide website/app design, color schemes, and UI direction. SuperDesign output still requires review and must follow the approved product docs.

**Reason**

The rebuild should not inherit prototype UI structure, styling drift, or component assumptions. SuperDesign will be used as the design workflow for the new interface.

**Implication**

Do not port:

- `components/ui/*`
- Radix/shadcn component wrappers
- prototype layout components
- prototype booking/admin UI components
- prototype color system as a source of truth

Implementation can still use normal React/Next.js components created for the new app, but design choices should come from approved SuperDesign explorations and the project docs.

## 032 - Keep FullCalendar In MVP

**Decision**

Keep `@fullcalendar/*` dependencies available for the MVP.

**Reason**

Calendar-style views are still expected to be useful for MVP workflows.

**Implication**

The rebuild may use FullCalendar where it improves booking/admin calendar views, while still prioritizing clear daily agenda and appointment table views where those are operationally simpler.

## 033 - No Ads Anywhere In The App

**Decision**

Do not include ads anywhere in the DocApp application.

**Reason**

Ads undermine trust in a healthcare-adjacent booking and payment product.

**Implication**

Do not migrate:

- `GoogleAds/`
- `AdContainer`
- `NEXT_PUBLIC_ENABLE_ADS`
- AdSense-related configuration
- ad display logic on public, booking, checkout, privacy, admin, or marketing pages

## 034 - Local Secrets Are Needed But Must Stay Uncommitted

**Decision**

The new project still needs local `.env` values and Google Calendar credential JSON files for development and integration setup, but they must not be committed.

**Reason**

The app requires real integration credentials for local testing, but committing secrets is unsafe.

**Implication**

Provide `.env.example` and documentation for required variables. Keep real `.env` files and `Google Calendar API Credentials.json` out of Git.

## 035 - Patient Accounts Are In MVP

**Decision**

Patient registration, login, and a patient appointment/profile area are part of MVP.

Patient accounts are for booking and appointment management only. They are not medical-record accounts.

**Reason**

Authenticated patient ownership makes booking status pages, appointment history, cancellation requests, and cross-patient privacy safer than a guest-only booking flow.

**Implication**

Patients can register/login, manage basic contact details, book appointments, view their own appointments, view deposit/payment state, and request cancellation when clinic policy allows it. Do not build medical records, diagnosis history, prescriptions, chat, file uploads, or treatment notes.

## 036 - Role-Based Access Starts In The Foundation

**Decision**

The MVP should model clinic-side staff roles and patient ownership from the start:

- owner
- admin
- manager
- receptionist
- doctor

Patients are represented through patient ownership/profile records, not `OrganizationMember` staff memberships.

**Reason**

Clinic-side users and patients both authenticate, so access separation is foundational rather than a later polish step.

**Implication**

Owner can manage clinic settings, staff, doctors, services, calendars, appointments, and billing configuration. Admin/manager can manage clinic operations and appointments according to configured permissions. Receptionist can create/manage appointments but should not manage billing/platform settings unless allowed. Doctor can view their own calendar/appointments where needed. Patient can view and manage only their own appointments/profile.

## 037 - Google Calendar Foundation Comes Early

**Decision**

Google Calendar connection/setup and calendar-resource mapping should be built early after authentication, organization scoping, and the core data model.

Creating final Google Calendar appointment events still happens only after Stripe webhook-confirmed payment or authorized manual confirmation.

**Reason**

DocApp depends on clinic calendars, doctor calendars, resource/cabinet calendars, and appointment sync. The integration shape affects the data model and admin setup.

**Implication**

Build Google Calendar configuration early, but keep appointment event creation payment-gated. Google Calendar remains a sync target; the local database remains the product source of truth.

## 038 - Use Two-Stage Slot Locking

**Decision**

DocApp uses two different slot locking stages:

1. Temporary slot hold when a patient selects a slot and opens the booking form.
2. Pending-payment appointment lock when the patient submits the form and is sent to Stripe Checkout.

The form hold is short, for example 2-5 minutes. The checkout lock is longer, for example 15-30 minutes. Durations should be clinic-configurable eventually, with sensible MVP defaults.

**Reason**

The short hold protects the form-filling moment. The longer pending-payment lock protects the Stripe Checkout window.

**Implication**

Closing the form should release the hold as a best-effort optimization, but expiration is the source of truth. Pending-payment appointments must expire if payment does not complete.

## 039 - Slot Holds Require Token Or Session Validation

**Decision**

Temporary slot holds are server-side records, not only visual UI state.

When the patient submits the booking form, the server must verify that the hold exists, belongs to the same user/session flow, is active, is not expired, matches organization/service/doctor/resource/start/end time, and has not already been converted.

**Reason**

Without hold ownership validation, one user could accidentally or intentionally convert another user's slot hold.

**Implication**

Checkout creation is rejected if the hold is invalid, expired, mismatched, or already converted.

## 040 - Google Calendar IDs Live In Integration Records

**Decision**

Local doctor/resource/cabinet records should not be tightly coupled to Google-specific fields.

Use `CalendarIntegration` or equivalent mapping records for external Google Calendar IDs.

**Reason**

The local data model should describe clinic operations. Google Calendar is an external sync target and may later be replaced, supplemented, or reconnected.

**Implication**

`Resource` / `Cabinet` represents local clinic resources. `Doctor` / staff represents local people. `CalendarIntegration` maps organizations/doctors/resources to Google Calendar identifiers.

## 041 - Public Booking Requires Abuse Prevention

**Decision**

Public-facing slot holds, booking submission, and Checkout Session creation require basic abuse prevention.

**Reason**

An attacker or careless user could hold many slots, spam Checkout creation, or interfere with booking availability.

**Implication**

Add rate limiting for hold creation, booking submission, and Checkout Session creation. Prevent one user/session/IP from holding many slots at once. Expire holds aggressively. CAPTCHA can be considered later if abuse appears.

## 042 - Pending Cleanup Needs A Concrete Mechanism

**Decision**

Temporary holds and pending-payment appointments must expire automatically through a concrete cleanup mechanism.

**Reason**

Browser close, modal close, page unload, and cancel-page visits are best-effort only.

**Implication**

Choose a cleanup path such as Vercel Cron, a protected cleanup route, a database scheduled job, or a background worker later. Availability logic must also ignore expired holds/pending appointments even before cleanup deletes or marks them.

## 043 - Timezone Policy Is Clinic-Centered

**Decision**

Clinic timezone is the default operational timezone.

**Reason**

Availability, patient display, admin scheduling, and Google Calendar sync must agree on time boundaries.

**Implication**

Organization/clinic has a timezone. Availability rules are interpreted in clinic timezone. Appointment start/end are stored consistently. Patient/admin/doctor displays use clinic timezone unless later configured otherwise. Google Calendar sync uses the clinic/calendar timezone consistently. Tests should cover timezone boundaries.

## 044 - Rescheduling Is Out Of Scope Until Explicitly Added

**Decision**

Cancellation/request-cancellation can be part of MVP. Rescheduling is out of scope unless explicitly added later.

**Reason**

Rescheduling introduces another availability, payment, notification, and calendar-sync workflow.

**Implication**

Do not build rescheduling during MVP foundation unless a later decision adds it.

## 045 - Clinic Owner And Admin Accounts Are Provisioned Privately

**Decision**

Clinic owner/admin accounts must be provisioned only through the Clerk Dashboard or a controlled database/administrative process. DocApp must not expose a public owner/admin registration form.

**Reason**

Owner/admin accounts can create or control clinic-scoped access to operational, patient, payment, and calendar data. Public self-registration would allow unverified users to claim clinic-side authority and create untrusted or orphaned clinic accounts.

**Implication**

Owner/admin roles and organization memberships are assigned only through trusted administrative processes. A directly provisioned local database record must be linked to a trusted Clerk identity before authentication. Public input, self-selected roles, and user-controlled Clerk metadata must never grant owner/admin access.

## 046 - A Clinic Owns A Google Connection But Is Not A Google Account

**Decision**

The local `Organization` is the single clinic profile and product source of truth for this deployment. For MVP, an existing clinic may have one active connected Google account containing multiple calendars. Store the account connection separately from individual calendar mappings. Calendars are mapped through integration records to existing local doctors, resources/cabinets, or an explicitly documented clinic-default purpose.

**Reason**

Clinic identity, authorization, services, booking policies, availability, appointments, and payment history must remain stable if Google Calendar is unavailable, disconnected, or replaced. Treating the clinic itself as a Google account would tightly couple core product records to an external provider.

**Implication**

Create the organization, authorized membership, doctors, resources, and calendar integration schema before implementing the Google connection flow. Keep doctor/resource booking settings local. Only authorized owner/admin roles may manage the clinic Google connection and mappings. Disconnecting or replacing Google Calendar must not delete local clinic records.

## 047 - Implementation Tasks Follow Explicit Dependencies

**Decision**

Implement roadmap tasks from top to bottom, one approved task/branch at a time, and do not begin a task until its prerequisite models, authorization, services, or integrations exist.

**Reason**

DocApp workflows cross authentication, clinic scoping, availability, slot locking, payments, calendar sync, notifications, and authorization. Implementing dependent behavior before its foundation creates temporary shortcuts and contradictory ownership boundaries.

**Implication**

The task roadmap must place local organization and operational records before external integration setup, Stripe Checkout redirection after server-side Checkout Session creation, and scheduled/rate-limit foundations before features depend on them. Focused tests are added with each implementation task; the final testing phase audits and extends coverage rather than postponing it.
