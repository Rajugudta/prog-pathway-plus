# Add Sign Out option to the Profile page

## What
Add a "Sign out" action to the Profile page (`/profile`), so users can log out directly from their profile — not only from the hidden sidebar footer.

## Where
`src/routes/_authenticated/profile.tsx`

## How
- Add a **Sign out** button (with a `LogOut` icon) to the profile page. It sits in the action area near the stats section — a bordered, subtle button labeled "Sign out", plus a hint that it signs you out on this device.
- Reuse the exact sign-out logic already in `AppShell.tsx`: cancel in-flight queries, clear the cache, call `supabase.auth.signOut()`, then navigate to `/auth`.
- Keep all existing profile content unchanged (banner, stats, skills, details form).

## Verification
- Typecheck passes.
- Open `/profile` signed in, confirm the Sign out button appears, click it, and confirm the app lands on the auth page signed out.
