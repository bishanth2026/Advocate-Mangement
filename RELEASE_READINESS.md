# AdvocateDesk Release Readiness

This document is the controlled checklist for moving AdvocateDesk from demo frontend to a sellable SaaS product.

## Current status

- [x] Responsive frontend and core navigation
- [x] Demo CRUD flows in browser storage
- [x] Hearing CSV export and print controls
- [x] Supabase project connected in the integration layer
- [x] PostgreSQL application tables created
- [x] Foreign keys and organization membership structure present
- [x] Row Level Security enabled on application tables
- [x] Privacy policy, terms and support documents added
- [x] Pilot launch checklist added
- [x] Backup and recovery runbook added
- [ ] Production Supabase Auth flow fully verified
- [ ] Cross-organization isolation test with two real accounts
- [ ] Full migration of all operational data from localStorage to Supabase verified
- [ ] Secure private document bucket and signed URL workflow verified
- [ ] Real finance, audit logs and backup restore test completed
- [ ] Subscription/billing and plan limits
- [ ] Data-retention and deletion process
- [ ] Mobile Safari, Android Chrome and desktop regression testing
- [ ] Production monitoring, incident response and rollback test

## Implementation order

1. Verify Supabase Auth, logout and session recovery.
2. Complete the two-account organization-isolation test.
3. Migrate Cases, Clients, Hearings, Tasks and Meetings from localStorage to Supabase.
4. Add private Storage buckets for documents and verify access rules.
5. Complete Finance, reports and audit history.
6. Configure backups and perform a restore drill.
7. Add billing, onboarding, support and retention workflows.
8. Run the release test matrix on iPhone Safari, Android Chrome and desktop.
9. Configure monitoring and rollback procedures.
10. Tag a release only after all launch blockers are completed.

## Pilot status

A controlled pilot may be used with known users while the remaining checks are completed. Do not upload highly sensitive client documents until private document storage has been verified.

## Release gate

Do not market the product as fully production-ready until authentication, organization isolation, secure document storage, backups/recovery, billing, retention, monitoring and regression testing are complete.
