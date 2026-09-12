# AdvocateDesk Security Verification Record

## Automated schema verification

Verified against the connected Supabase project:

- RLS is enabled on all application tables.
- Organization-scoped tables have organization foreign keys.
- `memberships` has a unique `(organization_id, user_id)` constraint.
- `workspace_data` has a unique `(organization_id, user_id)` constraint.
- Core records use foreign keys for organization, user, client, case, or document relationships where applicable.

## Not yet verified

The following require two real authenticated test users in separate organizations:

- User A cannot read Organization B records.
- User A cannot insert records into Organization B.
- User A cannot update or delete Organization B records.
- Workspace data cannot cross organizations.
- Non-admin users cannot perform restricted payment, document, or audit actions.
- Storage objects cannot be accessed across organizations.
- Session expiry and sign-out invalidate access.

## Required test setup

1. Create two test organizations.
2. Create one admin and one standard user in each organization.
3. Add clearly labelled test records to each organization.
4. Run the full `SECURITY_TEST_PLAN.md` checklist using separate browser sessions.
5. Capture the result of every test as PASS or FAIL with evidence.

## Release decision

**Current status: controlled pilot only.**

Do not mark the product production-ready until the authenticated cross-organization and role-based tests above have passed, along with backup, storage, billing, and mobile regression checks.
