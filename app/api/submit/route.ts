import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildTeamEmailHtml, buildClientEmailHtml } from '@/app/lib/email';
import type { FormState, UploadedFile } from '@/app/lib/types';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

function generateRef(): string {
  return `FME-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function validate(f: any): string | null {
  if (!f.firstName?.trim()) return 'First name required';
  if (!f.lastName?.trim()) return 'Last name required';
  if (!f.email?.trim() || !/.+@.+\..+/.test(f.email)) return 'Valid email required';
  if (!f.phone?.trim()) return 'Phone required';
  if (!f.company?.trim()) return 'Company required';
  if (!f.productionName?.trim()) return 'Production name required';
  if (!f.description?.trim()) return 'Description required';
  if (!f.scriptStatus) return 'Script status required';
  if (!f.shootDate) return 'Shoot date required';
  if (!f.deliveryDate) return 'Delivery date required';
  if (!f.street?.trim() || !f.city?.trim() || !f.state?.trim()) return 'Location required';
  if (!Array.isArray(f.services) || !f.services.length) return 'Services required';
  if (!f.audioNeeded) return 'Audio answer required';
  if (!Array.isArray(f.broadcast) || !f.broadcast.length) return 'Distribution required';
  if (!f.postNeeded) return 'Post-production answer required';
  if (!Array.isArray(f.deliverables) || !f.deliverables.length) return 'Deliverables required';
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { honeypot, files: uploadedFiles, ...form } = body as {
      honeypot?: string;
      files?: UploadedFile[];
    } & FormState;

    // Honeypot — bots fill hidden fields. Silent success keeps them guessing.
    if (honeypot && honeypot.trim()) {
      return NextResponse.json({ ok: true, ref: generateRef() });
    }

    const err = validate(form);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const ref = generateRef();
    const files = uploadedFiles || [];

    // Generate 30-day signed download URLs for the team email
    const fileUrls: Array<UploadedFile & { url?: string }> = [];
    for (const f of files) {
      const { data } = await supabase.storage
        .from('request-uploads')
        .createSignedUrl(f.path, 60 * 60 * 24 * 30);
      fileUrls.push({ ...f, url: data?.signedUrl });
    }

    // Insert into DB
    const { error: dbErr } = await supabase.from('production_requests').insert({
      ref,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      company: form.company,
      job_title: form.jobTitle || null,
      heard_about: form.heardAbout || null,
      production_name: form.productionName,
      description: form.description,
      script_status: form.scriptStatus,
      stakeholders: form.stakeholders || null,
      nda_required: form.ndaRequired || null,
      decision_deadline: form.decisionDeadline || null,
      shoot_date: form.shootDate || null,
      delivery_date: form.deliveryDate || null,
      shoot_days: form.shootDays ? parseInt(form.shootDays) : null,
      location_count: form.locationCount ? parseInt(form.locationCount) : null,
      street: form.street,
      street2: form.street2 || null,
      city: form.city,
      state: form.state,
      zip: form.zip || null,
      services: form.services,
      audio_needed: form.audioNeeded,
      broadcast: form.broadcast,
      post_needed: form.postNeeded,
      deliverables: form.deliverables,
      accessibility: form.accessibility,
      talent_needed: form.talentNeeded || null,
      talent_count: form.talentCount ? parseInt(form.talentCount) : null,
      talent_type: form.talentType,
      talent_demo: form.talentDemo || null,
      union_pref: form.unionPref || null,
      paid_advertising: form.paidAdvertising || null,
      usage_years: form.usageYears ? parseInt(form.usageYears) : null,
      brand_assets: form.brandAssets || null,
      brand_notes: form.brandNotes || null,
      music_approach: form.musicApproach,
      budget_range: form.budgetRange || null,
      notes: form.notes || null,
      files: files,
    });
    if (dbErr) {
      console.error('DB insert failed:', dbErr);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    // Send team notification + client confirmation in parallel
    const recipients = (process.env.RECIPIENT_EMAILS || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const fromName = process.env.FROM_NAME || 'FME Studios';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@fmestudios.com';
    const from = `${fromName} <${fromEmail}>`;

    const sends = [
      resend.emails.send({
        from,
        to: recipients,
        replyTo: form.email,
        subject: `New Production Request — ${form.productionName} (${ref})`,
        html: buildTeamEmailHtml(form, ref, fileUrls),
      }),
      resend.emails.send({
        from,
        to: form.email,
        subject: `We received your production request — ${ref}`,
        html: buildClientEmailHtml(form, ref),
      }),
    ];

    // Don't fail the request if email fails — DB record is the source of truth
    const results = await Promise.allSettled(sends);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`Email ${i === 0 ? 'team' : 'client'} send failed:`, r.reason);
      }
    });

    return NextResponse.json({ ok: true, ref });
  } catch (e: any) {
    console.error('submit route failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
