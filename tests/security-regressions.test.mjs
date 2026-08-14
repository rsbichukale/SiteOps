import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('database schema has no unrestricted anonymous policies', async () => {
  const sql = await read('siteops_supabase_schema.sql');
  assert.doesNotMatch(sql, /FOR\s+ALL\s+USING\s*\(true\)/i);
  assert.match(sql, /REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon/i);
  assert.match(sql, /CREATE POLICY project_select/i);
  assert.match(sql, /private\.is_site_member/i);
});

test('frontend environment templates cannot contain privileged database keys', async () => {
  const environment = await read('.env');
  assert.doesNotMatch(environment, /^SUPABASE_SERVICE_ROLE_KEY=/m);
  assert.doesNotMatch(environment, /^DATABASE_URL=/m);
});

test('cross-module database operations are transactional and source-linked', async () => {
  const sql = await read('siteops_supabase_schema.sql');
  assert.match(sql, /save_machinery_payment_with_expense/);
  assert.match(sql, /save_material_inward_with_ncr/);
  assert.match(sql, /save_material_issue_with_allocation/);
  assert.match(sql, /source_equipment_payment_unique/);
  assert.match(sql, /source_material_inward_unique/);
  assert.match(sql, /source_material_issue_unique/);
});
