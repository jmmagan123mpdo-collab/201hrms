# SJHR201 Controlled Remake Notes

This revision is based on the uploaded SJHR201 source ZIP. It preserves the existing React/Vite/Firebase structure, modules, assets, and Firebase project configuration.

## Preserved
- Existing HR Management and ESS portal structure
- Existing HR modules and employee/document workflows
- Existing Firebase project ID and custom Firestore database ID
- Existing branding assets and PWA files
- Existing Firestore rules (not silently deployed or replaced)

## Safe correction made
- Corrected the municipal logo URL in the mobile sidebar. Files under Vite's `public/` directory are served from the web root, so `/public/assets/...` was an invalid public URL; it is now `/assets/...`.

## Important limitations found during inspection
- The current DataContext initializes many HR collections from sample data and persists multiple collections to browser LocalStorage. This is not an authoritative Firebase-only data model yet.
- AuthContext contains local/demo credential paths and LocalStorage-backed accounts. These must not be treated as production authentication.
- Firestore rules currently allow broad create/update access in several transaction collections. Do not deploy these rules to production without a separate permission review and emulator tests.
- Email delivery depends on external provider configuration and must be tested before being represented as operational.
- A production build was not verified in this environment because dependency installation did not complete. No claim of build success is made.

## Data safety
No Firebase operations were run. No remote users, Firestore documents, or Storage files were modified or deleted. No database reset or migration was performed.

## Recommended next implementation boundary
Stabilize authentication and Firestore persistence collection-by-collection, preserving existing collection names and records. Do not bulk-seed sample data into production collections. Add migrations only after a backup and explicit approval.
