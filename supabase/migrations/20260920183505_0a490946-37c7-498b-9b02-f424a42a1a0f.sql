ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS address_line text,
  ADD COLUMN IF NOT EXISTS postal_code text;