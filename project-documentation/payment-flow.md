# Payment Flow

## Core Rule

Stripe webhooks are the source of truth for payment finalization.

Checkout success pages must not mark orders paid or create Google Calendar events.

## Prototype Reference

The current prototype already creates Stripe Checkout Sessions with:

- `mode: "payment"`
- BGN currency
- a local order ID in Checkout Session metadata
- success URL containing `{CHECKOUT_SESSION_ID}`
- cancel URL containing `{CHECKOUT_SESSION_ID}`

The rebuild can preserve this broad shape and environment variable names, but must fix these prototype issues:

- `/checkout/success` currently marks the order paid.
- `/checkout/success` currently creates the Google Calendar event.
- `/checkout/cancel` attempts cleanup from the browser redirect.
- `STRIPE_WEBHOOK_SECRET` exists, but no implemented Stripe webhook route was found in the prototype.
- Checkout Session IDs should be stored when the session is created, not only after success.
- Webhook fulfillment must be idempotent and must protect against duplicate side effects.

## Current MVP Payment Model

The patient prepays part of the appointment price as a deposit.

Example:

```txt
Full appointment price: 80 BGN
Deposit paid online: 20 BGN
Remaining balance at clinic: 60 BGN
```

Deposits are non-refundable by default. Patients cannot request or self-initiate refunds through DocApp. If a patient pays and does not attend, the deposit remains with the clinic unless an authorized clinic-side user explicitly issues or records a refund.

The default non-refundable deposit behavior is a product default and must be shown clearly to patients. Clinics are responsible for choosing policy text appropriate to their business and jurisdiction.

## Checkout Session Creation

When the patient submits the booking form:

1. Server validates clinic/service/doctor/resource/slot.
2. Server validates active `SlotHold` token/session/user ownership.
3. Server calculates price/deposit from database service data.
4. Server creates pending `Appointment`.
5. Server creates pending `AppointmentOrder`.
6. Server converts the short hold into a pending-payment appointment lock.
7. Server creates Stripe Checkout Session.
8. Server stores Stripe Checkout Session ID.
9. Browser redirects to Checkout.

Checkout Session metadata should include the local order ID:

```txt
metadata: { appointmentOrderId }
```

Do not include sensitive patient/medical data in Stripe metadata.

## Webhook Fulfillment

The webhook route should:

1. Read the raw request body.
2. Verify Stripe signature with `STRIPE_WEBHOOK_SECRET`.
3. Handle `checkout.session.completed`.
4. Read `appointmentOrderId` from session metadata.
5. Fetch the local order and appointment.
6. Verify the order is still eligible for fulfillment.
7. Verify session payment status is paid.
8. Mark order paid.
9. Mark appointment confirmed.
10. Store Stripe session/payment IDs.
11. Commit local payment/appointment state.
12. Trigger Google Calendar sync idempotently.
13. Trigger confirmation notification idempotently.

External side effects after local confirmation must not roll back the confirmed booking. If Google Calendar or email fails, keep the local appointment confirmed and store retry/failure state.

## Idempotency

Webhook fulfillment must be safe if called multiple times.

If the order is already paid and appointment already confirmed, the handler should not duplicate side effects.

If Google Calendar event already exists, retry should not create a duplicate event.

Confirmation emails, admin alerts, cancellation notices, and refund notifications should use persisted notification idempotency keys.

## Expired Checkout

Handle `checkout.session.expired` where practical.

When a Checkout Session expires:

- mark pending order expired if still pending
- mark pending appointment expired if still pending
- release the slot by treating expired pending appointments as unavailable no longer

A separate cleanup job/cron can also expire stale pending appointments.

Pending-payment locks should have a concrete expiration duration configured per clinic, typically 15-30 minutes.

## Cancel Page

The cancel page is only a convenience page.

It can mark a pending appointment/order cancelled if safe, but abandoned checkouts must still be handled by expiration logic.

Checkout success and cancel/status pages should use a public-safe order reference or token and must not expose another patient's details.

## Refunds And Cancellations

Refunds are admin-only actions. Patients should not see a refund request flow.

Minimum MVP refund behavior:

- authorized admin can mark refund review required
- authorized admin can issue or record a refund
- refund action requires a reason
- refund action creates an audit event
- refund action updates payment/order status
- refund action keeps appointment history visible
- refund notification can be sent to the patient if enabled

Default permission guidance:

- owner can issue refunds and override refund rules
- admin/manager can issue refunds if granted permission
- receptionist can cancel appointments or flag refund review, but cannot issue money refunds by default
- doctor can mark outcome where allowed, but cannot issue refunds by default

If implemented:

- store refund status
- store Stripe refund ID
- track cancellation policy
- audit who initiated refund/cancellation

## Stripe Connect

For early single-clinic or controlled pilots, normal Stripe Checkout may be enough.

For a real multi-clinic SaaS where patient deposits belong to clinics and DocApp keeps a fee, evaluate Stripe Connect.

The MVP should avoid hard-coding assumptions that all deposits permanently belong to the platform account. Do not onboard multiple real clinics with patient deposits flowing through the platform owner's Stripe account unless Stripe Connect or an equivalent payment architecture, legal, and accounting handling are explicitly approved.

## Security Rules

- Never expose Stripe secret key to browser.
- Never expose webhook secret to browser.
- Verify webhook signatures.
- Never trust client-provided price/deposit.
- Do not store sensitive patient details in Stripe metadata.
- Do not fulfill payment from success URL.
