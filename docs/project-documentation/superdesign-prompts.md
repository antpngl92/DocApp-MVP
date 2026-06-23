# SuperDesign Prompts

## Shared Context

Design DocApp as the public booking and operational application for one independent healthcare professional with one or more cabinets/offices.

Patients choose a cabinet such as `Dr. Anton - Pleven` or `Dr. Anton - Pordim`, then a service and available time. The product collects an appointment deposit, tracks the remaining balance, and optionally syncs each cabinet to its own Google calendar.

Do not design a clinic workforce platform, public provider marketplace, medical-record system, SaaS marketing page, or hospital dashboard. Do not add provider selection/cards, payroll, room rental, revenue sharing, ads, diagnosis, prescriptions, medical files, chat, or insurance workflows.

Use the approved modern clinical theme consistently. Keep colors purposeful rather than assigning random colors to sections. Public pages should feel calm, trustworthy, modern, and specific to the professional's practice.

## Public Homepage

Design a responsive patient-facing homepage for the independent practice, not a DocApp product-marketing page.

Include:

- full-width image-led hero with configurable headline/supporting copy
- prominent `Book an Appointment` action
- `Contact Us` secondary action
- language selector
- concise professional/practice introduction
- cabinet/location summary
- service overview
- deposit and attendance-policy summary
- contact and working information

The hero image and major copy are admin-configurable. Do not imply medical records or diagnosis.

## Booking Wizard

Design separate visual steps in one wizard:

1. cabinet selection
2. service selection for that cabinet
3. date and time
4. patient details/authentication where needed
5. payment/review

Do not combine cabinet/service selection and calendar selection into one screen.

The desktop calendar shows Monday-Sunday columns with previous/next week icon buttons and available time buttons. Mobile shows three day columns starting with today. Include available, selected, held-by-another, and own-hold-expiring states without shifting layout.

Always show cabinet/location, full price, deposit due now, remaining balance, and policy copy clearly.

## Staff Dashboard

Design a desktop-oriented dashboard with a collapsible icon sidebar and logout at the bottom. The public navbar does not appear.

Admin navigation may include dashboard, cabinets, services, schedule, manual booking, staff, notifications, integrations, homepage content, and settings.

Receptionist navigation may include schedule, appointments/manual booking, notifications relevant to operations, and profile. Do not show admin-only integration, staff, payment, or configuration controls.

There is no separate provider role or provider onboarding surface.

## Patient Account

Keep it simple and appointment-focused: upcoming/past appointments, cabinet/location, service/time, deposit/payment status, remaining balance, policy, and request-cancellation where allowed.

Do not show admin internals, refund initiation, medical records, prescriptions, diagnosis history, insurance, chat, files, or treatment notes.

## Status And Failure States

Design explicit empty, loading, validation, unavailable-slot, expired-hold, pending-payment, payment-failed, confirmed, calendar-sync-failed, and retry states. Calendar failure is secondary to the confirmed local appointment and must not look like payment failure.
