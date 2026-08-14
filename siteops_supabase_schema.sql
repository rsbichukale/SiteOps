-- =========================================================================
-- CONSTRUCTTRACK-SITEOPS SUPABASE DATABASE SCHEMA
-- Copy and run this entire script in Supabase Dashboard -> SQL Editor
-- =========================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sites Table
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    location VARCHAR(250),
    client_name VARCHAR(150),
    description TEXT,
    start_date DATE,
    target_end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Material Categories Master
CREATE TABLE IF NOT EXISTS material_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    default_unit VARCHAR(20) NOT NULL,
    icon_name VARCHAR(50),
    low_stock_threshold NUMERIC(10,2) DEFAULT 10
);

-- 3. Suppliers / Vendors Master
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    material_categories TEXT[],
    gst_number VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Material Inward Register (GRN)
CREATE TABLE IF NOT EXISTS material_inward (
    id SERIAL PRIMARY KEY,
    material_category_id INT REFERENCES material_categories(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(150),
    quantity_received NUMERIC(12,2) NOT NULL,
    quantity_ordered NUMERIC(12,2),
    unit VARCHAR(20) NOT NULL,
    rate_per_unit NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    challan_number VARCHAR(50),
    challan_photo_url TEXT,
    vehicle_number VARCHAR(30),
    quality_check_passed BOOLEAN DEFAULT TRUE,
    quality_notes TEXT,
    received_by VARCHAR(100),
    extra_expenses NUMERIC(10,2) DEFAULT 0,
    extra_expenses_description TEXT,
    date_received TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Material Issue Register
CREATE TABLE IF NOT EXISTS material_issued (
    id SERIAL PRIMARY KEY,
    material_category_id INT REFERENCES material_categories(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    quantity_issued NUMERIC(12,2) NOT NULL,
    quantity_returned NUMERIC(12,2) DEFAULT 0,
    return_status VARCHAR(50) DEFAULT 'NOT_RETURNED',
    return_logs JSONB DEFAULT '[]'::jsonb,
    unit VARCHAR(20) NOT NULL,
    issued_to VARCHAR(200) NOT NULL,
    contractor_id INT,
    contractor_name VARCHAR(150),
    location VARCHAR(200),
    engineer_remarks TEXT,
    issued_by VARCHAR(100),
    date_issued TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Material Wastage & Returns
CREATE TABLE IF NOT EXISTS material_wastage (
    id SERIAL PRIMARY KEY,
    material_category_id INT REFERENCES material_categories(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    notes TEXT,
    date_logged TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Expense Categories Master
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50)
);

-- 8. Daily Petty Cash Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_to VARCHAR(100),
    payment_mode VARCHAR(20) DEFAULT 'CASH',
    receipt_photo_url TEXT,
    date_logged DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Fund Requisitions
CREATE TABLE IF NOT EXISTS fund_requisitions (
    id SERIAL PRIMARY KEY,
    amount_requested NUMERIC(12,2) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    amount_received NUMERIC(12,2),
    date_requested DATE DEFAULT CURRENT_DATE,
    date_received DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Equipment Types Master
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50)
);

-- 11. Equipment Register
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    equipment_type VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    is_rented BOOLEAN DEFAULT TRUE,
    rental_company VARCHAR(150),
    daily_rate NUMERIC(10,2) DEFAULT 0,
    hourly_rate NUMERIC(10,2) DEFAULT 0,
    operator_name VARCHAR(100),
    start_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Equipment Usage Log
CREATE TABLE IF NOT EXISTS equipment_usage (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    date_logged DATE DEFAULT CURRENT_DATE,
    hours_operated NUMERIC(5,2) DEFAULT 0,
    fuel_liters NUMERIC(8,2) DEFAULT 0,
    work_description TEXT,
    operator VARCHAR(100),
    breakdown_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(equipment_id, date_logged)
);

-- 13. Equipment Rental Payments
CREATE TABLE IF NOT EXISTS equipment_payments (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    amount_paid NUMERIC(12,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(20) DEFAULT 'CASH',
    receipt_photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Visitor Log
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    visitor_name VARCHAR(150) NOT NULL,
    company_role VARCHAR(200),
    purpose VARCHAR(50) NOT NULL,
    entry_time TIMESTAMPTZ DEFAULT NOW(),
    exit_time TIMESTAMPTZ,
    accompanied_by VARCHAR(100),
    photo_url TEXT,
    notes TEXT
);

-- 15. Meeting Minutes
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    meeting_date TIMESTAMPTZ DEFAULT NOW(),
    attendees TEXT[],
    agenda TEXT,
    decisions TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Site Photos Timeline
CREATE TABLE IF NOT EXISTS site_photos (
    id SERIAL PRIMARY KEY,
    caption VARCHAR(200),
    photo_url TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'PROGRESS',
    date_taken TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Safety Check Items Master
CREATE TABLE IF NOT EXISTS safety_check_items (
    id SERIAL PRIMARY KEY,
    item_text VARCHAR(250) NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- 18. Daily Safety Checklist Records
CREATE TABLE IF NOT EXISTS safety_checklists (
    id SERIAL PRIMARY KEY,
    date_logged DATE DEFAULT CURRENT_DATE UNIQUE,
    checks JSONB NOT NULL,
    overall_score INT DEFAULT 0,
    total_checks INT DEFAULT 10,
    inspector_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Safety Incident Register
CREATE TABLE IF NOT EXISTS safety_incidents (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMPTZ DEFAULT NOW(),
    severity VARCHAR(20) NOT NULL,
    injured_person VARCHAR(100),
    injured_age INT,
    contractor_name VARCHAR(100),
    description TEXT NOT NULL,
    body_part VARCHAR(100),
    first_aid_given BOOLEAN DEFAULT FALSE,
    first_aid_description TEXT,
    hospital_required BOOLEAN DEFAULT FALSE,
    photos TEXT[],
    corrective_action TEXT,
    reported_to VARCHAR(100),
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PPE Issuance Log
CREATE TABLE IF NOT EXISTS ppe_issuance (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL,
    contractor_name VARCHAR(100),
    item VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    date_issued DATE DEFAULT CURRENT_DATE,
    returned BOOLEAN DEFAULT FALSE,
    date_returned DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Concrete Cube Test Register
CREATE TABLE IF NOT EXISTS cube_tests (
    id SERIAL PRIMARY KEY,
    casting_date DATE NOT NULL,
    grade VARCHAR(10) NOT NULL,
    location VARCHAR(200) NOT NULL,
    num_cubes INT DEFAULT 6,
    result7_day NUMERIC(8,2),
    result28_day NUMERIC(8,2),
    status VARCHAR(10) DEFAULT 'PENDING',
    lab_name VARCHAR(100),
    report_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Material Test Log
CREATE TABLE IF NOT EXISTS material_tests (
    id SERIAL PRIMARY KEY,
    material VARCHAR(100) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    sample_source VARCHAR(200),
    test_result VARCHAR(100),
    pass_fail VARCHAR(10) DEFAULT 'PASS',
    certificate_photo_url TEXT,
    date_tested DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Non-Conformance Reports (NCR)
CREATE TABLE IF NOT EXISTS ncr_reports (
    id SERIAL PRIMARY KEY,
    location VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    is_code_reference VARCHAR(50),
    photos TEXT[],
    assigned_to VARCHAR(100),
    status VARCHAR(30) DEFAULT 'OPEN',
    rectification_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- RLS is enabled immediately. Policies are installed by the project-isolation
-- upgrade below; there is intentionally no anonymous fallback policy.
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_inward ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_issued ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_wastage ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_issuance ENABLE ROW LEVEL SECURITY;
ALTER TABLE cube_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncr_reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS daily_progress_reports (
    id SERIAL PRIMARY KEY,
    report_date VARCHAR(50) NOT NULL,
    building_name VARCHAR(200) NOT NULL,
    format_style VARCHAR(50) DEFAULT 'PROFESSIONAL',
    carpenter_count INT DEFAULT 0,
    carpenter_notes TEXT,
    fitter_count INT DEFAULT 0,
    fitter_notes TEXT,
    electrical_count INT DEFAULT 0,
    electrical_notes TEXT,
    plumber_count INT DEFAULT 0,
    plumber_notes TEXT,
    core_cutting_count INT DEFAULT 0,
    core_cutting_notes TEXT,
    fabrication_count INT DEFAULT 0,
    fabrication_notes TEXT,
    suraj_chauhan_tiles_count INT DEFAULT 0,
    suraj_chauhan_notes TEXT,
    mohan_khetawat_waterproofing_count INT DEFAULT 0,
    mohan_khetawat_notes TEXT,
    naresh_khetawat_waterproofing_count INT DEFAULT 0,
    naresh_khetawat_notes TEXT,
    custom_trades JSONB DEFAULT '[]'::jsonb,
    bathkam JSONB,
    bathkam_breaker_notes TEXT,
    department_staff_count INT DEFAULT 0,
    department_labour_count INT DEFAULT 0,
    department_tasks_notes TEXT,
    cement_stock JSONB DEFAULT '[]'::jsonb,
    before_photos JSONB DEFAULT '[]'::jsonb,
    after_photos JSONB DEFAULT '[]'::jsonb,
    work_photo_sets JSONB DEFAULT '[]'::jsonb,
    damage_deductions JSONB DEFAULT '[]'::jsonb,
    worker_attendance_logs JSONB DEFAULT '[]'::jsonb,
    created_by_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_progress_reports ENABLE ROW LEVEL SECURITY;

-- 25. Contractors Master
CREATE TABLE IF NOT EXISTS contractors_master (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    default_rate_per_worker NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Contractor Shifts Register
CREATE TABLE IF NOT EXISTS contractor_shifts (
    id BIGINT PRIMARY KEY,
    contractor_id INT REFERENCES contractors_master(id) ON DELETE SET NULL,
    contractor_name VARCHAR(150) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    report_date VARCHAR(50) NOT NULL,
    shift_start_time VARCHAR(20) NOT NULL,
    shift_end_time VARCHAR(20),
    worker_count INT NOT NULL DEFAULT 1,
    regular_hours NUMERIC(5,2),
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    work_location VARCHAR(200),
    work_description TEXT,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    logged_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 27. Contractor Material Allocations
CREATE TABLE IF NOT EXISTS contractor_material_allocations (
    id SERIAL PRIMARY KEY,
    contractor_id INT REFERENCES contractors_master(id) ON DELETE CASCADE,
    contractor_name VARCHAR(150),
    material_category_id INT REFERENCES material_categories(id) ON DELETE CASCADE,
    item_name VARCHAR(200),
    quantity_issued NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    floor_location VARCHAR(200),
    purpose TEXT,
    issued_by VARCHAR(100),
    date_issued DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. Material Damage & Deductions
CREATE TABLE IF NOT EXISTS material_damage_deductions (
    id SERIAL PRIMARY KEY,
    contractor_id INT REFERENCES contractors_master(id) ON DELETE CASCADE,
    contractor_name VARCHAR(150) NOT NULL,
    trade VARCHAR(100),
    material_name VARCHAR(200) NOT NULL,
    quantity NUMERIC(12,2) DEFAULT 0,
    unit VARCHAR(20),
    deduction_amount NUMERIC(12,2) NOT NULL,
    reason TEXT,
    photo_url TEXT,
    date_logged DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contractors_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_material_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_damage_deductions ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- IDEMPOTENT UPGRADE: project persistence and app/database field alignment
-- Required for databases where the CREATE TABLE IF NOT EXISTS statements above
-- were run before these fields were added.
-- =========================================================================

ALTER TABLE sites ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS location VARCHAR(250);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS client_name VARCHAR(150);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS target_end_date DATE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS sites_code_unique_idx ON sites (code) WHERE code IS NOT NULL;

ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS quantity_returned NUMERIC(12,2) DEFAULT 0;
ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS return_status VARCHAR(50) DEFAULT 'NOT_RETURNED';
ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS return_logs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS contractor_id INT;
ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS contractor_name VARCHAR(150);
ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE material_issued ADD COLUMN IF NOT EXISTS engineer_remarks TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cube_tests' AND column_name = 'result_7day')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cube_tests' AND column_name = 'result7_day') THEN
    ALTER TABLE cube_tests RENAME COLUMN result_7day TO result7_day;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cube_tests' AND column_name = 'result_28day')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cube_tests' AND column_name = 'result28_day') THEN
    ALTER TABLE cube_tests RENAME COLUMN result_28day TO result28_day;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'quantity_allocated')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'quantity_issued') THEN
    ALTER TABLE contractor_material_allocations RENAME COLUMN quantity_allocated TO quantity_issued;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'date_allocated')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'date_issued') THEN
    ALTER TABLE contractor_material_allocations RENAME COLUMN date_allocated TO date_issued;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'allocated_by')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'issued_by') THEN
    ALTER TABLE contractor_material_allocations RENAME COLUMN allocated_by TO issued_by;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'notes')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contractor_material_allocations' AND column_name = 'purpose') THEN
    ALTER TABLE contractor_material_allocations RENAME COLUMN notes TO purpose;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'material_damage_deductions' AND column_name = 'damage_amount')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'material_damage_deductions' AND column_name = 'deduction_amount') THEN
    ALTER TABLE material_damage_deductions RENAME COLUMN damage_amount TO deduction_amount;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'material_damage_deductions' AND column_name = 'description')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'material_damage_deductions' AND column_name = 'reason') THEN
    ALTER TABLE material_damage_deductions RENAME COLUMN description TO reason;
  END IF;
END $$;

-- =========================================================================
-- SECURITY AND PROJECT-ISOLATION UPGRADE
-- Run this section after the base tables above. Existing operational rows are
-- assigned automatically only when the database contains exactly one project.
-- With multiple existing projects, assign site_id explicitly before users log in.
-- =========================================================================

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

ALTER TABLE sites ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

CREATE TABLE IF NOT EXISTS site_members (
    site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'supervisor' CHECK (role IN ('admin', 'engineer', 'supervisor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (site_id, user_id)
);
CREATE INDEX IF NOT EXISTS site_members_user_id_idx ON site_members(user_id);

CREATE OR REPLACE FUNCTION private.is_site_member(p_site_id INT, p_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.site_members membership
    WHERE membership.site_id = p_site_id
      AND membership.user_id = (SELECT auth.uid())
      AND (p_roles IS NULL OR membership.role = ANY(p_roles))
  );
$$;
REVOKE ALL ON FUNCTION private.is_site_member(INT, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_site_member(INT, TEXT[]) TO authenticated;

CREATE OR REPLACE FUNCTION private.add_site_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.created_by IS NULL OR NEW.created_by <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'A project must be created by the signed-in user';
  END IF;
  INSERT INTO public.site_members(site_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (site_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.add_site_owner() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS add_site_owner_after_insert ON sites;
CREATE TRIGGER add_site_owner_after_insert
AFTER INSERT ON sites
FOR EACH ROW EXECUTE FUNCTION private.add_site_owner();

DO $$
DECLARE
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
  only_site_id INT;
BEGIN
  SELECT CASE WHEN COUNT(*) = 1 THEN MIN(id) END INTO only_site_id FROM sites;

  FOREACH table_name IN ARRAY operational_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS site_id INT REFERENCES public.sites(id) ON DELETE CASCADE', table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(site_id)', table_name || '_site_id_idx', table_name);
    IF only_site_id IS NOT NULL THEN
      EXECUTE format('UPDATE public.%I SET site_id = $1 WHERE site_id IS NULL', table_name) USING only_site_id;
    END IF;
  END LOOP;
END $$;

ALTER TABLE site_members ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record RECORD;
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
  FOR policy_record IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND (tablename = 'sites' OR tablename = 'site_members' OR tablename = ANY(operational_tables))
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
  END LOOP;

  CREATE POLICY sites_select_member ON sites FOR SELECT TO authenticated
    USING (private.is_site_member(id, NULL) OR created_by = (SELECT auth.uid()));
  CREATE POLICY sites_insert_owner ON sites FOR INSERT TO authenticated
    WITH CHECK (created_by = (SELECT auth.uid()));
  CREATE POLICY sites_update_manager ON sites FOR UPDATE TO authenticated
    USING (private.is_site_member(id, ARRAY['admin','engineer']))
    WITH CHECK (private.is_site_member(id, ARRAY['admin','engineer']));
  CREATE POLICY sites_delete_admin ON sites FOR DELETE TO authenticated
    USING (private.is_site_member(id, ARRAY['admin']));

  CREATE POLICY site_members_select ON site_members FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR private.is_site_member(site_id, ARRAY['admin']));
  CREATE POLICY site_members_insert_admin ON site_members FOR INSERT TO authenticated
    WITH CHECK (private.is_site_member(site_id, ARRAY['admin']));
  CREATE POLICY site_members_update_admin ON site_members FOR UPDATE TO authenticated
    USING (private.is_site_member(site_id, ARRAY['admin']))
    WITH CHECK (private.is_site_member(site_id, ARRAY['admin']));
  CREATE POLICY site_members_delete_admin ON site_members FOR DELETE TO authenticated
    USING (private.is_site_member(site_id, ARRAY['admin']));

  FOREACH table_name IN ARRAY operational_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY project_select ON public.%I FOR SELECT TO authenticated USING (private.is_site_member(site_id, NULL))',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY project_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_site_member(site_id, ARRAY[''admin'',''engineer'',''supervisor'']))',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY project_update ON public.%I FOR UPDATE TO authenticated USING (private.is_site_member(site_id, ARRAY[''admin'',''engineer'',''supervisor''])) WITH CHECK (private.is_site_member(site_id, ARRAY[''admin'',''engineer'',''supervisor'']))',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY project_delete ON public.%I FOR DELETE TO authenticated USING (private.is_site_member(site_id, ARRAY[''admin'',''engineer'']))',
      table_name
    );
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON sites, site_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  contractors_master, material_categories, suppliers, material_inward,
  material_issued, material_wastage, expense_categories, expenses,
  fund_requisitions, equipment_types, equipment, equipment_usage,
  equipment_payments, visitors, meetings, site_photos, safety_check_items,
  safety_checklists, safety_incidents, ppe_issuance, cube_tests, material_tests,
  ncr_reports, daily_progress_reports, contractor_shifts,
  contractor_material_allocations, material_damage_deductions
TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE USAGE, SELECT ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;

ALTER TABLE contractor_material_allocations ADD COLUMN IF NOT EXISTS contractor_name VARCHAR(150);
ALTER TABLE contractor_material_allocations ADD COLUMN IF NOT EXISTS item_name VARCHAR(200);
ALTER TABLE contractor_material_allocations ADD COLUMN IF NOT EXISTS floor_location VARCHAR(200);
ALTER TABLE contractor_material_allocations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE material_damage_deductions ADD COLUMN IF NOT EXISTS quantity NUMERIC(12,2) DEFAULT 0;
ALTER TABLE material_damage_deductions ADD COLUMN IF NOT EXISTS unit VARCHAR(20);
ALTER TABLE material_damage_deductions ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS source_equipment_payment_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS expenses_source_equipment_payment_unique
  ON expenses(site_id, source_equipment_payment_id) WHERE source_equipment_payment_id IS NOT NULL;

ALTER TABLE ncr_reports ADD COLUMN IF NOT EXISTS source_material_inward_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS ncr_source_material_inward_unique
  ON ncr_reports(site_id, source_material_inward_id) WHERE source_material_inward_id IS NOT NULL;

ALTER TABLE contractor_material_allocations ADD COLUMN IF NOT EXISTS source_material_issue_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS allocation_source_material_issue_unique
  ON contractor_material_allocations(site_id, source_material_issue_id) WHERE source_material_issue_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.save_machinery_payment_with_expense(
  p_site_id INT, p_payment JSONB, p_expense JSONB
) RETURNS VOID
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (p_expense->>'source_equipment_payment_id')::BIGINT IS DISTINCT FROM (p_payment->>'id')::BIGINT THEN
    RAISE EXCEPTION 'Expense source does not match equipment payment';
  END IF;
  INSERT INTO public.equipment_payments
    SELECT (jsonb_populate_record(NULL::public.equipment_payments, p_payment || jsonb_build_object('site_id', p_site_id))).*;
  INSERT INTO public.expenses
    SELECT (jsonb_populate_record(NULL::public.expenses, p_expense || jsonb_build_object('site_id', p_site_id))).*;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_material_inward_with_ncr(
  p_site_id INT, p_inward JSONB, p_ncr JSONB
) RETURNS VOID
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (p_ncr->>'source_material_inward_id')::BIGINT IS DISTINCT FROM (p_inward->>'id')::BIGINT THEN
    RAISE EXCEPTION 'NCR source does not match material inward';
  END IF;
  INSERT INTO public.material_inward
    SELECT (jsonb_populate_record(NULL::public.material_inward, p_inward || jsonb_build_object('site_id', p_site_id))).*;
  INSERT INTO public.ncr_reports
    SELECT (jsonb_populate_record(NULL::public.ncr_reports, p_ncr || jsonb_build_object('site_id', p_site_id))).*;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_material_issue_with_allocation(
  p_site_id INT, p_issue JSONB, p_allocation JSONB
) RETURNS VOID
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (p_allocation->>'source_material_issue_id')::BIGINT IS DISTINCT FROM (p_issue->>'id')::BIGINT THEN
    RAISE EXCEPTION 'Allocation source does not match material issue';
  END IF;
  INSERT INTO public.material_issued
    SELECT (jsonb_populate_record(NULL::public.material_issued, p_issue || jsonb_build_object('site_id', p_site_id))).*;
  INSERT INTO public.contractor_material_allocations
    SELECT (jsonb_populate_record(NULL::public.contractor_material_allocations, p_allocation || jsonb_build_object('site_id', p_site_id))).*;
END;
$$;

REVOKE ALL ON FUNCTION public.save_machinery_payment_with_expense(INT, JSONB, JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_material_inward_with_ncr(INT, JSONB, JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_material_issue_with_allocation(INT, JSONB, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_machinery_payment_with_expense(INT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_material_inward_with_ncr(INT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_material_issue_with_allocation(INT, JSONB, JSONB) TO authenticated;

-- Keep SERIAL/BIGSERIAL sequences ahead of rows inserted by seed scripts with
-- explicit IDs. Without this, the next normal insert can collide with id = 1.
DO $$
DECLARE
  id_column RECORD;
  sequence_name TEXT;
  maximum_id BIGINT;
BEGIN
  FOR id_column IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'id'
      AND column_default LIKE 'nextval(%'
  LOOP
    sequence_name := pg_get_serial_sequence(
      format('%I.%I', id_column.table_schema, id_column.table_name),
      'id'
    );
    IF sequence_name IS NOT NULL THEN
      -- Several legacy tables use bigint IDs populated with Date.now(), while
      -- their original SERIAL sequence still has a 32-bit ceiling.
      EXECUTE format('ALTER SEQUENCE %s AS BIGINT', sequence_name::regclass);
      EXECUTE format('SELECT COALESCE(MAX(id), 0) FROM %I.%I', id_column.table_schema, id_column.table_name)
        INTO maximum_id;
      PERFORM setval(sequence_name::regclass, GREATEST(maximum_id, 1), maximum_id > 0);
    END IF;
  END LOOP;
END $$;
