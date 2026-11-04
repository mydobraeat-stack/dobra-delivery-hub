DO $$ DECLARE _name text; _definition text; BEGIN
FOREACH _name IN ARRAY ARRAY['submit_driver_application','guard_driver_document_review','guard_existing_driver_approval'] LOOP
SELECT pg_get_functiondef(p.oid) INTO _definition FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.proname=_name;
_definition:=replace(_definition, 'file_path LIKE _id::text||''/%''', 'file_path LIKE ''driver-documents/''||_id::text||''/%''');
_definition:=replace(_definition, 'NEW.file_path NOT LIKE auth.uid()::text||''/%''', 'NEW.file_path NOT LIKE ''driver-documents/''||auth.uid()::text||''/%''');
_definition:=replace(_definition, 'file_path LIKE NEW.id::text||''/%''', 'file_path LIKE ''driver-documents/''||NEW.id::text||''/%''');
EXECUTE _definition;
END LOOP;
END $$;