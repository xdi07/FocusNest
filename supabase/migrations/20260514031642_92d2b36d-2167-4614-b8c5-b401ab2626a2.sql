ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS daily_limit_minutes integer NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS daily_usage_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_usage_date date;