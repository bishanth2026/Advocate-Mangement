# AdvocateDesk — Backup and Recovery Runbook

## Scope

This runbook is for the Supabase database and application configuration used by AdvocateDesk.

## Before pilot

- Enable an appropriate Supabase backup/point-in-time recovery plan.
- Confirm the project owner and emergency contact.
- Document the production project reference in the private operations record.
- Keep database migrations in GitHub and apply them in a controlled order.
- Never store Supabase service-role keys in GitHub Pages files.

## Backup verification

1. Confirm the latest backup timestamp in Supabase.
2. Record the backup retention period.
3. Create a non-production restore/test environment.
4. Restore a backup into the test environment.
5. Verify organizations, memberships, cases, clients, hearings, tasks, documents metadata and payments.
6. Record the restore date, duration and result.

## Recovery procedure

1. Declare the incident and stop risky data changes.
2. Identify the last known-good backup or recovery point.
3. Create a recovery target/project rather than overwriting evidence.
4. Restore the database using Supabase's supported recovery controls.
5. Verify schema, RLS policies, foreign keys and row counts.
6. Verify authentication configuration and storage access rules.
7. Test login, organization selection and core CRUD flows.
8. Communicate service status to pilot customers.
9. Reconcile any records created after the recovery point.
10. Document the incident and corrective actions.

## Minimum recovery acceptance criteria

- No cross-organization data exposure.
- Users can log in and access only their organization.
- Core case/client/hearing/task records are readable and writable.
- Document access remains private.
- Audit records are retained where available.
- The recovery process is repeatable by a second administrator.
