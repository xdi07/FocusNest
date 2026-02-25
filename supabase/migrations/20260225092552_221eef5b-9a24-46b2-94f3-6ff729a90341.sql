
-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admins to view all login attempts
CREATE POLICY "Admins can view all login attempts"
  ON public.login_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admins to view all focus sessions
CREATE POLICY "Admins can view all sessions"
  ON public.focus_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admins to view all goals
CREATE POLICY "Admins can view all goals"
  ON public.goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admins to view all user settings
CREATE POLICY "Admins can view all settings"
  ON public.user_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
