/**
 * One-time provisioning for the six initial SJHR201 privileged accounts.
 * Requires a Firebase service-account JSON outside the repository.
 * This script never creates Encoder or ESS accounts and never deletes data.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the Firebase service-account JSON path.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: serviceAccount.project_id });
const auth = admin.auth();
const db = admin.firestore();
const roles = [
  { role: 'developer', username: 'sysdev', label: 'System Developer' },
  { role: 'hr_admin', username: 'hradmin', label: 'HR Administrator' },
  { role: 'payroll', username: 'payroll', label: 'Payroll Officer' },
  { role: 'mayor', username: 'mayor', label: 'Mayor' },
  { role: 'department_head', username: 'depthead', label: 'Department Head' },
  { role: 'division_head', username: 'divhead', label: 'Division Head' },
];
const rl = readline.createInterface({ input, output });
const credentials = [];
try {
  console.log('\nSJHR201 INITIAL PRIVILEGED ACCOUNT SETUP');
  console.log('Creates only Developer, HR Administrator, Payroll Officer, Mayor, Department Head, and Division Head.');
  console.log('Encoder and ESS accounts are intentionally excluded.\n');
  for (const item of roles) {
    const email = (await rl.question(`${item.label} official email: `)).trim().toLowerCase();
    const displayName = (await rl.question(`${item.label} full name: `)).trim() || item.label;
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error(`A valid official email is required for ${item.label}.`);
    let user;
    let createdNow = false;
    try { user = await auth.getUserByEmail(email); }
    catch (e) { if (e.code !== 'auth/user-not-found') throw e; }
    const temporaryPassword = `SJH!${crypto.randomBytes(9).toString('base64url')}9a`;
    if (user) {
      console.log(`\n${email} already exists in Firebase Authentication. No password changed; updating only SJHR201 role profile.`);
    } else {
      user = await auth.createUser({ email, password: temporaryPassword, displayName, emailVerified: false, disabled: false });
      createdNow = true;
    }
    await auth.setCustomUserClaims(user.uid, { sjhr201: true, role: item.role });
    await db.collection('users').doc(user.uid).set({
      uid: user.uid, email, username: item.username, usernameLower: item.username,
      displayName, role: item.role, permissions: item.role === 'developer' || item.role === 'hr_admin'
        ? ['*'] : item.role === 'payroll' ? ['view_employees','view_payroll','manage_payslips','generate_reports']
        : item.role === 'mayor' ? ['view_department_summary','approve_leave_when_required']
        : item.role === 'department_head' ? ['view_department_employees','review_department_leave','review_performance']
        : ['view_division_employees','review_division_leave','review_performance'],
      isActive: true, mustChangePassword: !user.metadata?.creationTime,
      accountProvisionedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    credentials.push({ role: item.label, username: item.username, email, temporaryPassword: createdNow ? temporaryPassword : '(existing Firebase account — password unchanged)' });
  }
  const csv = ['Role,Username,Email,Temporary Password', ...credentials.map(x => [x.role,x.username,x.email,x.temporaryPassword].map(v => `"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');
  const out = `SJHR201-INITIAL-CREDENTIALS-${new Date().toISOString().slice(0,10)}.csv`;
  fs.writeFileSync(out, csv, { mode: 0o600 });
  console.log(`\nProvisioning complete. Credential sheet: ${out}`);
  console.log('Store this file securely, deliver credentials privately, and require password changes before operational use.');
} catch (error) {
  console.error('\nProvisioning stopped:', error.message);
  process.exitCode = 1;
} finally { rl.close(); }
