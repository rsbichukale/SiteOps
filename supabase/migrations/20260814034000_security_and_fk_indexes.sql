-- The event trigger still runs as its owner when DDL creates a public table,
-- but it must never be callable as a Data API RPC.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS contractor_allocations_contractor_id_idx
  ON public.contractor_material_allocations(contractor_id);
CREATE INDEX IF NOT EXISTS contractor_allocations_category_id_idx
  ON public.contractor_material_allocations(material_category_id);
CREATE INDEX IF NOT EXISTS contractor_shifts_contractor_id_idx
  ON public.contractor_shifts(contractor_id);
CREATE INDEX IF NOT EXISTS equipment_payments_equipment_id_idx
  ON public.equipment_payments(equipment_id);
CREATE INDEX IF NOT EXISTS damage_deductions_contractor_id_idx
  ON public.material_damage_deductions(contractor_id);
CREATE INDEX IF NOT EXISTS material_inward_category_id_idx
  ON public.material_inward(material_category_id);
CREATE INDEX IF NOT EXISTS material_inward_supplier_id_idx
  ON public.material_inward(supplier_id);
CREATE INDEX IF NOT EXISTS material_issued_category_id_idx
  ON public.material_issued(material_category_id);
CREATE INDEX IF NOT EXISTS material_wastage_category_id_idx
  ON public.material_wastage(material_category_id);
CREATE INDEX IF NOT EXISTS sites_created_by_idx
  ON public.sites(created_by);
