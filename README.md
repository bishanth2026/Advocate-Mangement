# AdvocateDesk — by Biznexco

A responsive law-office practice-management application for advocates and legal teams.

## Live application

- Website: https://advocate.biznexco.in/
- Demo app: https://advocate.biznexco.in/app.html
- Admin login: https://advocate.biznexco.in/admin-login.html

## Included modules

- Dashboard
- Case management
- Client management
- Hearings and calendar
- Documents workspace
- Tasks and follow-ups
- Finance, fees and payments workflow
- Reports
- Settings
- Responsive mobile layout
- WhatsApp communication links
- Supabase authentication and persistence integration
- Organization/member data model
- Audit-log data model

## Current release status

AdvocateDesk is suitable for controlled demonstrations and pilot onboarding. It should not yet be advertised as fully production-ready until the remaining operational checks are completed.

### Completed or implemented

- Frontend application and responsive layouts
- GitHub Pages deployment structure
- Supabase project integration
- PostgreSQL tables for the main modules
- Row Level Security enabled on application tables
- Organization and membership relationships
- Foreign-key and uniqueness constraints
- Privacy Policy, Terms and Support documents
- Persistence and session-handling integration
- Security test plan and test-results documentation

### Remaining before unrestricted commercial launch

- Complete authenticated two-user organization-isolation test
- Verify all login, logout, refresh and recovery flows on real devices
- Complete secure document-storage policy and upload/download testing
- Replace or confirm any remaining browser-only demo data paths
- Configure payment/subscription workflow if paid billing is required
- Configure backup, restore and recovery procedures
- Complete mobile and desktop regression testing
- Add production monitoring, error reporting and rollback procedure
- Finalize customer onboarding, support contact and retention details

## Important data note

Do not use demo records as real client data. Before production use, confirm authentication, organization isolation, secure document storage, backups and recovery procedures.

## Legal and support pages

- Privacy Policy: `/PRIVACY.md`
- Terms of Service: `/TERMS.md`
- Support: `/SUPPORT.md`

These Markdown files are repository documentation. They should be published or linked from the live application before commercial launch.

## Development notes

The application is hosted from the repository's main branch through GitHub Pages. Supabase credentials must remain limited to safe public client configuration; never place service-role keys or private secrets in frontend files.
