'use client';

import { useState, useRef } from 'react';
import {
  Check, Upload, Calendar, MapPin, Camera, Film,
  Sparkles, FileText, Users, DollarSign, ArrowRight, Paperclip, Mail,
  Music, Loader2,
} from 'lucide-react';
import { C, SERVICES, BROADCAST, DELIVERABLES, ACCESSIBILITY,
  BUDGET_RANGES, HEARD_ABOUT, SCRIPT_STATUS, TALENT_TYPE,
  UNION_PREF, BRAND_ASSETS, MUSIC_OPTIONS } from '@/app/lib/constants';
import { blankForm, type FormState, type UploadedFile } from '@/app/lib/types';
import { Field, TextInput, TextArea, Select, CheckGroup, RadioButtons, YesNo, FileChips } from './inputs';
import { SectionHeader, NestedBlock } from './SectionHeader';
import { Confirmation } from './Confirmation';

type Errors = Partial<Record<keyof FormState | 'location', boolean>>;

export default function Form() {
  const [form, setForm] = useState<FormState>(blankForm());
  const [files, setFiles] = useState<File[]>([]);
  const [honeypot, setHoneypot] = useState(''); // bots fill this; humans don't see it
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof FormState>(key: K) => (val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = true;
    if (!form.lastName.trim()) e.lastName = true;
    if (!form.email.trim() || !/.+@.+\..+/.test(form.email)) e.email = true;
    if (!form.phone.trim()) e.phone = true;
    if (!form.company.trim()) e.company = true;
    if (!form.productionName.trim()) e.productionName = true;
    if (!form.description.trim()) e.description = true;
    if (!form.scriptStatus) e.scriptStatus = true;
    if (!form.shootDate) e.shootDate = true;
    if (!form.deliveryDate) e.deliveryDate = true;
    if (!form.street.trim() || !form.city.trim() || !form.state.trim()) e.location = true;
    if (form.services.length === 0) e.services = true;
    if (!form.audioNeeded) e.audioNeeded = true;
    if (form.broadcast.length === 0) e.broadcast = true;
    if (!form.postNeeded) e.postNeeded = true;
    if (form.deliverables.length === 0) e.deliverables = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const r = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name }),
    });
    if (!r.ok) throw new Error('Failed to get upload URL');
    const { signedUrl, path } = await r.json();
    const upload = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
    if (!upload.ok) throw new Error(`Upload failed for ${file.name}`);
    return { name: file.name, size: file.size, path };
  };

  const handleSubmit = async () => {
    setSubmitError('');
    if (!validate()) {
      const firstErrorEl = document.querySelector('[data-error="true"]');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      // 1. Upload files directly to Supabase Storage
      const uploadedFiles: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading file ${i + 1} of ${files.length}…`);
        uploadedFiles.push(await uploadFile(files[i]));
      }
      setUploadProgress(files.length ? 'Sending request…' : 'Sending request…');

      // 2. Submit the form
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, files: uploadedFiles, honeypot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmittedRef(data.ref);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  const startNew = () => {
    setForm(blankForm());
    setFiles([]);
    setSubmitted(false);
    setErrors({});
    setSubmittedRef('');
    setSubmitError('');
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <Confirmation
        firstName={form.firstName}
        productionName={form.productionName}
        ref={submittedRef}
        fileCount={files.length}
        onReset={startNew}
      />
    );
  }

  return (
    <div ref={topRef} style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: '"Inter", system-ui, sans-serif',
      color: C.ink,
    }}>
      {/* Hero */}
      <header style={{
        padding: '64px 32px 56px',
        background: C.bg,
        position: 'relative', overflow: 'hidden',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          position: 'absolute', top: '-200px', right: '-100px',
          width: 700, height: 700,
          background: `radial-gradient(circle, ${C.blueDeep}33 0%, ${C.blueGlow} 30%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-300px', left: '-100px',
          width: 600, height: 600,
          background: `radial-gradient(circle, ${C.blueGlow} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <img src="/fme-logo.png" alt="FME Studios" style={{ width: 96, height: 'auto', marginBottom: 36 }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: C.blue, marginBottom: 24,
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            <span style={{ width: 28, height: 1, background: C.blue }} />
            A Creative Digital Agency
          </div>
          <h1 style={{
            fontFamily: '"Kimberley BL", "Inter", system-ui, sans-serif',
            fontSize: 76, fontWeight: 400, margin: 0,
            letterSpacing: '0.005em', lineHeight: 1,
            textTransform: 'uppercase',
            color: C.ink,
          }}>
            Production<br />
            <span style={{ color: C.blue }}>Request.</span>
          </h1>
          <p style={{
            fontSize: 16, color: C.inkMuted, margin: '28px 0 0',
            maxWidth: 580, lineHeight: 1.65,
          }}>
            Tell us about the project you want to bring to life. The more detail you share,
            the faster we can put together a plan, a crew, and a budget that fits.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '64px 32px 80px' }}>

        {/* Honeypot — hidden from real users, attractive to bots */}
        <div style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
          <label htmlFor="website-url">Website (leave blank)</label>
          <input
            type="text"
            id="website-url"
            name="website-url"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* 1 — Your Details */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={1} title="Your Details" subtitle="So we know who to reach out to." icon={Users} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
            <Field label="First Name" required span={6} error={errors.firstName}>
              <div data-error={errors.firstName ? 'true' : 'false'}>
                <TextInput value={form.firstName} onChange={update('firstName')} placeholder="Andy" error={errors.firstName} />
              </div>
            </Field>
            <Field label="Last Name" required span={6} error={errors.lastName}>
              <div data-error={errors.lastName ? 'true' : 'false'}>
                <TextInput value={form.lastName} onChange={update('lastName')} placeholder="Lake" error={errors.lastName} />
              </div>
            </Field>
            <Field label="Email" required span={6} error={errors.email}>
              <div data-error={errors.email ? 'true' : 'false'}>
                <TextInput type="email" value={form.email} onChange={update('email')} placeholder="andy@example.com" error={errors.email} />
              </div>
            </Field>
            <Field label="Phone" required span={6} error={errors.phone}>
              <div data-error={errors.phone ? 'true' : 'false'}>
                <TextInput type="tel" value={form.phone} onChange={update('phone')} placeholder="(317) 555-0100" error={errors.phone} />
              </div>
            </Field>
            <Field label="Company / Organization" required span={6} error={errors.company}>
              <div data-error={errors.company ? 'true' : 'false'}>
                <TextInput value={form.company} onChange={update('company')} placeholder="Acme Corp" error={errors.company} />
              </div>
            </Field>
            <Field label="Job Title" span={6}>
              <TextInput value={form.jobTitle} onChange={update('jobTitle')} placeholder="Director of Marketing" />
            </Field>
            <Field label="How did you hear about FME?" span={12}>
              <Select value={form.heardAbout} onChange={update('heardAbout')} options={HEARD_ABOUT} placeholder="Select…" />
            </Field>
          </div>
        </section>

        {/* 2 — The Production */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={2} title="The Production" subtitle="What is this project, in a sentence or two?" icon={Film} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
            <Field label="Production Name" required span={12} error={errors.productionName}>
              <div data-error={errors.productionName ? 'true' : 'false'}>
                <TextInput value={form.productionName} onChange={update('productionName')} placeholder="e.g. Summer Brand Campaign" error={errors.productionName} />
              </div>
            </Field>
            <Field label="Brief Description" required span={12} hint="Audience, tone, story angle, anything we should know up front." error={errors.description}>
              <div data-error={errors.description ? 'true' : 'false'}>
                <TextArea value={form.description} onChange={update('description')} placeholder="A 60-second hero spot for our flagship product launch, plus social cutdowns…" rows={5} error={errors.description} />
              </div>
            </Field>
            <Field label="Script / Concept Status" required span={12}
              hint="Helps us understand what kind of creative lift is needed." error={errors.scriptStatus}>
              <div data-error={errors.scriptStatus ? 'true' : 'false'}>
                <RadioButtons options={SCRIPT_STATUS} value={form.scriptStatus} onChange={update('scriptStatus')} columns={3} />
              </div>
            </Field>
            <Field label="Approvers / Stakeholders" span={12}
              hint="Who needs to sign off on this project? (Names and titles, or just a count is fine.)">
              <TextArea value={form.stakeholders} onChange={update('stakeholders')} placeholder="e.g. Jane Doe (CMO), VP of Brand, agency partner…" rows={3} />
            </Field>
            <Field label="NDA Required?" span={12}>
              <YesNo value={form.ndaRequired} onChange={update('ndaRequired')} />
            </Field>
          </div>
        </section>

        {/* 3 — Schedule */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={3} title="Schedule" subtitle="When are we shooting and when do you need it back?" icon={Calendar} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
            <Field label="Decision Deadline" span={6} hint="When do you need to greenlight the project?">
              <TextInput type="date" value={form.decisionDeadline} onChange={update('decisionDeadline')} />
            </Field>
            <Field label="Anticipated Shoot Date" required span={6} error={errors.shootDate}>
              <div data-error={errors.shootDate ? 'true' : 'false'}>
                <TextInput type="date" value={form.shootDate} onChange={update('shootDate')} error={errors.shootDate} />
              </div>
            </Field>
            <Field label="Asset Delivery Date" required span={6} error={errors.deliveryDate}>
              <div data-error={errors.deliveryDate ? 'true' : 'false'}>
                <TextInput type="date" value={form.deliveryDate} onChange={update('deliveryDate')} error={errors.deliveryDate} />
              </div>
            </Field>
            <Field label="# of Shoot Days" span={3}>
              <TextInput type="number" min="1" value={form.shootDays} onChange={update('shootDays')} placeholder="2" />
            </Field>
            <Field label="# of Locations" span={3}>
              <TextInput type="number" min="1" value={form.locationCount} onChange={update('locationCount')} placeholder="3" />
            </Field>
          </div>
        </section>

        {/* 4 — Where */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={4} title="Where" subtitle="The primary location, or your office address if it's TBD." icon={MapPin} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
            <div data-error={errors.location ? 'true' : 'false'} style={{ gridColumn: 'span 12' }}>
              <Field label="Street Address" required span={12} error={errors.location}>
                <TextInput value={form.street} onChange={update('street')} placeholder="123 Main Street" error={errors.location} />
              </Field>
            </div>
            <Field label="Suite / Unit" span={12}>
              <TextInput value={form.street2} onChange={update('street2')} placeholder="Suite 400" />
            </Field>
            <Field label="City" required span={6} error={errors.location}>
              <TextInput value={form.city} onChange={update('city')} placeholder="Indianapolis" error={errors.location} />
            </Field>
            <Field label="State" required span={3} error={errors.location}>
              <TextInput value={form.state} onChange={update('state')} placeholder="IN" error={errors.location} />
            </Field>
            <Field label="ZIP" span={3}>
              <TextInput value={form.zip} onChange={update('zip')} placeholder="46204" />
            </Field>
          </div>
        </section>

        {/* 5 — Scope */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={5} title="Scope of Work" subtitle="Pick everything that applies — we'll size from there." icon={Camera} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
            <Field label="Services Needed" required span={12} error={errors.services}>
              <div data-error={errors.services ? 'true' : 'false'}>
                <CheckGroup options={SERVICES} values={form.services} onChange={update('services')} columns={2} />
              </div>
            </Field>
            <Field label="Audio Capture Required?" required span={6} hint="Interviews, live speakers, natural sound, etc." error={errors.audioNeeded}>
              <div data-error={errors.audioNeeded ? 'true' : 'false'}>
                <YesNo value={form.audioNeeded} onChange={update('audioNeeded')} />
              </div>
            </Field>
            <Field label="Post-Production Needed?" required span={6} hint="Editing, graphics, color, music, etc." error={errors.postNeeded}>
              <div data-error={errors.postNeeded ? 'true' : 'false'}>
                <YesNo value={form.postNeeded} onChange={update('postNeeded')} />
              </div>
            </Field>
            <Field label="Where Will This Be Distributed?" required span={12} error={errors.broadcast}>
              <div data-error={errors.broadcast ? 'true' : 'false'}>
                <CheckGroup options={BROADCAST} values={form.broadcast} onChange={update('broadcast')} columns={3} />
              </div>
            </Field>
          </div>
        </section>

        {/* 6 — Deliverables */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={6} title="Deliverables" subtitle="What's the final output package?" icon={Sparkles} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
            <Field label="Output Package" required span={12} error={errors.deliverables}>
              <div data-error={errors.deliverables ? 'true' : 'false'}>
                <CheckGroup options={DELIVERABLES} values={form.deliverables} onChange={update('deliverables')} columns={2} />
              </div>
            </Field>
            <Field label="Accessibility Deliverables" span={12}
              hint="Captions and audio description help expand reach and meet ADA requirements.">
              <CheckGroup options={ACCESSIBILITY} values={form.accessibility} onChange={update('accessibility')} columns={3} />
            </Field>
          </div>
        </section>

        {/* 7 — Talent & Usage */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={7} title="Talent & Usage" subtitle="If we're hiring talent, we need to know how the work will run." icon={Users} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
            <Field label="Professional Talent Required?" span={12}>
              <YesNo value={form.talentNeeded} onChange={update('talentNeeded')} />
            </Field>
            {form.talentNeeded === 'Yes' && (
              <NestedBlock>
                <Field label="Number of Talent" span={6}>
                  <TextInput type="number" min="1" value={form.talentCount} onChange={update('talentCount')} placeholder="3" />
                </Field>
                <Field label="Type" span={6}>
                  <CheckGroup options={TALENT_TYPE} values={form.talentType} onChange={update('talentType')} columns={3} />
                </Field>
                <Field label="Casting Notes" span={12} hint="Age range, gender, ethnicity, vibe, special skills, etc.">
                  <TextArea value={form.talentDemo} onChange={update('talentDemo')} placeholder="Mid-30s, diverse ensemble of 3, warm and approachable…" rows={3} />
                </Field>
                <Field label="Union Preference" span={12}>
                  <RadioButtons options={UNION_PREF} value={form.unionPref} onChange={update('unionPref')} columns={3} />
                </Field>
              </NestedBlock>
            )}
            <Field label="Used in Paid Advertising?" span={12}>
              <YesNo value={form.paidAdvertising} onChange={update('paidAdvertising')} />
            </Field>
            {form.paidAdvertising === 'Yes' && (
              <NestedBlock>
                <Field label="Years of Usage Rights" span={12} hint="The license term you'll need for talent and music.">
                  <TextInput type="number" min="0" value={form.usageYears} onChange={update('usageYears')} placeholder="2" />
                </Field>
              </NestedBlock>
            )}
          </div>
        </section>

        {/* 8 — Brand & Music */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={8} title="Brand & Music" subtitle="Existing assets we should work with, and the audio direction." icon={Music} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
            <Field label="Existing Brand Assets?" span={12}
              hint="Brand guidelines, logo files, fonts, prior video work to reference.">
              <RadioButtons options={BRAND_ASSETS} value={form.brandAssets} onChange={update('brandAssets')} columns={3} />
            </Field>
            <Field label="Brand Notes" span={12}>
              <TextArea value={form.brandNotes} onChange={update('brandNotes')} placeholder="Optional — any specific guidelines, mood references, or visual direction." rows={3} />
            </Field>
            <Field label="Music Approach" span={12} hint="Pick what fits — we can guide you if you're not sure.">
              <CheckGroup options={MUSIC_OPTIONS} values={form.musicApproach} onChange={update('musicApproach')} columns={3} />
            </Field>
          </div>
        </section>

        {/* 9 — Budget */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={9} title="Budget" subtitle="A range is fine — it helps us scope the right approach." icon={DollarSign} />
          <Field label="Production Budget Range" span={12}>
            <Select value={form.budgetRange} onChange={update('budgetRange')} options={BUDGET_RANGES} placeholder="Select a range…" />
          </Field>
        </section>

        {/* 10 — Reference */}
        <section style={{ marginBottom: 72 }}>
          <SectionHeader number={10} title="Reference Materials" subtitle="Run of show, shot lists, mood boards, brand guidelines — anything that gives context." icon={FileText} />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.bgHover; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgInput; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.background = C.bgInput;
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            style={{
              border: `1.5px dashed ${C.border}`,
              padding: '36px 24px', textAlign: 'center',
              cursor: 'pointer',
              background: C.bgInput,
              transition: 'all 140ms ease',
            }}
          >
            <Upload size={28} color={C.blue} strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, color: C.ink, fontWeight: 500, marginBottom: 4 }}>
              Drop files here, or click to browse
            </div>
            <div style={{ fontSize: 12, color: C.inkDim }}>
              PDF, JPG, PNG, DOCX, MP4 — up to 100MB each
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          <FileChips files={files} onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />
          <div style={{ marginTop: 28 }}>
            <Field label="Anything Else?" span={12}>
              <TextArea value={form.notes} onChange={update('notes')} placeholder="Optional notes for the producer…" rows={3} />
            </Field>
          </div>
        </section>

        {/* Submit */}
        <div style={{
          paddingTop: 36, borderTop: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          {Object.keys(errors).length > 0 && (
            <div style={{
              padding: '13px 22px',
              background: 'rgba(79, 176, 209, 0.08)',
              border: `1px solid ${C.blue}66`,
              color: C.blue,
              fontSize: 13, fontWeight: 500,
            }}>
              Some required fields are missing — please scroll up to review.
            </div>
          )}
          {submitError && (
            <div style={{
              padding: '13px 22px',
              background: 'rgba(232, 160, 74, 0.08)',
              border: `1px solid ${C.warn}66`,
              color: C.warn,
              fontSize: 13, fontWeight: 500,
              maxWidth: 600, textAlign: 'center',
            }}>
              {submitError}
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '20px 52px',
              background: submitting ? C.border : C.blue,
              border: 'none',
              color: submitting ? C.inkMuted : '#000',
              fontFamily: '"Kimberley BL", "Inter", system-ui, sans-serif',
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 14,
              transition: 'all 140ms ease',
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = '#5BC0E0';
                e.currentTarget.style.boxShadow = `0 0 32px ${C.blueGlow}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = C.blue;
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} strokeWidth={2.5} style={{ animation: 'spin 1s linear infinite' }} />
                {uploadProgress || 'Submitting…'}
              </>
            ) : (
              <>
                Submit Request
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: C.inkDim,
          }}>
            <Mail size={12} />
            Sends to <span style={{ color: C.inkMuted }}>production@fmestudios.com</span>
            <span>·</span>
            <span style={{ color: C.inkMuted }}>info@fmestudios.com</span>
          </div>
        </div>
      </main>

      <footer style={{
        padding: '32px',
        borderTop: `1px solid ${C.border}`,
        textAlign: 'center',
        fontSize: 11,
        color: C.inkDim,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        FME Studios · Indianapolis, Indiana · fmestudios.com
      </footer>
    </div>
  );
}
