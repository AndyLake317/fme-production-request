# fme-production-request — Claude Code Context

**Canonical docs live in `FME-Studios/fme-studio-os`:** `architecture.md` (system design, schema, seams, invariants), `DECISIONS.md` (the ADR log), `FME_Studio_OS_Strategy.md` (vision), and that repo's `CLAUDE.md` (the cross-cutting operating directives — *challenge-don't-agree*, persona-review specs, the shared invariants). **Those apply here too.** This file covers only what's specific to this repo.

**What this app is:** the public production-request intake site (`request.fmestudios.com`). It collects a request from an external visitor and hands it to Studio OS; it also hosts the Sullivan Discovery Pre-Work form. Next.js 15 on Vercel; shares the Studio OS Supabase DB (`tqxeemvgfoskrpesdfvy`).

**⚠️ This repo is PUBLIC.** Source is world-readable. Never commit secrets, private internal URLs, or anything that assumes obscurity. (This is the hard constraint behind the deferred monorepo question — `DECISIONS.md` ADR-016.)

---

## Commit & deploy
- **Commit as the real contributor** (`zane-fme` / `andy-fme`). The old **`AndyLake317` shared-author convention is RETIRED** — Vercel is on a paid plan as of June 30, so the free-tier "deploys restricted to account owner" constraint that forced it no longer exists (`DECISIONS.md` ADR-015). *The previous version of this file documented the AndyLake317 rule and told you not to flag authorship — that guidance is obsolete; disregard it.* Commit identity is now the real author, and `git config` is authoritative again.
- Run **`npx next build`** before committing (not just `tsc`). Zane reviews + pushes; push is the deploy gate.

## The intake contract (this app → Studio OS)
This is the load-bearing cross-app seam. The Studio-OS side is described in `fme-studio-os/architecture.md` §5.6; this is the caller side.
- `app/api/submit` POSTs to **`STUDIO_OS_INTAKE_URL`** with **`Authorization: Bearer REQUEST_INTAKE_TOKEN`**.
- Payload: `{ productionName, description, shootDate, deliveryDate, shootDays, productionRequestId, client: { company, contactName, email, phone } }`.
- **The submission must never fail the user.** A failed intake call logs a single `console.error('Studio OS intake call failed:', res.status)` and still returns success to the visitor — a downstream error must not throw the visitor's submission away.
- **Do NOT write `projects` / `project_phases` / clients directly from this repo.** Studio OS owns project creation (it makes an UNINITIALIZED project, upserts the client, idempotent on `production_request_id`). The old `createProjectFromRequest` / `upsertClient` direct-DB writes were deleted in Session 24 and must not return — the intake endpoint is the only path.
- **No DIAG logging.** Temporary diagnostic logs in `/api/submit` were removed (Session 25); don't reintroduce standing DIAG logs.

## Other surfaces
- `/sullivan-prework` + `app/api/sullivan-prework` — a Resend email to `andy@fmestudios.com` + `chris@fmestudios.com`. Light/dark theme toggle persisted via localStorage; FME favicon.

## Env vars (this repo's Vercel project)
- `STUDIO_OS_INTAKE_URL`, `REQUEST_INTAKE_TOKEN` — the token must match the value set on the Studio OS project; **rotate them together.**
- Resend (`RESEND_API_KEY`, `FROM_*`) for the pre-work email.
- *(Verify the full set against the live Vercel project.)*

## Migrations / schema
This app reads/writes the shared DB but **does not own schema.** Migrations are applied from the Studio OS side via Supabase MCP — don't run migrations from here. Schema reference: `fme-studio-os/architecture.md` §7.

---

*App-specific operating notes only. System design + schema + the shared invariants live in `FME-Studios/fme-studio-os`.*
