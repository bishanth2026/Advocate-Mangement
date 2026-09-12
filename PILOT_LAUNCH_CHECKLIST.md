# AdvocateDesk — Pilot Launch Checklist

## Completed in repository

- Responsive AdvocateDesk frontend
- Supabase Auth integration files
- PostgreSQL application tables
- Row Level Security enabled on application tables
- Organization and membership structure
- Browser session persistence handling
- Privacy Policy, Terms of Service and Support documents

## Required before inviting real law firms

- [ ] Complete two-user organization isolation test
- [ ] Confirm email/password login and password reset in Supabase Auth
- [ ] Confirm logout clears the active session and private cached data
- [ ] Confirm refresh and re-login restore the correct organization data
- [ ] Confirm document uploads use private storage buckets and signed URLs
- [ ] Confirm no service-role key is present in frontend files
- [ ] Configure database backups and test a restore
- [ ] Configure monitoring/error reporting
- [ ] Test iPhone Safari, Android Chrome and desktop browsers
- [ ] Test empty states, slow network, expired session and failed requests
- [ ] Confirm finance records and audit logs are production-ready
- [ ] Add visible links to Privacy, Terms and Support pages
- [ ] Prepare customer onboarding and support contact workflow

## Pilot operating rules

1. Invite only a small number of known users.
2. Do not upload highly sensitive client documents until private storage is verified.
3. Keep a manual backup/export process during the pilot.
4. Record every issue and release change.
5. Do not advertise the product as fully production-ready until all required checks are complete.
