'use client';

import { Check, Paperclip } from 'lucide-react';
import { C } from '@/app/lib/constants';

export function Confirmation({
  firstName, productionName, ref, fileCount, onReset,
}: {
  firstName: string; productionName: string; ref: string;
  fileCount: number; onReset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      backgroundImage: `radial-gradient(circle at 50% 30%, ${C.blueGlow} 0%, transparent 60%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
        <img src="/fme-logo.png" alt="FME Studios" style={{ width: 110, height: 'auto', marginBottom: 36, opacity: 0.95 }} />
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'transparent', border: `1.5px solid ${C.blue}`,
          color: C.blue,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          boxShadow: `0 0 40px ${C.blueGlow}`,
        }}>
          <Check size={28} strokeWidth={2.5} />
        </div>
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
          color: C.blue, marginBottom: 18,
        }}>
          Request Received
        </div>
        <h1 style={{
          fontFamily: '"Kimberley BL", "Inter", system-ui, sans-serif',
          fontSize: 48, fontWeight: 400, color: C.ink, margin: '0 0 24px',
          letterSpacing: '0.01em', lineHeight: 1.05,
          textTransform: 'uppercase',
        }}>
          Thanks, {firstName}.
        </h1>
        <p style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 16, color: C.inkMuted, lineHeight: 1.65, margin: '0 0 12px',
          maxWidth: 520, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Your request for <span style={{ color: C.ink, fontWeight: 600 }}>{productionName}</span> has been received.
          We&apos;ve sent you a confirmation email — a producer will be in touch within one business day to discuss next steps.
        </p>
        {fileCount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', marginTop: 18,
            background: 'rgba(93, 186, 111, 0.08)',
            border: `1px solid ${C.ok}44`,
            color: C.ok, fontSize: 13,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            <Paperclip size={14} />
            {fileCount} reference {fileCount === 1 ? 'file' : 'files'} uploaded successfully.
          </div>
        )}
        <div style={{
          display: 'inline-block',
          padding: '14px 24px',
          background: C.bgElev,
          border: `1px solid ${C.border}`,
          marginTop: 32,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.inkDim, marginBottom: 6 }}>
            Reference
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 20, fontWeight: 600, color: C.blue, letterSpacing: '0.06em',
          }}>
            {ref}
          </div>
        </div>
        <div style={{ marginTop: 48 }}>
          <button
            onClick={onReset}
            style={{
              padding: '13px 30px',
              background: 'transparent',
              border: `1px solid ${C.borderHi}`,
              color: C.ink,
              fontFamily: '"Kimberley BL", "Inter", system-ui, sans-serif',
              fontSize: 12, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.ink; }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    </div>
  );
}
