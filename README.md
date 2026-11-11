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


## SJHR201 Development Build Notes

This development build starts employee records, document requests, ESS document requests,
leave applications, wellness applications, SALN records, notifications, and audit logs empty.
It retains the configured office directory, document catalog, system settings, Firebase
project configuration, and existing authentication setup.

Biometrics and attendance data models/actions are excluded. Wellness W-01/W-02 remain
available inside the single Leave Management area; there is no separate Wellness Leave /
Break sidebar entry.

The current application still uses browser LocalStorage for much of its working state.
Firebase connectivity and selected writes are present, but complete Firestore read/write
coverage, Firebase Storage uploads, secure role enforcement, email delivery, and the full
approval workflow must be completed and tested before production use. Do not use real
personnel data until those items are verified.


## Sample approval email routing (development)

Developer System Control Center → Workflow Engine or Notifications includes editable test recipient addresses:
- Supervisor: `jmmagan123mpdo@gmail.com`
- Mayor: `juanmig488@gmail.com`

These settings are saved to browser local storage in the current development build. They do **not** send email or authorize approvers. An email service, authenticated approval pages, HR final acceptance, and leave-credit posting still need to be built and tested before production use.
