ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS vehicle_model text,
  ADD COLUMN IF NOT EXISTS plate text,
  ADD COLUMN IF NOT EXISTS docs_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

ALTER TABLE public.drivers
  DROP CONSTRAINT IF EXISTS drivers_docs_status_check;
ALTER TABLE public.drivers
  ADD CONSTRAINT drivers_docs_status_check
  CHECK (docs_status IN ('draft','in_review','approved','rejected'));

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  expires_on date,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT driver_documents_type_check CHECK (
    doc_type IN ('drivers_licence','id_card','insurance','vehicle_registration','profile_photo')
  ),
  CONSTRAINT driver_documents_status_check CHECK (status IN ('pending','approved','rejected')),
  UNIQUE (driver_id, doc_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_documents TO authenticated;
GRANT ALL ON public.driver_documents TO service_role;

ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers manage own documents" ON public.driver_documents;
CREATE POLICY "Drivers manage own documents"
  ON public.driver_documents FOR ALL TO authenticated
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

DROP TRIGGER IF EXISTS driver_documents_set_updated_at ON public.driver_documents;
CREATE TRIGGER driver_documents_set_updated_at
  BEFORE UPDATE ON public.driver_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS driver_documents_driver_idx ON public.driver_documents(driver_id);