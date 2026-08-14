-- One-time ownership repair for rows created before project scoping existed.
-- The legacy UI always selected the first project, and the only operational
-- row references the first project's master data. Abort if that target is no
-- longer unique instead of silently assigning records to the wrong project.
DO $$
DECLARE
  target_site_id BIGINT;
  target_count INTEGER;
  table_name TEXT;
  operational_tables CONSTANT TEXT[] := ARRAY[
    'contractors_master', 'material_categories', 'suppliers', 'material_inward',
    'material_issued', 'material_wastage', 'expense_categories', 'expenses',
    'fund_requisitions', 'equipment_types', 'equipment', 'equipment_usage',
    'equipment_payments', 'visitors', 'meetings', 'site_photos',
    'safety_check_items', 'safety_checklists', 'safety_incidents', 'ppe_issuance',
    'cube_tests', 'material_tests', 'ncr_reports', 'daily_progress_reports',
    'contractor_shifts', 'contractor_material_allocations', 'material_damage_deductions'
  ];
BEGIN
  SELECT COUNT(*), MIN(id)
  INTO target_count, target_site_id
  FROM public.sites
  WHERE name = 'Site Alpha (Main Project)';

  IF target_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one legacy Site Alpha project, found %', target_count;
  END IF;

  FOREACH table_name IN ARRAY operational_tables LOOP
    EXECUTE format('UPDATE public.%I SET site_id = $1 WHERE site_id IS NULL', table_name)
      USING target_site_id;
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN site_id SET NOT NULL', table_name);
  END LOOP;
END $$;
