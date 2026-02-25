
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_info TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view login attempts (admin-like access)
CREATE POLICY "Authenticated users can view login attempts"
  ON public.login_attempts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Anyone can insert (login attempts happen before auth)
CREATE POLICY "Anyone can insert login attempts"
  ON public.login_attempts
  FOR INSERT
  WITH CHECK (true);
