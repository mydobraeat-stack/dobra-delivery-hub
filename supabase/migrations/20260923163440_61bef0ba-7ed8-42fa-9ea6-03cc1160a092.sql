CREATE TABLE public.prime_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive','active','past_due','cancelled')),
  plan text NOT NULL DEFAULT 'monthly' CHECK (plan IN ('monthly')),
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.prime_memberships TO authenticated;
GRANT ALL ON public.prime_memberships TO service_role;

ALTER TABLE public.prime_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own membership"
  ON public.prime_memberships FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_prime_memberships()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_prime_memberships_updated_at
  BEFORE UPDATE ON public.prime_memberships
  FOR EACH ROW EXECUTE FUNCTION public.touch_prime_memberships();
