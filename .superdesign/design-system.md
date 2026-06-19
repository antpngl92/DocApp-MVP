# DocApp Design System

This design system is the SuperDesign guardrail for DocApp MVP UI exploration.

It must be passed as a context file to SuperDesign design commands.

## Product Context

DocApp is a deposit-based appointment booking and Google Calendar management tool for small private clinics.

It is not:

- a public doctor marketplace
- a medical-record system
- a prescription platform
- a diagnosis or treatment-note product
- an ad-supported consumer app

## Core Experience

DocApp must help:

- patients book appointments and pay deposits clearly
- clinic staff manage appointments and manual bookings
- admins see payment, appointment, slot hold, and calendar sync states separately
- clinics reduce no-shows without creating confusing refund flows

## Visual Direction

Use:

- modern calm clinic SaaS styling
- light neutral backgrounds
- white/off-white panels
- soft borders
- restrained but intentional shadows
- readable typography
- muted clinical blue and green accents
- refined hero composition with a clear primary CTA
- polished product/clinic-operations visual areas, especially on the homepage
- more deliberate spacing and card hierarchy than the current foundation placeholder UI
- clear warning states for holds, payment issues, and sync failures
- desktop-friendly admin information density
- mobile-first patient booking layouts

Avoid:

- ads
- heavy gradients as the identity
- decorative blobs or bokeh backgrounds
- purple-heavy AI startup aesthetics
- marketplace-style doctor cards as the main product metaphor
- medical-record or hospital-management UI
- dark, flashy, or entertainment-oriented styling

## Suggested Palette

These are approved direction tokens for modern clinic-focused design exploration. They should
remain close to the current CSS tokens unless implementation explicitly updates global variables.

```txt
Background: #f8fafc
Surface: #ffffff
Surface muted: #f1f5f9
Surface elevated: #fbfdff
Text strong: #0f172a
Text default: #111827
Text muted: #64748b
Border: #dbe3ea
Border strong: #cbd5e1
Primary clinical blue: #2563eb
Primary blue hover: #1d4ed8
Primary soft: #dbeafe
Secondary clinical green: #0f766e
Secondary soft: #ccfbf1
Success: #15803d
Warning: #b45309
Danger: #b91c1c
Info: #0369a1
```

Use colors sparingly. Most screens should be neutral, with color reserved for actions and statuses.
Subtle tonal section backgrounds are allowed when they improve hierarchy. Avoid heavy gradients as
the main identity.

## Typography

Approved direction:

```txt
Inter, Arial, Helvetica, sans-serif
```

Use `Inter` or a similarly neutral modern sans-serif when implementation reaches the theme update.
If web-font loading is introduced, use the Next.js font path rather than ad hoc client-side imports.

- readable sans-serif
- no decorative or serif display type
- no negative letter spacing
- stronger homepage display headings without feeling like a generic SaaS template
- compact headings in dashboards and operational screens
- clear labels and helper text in forms
- consistent numeric/tabular treatment where useful for prices, counts, and schedules

## Homepage Tone

Phase 7 homepage design should not copy the current foundation layout too closely. It should use the
existing palette as a base while feeling more modern, composed, and product-ready.

Approved homepage direction:

- use the desktop exploration as the structural starting point
- borrow the mobile exploration's compact mobile pacing and CTA treatment
- replace generic foundation cards with stronger value sections and a polished hero
- include a hero visual area that can later be configured by admins
- keep the homepage clinic/product-focused rather than marketplace-like
- avoid fake metrics, public staff-login language, and staff/admin-specific copy

## Layout Rules

Patient booking:

- mobile-first
- single clear primary action per step
- fewer days/time columns on mobile
- full price, deposit due now, and remaining balance visible before Checkout
- login/register step should feel embedded in booking

Admin:

- desktop-friendly
- operational layout
- tables, filters, agenda views, and status panels
- no marketing hero sections inside admin app
- dashboard cards for operational metrics

Patient account:

- appointment-management only
- simple, private, low-clutter
- no medical-record navigation

## Status Systems

Appointment states:

- pending payment
- confirmed
- cancellation requested
- cancelled
- expired
- no-show
- completed

Payment states:

- payment pending
- deposit paid
- checkout expired
- refunded
- paid externally
- pay at clinic
- no deposit required

Slot hold states:

- available
- selected by current patient
- held by current patient
- held by another patient
- hold expiring soon
- hold expired
- pending payment

Calendar sync states:

- calendar not created
- calendar created
- calendar sync failed
- retry pending

Do not combine these into one visual state. Show them as separate badges or rows where needed.

## Required Copy

Use:

- "Full appointment price"
- "Deposit due now"
- "Remaining balance at clinic"
- "Deposit paid"
- "Payment pending"
- "Request cancellation"
- "This slot is no longer available"
- "Appointment is confirmed, but calendar sync failed"
- "This deposit is non-refundable by default if you do not attend."

Avoid:

- "booking fee"
- "cancel and refund"
- "refund request" in patient flows
- vague "Something went wrong" messages without context

## Privacy And Safety Rules

Do not design:

- medical records
- diagnosis history
- prescriptions
- lab results
- insurance workflows
- doctor-patient chat
- file uploads
- treatment notes
- patient refund request UI
- ads
- rescheduling unless explicitly added later

Google Calendar event UI must avoid sensitive medical details.

## Implementation Guardrails

Approved designs must be translated into maintainable Next.js components.

Follow:

- `docs/project-documentation/project-structure.md`
- `docs/project-documentation/code-style.md`

Do not port:

- prototype Radix/shadcn setup
- old reusable UI components
- old ad components
- prototype payment/calendar lifecycle shortcuts

SuperDesign HTML is reference material, not automatic production code.
