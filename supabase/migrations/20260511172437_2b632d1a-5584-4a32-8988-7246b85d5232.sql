DROP POLICY IF EXISTS "Anyone can insert login attempts" ON public.login_attempts;

CREATE POLICY "Users can record login attempts"
ON public.login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(trim(email)) BETWEEN 3 AND 320
  AND (
    success = false
    OR auth.uid() IS NOT NULL
  )
);