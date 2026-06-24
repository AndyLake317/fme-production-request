import type { FormState, UploadedFile } from './types';

export function esc(s: string | undefined | null): string {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function row(label: string, value: string | undefined | null): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:7px 16px 7px 0;color:#777;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;vertical-align:top;width:170px;font-family:'Inter',Arial,sans-serif;">${esc(label)}</td>
      <td style="padding:7px 0;color:#1a1a1a;font-size:14px;line-height:1.55;font-family:'Inter',Arial,sans-serif;">${esc(value).replace(/\n/g, '<br>')}</td>
    </tr>`;
}

export function section(title: string, rows: string[]): string {
  const content = rows.filter(Boolean).join('');
  if (!content) return '';
  return `
    <tr><td style="padding:28px 0 4px;">
      <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#4FB0D1;border-top:1px solid #e5e5e5;padding-top:18px;">${esc(title)}</div>
    </td></tr>
    <tr><td>
      <table style="width:100%;border-collapse:collapse;">${content}</table>
    </td></tr>`;
}

export function buildTeamEmailHtml(f: FormState, ref: string, fileUrls: Array<UploadedFile & { url?: string }>): string {
  const addr = [f.street, f.street2, [f.city, f.state, f.zip].filter(Boolean).join(', ')]
    .filter(Boolean).join('\n');

  const fileLinks = fileUrls.length
    ? fileUrls.map(file => `<a href="${file.url}" style="color:#1464AB;text-decoration:underline;">${esc(file.name)}</a> <span style="color:#999;font-size:12px;">(${(file.size/1024).toFixed(0)} KB)</span>`).join('<br>')
    : null;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f5f5f5;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;width:100%;background:#fff;border-radius:0;">
        <tr><td style="padding:36px 36px 28px;background:#000;color:#fff;">
          <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#4FB0D1;margin-bottom:10px;">New Production Request</div>
          <h1 style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;">${esc(f.productionName)}</h1>
          <div style="margin-top:10px;font-family:'Courier New',monospace;font-size:13px;color:#4FB0D1;letter-spacing:0.05em;">${ref} · from ${esc(f.firstName)} ${esc(f.lastName)} (${esc(f.company)})</div>
        </td></tr>
        <tr><td style="padding:0 36px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            ${section('Contact', [
              row('Name', `${f.firstName} ${f.lastName}`),
              row('Email', f.email),
              row('Phone', f.phone),
              row('Company', f.company),
              row('Title', f.jobTitle),
              row('Source', f.heardAbout),
            ])}
            ${section('Production', [
              row('Description', f.description),
              row('Status', f.scriptStatus),
              row('Approvers / Stakeholders', f.stakeholders),
              row('NDA Required', f.ndaRequired),
            ])}
            ${section('Schedule', [
              row('Decision Deadline', fmtDate(f.decisionDeadline)),
              row('Shoot Date', fmtDate(f.shootDate)),
              row('Shoot Days', f.shootDays),
              row('Locations', f.locationCount),
              row('Asset Delivery', fmtDate(f.deliveryDate)),
            ])}
            ${section('Location', [row('Address', addr)])}
            ${section('Scope', [
              row('Services', f.services.join(', ')),
              row('Audio Capture', f.audioNeeded),
              row('Post-Production', f.postNeeded),
              row('Distribution', f.broadcast.join(', ')),
            ])}
            ${section('Deliverables', [
              row('Output Package', f.deliverables.join(', ')),
              row('Accessibility', f.accessibility.join(', ')),
            ])}
            ${section('Talent', [
              row('Pro Talent', f.talentNeeded),
              f.talentNeeded === 'Yes' ? row('Count', f.talentCount) : '',
              f.talentNeeded === 'Yes' ? row('Type', f.talentType.join(', ')) : '',
              f.talentNeeded === 'Yes' ? row('Casting Notes', f.talentDemo) : '',
              f.talentNeeded === 'Yes' ? row('Union Preference', f.unionPref) : '',
              row('Paid Advertising', f.paidAdvertising),
              f.paidAdvertising === 'Yes' ? row('Usage Years', f.usageYears) : '',
            ].filter(Boolean) as string[])}
            ${section('Brand & Music', [
              row('Existing Brand Assets', f.brandAssets),
              row('Brand Notes', f.brandNotes),
              row('Music Approach', f.musicApproach.join(', ')),
            ])}
            ${section('Budget', [row('Range', f.budgetRange)])}
            ${fileLinks ? `
              <tr><td style="padding:28px 0 4px;">
                <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#4FB0D1;border-top:1px solid #e5e5e5;padding-top:18px;">Reference Files</div>
              </td></tr>
              <tr><td style="padding:8px 0;font-family:'Inter',Arial,sans-serif;font-size:14px;line-height:1.85;color:#1a1a1a;">
                ${fileLinks}
                <div style="margin-top:14px;color:#999;font-size:12px;">Links expire in 30 days.</div>
              </td></tr>` : ''}
            ${f.notes ? section('Notes', [row('Additional', f.notes)]) : ''}
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

export function buildClientEmailHtml(f: FormState, ref: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f5f5f5;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:#fff;">
        <tr><td style="padding:48px 36px 36px;background:#000;color:#fff;text-align:center;">
          <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#4FB0D1;margin-bottom:14px;">A Creative Digital Agency</div>
          <div style="font-family:'Inter',Arial,sans-serif;font-size:30px;font-weight:800;letter-spacing:0.02em;">FME <span style="color:#4FB0D1;">STUDIOS</span></div>
        </td></tr>
        <tr><td style="padding:44px 36px 32px;">
          <h2 style="margin:0 0 18px;font-family:'Inter',Arial,sans-serif;font-size:24px;font-weight:700;color:#1a1a1a;">Thanks, ${esc(f.firstName)}.</h2>
          <p style="margin:0 0 18px;font-family:'Inter',Arial,sans-serif;font-size:15px;line-height:1.65;color:#444;">
            We've received your production request for <strong style="color:#1a1a1a;">${esc(f.productionName)}</strong>.
            A producer will be in touch within one business day to discuss next steps, schedule, and budget.
          </p>
          <div style="margin:32px 0;padding:18px 22px;background:#fafafa;border-left:3px solid #4FB0D1;">
            <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#999;margin-bottom:6px;">Your Reference</div>
            <div style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#1464AB;letter-spacing:0.06em;">${ref}</div>
          </div>
          <p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:13px;line-height:1.65;color:#666;">
            Please include this reference number in any follow-up correspondence.
          </p>
        </td></tr>
        <tr><td style="padding:24px 36px;background:#000;color:#999;text-align:center;font-family:'Inter',Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">
          FME Studios · Indianapolis, Indiana · fmestudios.com
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
