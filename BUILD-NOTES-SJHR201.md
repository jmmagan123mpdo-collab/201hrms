# SJHR201 build notes

This package is a safe development foundation based on the latest supplied SJHR201 source archive.

## Start locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

## Important before using real employee data

This is not yet a complete production system. Do not deploy it for real employee records until the remaining security and persistence work listed in `IMPLEMENTATION-STATUS.md` is completed and tested. The existing Firestore and Storage rules are not certified for production and must not be deployed as-is.

The build preserves the configured Firebase project/database IDs and does not execute any remote Firebase operations. It does not reset Firestore, Storage, Authentication users, or local browser caches.

## Current sign-in contract

Sign-in uses Firebase Authentication email/password plus a matching `/users/{uid}` Firestore profile with an active role. The supported account roles are `developer`, `hr_admin`, `hr_staff`, `payroll`, `mayor`, `department_head`, `division_head`, and `employee`. Username login, account provisioning, and ESS self-registration need secure server-side endpoints and are not represented as complete in this build.
