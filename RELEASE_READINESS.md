# AdvocateDesk Release Readiness

This document is the controlled checklist for moving AdvocateDesk from demo frontend to a sellable SaaS product.

## Current status
- [x] Responsive frontend and core navigation
- [x] Demo CRUD flows in browser storage
- [x] Hearing CSV export and print controls
- [ ] Production Supabase Auth with verified sessions
- [ ] PostgreSQL schema for every module
- [ ] Row Level Security and organization isolation
- [ ] Secure document storage and access policies
- [ ] Real finance, audit logs, and backups
- [ ] Subscription/billing and plan limits
- [ ] Privacy policy, terms, support and data-retention process
- [ ] Mobile Safari and desktop regression testing
- [ ] Production deployment and rollback plan

## Implementation order
1. Connect Supabase Auth and remove local-session trust.
2. Create database tables, indexes, foreign keys and organization membership.
3. Add RLS policies and test cross-organization access denial.
4. Migrate Cases, Clients, Hearings, Tasks and Meetings from localStorage to Supabase.
5. Add secure Storage buckets for documents.
6. Complete Finance, reports and audit history.
7. Add billing, onboarding, support and legal pages.
8. Run the release test matrix on iPhone Safari, Android Chrome and desktop.
9. Tag a release only after all unchecked items are completed.

## Release gate
Do not market the product as production-ready until authentication, RLS, backups, billing, legal documents and the regression test matrix are complete.