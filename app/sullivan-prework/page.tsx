'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sullivan_prework_v1';

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
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
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

  const update = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    // Typing into a flagged field clears its highlight + the guard error.
    if (key === highlightKey) setHighlightKey(null);
    if (status === 'error' && (key === 'i_name' || key === 'i_role')) {
      setStatus('idle');
      setMessage('');
    }
  };

  const flagMissing = (key: string) => {
    setStatus('error');
    setMessage('Please add your name and role first.');
    setHighlightKey(key);
    const el = fieldRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightKey(null), 2800);
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
      setHighlightKey(null);
    }
  };

  const handleSubmit = async () => {
    if (status === 'sending' || status === 'sent') return;

    // Guard — block the send entirely until name AND role are present.
    if (!form.i_name.trim()) {
      flagMissing('i_name');
      return;
    }
    if (!form.i_role.trim()) {
      flagMissing('i_role');
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
  const statusClass =
    status === 'error' ? 'sstatus-err' : status === 'sent' ? 'sstatus-ok' : 'sstatus-info';

  return (
    <div className="swrap">
      {/* Hanken Grotesk — loaded here to keep the change isolated to this page. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="sdoc">
        {/* Masthead */}
        <header className="smast">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="smast-logo" src="/fme-logo.png" alt="FME Studios" />
          <div className="smast-col">
            <div className="smast-brandrow">
              <span className="smast-word">FME STUDIOS</span>
              <span className="smast-dot" />
              <span className="smast-sub">Sullivan Brand Refresh</span>
            </div>
            <div className="smast-bar" />
            <div className="seyebrow">Phase 01 · Pre-Work for the Sullivan Team</div>
            <h1 className="sh1">Discovery Pre-Read</h1>
            <p className="sintro">
              A short set of questions to complete before our kick-off. Your answers give us a head
              start — we&rsquo;ll review them together in the meeting rather than starting cold.
              There are no wrong answers; first instincts are often the most useful.
            </p>
          </div>
        </header>

        {/* Before you start */}
        <div className="scallout">
          <div className="scallout-label">Before you start</div>
          <ul>
            <li>Set aside about 15–20 minutes.</li>
            <li>Complete this on your own — we want your individual perspective.</li>
            <li>Answer in your own words. Bullet points or full sentences both work.</li>
          </ul>
        </div>

        {/* Intake */}
        <section className="scard">
          <div className="ssec-label">Who is filling this out?</div>
          <div className="sintake-grid">
            {INTAKE.map((f) => {
              const isDate = f.key === 'i_date';
              return (
                <label key={f.key} className={`sfield${isDate ? ' sfield-date' : ''}`}>
                  <span className="sflabel">{f.label}</span>
                  <input
                    ref={(el) => {
                      fieldRefs.current[f.key] = el;
                    }}
                    type="text"
                    value={form[f.key] || ''}
                    onChange={(e) => update(f.key, e.target.value)}
                    className={`f-line${highlightKey === f.key ? ' f-err' : ''}`}
                  />
                </label>
              );
            })}
          </div>
        </section>

        {/* Part 01 */}
        <section className="spart">
          <div className="spart-head">
            <span className="spart-num">01</span>
            <div>
              <div className="spart-eyebrow">Part 01</div>
              <h2 className="spart-h2">Where the Brand Has Been &amp; Where It&rsquo;s Going</h2>
            </div>
          </div>
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
        </section>

        {/* Part 02 */}
        <section className="spart">
          <div className="spart-head">
            <span className="spart-num">02</span>
            <div>
              <div className="spart-eyebrow">Part 02</div>
              <h2 className="spart-h2">Your Perspective on the Brand</h2>
            </div>
          </div>
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
        </section>

        {/* Anything else */}
        <section className="spart">
          <div className="spart-head">
            <div>
              <div className="spart-eyebrow">Optional</div>
              <h2 className="spart-h2">Anything Else</h2>
            </div>
          </div>
          <QuestionField
            field={EXTRA}
            value={form[EXTRA.key] || ''}
            onChange={(val) => update(EXTRA.key, val)}
            assignRef={(el) => {
              fieldRefs.current[EXTRA.key] = el;
            }}
          />
        </section>

        {/* Submit */}
        <div className="ssubmit-row">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || sent}
            className="swbtn swbtn-primary"
          >
            {sent ? 'Submitted' : sending ? 'Sending…' : 'Submit to FME'}
          </button>
          <button type="button" onClick={clearFields} disabled={sending} className="swbtn swbtn-ghost">
            Clear fields
          </button>
        </div>
        {message ? <div className={`sstatus ${statusClass}`}>{message}</div> : null}

        {/* Signoff */}
        <footer className="sfoot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sfoot-logo" src="/fme-logo.png" alt="FME Studios" />
          <div>
            <div className="sfoot-word">FME STUDIOS</div>
            <div className="sfoot-line">
              Phase 01 — Discovery Pre-Work · Please return ahead of the kick-off · fmestudios.com
            </div>
          </div>
        </footer>
      </div>
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
    <label className="sq">
      <span className="sq-label">
        {number ? <span className="sq-num">{number}. </span> : null}
        {field.label}
      </span>
      <textarea
        ref={assignRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="f-box"
      />
    </label>
  );
}

const CSS = `
.swrap {
  min-height: 100vh;
  background: #0E1116;
  padding: 40px 16px 64px;
  font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: #2B3038;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.sdoc {
  max-width: 8.5in;
  margin: 0 auto;
  background: #fff;
  border-radius: 6px;
  padding: 40px clamp(24px, 5vw, 0.75in) 96px;
  box-shadow: 0 10px 44px rgba(0,0,0,0.40);
}

/* Masthead */
.smast {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  border-bottom: 2px solid rgba(14,17,22,0.10);
  padding-bottom: 22px;
}
.smast-logo { width: 52px; height: 52px; flex: none; object-fit: contain; }
.smast-col { flex: 1; min-width: 0; }
.smast-brandrow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.smast-word {
  font-family: 'Kimberley BL', 'Kimberley', Georgia, serif;
  font-size: 13px; font-weight: 700; letter-spacing: 0.04em; color: #0E1116;
}
.smast-dot { width: 4px; height: 4px; border-radius: 50%; background: #4FB0D1; flex: none; }
.smast-sub {
  font-size: 11px; font-weight: 600; letter-spacing: 0.24em;
  text-transform: uppercase; color: #8A929E;
}
.smast-bar { width: 48px; height: 3px; background: #4FB0D1; margin: 14px 0 12px; }
.seyebrow {
  font-size: 12px; font-weight: 600; letter-spacing: 0.3em;
  text-transform: uppercase; color: #2A82B8;
}
.sh1 {
  font-family: 'Kimberley BL', 'Kimberley', Georgia, serif;
  font-size: 40px; font-weight: 700; line-height: 0.96;
  text-transform: uppercase; color: #0E1116; margin: 10px 0 16px;
}
.sintro { font-size: 15px; line-height: 1.55; color: #4A515C; max-width: 42em; margin: 0; }

/* Before you start */
.scallout {
  border-left: 3px solid #4FB0D1;
  background: #F4FAFC;
  border-radius: 0 8px 8px 0;
  padding: 16px 18px;
  margin-top: 28px;
}
.scallout-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase; color: #2A82B8; margin-bottom: 8px;
}
.scallout ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: #4A515C; }

/* Intake card */
.scard {
  border: 1px solid rgba(14,17,22,0.12);
  border-radius: 8px;
  padding: 18px 20px 20px;
  background: #FAFBFC;
  margin-top: 34px;
}
.ssec-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase; color: #6B7480; margin-bottom: 16px;
}
.sintake-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
.sfield { display: flex; flex-direction: column; gap: 6px; }
.sfield-date { grid-column: 1 / -1; max-width: 220px; }
.sflabel {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6B7480;
}
.f-line {
  border: none;
  border-bottom: 1px solid #C7CDD4;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #2B3038;
  padding: 7px 2px;
  outline: none;
  width: 100%;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.f-line:focus { border-bottom-color: #4FB0D1; box-shadow: 0 1px 0 0 #4FB0D1; }
.f-line.f-err {
  border-bottom-color: #C0492B;
  background: rgba(192,73,43,0.06);
  box-shadow: 0 0 0 3px rgba(192,73,43,0.20);
  border-radius: 4px;
}

/* Part sections */
.spart { border-top: 1px solid rgba(14,17,22,0.12); padding-top: 30px; margin-top: 34px; }
.spart-head { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
.spart-num {
  font-family: 'Kimberley BL', 'Kimberley', Georgia, serif;
  font-size: 44px; font-weight: 700; line-height: 0.85; color: #4FB0D1; flex: none;
}
.spart-eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 0.28em;
  text-transform: uppercase; color: #8A929E;
}
.spart-h2 {
  font-family: 'Kimberley BL', 'Kimberley', Georgia, serif;
  font-size: 23px; font-weight: 700; text-transform: uppercase;
  color: #0E1116; line-height: 1.05; margin: 4px 0 0;
}

/* Questions */
.sq { display: block; margin-bottom: 22px; }
.sq-label { display: block; font-size: 15px; font-weight: 600; line-height: 1.5; color: #2B3038; margin-bottom: 9px; }
.sq-num { color: #4FB0D1; font-family: 'Kimberley BL', 'Kimberley', Georgia, serif; font-weight: 700; }
.f-box {
  border: 1px solid #D5DAE0;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #2B3038;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  width: 100%;
  min-height: 84px;
  transition: border-color .15s, box-shadow .15s;
}
.f-box:focus { border-color: #4FB0D1; box-shadow: 0 0 0 3px rgba(79,176,209,0.22); }

/* Buttons */
.ssubmit-row { display: flex; align-items: center; gap: 16px; margin-top: 40px; flex-wrap: wrap; }
.swbtn {
  font-family: inherit;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: 6px;
  padding: 9px 16px;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s, opacity .15s;
}
.swbtn:disabled { cursor: default; }
.swbtn-primary { background: #4FB0D1; color: #08222E; border: none; }
.swbtn-primary:hover:not(:disabled) { background: #6FC7E6; }
.swbtn-primary:disabled { opacity: .65; }
.swbtn-ghost { background: transparent; color: #6B7480; border: 1px solid #C7CDD4; }
.swbtn-ghost:hover:not(:disabled) { color: #14171D; border-color: #8A929E; }
.swbtn-ghost:disabled { opacity: .6; }
.sstatus { margin-top: 14px; font-size: 14px; font-weight: 600; }
.sstatus-err { color: #C0492B; }
.sstatus-ok { color: #1a8f5a; }
.sstatus-info { color: #6B7480; }

/* Signoff */
.sfoot {
  border-top: 2px solid rgba(14,17,22,0.10);
  margin-top: 44px;
  padding-top: 20px;
  display: flex;
  gap: 14px;
  align-items: center;
}
.sfoot-logo { width: 40px; height: 40px; flex: none; object-fit: contain; }
.sfoot-word { font-family: 'Kimberley BL', 'Kimberley', Georgia, serif; font-size: 14px; font-weight: 700; color: #0E1116; }
.sfoot-line { font-size: 12px; color: #8A929E; margin-top: 2px; }

@media (max-width: 560px) {
  .sintake-grid { grid-template-columns: 1fr; }
  .sfield-date { max-width: none; }
  .sh1 { font-size: 32px; }
  .spart-num { font-size: 36px; }
}
`;
