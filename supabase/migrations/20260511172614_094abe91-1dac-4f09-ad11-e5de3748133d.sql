CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
DROP POLICY IF EXISTS "Admins can view all settings" ON public.user_settings;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all sessions"
ON public.focus_sessions
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all goals"
ON public.goals
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all settings"
ON public.user_settings
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;