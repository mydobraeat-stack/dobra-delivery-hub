ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_reference text;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('cash','card')),
  ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending','paid','failed','cash'));