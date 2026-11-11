# SJHR201 – LGU San Jose HRMIS

Private-source application. Stack: React, TypeScript, Vite, Firebase, GitHub and Vercel.

## Local development
1. Install Node.js (LTS).
2. Run `npm install`.
3. Configure Firebase web app values in `.env.local` using `.env.example` as a guide. Never commit secrets.
4. Run `npm run dev`.
5. Run `npm run build` before deployment.

## Important
- Demo employee, document, leave, wellness, SALN and ESS request records have been cleared.
- Existing portal account usernames and role definitions are retained in the starter account list.
- Authentication must be connected to Firebase Authentication and protected by Firestore/Storage security rules before production use. Do not use hard-coded demo passwords for real personnel data.
- Attendance and biometrics are excluded.
- PWA manifest and service worker are included; test installation over HTTPS after deployment.
- This starter is not yet certified for production HR/payroll processing. Validate workflows, legal requirements, access controls and audit logging before launch.
