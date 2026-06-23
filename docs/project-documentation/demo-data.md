# Demo And Pilot Data

## Demo Practice

```txt
Practice name: Dr. Anton Practice
Owner/admin: Dr. Anton
Timezone: Europe/Sofia
Currency: BGN
Contact email: hello@example-practice.test
```

## Demo Staff

- one privately provisioned admin/owner
- one invited receptionist
- two patient accounts

There is no separate provider staff account or provider profile in target demo data.

## Demo Cabinets

### Dr. Anton - Pleven

- active and publicly bookable
- central Pleven address
- works Monday, Tuesday, Thursday, and Friday
- mapped to Google calendar `Dr. Anton - Pleven`

### Dr. Anton - Pordim

- active and publicly bookable
- Pordim address
- works Wednesday
- mapped to Google calendar `Dr. Anton - Pordim`

The two cabinets should use different availability so cabinet-specific slot generation is easy to verify.

## Demo Services

### Initial consultation

- duration: 30 minutes
- full price: 80 BGN
- deposit: 20 BGN
- remaining balance: 60 BGN
- assigned to both cabinets

### Follow-up consultation

- duration: 20 minutes
- full price: 50 BGN
- deposit: 15 BGN
- remaining balance: 35 BGN
- assigned to both cabinets

### Extended consultation

- duration: 45 minutes
- full price: 100 BGN
- deposit: 30 BGN
- remaining balance: 70 BGN
- assigned only to Pleven

## Demo States

Include examples of:

- available slot
- active anonymous hold
- hold expiring soon
- pending payment
- confirmed paid appointment
- manual pay-at-appointment booking
- failed Google sync awaiting retry
- cancellation requested
- cancelled
- no-show
- completed
- refunded order with retained appointment history

## Pilot Setup Checklist

- confirm legal/business display name
- configure admin identity and invited receptionist if needed
- create every cabinet with accurate address/contact information
- configure services and cabinet assignments
- configure cabinet working days, breaks, closures, and holidays
- confirm timezone, currency, deposit, cancellation, and refund policy
- connect the practice Stripe account
- connect the practice Google account if desired
- map each cabinet to the correct Google calendar
- verify public homepage and booking copy
- run end-to-end test bookings for every cabinet
- verify confirmation email and calendar retry behavior

## Admin Handoff

The admin should understand that local appointments remain authoritative, payments finalize only through Stripe webhooks, Google sync may be retried without losing a paid appointment, holds expire automatically, patients cannot initiate refunds, and every cabinet has independent booking settings/calendar mapping.
