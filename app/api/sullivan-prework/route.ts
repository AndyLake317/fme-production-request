import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { esc, row, section } from '@/app/lib/email';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Hardcoded distribution for the Sullivan pre-work — NOT RECIPIENT_EMAILS.
const RECIPIENTS = ['andy@fmestudios.com', 'chris@fmestudios.com'];

// Renders empty answers as an em dash, mirroring the requested format.
const v = (s: unknown): string => {
  const t = typeof s === 'string' ? s.trim() : '';
  return t || '—';
};

function buildSullivanEmailHtml(f: Record<string, string>): string {
  const name = (f.i_name || '').trim();
  const role = (f.i_role || '').trim();

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f5f5f5;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;width:100%;background:#fff;border-radius:0;">
        <tr><td style="padding:36px 36px 28px;background:#000;color:#fff;">
          <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#4FB0D1;margin-bottom:10px;">Sullivan Discovery Pre-Work</div>
          <h1 style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;">Discovery Pre-Read</h1>
          <div style="margin-top:10px;font-family:'Courier New',monospace;font-size:13px;color:#4FB0D1;letter-spacing:0.05em;">${esc(name)}${role ? ` · ${esc(role)}` : ''}</div>
        </td></tr>
        <tr><td style="padding:0 36px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            ${section('Who is filling this out', [
              row('Name', v(f.i_name)),
              row('Role / Title', v(f.i_role)),
              row('Team / Department', v(f.i_team)),
              row('Years with Sullivan', v(f.i_years)),
              row('Date completed', v(f.i_date)),
            ])}
            ${section('Part 01 — Where the Brand Has Been & Where It\'s Going', [
              row("Sullivan's greatest strength", v(f.dg_strength)),
              row('Brand heritage — what must we protect?', v(f.dg_heritage)),
              row('Future direction', v(f.dg_future)),
              row('Why a refresh, why now?', v(f.dg_whynow)),
            ])}
            ${section('Part 02 — Your Perspective on the Brand', [
              row('1. Describe Sullivan to a stranger', v(f.q1)),
              row('2. What we do better than anyone', v(f.q2)),
              row('3. Why customers choose us / leave', v(f.q3)),
              row('4. Perception gap', v(f.q4)),
              row('5. Working vs. dated', v(f.q5)),
              row('6. Most important audiences', v(f.q7)),
              row('7. Brands you admire & why', v(f.q8)),
            ])}
            ${section('Anything else', [
              row('Before we begin', v(f.extra)),
            ])}
          </table>
        </td></tr>
        <tr><td style="padding:20px 36px;background:#fafafa;border-top:1px solid #e5e5e5;text-align:center;color:#999;font-family:'Inter',Arial,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">
          FME Studios · ${esc(new Date().toLocaleString())}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, string>;
    const name = (body.i_name || '').trim();
    const role = (body.i_role || '').trim();

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required.' }, { status: 400 });
    }

    const fromName = process.env.FROM_NAME || 'FME Studios';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@fmestudios.com';
    const from = `${fromName} <${fromEmail}>`;

    try {
      const { error } = await resend.emails.send({
        from,
        to: RECIPIENTS,
        subject: `Sullivan Discovery Pre-Work — ${name}${role ? ` (${role})` : ''}`,
        html: buildSullivanEmailHtml(body),
      });
      if (error) {
        console.error('Sullivan pre-work email send failed:', error);
        return NextResponse.json({ error: 'Failed to send. Please try again.' }, { status: 500 });
      }
    } catch (sendErr) {
      console.error('Sullivan pre-work email send threw:', sendErr);
      return NextResponse.json({ error: 'Failed to send. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('sullivan-prework route failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
