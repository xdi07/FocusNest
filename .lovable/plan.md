## Overuse Warning & Nudge System

When a user's daily app usage crosses their personal limit, FocusNest shows escalating warnings, dimming, and break prompts — but stays fully responsive.

### How it works (user-facing)

- User sets a **daily app-usage limit** in Profile → Settings (e.g. 90 minutes).
- App tracks total time spent in the app today (across all pages).
- Three escalating stages once usage crosses the limit:
  1. **Approaching (80% of limit)** — gentle toast: *"You're close to your daily limit. Consider a break soon."*
  2. **At limit (100%)** — full-screen modal: *"You've reached your daily limit"* with two choices: *Take a 5-min break* (locks app for 5 min with breathing animation) or *Continue anyway*.
  3. **Overuse (120%+)** — persistent dimmed overlay (40% opacity), slow gentle pulse on screen edges, and a sticky banner at the top reminding the user to stop. A friendly nudge toast appears every 5 minutes.
- Counter resets at midnight (local time).

### Intensity level: 3 (moderate)

- Dim overlay is noticeable but doesn't block interaction.
- Banner is dismissible per-session but reappears after 10 min.
- Break lock is skippable (so it never traps the user).

### Where it lives

- **Settings**: New field `daily_limit_minutes` on `user_settings` (default 120).
- **Tracking**: A small `useUsageTracker` hook in `src/hooks/` increments time-in-app every minute while the tab is visible, persisted to `localStorage` keyed by date + user id.
- **Provider**: New `UsageGuardProvider` wraps the authenticated app shell, exposes current usage + stage, and renders the overlay/banner/modal.
- **UI surfaces**:
  - `OveruseBanner` (sticky top, stage 3)
  - `OveruseDimOverlay` (full-screen pointer-events-none dim, stage 3)
  - `OveruseLimitModal` (centered dialog, stage 2)
  - Toasts via existing `sonner`
- **Profile page**: New "Daily app limit" slider (15–240 min) in the settings section.

### Technical notes

- Time is tracked client-side (visibility-aware) — no need to call backend every minute. Daily totals are also written to `user_settings.last_usage_date` + a new `daily_usage_minutes` column so progress survives reloads.
- Schema migration adds two columns to `user_settings`:
  - `daily_limit_minutes int not null default 120`
  - `daily_usage_minutes int not null default 0`
  - `last_usage_date date`
- `useUsageTracker` flushes to Supabase every 5 minutes and on `visibilitychange`.
- Stage transitions are memoized to avoid re-render storms; toasts are rate-limited.
- Admin pages and `/auth` are excluded from the overlay so admins and login flows are never affected.

### Files to add / change

- New: `src/hooks/useUsageTracker.ts`
- New: `src/contexts/UsageGuardContext.tsx`
- New: `src/components/overuse/OveruseBanner.tsx`
- New: `src/components/overuse/OveruseDimOverlay.tsx`
- New: `src/components/overuse/OveruseLimitModal.tsx`
- Edit: `src/App.tsx` — wrap authenticated routes with `UsageGuardProvider`
- Edit: `src/pages/ProfilePage.tsx` — add daily limit slider
- Edit: `src/contexts/AuthContext.tsx` — extend `settings` type with new fields
- Migration: add columns to `user_settings`
