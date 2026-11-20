# SJHR201 rebuild status — 20 November 2026

## Changes in this rebuild
- Replaced the inactive placeholder HR/ESS password handlers with Firebase Email/Password sign-in.
- HR/ESS portal separation is enforced at sign-in using the Firestore role profile.
- Role profile is loaded from `users/{uid}` after Firebase Authentication; browser-local role records are no longer accepted as authentication.
- Added the missing privileged role identifiers: Mayor, Department Head, and Division Head.
- Disabled Google sign-in and public ESS self-registration; ESS accounts must be provisioned by authorized HR.
- Added a one-time Firebase Admin provisioning script for six initial privileged accounts: System Developer, HR Administrator, Payroll Officer, Mayor, Department Head, and Division Head. Encoder and ESS are deliberately excluded.
- Provisioning generates random temporary passwords and a local credential CSV after the operator enters each official email. Existing Firebase accounts are not password-reset.
- Added `INITIAL_ACCOUNT_SETUP.md` with setup steps.

## Not yet complete / not safe to deploy for real personnel data
- The six Firebase accounts are not live until the provisioning script is run against the user's Firebase project with a service-account key and official emails.
- Full conversion of all HR modules and DataContext from sample/local state to Firestore is not complete.
- Role-specific page/action authorization across every module is not complete.
- Firestore and Storage rules still require a complete least-privilege review and emulator testing before deployment.
- Account recovery, forced password-change screen, account lifecycle management, audit event coverage, email delivery, and leave approval integrations need completion/testing.
- Full build/lint verification could not be completed because `npm install` timed out in this environment.

## Data safety
- No Firebase records were read, changed, migrated, reset, or deleted by this rebuild process.
- No paid Firebase service was enabled.
- Do not use this build for live confidential employee records until the outstanding security and persistence work is complete.
