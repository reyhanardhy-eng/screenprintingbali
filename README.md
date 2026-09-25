# Screen Printing Bali

Next.js 16 app. Authentication, calculator data, portfolio and chat use the Hostinger MySQL database. Browsers never connect to MySQL directly. No Supabase SDK or runtime configuration is required.

## Hostinger prerequisites

- Hostinger Business or Cloud hosting with Node.js web app support, Node 20.9+ (Node 22 LTS recommended), and MySQL.
- Persistent writable storage for portfolio uploads. Set `PORTFOLIO_STORAGE_DIR` to a directory that survives redeployments.
- SMTP account for verification and password reset. Google OAuth is optional for customer sign-in.

Hostinger guidance: [deploy a Node.js website](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) and [connect a Hostinger MySQL database](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/).

## Deploy

1. Create a MySQL database/user in hPanel and import `database/schema.mysql.sql` into an empty database. For a full reset of the existing approved Hostinger database, run `database/reset-hostinger.sql` first; it permanently removes the 12 old app tables and their contents. Run it only after confirming the reset and verifying the target database. Skip it for a fresh database.
2. Deploy as a Node.js app with Node.js 22, build command `npm ci && npm run build`, and start command `npm run start`.
3. Add variables from `.env.hostinger.example` in Hostinger settings. Use hPanel database details and generate fresh random secrets.
4. Set `APP_BASE_URL` to the final HTTPS origin. For Google login, register `https://YOUR_DOMAIN/api/auth/google/callback` in Google Cloud.
5. Configure SMTP and test mail. Point the domain after the app, database and email are ready.
6. Temporarily set a strong `ADMIN_BOOTSTRAP_TOKEN`, visit `/admin/setup`, create the admin, then remove the token. Enroll an authenticator and save the recovery codes.
7. Check signup, verification, password reset, admin MFA, price edits, portfolio upload and chat before production traffic.

## Import existing data

Export required legacy rows as CSV or JSON into `migration/data` using the column names expected by `scripts/import-hostinger-data.mjs`. Supported files: `users`, `admins`, `oauth_accounts`, `products`, `fabrics`, `cuts`, `bag_sizes`, `print_methods`, `design_sizes`, `portfolio_items`, `portfolio_media_map`, `conversations`, and `messages`. Each can be a JSON array or CSV. For Supabase Auth, export `auth.users` fields `id`, `email`, `email_confirmed_at`, and `raw_user_meta_data` to `users.csv`; export `public.admins` as `admins.csv`; export Google rows from `auth.identities` with `provider`, `provider_id`, `user_id`, and `identity_data` as `oauth_accounts.csv`. Do not export password hashes. Put portfolio files in `migration/data/media`, and map old image URLs to safe filenames in `portfolio_media_map.csv` with columns `image_url,file_name`.

The `.gitignore` excludes `migration/data/` and `var/`. Keep exported emails, chat messages, and image files out of Git and deployment archives.

After installing the schema and configuring the environment for the new database, run `npm run import:hostinger -- migration/data`. Review row counts and missing-image count. Imported password hashes are discarded; users must set new passwords through reset email. Chat history and Google account IDs can be imported. Sessions, MFA secrets, and reset/verification tokens are not imported. Keep the old system available until record counts and sample rows are checked.

The importer does not connect to Supabase. Export files must be created separately; this migration does not delete old-provider data.

## Local development

```powershell
npm ci
Copy-Item .env.hostinger.example .env.local
# Set local MySQL and mail settings, then:
npm run dev
```

Run `npm run lint` and `npm run build` to check source. Do not use production credentials locally.
