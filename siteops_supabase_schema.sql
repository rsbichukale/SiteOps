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
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    result_7day NUMERIC(8,2),
    result_28day NUMERIC(8,2),
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

-- RLS Enable & Permissive Public Access Policies
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

CREATE POLICY "Allow public read-write sites" ON sites FOR ALL USING (true);
CREATE POLICY "Allow public read-write material_categories" ON material_categories FOR ALL USING (true);
CREATE POLICY "Allow public read-write suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "Allow public read-write material_inward" ON material_inward FOR ALL USING (true);
CREATE POLICY "Allow public read-write material_issued" ON material_issued FOR ALL USING (true);
CREATE POLICY "Allow public read-write material_wastage" ON material_wastage FOR ALL USING (true);
CREATE POLICY "Allow public read-write expense_categories" ON expense_categories FOR ALL USING (true);
CREATE POLICY "Allow public read-write expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow public read-write fund_requisitions" ON fund_requisitions FOR ALL USING (true);
CREATE POLICY "Allow public read-write equipment_types" ON equipment_types FOR ALL USING (true);
CREATE POLICY "Allow public read-write equipment" ON equipment FOR ALL USING (true);
CREATE POLICY "Allow public read-write equipment_usage" ON equipment_usage FOR ALL USING (true);
CREATE POLICY "Allow public read-write equipment_payments" ON equipment_payments FOR ALL USING (true);
CREATE POLICY "Allow public read-write visitors" ON visitors FOR ALL USING (true);
CREATE POLICY "Allow public read-write meetings" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow public read-write site_photos" ON site_photos FOR ALL USING (true);
CREATE POLICY "Allow public read-write safety_check_items" ON safety_check_items FOR ALL USING (true);
CREATE POLICY "Allow public read-write safety_checklists" ON safety_checklists FOR ALL USING (true);
CREATE POLICY "Allow public read-write safety_incidents" ON safety_incidents FOR ALL USING (true);
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
CREATE POLICY "Allow public read-write daily_progress_reports" ON daily_progress_reports FOR ALL USING (true);

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
    material_category_id INT REFERENCES material_categories(id) ON DELETE CASCADE,
    quantity_allocated NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    date_allocated DATE DEFAULT CURRENT_DATE,
    allocated_by VARCHAR(100),
    notes TEXT
);

-- 28. Material Damage & Deductions
CREATE TABLE IF NOT EXISTS material_damage_deductions (
    id SERIAL PRIMARY KEY,
    contractor_id INT REFERENCES contractors_master(id) ON DELETE CASCADE,
    contractor_name VARCHAR(150) NOT NULL,
    trade VARCHAR(100),
    material_name VARCHAR(200) NOT NULL,
    damage_amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    photos TEXT[],
    date_logged DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contractors_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_material_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_damage_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write contractors_master" ON contractors_master FOR ALL USING (true);
CREATE POLICY "Allow public read-write contractor_shifts" ON contractor_shifts FOR ALL USING (true);
CREATE POLICY "Allow public read-write contractor_material_allocations" ON contractor_material_allocations FOR ALL USING (true);
CREATE POLICY "Allow public read-write material_damage_deductions" ON material_damage_deductions FOR ALL USING (true);


