# Plan: Premium Barber & Salon Booking Marketplace

A marketplace booking app — clients discover top barbers and salons, browse portfolios and reviews, and book time slots instantly. Built to feel more premium than thecuts or Booksy. Demo data for v1 (no real backend yet), designed so a real backend can be wired in later.

## Design

First step: generate 3 distinct design directions (rendered previews) for you to pick from. Each will be a strong, premium visual direction for the booking marketplace — no generic template look.

## Pages

- **Home (`/`)** — hero, search by service/location, featured barbers & shops, how it works, top categories (cuts, fades, braids, color, beard, nails).
- **Explore (`/explore`)** — browsable directory of barbers and salons with filters (service, price, rating, distance, availability), sortable results.
- **Barber/Salon profile (`/barber/$slug`)** — portfolio gallery, services with prices and durations, reviews with ratings, live availability calendar.
- **Booking flow (`/book/$slug`)** — pick service → barber → date → time slot → confirm; deposit payment step shown as a polished checkout mock (demo mode, no real charge).
- **My bookings (`/bookings`)** — upcoming and past appointments, reminders summary, cancel/reschedule actions (demo), waitlist status.
- **Barber dashboard (`/dashboard`)** — today's schedule, upcoming appointments, waitlist management, profile/portfolio overview (demo data).

## Key features (v1)

- Real-time-style availability: generated time-slot grid per barber with taken/available slots; booking marks a slot as taken in-app.
- Profiles, portfolio galleries, ratings & reviews with distribution bars.
- Payments & deposits: checkout UI with deposit option (25% deposit or pay in full) presented as a demo payment flow, clearly labeled; real Stripe wiring comes later with Lovable Cloud.
- Reminders & waitlist: reminder badges on upcoming bookings, join-waitlist on fully booked slots, waitlist promotion demo.
- Rich sample data: ~10 barbers/salons with realistic names, services, prices, photos, reviews, and schedules.

## Technical details

- TanStack Start routes with per-route head() metadata (unique titles/descriptions per page).
- Demo data in typed TS modules under `src/lib/data/` with generated images for barber avatars and portfolio shots.
- Booking state held client-side (context/store) so the full flow works end-to-end without a backend.
- Design tokens in `src/styles.css` (oklch), shadcn-style components, motion for page and list transitions.
- Later step (not in this plan): enable Lovable Cloud for real auth, database, payments, and reminders.

## Order of work

1. Design directions → you pick one.
2. Build data model, pages, and booking flow.
3. Polish, verify in preview, then publish.
