# SJHR201 – Initial Privileged Accounts

This build includes a one-time Firebase provisioning script for exactly six initial privileged accounts:

| Role | Initial username |
|---|---|
| System Developer | `sysdev` |
| HR Administrator | `hradmin` |
| Payroll Officer | `payroll` |
| Mayor | `mayor` |
| Department Head | `depthead` |
| Division Head | `divhead` |

**Encoder and ESS accounts are not created by this setup.** Encoder accounts are created later by the HR Administrator. ESS accounts remain separate and are provisioned for HR-verified employees only.

## Create the six accounts in Firebase

1. In Firebase Console, enable **Authentication → Email/Password**.
2. Generate a Firebase service-account key for the correct project and store it outside this source folder. Never commit it to GitHub or Vercel.
3. Install dependencies with `npm install`.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the service-account JSON file path.
5. Run `npm run provision:admins`.
6. Enter each person's official email and full name when prompted.
7. The script creates Firebase Authentication accounts with random temporary passwords, writes their role profiles to Firestore `users/{uid}`, and creates a local CSV credential sheet with restricted file permissions.
8. Deliver each temporary credential privately and require password changes before the system is used for actual personnel records.

If an email already exists in Firebase Authentication, the script does not reset its password; it updates the SJHR201 role profile only. It never deletes or resets Firestore records.

## Login

The HR Management login uses Firebase Email/Password authentication and reads the authorized role from `users/{uid}`. HR login accepts the official email address. Username lookup uses the `usernameLower` field, which is provisioned by the script.

## Important

The source package cannot activate accounts in your live Firebase project from this workspace because no Firebase service-account credential was provided. The six roles and provisioning process are included, but accounts become live only after you run the provisioning command against your Firebase project. Do not deploy this HR system for real confidential records until Firestore/Storage rules, role-specific UI restrictions, and the complete application build have been reviewed and tested.
