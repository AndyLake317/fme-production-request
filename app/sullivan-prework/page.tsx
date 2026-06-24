'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sullivan_prework_v1';
const ACCENT = '#4FB0D1';
const DISPLAY = "'Kimberley BL', 'Inter', Arial, sans-serif";
const BODY = "'Inter', Arial, sans-serif";

type Field = { key: string; label: string; required?: boolean };

const INTAKE: Field[] = [
  { key: 'i_name', label: 'Name', required: true },
  { key: 'i_role', label: 'Role / Title', required: true },
  { key: 'i_team', label: 'Team / Department' },
  { key: 'i_years', label: 'Years with Sullivan' },
  { key: 'i_date', label: 'Date completed' },
];

const PART01: Field[] = [
  { key: 'dg_heritage', label: 'Brand heritage — what about Sullivan must we protect?' },
  { key: 'dg_future', label: 'Future direction — where does the brand need to go?' },
  { key: 'dg_whynow', label: 'Why a refresh, why now?' },
  { key: 'dg_sacred', label: 'What must NOT change?' },
  { key: 'dg_open', label: "Open questions you'd want this process to answer" },
];

const PART02: Field[] = [
  { key: 'q1', label: 'In one sentence, how would you describe Sullivan to a stranger?' },
  { key: 'q2', label: 'What do we do better than anyone else?' },
  { key: 'q3', label: 'Why do customers really choose us — and why do they leave?' },
  { key: 'q4', label: "Where's the perception gap — how we see ourselves vs. how we're seen?" },
  { key: 'q5', label: "What's working about the current brand? What feels dated?" },
  { key: 'q7', label: 'Who are our most important audiences, in order?' },
  { key: 'q8', label: 'Which brands do you admire — in or out of category — and why?' },
];

const EXTRA: Field = { key: 'extra', label: 'Anything else we should know before we begin?' };

const ALL_KEYS = [...INTAKE, ...PART01, ...PART02, EXTRA].map((f) => f.key);

const blank = (): Record<string, string> =>
  ALL_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as Record<string, string>);

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function SullivanPreWork() {
  const [form, setForm] = useState<Record<string, string>>(blank);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  // Rehydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string>;
        setForm((prev) => ({ ...prev, ...saved }));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Autosave every change (after the initial hydrate so we don't clobber saved data).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* storage full / unavailable */
    }
  }, [form, hydrated]);

  const update = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const focusField = (key: string) => {
    const el = fieldRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  const clearFields = () => {
    if (status === 'sending') return;
    if (window.confirm('Clear all fields? This can’t be undone.')) {
      setForm(blank());
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setStatus('idle');
      setMessage('');
    }
  };

  const handleSubmit = async () => {
    if (status === 'sending' || status === 'sent') return;

    if (!form.i_name.trim()) {
      setStatus('error');
      setMessage('Please add your name and role first.');
      focusField('i_name');
      return;
    }
    if (!form.i_role.trim()) {
      setStatus('error');
      setMessage('Please add your name and role first.');
      focusField('i_role');
      return;
    }

    setStatus('sending');
    setMessage('Sending…');
    try {
      const res = await fetch('/api/sullivan-prework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
        setMessage('✓ Sent to FME. Thank you!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const sending = status === 'sending';
  const sent = status === 'sent';

  return (
    <div style={s.page}>
      <div style={s.doc}>
        {/* Header */}
        <div style={s.eyebrow}>Phase 01 · Pre-Work for the Sullivan Team</div>
        <h1 style={s.title}>Discovery Pre-Read</h1>
        <p style={s.intro}>
          A short set of questions to complete before our kick-off. Your answers give us a head
          start — we&rsquo;ll review them together in the meeting rather than starting cold. There
          are no wrong answers; first instincts are often the most useful.
        </p>

        {/* Before you start callout */}
        <div style={s.callout}>
          <div style={s.calloutTitle}>Before you start</div>
          <ul style={s.calloutList}>
            <li>Set aside about 15–20 minutes.</li>
            <li>Complete this on your own — we want your individual perspective.</li>
            <li>Answer in your own words. Bullet points or full sentences both work.</li>
          </ul>
        </div>

        {/* INTAKE */}
        <SectionTitle n="00" label="Who is filling this out?" />
        <div style={s.intakeGrid}>
          {INTAKE.map((f) => (
            <label key={f.key} style={s.intakeField}>
              <span style={s.intakeLabel}>
                {f.label}
                {f.required ? <span style={{ color: ACCENT }}> *</span> : null}
              </span>
              <input
                ref={(el) => {
                  fieldRefs.current[f.key] = el;
                }}
                type="text"
                value={form[f.key] || ''}
                onChange={(e) => update(f.key, e.target.value)}
                style={s.input}
              />
            </label>
          ))}
        </div>

        {/* PART 01 */}
        <SectionTitle n="01" label="Where the Brand Has Been & Where It's Going" />
        {PART01.map((f) => (
          <QuestionField
            key={f.key}
            field={f}
            value={form[f.key] || ''}
            onChange={(val) => update(f.key, val)}
            assignRef={(el) => {
              fieldRefs.current[f.key] = el;
            }}
          />
        ))}

        {/* PART 02 */}
        <SectionTitle n="02" label="Your Perspective on the Brand" />
        {PART02.map((f, i) => (
          <QuestionField
            key={f.key}
            field={f}
            number={i + 1}
            value={form[f.key] || ''}
            onChange={(val) => update(f.key, val)}
            assignRef={(el) => {
              fieldRefs.current[f.key] = el;
            }}
          />
        ))}

        {/* ANYTHING ELSE */}
        <SectionTitle n="03" label="Anything else?" />
        <QuestionField
          field={EXTRA}
          value={form[EXTRA.key] || ''}
          onChange={(val) => update(EXTRA.key, val)}
          assignRef={(el) => {
            fieldRefs.current[EXTRA.key] = el;
          }}
        />

        {/* Submit */}
        <div style={s.submitRow}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || sent}
            style={{
              ...s.submitBtn,
              opacity: sending ? 0.7 : 1,
              cursor: sending || sent ? 'default' : 'pointer',
              background: sent ? '#1a8f5a' : ACCENT,
            }}
          >
            {sent ? 'Submitted' : sending ? 'Sending…' : 'Submit to FME'}
          </button>
          <button
            type="button"
            onClick={clearFields}
            disabled={sending}
            style={s.clearBtn}
          >
            Clear fields
          </button>
        </div>
        {message ? (
          <div
            style={{
              ...s.status,
              color: status === 'error' ? '#c0392b' : status === 'sent' ? '#1a8f5a' : '#666',
            }}
          >
            {message}
          </div>
        ) : null}

        {/* Footer / signoff */}
        <div style={s.footer}>
          Thank you for taking the time. — The FME Studios Team
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ n, label }: { n: string; label: string }) {
  return (
    <div style={s.sectionTitleWrap}>
      <span style={s.sectionNum}>{n}</span>
      <span style={s.sectionLabel}>{label}</span>
    </div>
  );
}

function QuestionField({
  field,
  number,
  value,
  onChange,
  assignRef,
}: {
  field: Field;
  number?: number;
  value: string;
  onChange: (val: string) => void;
  assignRef: (el: HTMLTextAreaElement | null) => void;
}) {
  return (
    <label style={s.qField}>
      <span style={s.qLabel}>
        {number ? <span style={{ color: ACCENT, fontWeight: 700 }}>{number}. </span> : null}
        {field.label}
      </span>
      <textarea
        ref={assignRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={s.textarea}
      />
    </label>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#eceef0',
    padding: '40px 16px 64px',
    fontFamily: BODY,
    color: '#1a1a1a',
  },
  doc: {
    maxWidth: 760,
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.10)',
    padding: '56px 56px 48px',
  },
  eyebrow: {
    fontFamily: BODY,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: ACCENT,
    marginBottom: 14,
  },
  title: {
    fontFamily: DISPLAY,
    fontSize: 44,
    fontWeight: 400,
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
    margin: '0 0 18px',
    color: '#0f0f0f',
  },
  intro: {
    fontSize: 15.5,
    lineHeight: 1.7,
    color: '#444',
    margin: '0 0 28px',
    maxWidth: 620,
  },
  callout: {
    background: '#f7fbfd',
    border: `1px solid ${'#d8edf4'}`,
    borderLeft: `3px solid ${ACCENT}`,
    borderRadius: 3,
    padding: '18px 22px',
    marginBottom: 40,
  },
  calloutTitle: {
    fontFamily: BODY,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#3a8aa6',
    marginBottom: 10,
  },
  calloutList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 14,
    lineHeight: 1.8,
    color: '#4a4a4a',
  },
  sectionTitleWrap: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 14,
    borderTop: '1px solid #e5e5e5',
    paddingTop: 26,
    marginTop: 40,
    marginBottom: 22,
  },
  sectionNum: {
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    fontWeight: 700,
    color: ACCENT,
    letterSpacing: '0.06em',
  },
  sectionLabel: {
    fontFamily: DISPLAY,
    fontSize: 22,
    fontWeight: 400,
    color: '#0f0f0f',
    lineHeight: 1.2,
  },
  intakeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 18,
    marginBottom: 8,
  },
  intakeField: { display: 'flex', flexDirection: 'column', gap: 7 },
  intakeLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#777',
  },
  input: {
    fontFamily: BODY,
    fontSize: 15,
    color: '#1a1a1a',
    background: '#fff',
    border: '1px solid #d6d6d6',
    borderRadius: 3,
    padding: '10px 12px',
    outline: 'none',
    width: '100%',
  },
  qField: { display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 },
  qLabel: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.5,
    color: '#222',
  },
  textarea: {
    fontFamily: BODY,
    fontSize: 15,
    lineHeight: 1.6,
    color: '#1a1a1a',
    background: '#fff',
    border: '1px solid #d6d6d6',
    borderRadius: 3,
    padding: '12px 14px',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
    minHeight: 84,
  },
  submitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginTop: 44,
    flexWrap: 'wrap',
  },
  submitBtn: {
    fontFamily: BODY,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.03em',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    padding: '14px 32px',
  },
  clearBtn: {
    fontFamily: BODY,
    fontSize: 13.5,
    fontWeight: 600,
    color: '#888',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '8px 4px',
  },
  status: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: 600,
  },
  footer: {
    marginTop: 48,
    paddingTop: 22,
    borderTop: '1px solid #e5e5e5',
    fontSize: 13,
    color: '#999',
    letterSpacing: '0.04em',
  },
};
