# SJHR201 Landing Page Correction

This patch replaces the previous two-card public landing page with the agreed simpler design:

- Public landing page offers Employee Self-Service sign-in and an Authorized Personnel Access gate.
- HR, Payroll, Developer, Mayor, Department Head, and Division Head accounts are not exposed as separate public portal buttons.
- ESS public self-registration is removed from the landing page and ESS login modal. Employee accounts must be provisioned/verified by HR.
- Google sign-in button is removed from ESS login.
- Municipal logo public URL is corrected from `/public/assets/...` to `/assets/...`.
- Personnel access key is checked server-side through `/api/personnel-access/verify`; it is never embedded in frontend code.

## Required deployment configuration

Set `PERSONNEL_ACCESS_KEY` as a Vercel Environment Variable (and in the server environment for Express deployments). Use a strong unique secret. Do not put it in frontend variables such as `VITE_*`, source code, or Git.

If this environment variable is not set, the personnel access gate fails closed and displays a configuration message. The individual HR login remains a separate required authentication step.

## Important status

This is a landing-page and access-gate correction only. It does not complete Firebase password authentication, all eight role dashboards, Firestore persistence, document storage, or approval workflows. Do not treat it as production-ready. Existing Firebase data/rules were not changed or deployed.
