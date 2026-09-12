# AdvocateDesk Security Test Plan

This checklist is for validating the Supabase-backed AdvocateDesk application before production launch.

## Test setup

Create two separate test organizations and at least two users:

- **Org A**: User A1 as owner/admin; User A2 as regular member.
- **Org B**: User B1 as owner/admin.
- Use separate browser profiles or private windows so sessions cannot be confused.
- Use clearly identifiable test records, for example `SEC-ORG-A-001` and `SEC-ORG-B-001`.

## Authentication tests

- [ ] A signed-out visitor cannot access protected application data.
- [ ] A user can sign in and sign out successfully.
- [ ] Refreshing the page preserves only the current authenticated session.
- [ ] A user cannot switch organization by editing localStorage, sessionStorage, or URL parameters.
- [ ] Expired or revoked sessions are rejected.

## Organization isolation tests

Run each test as User A1 and then as User B1:

- [ ] List/read queries return only records belonging to the active organization.
- [ ] A user cannot read another organization's clients.
- [ ] A user cannot read another organization's cases.
- [ ] A user cannot read another organization's hearings.
- [ ] A user cannot read another organization's tasks or meetings.
- [ ] A user cannot read another organization's payments.
- [ ] A user cannot read another organization's documents.
- [ ] A user cannot read another organization's workspace data.
- [ ] Direct requests using another organization's UUID return zero rows or an authorization error.
- [ ] Insert attempts using another organization's UUID are rejected.
- [ ] Update attempts against another organization's records are rejected.
- [ ] Delete attempts against another organization's records are rejected.

## Role-based access tests

- [ ] A regular member cannot perform owner/admin-only actions.
- [ ] A regular member cannot change organization membership or roles.
- [ ] A regular member cannot modify audit history.
- [ ] Payment records are restricted to the intended roles.
- [ ] Document access follows the intended organization and role rules.
- [ ] Audit logs cannot be edited or deleted by ordinary users.

## Storage tests

- [ ] A user can upload an allowed document only to their own organization path.
- [ ] A user cannot download another organization's document by guessing its path.
- [ ] Unauthorized public URLs do not expose private documents.
- [ ] File type, size, and filename validation works as intended.
- [ ] Deleted or revoked documents are no longer downloadable.

## Browser and mobile tests

- [ ] Test on iPhone Safari using a fresh login.
- [ ] Test on Android Chrome using a fresh login.
- [ ] Test on desktop Chrome/Edge/Safari.
- [ ] Verify sign-in, refresh, sign-out, CRUD, document access, and workspace persistence on each platform.
- [ ] Confirm no sensitive data is written to console logs or exposed in page source.

## Evidence to capture

For every test, record:

1. Test ID and date.
2. User and organization used.
3. Action or request performed.
4. Expected result.
5. Actual result.
6. Screenshot, query result, or network response.
7. Pass/fail and any remediation issue.

## Release gate

Do not mark AdvocateDesk production-ready until all authentication, organization-isolation, role, storage, and mobile regression tests pass with separate authenticated users. RLS being enabled is not by itself proof that cross-organization access has been tested successfully.
