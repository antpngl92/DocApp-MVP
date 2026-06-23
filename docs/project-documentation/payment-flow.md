# Payment Flow

## Core Rule

Stripe webhooks are the only payment-finalization authority. Browser redirects and status pages never mark an order paid or confirm an appointment.

## Practice Payment Model

Each deployment uses one practice-owned Stripe account. Deposits from every cabinet are paid into that account.

MVP does not split money by cabinet, pay employed/renting providers, calculate wages, perform revenue sharing, or use Stripe Connect.

## Checkout Creation

Before creating Checkout, the server must:

1. authenticate the patient
2. validate the anonymous hold ownership and expiry
3. reload the cabinet, cabinet-service assignment, service duration, price, deposit, and currency
4. verify the slot is still available
5. create the pending appointment and `AppointmentOrder`
6. create Stripe Checkout with trusted metadata such as `appointmentOrderId`
7. persist the Checkout Session ID

Never trust amounts, cabinet IDs, service IDs, patient IDs, or ownership claims supplied only by the browser.

## Webhook Fulfillment

The Stripe route verifies the raw-body signature, resolves the local order from trusted metadata, checks payment state and amount, and performs idempotent fulfillment.

For completed payment:

- mark order paid
- store Payment Intent ID where available
- mark appointment confirmed
- record history/audit state
- initiate cabinet calendar synchronization
- enqueue/send idempotent notifications

For expired Checkout, expire pending state only when it is still valid to do so and release the slot through the documented cleanup lifecycle.

## Status Pages

Success, cancel, expired, and status pages read local state through a public-safe reference or authenticated ownership. They do not mutate payment state or create calendar events.

## Refunds

Patients cannot request or self-initiate refunds in the app. Admin may issue or record an authorized refund with reason and audit history. Receptionists cannot issue money refunds by default.

Appointment history remains visible after refund. Refund status is separate from appointment status.

The default non-refundable deposit policy must be clearly shown to patients. The practice is responsible for policy language suitable for its business and jurisdiction.

## Security And Idempotency

- Stripe secrets stay server-side
- webhook signatures are mandatory
- fulfillment tolerates duplicate/out-of-order delivery
- identifiers are stored for traceability
- server-calculated amounts are compared before fulfillment
- order/appointment queries are scoped to the local practice
- no sensitive medical details enter Stripe metadata
