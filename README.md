# SJHR201 – LGU San Jose HRMIS (Revision Build)

This archive contains a revision of the supplied SJHR201 project. It is a development build, not a production-certified HRMIS.

## Changes applied in this revision

- Added a shared `profilePictureUrl` and `profilePicturePath` to the employee record model.
- Added ESS profile-picture upload to Firebase Storage (JPG, PNG, WEBP; maximum 5 MB).
- Updated the ESS header to display the shared employee profile picture and allow the employee to change it.
- Updated the HR Employee Masterlist to display the same employee profile picture.
- Added a Firestore live listener for employee records so HR and ESS clients can receive employee record updates.
- Changed employee updates to persist to Firestore before updating local UI state; Firestore errors are no longer silently swallowed by this action.
- Added `storage.rules` for employee profile images. Review and deploy these rules only after confirming the Firebase user documents contain the correct `employeeId` and role fields.
- Changed the HR Payroll Manager so it no longer automatically fabricates historical payslip entries from sample employees.
- Removed the hardcoded assumption that only selected employment classifications are SALN-covered in the SALN monitoring summary.

## Existing project limitations that remain

This revision does NOT complete every item in the master revision prompt. In particular:

- The DataContext still uses LocalStorage for much of its application state. Employee records now have a Firestore live listener and employee updates write to Firestore, but the entire application has not been migrated to Firestore as its authoritative database.
- Several other transaction actions still have local/demo behavior or incomplete Firestore persistence.
- Document uploads outside the profile-picture feature still need end-to-end Firebase Storage integration and testing.
- The full SALN signed upload/review workflow, two-PDF generation for every document request, secure digital signing/sealing, and personal-claim acknowledgment workflow are not fully implemented.
- Leave approval emails and secure interactive approval links require a configured trusted email/backend service and have not been verified.
- Existing Firestore rules need a complete least-privilege review before production. Do not deploy without reviewing access rules and testing with separate HR and employee accounts.
- Storage rules must be reviewed against the actual Firebase project and user document schema before deployment.
- The existing sample records and some demo-oriented interfaces may still be present in other modules.

## Firebase setup

1. Confirm Firebase project `stable-timing-7pthm` is the intended project.
2. Confirm the custom Firestore database ID in `firebase-applet-config.json`.
3. Review `firestore.rules`.
4. Review and deploy `storage.rules` only after validating user-role and employee ownership fields.
5. Configure Vercel environment variables as required by the existing app.
6. Never add service-account private keys or email provider secrets to frontend code or public GitHub.

## Build verification

A production build was not verified in this environment because dependency installation did not complete within the available execution window. Run:

```bash
npm install
npm run lint
npm run build
```

Fix all reported errors before deploying to Vercel.

## Important

This revision does not reset Firebase, delete employee records, or remove administrator accounts. Keep the original ZIP as a backup.
