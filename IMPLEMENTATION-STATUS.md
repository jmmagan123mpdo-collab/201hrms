# SJHR201 Build Status — 20 November 2026

## Changes in this build
- Preserved the existing React/Vite/Firebase application structure, assets, module components, and Firebase project configuration.
- Removed the one-time browser LocalStorage purge. The app no longer clears keys beginning with `sjhr201_` on startup.
- Replaced cached-browser-role authentication with Firebase Authentication sign-in plus a required `/users/{uid}` Firestore profile check.
- Added the eight approved role identifiers: Developer, HR Administrator, HR Staff/Encoder, Payroll Officer, Mayor, Department Head, Division Head, and Employee.
- Added role-specific sidebar navigation for executive, department, division, payroll, HR administration, and encoder views. SALN is not shown in Mayor, Department Head, or Division Head navigation.
- Removed the Google sign-in button from ESS login. Login uses the HR-verified email and Firebase password.
- Corrected Vite public asset paths and production service-worker detection.

## Not yet production-complete
- Existing module data is still partly browser LocalStorage state. The collections have not all been migrated to real-time Firestore persistence.
- User Management still contains local/demo account-management logic. Creating/deleting Firebase Authentication users for other people requires a trusted server-side Admin SDK endpoint or Cloud Function; it must not be done with client-side elevated credentials.
- Username-based login requires a secure server-side username-to-email resolver. This build currently accepts email/password only.
- ESS self-registration is intentionally disabled until HR-verified provisioning is connected.
- Firestore and Storage rules in this source package have not been deployed or certified. Existing rules contain broad permissions and must be replaced only after collection-by-collection review and Firebase Emulator tests.
- Email delivery requires configured provider secrets and end-to-end tests.
- Department/Division/Mayor process screens need final LGU routing configuration and role-specific transaction-level authorization, beyond hiding navigation items.
- SALN, employee documents, payroll, and other sensitive collections need verified server-side and Firestore rule enforcement before real personnel data is used.

## Safety
- No Firebase calls, migrations, deployments, remote account changes, Firestore writes, or Storage writes were run while preparing this ZIP.
- No paid services were activated.
- Existing Firebase data and browser LocalStorage data were not intentionally deleted.

## Required before live deployment
1. Provision one initial Developer/HR Administrator account in Firebase Authentication and its matching `/users/{uid}` profile through a trusted administrative process.
2. Implement secure Admin SDK user provisioning, account deletion with immutable audit identity, and username resolver endpoints.
3. Move each business collection to Firestore with server timestamps, ownership checks, role/office/division scoping, and append-only audit history.
4. Rewrite and test Firestore/Storage rules in the Firebase Emulator; do not deploy the existing broad rules.
5. Configure and test email provider secrets, leave approval routing, PDF generation, document storage, and PWA offline/update behavior.
6. Run dependency installation, TypeScript checks, production build, and end-to-end role tests.
