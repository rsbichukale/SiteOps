# ConstructTrack SiteOps remediation plan

## Completed in this worktree

- Removed tracked service-role and PostgreSQL credentials; added safe environment templates and ignore rules.
- Added Supabase email/password authentication and removed the hardcoded administrator identity.
- Added project membership, role-aware RLS, explicit Data API grants, and anonymous-access revocation.
- Scoped every operational read, write, and delete to the selected project.
- Replaced timestamp IDs with PostgreSQL `INTEGER`-safe random identifiers.
- Replaced full-collection writes with serialized, changed-record writes and failure rollback/error reporting.
- Removed duplicate per-component initial synchronization and protected project switching from stale responses.
- Added deterministic database ordering.
- Added transactional, idempotent links for material inward to NCR, material issue to contractor allocation, and machinery payment to expense.
- Added visitor checkout, fund requisition lifecycle, typed expense/NCR states, NCR closure, material tests, report history, date-filtered attendance/DPR, and corrected dashboard daily metrics.
- Restricted stored image rendering to the project's Supabase Storage origin and added browser security headers.
- Added versioned, size-limited, project-only backup validation.

## Deployment steps still requiring project-owner access

1. Rotate the exposed Supabase service-role key and database password in the Supabase dashboard. Revoking the old values is mandatory because Git history cannot make a leaked credential secret again.
2. Put only `NEXT_PUBLIC_SUPABASE_URL` and the browser-safe publishable/anon key in the local `.env` file.
3. Run `siteops_supabase_schema.sql` in a controlled database migration window and review its output.
4. Create or sign in to the first Auth account.
5. For existing projects, insert that user's UUID into `site_members` as `admin`. New projects add their creator automatically.
6. If the existing database contains multiple projects, assign every legacy operational row to the correct `site_id`. The script auto-assigns legacy rows only when exactly one project exists because guessing across multiple projects would corrupt tenant ownership.
7. Verify anonymous requests are denied, members see only assigned projects, supervisors cannot delete, and cross-module RPC calls create both records or neither.
8. Rotate any deployment/provider secrets that copied the old credentials and review Supabase access logs.

## Next engineering iterations

- Add a project-member administration screen and invitation flow.
- Replace URL entry with authenticated Supabase Storage upload controls and bucket RLS.
- Add editable cube-test results and meeting action-item task ownership.
- Add audit-log views, pagination, server-side filtering, and conflict/version columns.
- Add automated unit, database migration, RLS, integration, and browser tests to CI.
