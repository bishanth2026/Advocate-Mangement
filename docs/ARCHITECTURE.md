# AdvocateDesk Architecture

## Frontend
Static HTML/CSS/JavaScript for the initial GitHub Pages deployment.

## Planned backend
Supabase:
- Auth
- PostgreSQL
- Storage
- Row Level Security
- Edge Functions where required

## Multi-tenant model
organization -> offices -> users -> clients/cases/hearings/documents/finance

Every business record will carry an organization relationship and be protected by RLS.

## Planned roles
- Super Admin
- Advocate Admin
- Junior Advocate
- Clerk
- Accountant
- Staff

## Production principle
Historical legal and financial records should use audit/version history rather than destructive overwrites.
