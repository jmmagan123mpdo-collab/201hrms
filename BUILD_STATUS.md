# SJHR201 rebuild status — implementation handoff

This package is based on the existing SJHR201 React/Vite/Firebase project. It is **not yet a production-complete application**.

## Changes applied in this rebuild pass
- Removed public ESS self-registration from the landing page and ESS login screen. ESS accounts must be provisioned/verified by HR.
- Removed Google sign-in controls from the ESS login UI.
- Corrected Vite public asset paths from `/public/assets/...` to `/assets/...`.
- Preserved the existing project structure, HR/ESS modules, Firebase project configuration, PWA assets, and remote data references.

## Work still required before production
- Replace the current placeholder/local account flows in `src/context/AuthContext.tsx` with Firebase Email/Password authentication and authoritative Firestore role profiles. Current login methods still deliberately fail when no password-auth account is configured.
- Implement username-to-verified-email resolution using a secure Firestore mapping or callable backend; never trust a client-side username lookup for account authorization.
- Complete the eight-role model and enforce role/office/division/document-level authorization in both UI and Firestore/Storage rules.
- Replace sample/localStorage data in `src/context/DataContext.tsx` with Firestore-backed repositories collection by collection, preserving existing records.
- Rework SALN access rules so only the employee and authorized HR/RCC roles can read contents; never grant access to Mayor/Department Heads.
- Validate leave approval routing, final HR acceptance, leave-credit updates, generated PDFs, email provider delivery and idempotency.
- Complete payroll import/publish, document OCR review, PDS/SALN workflows, performance workflow against LGU-approved SPMS, backups and audit trails.
- Run TypeScript, production build, Firebase Emulator tests, Storage tests, and PWA installation/offline-update tests.

## Build environment limitation
Dependency installation could not complete in this environment (npm registry request timed out; required package metadata is not cached), so no successful production build is claimed.

## Required before initial account provisioning
Provide the official email addresses for the six initial accounts: System Developer, HR Administrator, Payroll Officer, Mayor, Department Head, and Division Head. Do not put passwords in chat. Provision passwords through Firebase Authentication's secure invitation/reset flow.

## Data safety
No Firebase login, write, deletion, migration, deployment, or paid-service activation was performed. Existing remote Firebase data was not touched. Do not deploy the existing Firestore/Storage rules without a security review and emulator tests.
