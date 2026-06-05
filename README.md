# FME Production Request

Production-ready Next.js app that powers the public production request form for FME Studios.

- **Form** — Next.js 15 (App Router) + React 19 + TypeScript
- **Database** — Supabase Postgres
- **File uploads** — Supabase Storage (signed URLs, bypasses Vercel's body size limit)
- **Email** — Resend (notification to production team + confirmation to submitter)
- **Hosting** — Vercel

---

## Deploy checklist

You'll need accounts at:
- [GitHub](https://github.com)
- [Vercel](https://vercel.com)
- [Supabase](https://supabase.com)
- [Resend](https://resend.com)

And access to DNS for `fmestudios.com` (to verify the sender domain in Resend and point the subdomain at Vercel).

Total time: ~60–90 minutes, mostly waiting for DNS.

---

## 1. Supabase setup

1. Open your Supabase project → **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
   This creates the `production_requests` table and the `request-uploads` storage bucket.

2. **Settings → API** — copy three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → `SUPABASE_SERVICE_KEY` — **keep this secret**

3. **Storage → request-uploads** — confirm the bucket exists. It should be **private** (default).

---

## 2. Resend setup

1. Sign up at [resend.com](https://resend.com).

2. **Domains** → **Add Domain** → enter `fmestudios.com`. Resend gives you DNS records to add (SPF, DKIM, DMARC). Add them at your DNS provider. **Wait for verification** — can take 10 minutes to a few hours.

3. **API Keys** → **Create API Key** → name it "Production Request Form" → copy the key → save as `RESEND_API_KEY`.

   You can also use Resend's testing mode with their `onboarding@resend.dev` sender to test before DNS verifies — just set `FROM_EMAIL=onboarding@resend.dev` temporarily.

---

## 3. Local development

```bash
# Clone or unzip this project, then:
npm install

# Copy the env template and fill it in
cp .env.local.example .env.local
# Open .env.local and paste the values from Supabase + Resend

# Start the dev server
npm run dev
# → open http://localhost:3000
```

Submit a test request. You should see:
- A new row in the `production_requests` table in Supabase
- Files (if uploaded) in the `request-uploads` storage bucket
- Two emails (to `production@`, `info@`, and the submitter)

---

## 4. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-ORG/fme-production-request.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - vercel.com → **Add New** → **Project** → import your GitHub repo
   - Framework Preset: **Next.js** (auto-detected)
   - **Environment Variables** — paste in everything from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`
     - `RESEND_API_KEY`
     - `RECIPIENT_EMAILS`
     - `FROM_EMAIL`
     - `FROM_NAME`
   - **Deploy**

3. **Custom domain**
   - Project → **Settings → Domains** → **Add** → `request.fmestudios.com`
   - Vercel gives you a CNAME record. Add it at your DNS provider.
   - Vercel auto-issues an SSL cert once DNS resolves.

---

## 5. Test the live form

Submit a real request from the deployed URL. Verify:
- ✅ Row appears in Supabase (`production_requests` table)
- ✅ Files appear in Storage (`request-uploads` bucket)
- ✅ Notification email arrives at `production@fmestudios.com` and `info@fmestudios.com`
- ✅ Confirmation email arrives at the submitter's address
- ✅ Reference number on confirmation page matches the email subject and the DB row

---

## Where things live

```
app/
├─ components/Form.tsx          ← the main form UI (sections 1–10)
├─ components/inputs.tsx        ← reusable Field, TextInput, CheckGroup, etc.
├─ components/Confirmation.tsx  ← post-submit thank-you screen
├─ components/SectionHeader.tsx ← numbered section header + NestedBlock
├─ lib/constants.ts             ← option lists + theme colors — edit here
├─ lib/types.ts                 ← FormState type
├─ lib/email.ts                 ← HTML email templates (team + client)
├─ api/submit/route.ts          ← receives form, writes to DB, sends emails
├─ api/upload-url/route.ts      ← issues signed Supabase upload URLs
├─ layout.tsx                   ← html shell + Google Fonts
├─ page.tsx                     ← entry point — renders Form
└─ globals.css                  ← @font-face for Kimberley BL + resets

public/
├─ fme-logo.png                 ← FME logo (transparent PNG)
└─ fonts/kimberley-bl.otf       ← Kimberley BL display font

supabase/schema.sql             ← database + storage bucket setup
```

---

## Common edits

**Change who receives notifications**
Edit `RECIPIENT_EMAILS` env var in Vercel. Comma-separated, no spaces.

**Add/remove form options** (services, deliverables, budget ranges, etc.)
Edit `app/lib/constants.ts`. The form re-reads from this file.

**Tweak the dark theme palette**
The `C` object in `app/lib/constants.ts` holds every color in the form.

**Edit email copy**
`app/lib/email.ts` — two functions: `buildTeamEmailHtml` (internal notification) and `buildClientEmailHtml` (submitter confirmation).

---

## Viewing submissions

Two easy options for now:
1. **Supabase Table Editor** — log into Supabase, open `production_requests`, sort by `created_at` desc. Best for browsing all-time history.
2. **Email** — every submission lands in `production@fmestudios.com` and `info@fmestudios.com` with the full request brief inline.

When the volume grows, building a small `/admin` page with auth is straightforward — let me know and I can add it.

---

## Spam protection

A honeypot field is built in — bots fill it, the request silently 200s without writing to DB or sending email. This handles most low-effort scrapers.

For more aggressive spam protection, add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (free, invisible to real users). Wire-up is ~10 lines of code in `Form.tsx` and `api/submit/route.ts`.

---

## Costs

At current FME volume (estimating 5–50 submissions/month):
- **Supabase** — free tier (500MB database, 1GB storage — plenty)
- **Resend** — free tier (3,000 emails/month — plenty)
- **Vercel** — free tier (100GB bandwidth — way more than you'll need)

If you ever outgrow free tiers, expect ~$25/month total.

---

## Troubleshooting

**"Failed to get upload URL" when submitting files**
Check `SUPABASE_SERVICE_KEY` is set in Vercel env vars. It must be the **service_role** key, not anon.

**Emails not arriving**
- Resend domain not yet verified? Check **Domains** tab in Resend.
- Spam folder?
- Try setting `FROM_EMAIL=onboarding@resend.dev` temporarily to bypass domain verification.

**Form submits but no DB row**
Check the Vercel function logs (Project → **Logs**). Most common cause: `production_requests` table doesn't exist (re-run `supabase/schema.sql`).

**Local dev: "Module not found"**
Run `npm install` again. If still broken, delete `node_modules/` and `package-lock.json` and run `npm install` fresh.

---

## What's next

Reasonable v2 additions, ranked by impact:
1. **Internal admin view** at `/admin` (password-gated) — list, search, mark-as-read
2. **Slack notification** — drop a webhook into `api/submit/route.ts`, get a Slack message per submission
3. **Cloudflare Turnstile** — better spam protection
4. **Status updates** — let the team change a row's `status` (new → in-review → quoted → won/lost) for pipeline tracking
5. **Analytics** — Vercel Analytics is free and one-click

Hit me up when you're ready.
