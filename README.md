# Screenprinting Bali — Next.js + Supabase

Landing page migrated from the original standalone `index.html`. Pricing for
the "Price it yourself" calculator now lives in Supabase instead of being
hardcoded in JavaScript.

## 1. Setup

```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 2. Supabase

1. Create a Supabase project (or reuse an existing one).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the pricing tables and seeds them with the current prices
   (combed 16s/24s/30s, cut multipliers, DTF/plastisol/rubber costs, etc).
3. Copy the Project URL and the `anon` public key from
   Project Settings → API into `.env.local`.

Tables created: `products`, `fabrics`, `cuts`, `bag_sizes`, `print_methods`,
`design_sizes`. The calculator fetches these client-side on page load.

The schema currently grants the anon key write access to all pricing tables
so `/admin` works without login. **Before going live**, add Supabase Auth
to `/admin` and replace the `"temp anon write ..."` policies in
`supabase/schema.sql` with policies scoped to authenticated admins.

## 3. Run locally

```bash
npm run dev
```

- `/` — the landing page
- `/admin` — edit pricing numbers (no auth yet, keep the URL private)

## 4. Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel, with **Root Directory** set to `app-nextjs`
   if this folder isn't the repo root.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. `npm run build` runs automatically.

Run `npm run build` locally first to make sure it's green before pushing.
