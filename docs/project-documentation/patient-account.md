# Patient Account

## Overview

Patient registration and login are part of the DocApp MVP.

Patient accounts are for booking and appointment management only. They are not medical-record accounts.

## MVP Scope

Patients should be able to:

- register/login
- manage basic profile and contact details
- browse practice and cabinet booking pages
- book appointments
- view upcoming appointments
- view past appointments
- view appointment detail
- view payment/deposit status
- view remaining balance due at the appointment
- view practice cancellation/refund policy
- request cancellation when practice policy allows it
- receive booking-related email notifications

## Out Of Scope

Do not build the following patient-account features in MVP:

- medical records
- diagnosis history
- prescriptions
- lab results
- insurance data
- clinical chat
- file uploads
- treatment notes
- health questionnaires unless explicitly added later
- rescheduling unless explicitly added later

## Booking Ownership

Every patient booking should be attached to the authenticated patient account.

Patient-facing appointment views must enforce ownership:

- patient can view only their own appointments
- patient cannot view another patient's appointment by guessing IDs or status links
- patient cannot access practice admin records
- patient cannot see admin-only payment internals
- patient cannot see unrelated practice data

## Booking Flow Integration

Recommended MVP behavior:

1. Patient can browse public booking pages, services, and available slots.
2. Patient selects a slot.
3. App creates a temporary slot hold.
4. Patient registers or logs in before final booking/payment.
5. Patient profile data prefills booking form fields.
6. Patient can update contact details during booking.
7. Server validates the slot hold and booking details.
8. Booking is attached to the patient account.
9. Patient pays deposit through Stripe Checkout.
10. Patient can see appointment/payment status in their account.

Guest booking can be considered later, but MVP direction prioritizes patient accounts.

## Cancellation Requests

Patient cancellation behavior is configurable per practice:

- cancellation request allowed only N days/hours before appointment
- cancellation request allowed anytime
- cancellation request not allowed

The patient action should be named `Request cancellation`, not `Cancel and refund`.

Patient cancellation request does not automatically mean refund request. Refund execution belongs only to an authorized admin.

## Profile Data

Allowed patient profile fields:

- name
- email
- phone
- optional basic contact preferences if needed

A patient profile should be linked one-to-one to the local `User` record. Avoid storing medical details in the patient profile.

## Notifications

Patient accounts may receive:

- booking confirmation email after webhook-confirmed payment
- appointment reminder email
- cancellation request/status email
- cancellation confirmation email if applicable
- refund notification only when an authorized admin issues or records a refund

Notification sending should be idempotent.

## Privacy Boundaries

Patient account pages must not expose:

- another patient's appointment
- another practice's booking data
- raw Stripe metadata unless explicitly safe
- sensitive Google Calendar payloads
- medical details

All patient account data access must be checked on the server.
