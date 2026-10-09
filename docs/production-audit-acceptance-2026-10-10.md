# AdvocateDesk Production Audit & Acceptance Report

**Assessment date:** 10 October 2026  
**Environment:** Production — https://advocate.biznexco.in  
**Repository:** `bishanth2026/Advocate-Mangement` (`main`)  
**Production Supabase project:** `ykxfidrtvmkmmbxameji`

## Executive decision

**Functional acceptance: PASS for the checks listed below.**  
**Overall security sign-off: CONDITIONAL — one known security recommendation remains deferred.**

This report distinguishes live tests reported by the operator, database checks, and CI/deployment evidence. It does not claim a full independent end-to-end test of every feature.

## Verified checks

| Check | Result | Evidence |
|---|---|---|
| Admin invitation delivery and acceptance | PASS | Operator confirmed Ami received and accepted the invitation. |
| Admin password setup | PASS | Operator confirmed Ami set a new password. |
| Admin sign-in | PASS | Operator confirmed login with the new password succeeded. |
| Admin denied access to Super Admin portal | PASS | Operator observed the message: “This account is not authorized for the Super Admin portal.” |
| Ami's platform role | PASS | Read-only production database query returned `platform_role = user`. |
| Ami's workspace role | PASS | Read-only production database query returned `workspace_role = admin`, workspace `Vatakara`, status `active`. |
| Calendar first-use regression | PASS | Operator confirmed the re-test passed. |
| Case 360° cards regression | PASS | Operator confirmed the re-test passed. |
| Production safety-validation workflow | PASS | GitHub Actions run: https://github.com/bishanth2026/Advocate-Mangement/actions/runs/37956093724 |
| Production Pages deployment | PASS | GitHub Actions run: https://github.com/bishanth2026/Advocate-Mangement/actions/runs/37956092604 |
| Admin invitation/recovery token handling code | PASS — code and CI/deployment evidence only | Production reset page accepts `recovery` and `invite` token types. Commit: https://github.com/bishanth2026/Advocate-Mangement/commit/4a016ad41748b1a1407644aae85fe4dbf3a29190. Operator subsequently confirmed the real invitation and password setup worked. |

## Deferred security item

**Leaked Password Protection Disabled — WARN / DEFERRED.** The production Supabase Security Advisor reported `auth_leaked_password_protection`. The operator explicitly chose not to enable this setting during this acceptance cycle. It must not be represented as fixed or passed. Remediation settings: https://supabase.com/dashboard/project/ykxfidrtvmkmmbxameji/auth/providers. Supabase guidance: https://supabase.com/docs/guides/auth/password-security.

## Acceptance and limitations

- The Calendar and Case 360° results above are based on the operator's live re-test confirmation; no independent browser recording or automated assertion was provided for those two checks in this report.
- Successful GitHub Actions runs establish that the recorded validation and Pages deployment workflows completed successfully; they do not prove every production feature is defect-free.
- This report does not certify all application workflows, data-retention behavior, backup/restore, or every authorization boundary beyond the checks explicitly listed.

## Final recommendation

**Accept the tested functional flows; treat overall production security acceptance as conditional until leaked-password protection is enabled and the Security Advisor warning is cleared.** If the business elects to proceed while it remains deferred, record explicit risk acceptance and schedule remediation. No claim is made that the deferred setting has been changed.
