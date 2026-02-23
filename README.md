# Peak NYU – Next.js

This is the Peak NYU marketing site and business portal rewritten in **Next.js** (App Router).

## What’s included

- **Landing page** (`/`) – Hero, How it works, Our story, Team, Footer, theme toggle, scroll animations
- **Business login** (`/business/login`) – Email/password sign in and sign up via Firebase Auth
- **Business dashboard** (`/business/dashboard`) – Event list and analytics (requires login)
- **Create event** (`/business/create-event`) – Pick a venue and create an event (Firestore)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Firebase**

   Copy `.env.local.example` to `.env.local` and set your Firebase web app config (from Firebase Console → Project settings → General):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

   Ensure:
   - **Authentication** → Sign-in method: Email/Password enabled
   - **Firestore**: `venues` collection (for create-event) and `events` collection with a composite index on `ownerId` + `date` (you’ll get a link in the console if needed)

3. **App integration (events & RSVPs)**  
   Events created on the website are stored in the `events` collection with: `addr`, `createdAt`, `date`, `ownerId`, `priceBoys`, `priceGirls`, `revenue`, `total`, `venueId`, `venueImage`, `venueName`.  
   To show RSVPs from the app on the website:
   - Only **registered app users** (documents in the **`users`** collection) can RSVP. When a user RSVPs in the app, add a document to **`events/{eventId}/guests`** with **`userId`** (the app user’s UID). The business dashboard resolves guest names from the **`users`** collection; if `userId` is not in `users`, the guest is shown as “Not a registered user”.
   - Optionally update the event document's **`total`** (and **`revenue`** if you track payments) so the dashboard event cards show up-to-date RSVP/ticket counts without opening each event.

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – Development server
- `npm run build` – Production build
- `npm run start` – Run production server
- `npm run lint` – Run ESLint

## Structure

- `app/` – App Router pages and layouts
- `app/page.tsx` – Landing page
- `app/business/` – Login, dashboard, create-event
- `components/` – LandingClient, ThemeToggle
- `lib/` – Firebase init, auth helpers, Firestore helpers

The original static HTML/JS/CSS in the repo is unchanged; the Next.js app replaces the need to open `index.html` and `business/*.html` directly by serving the same experience via Next.js routes.
