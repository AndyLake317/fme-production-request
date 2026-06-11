'use client';

import { useState, ReactNode } from 'react';
import { Check, Paperclip, X } from 'lucide-react';
import { C } from '@/app/lib/constants';

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 15,
  color: C.ink,
  background: C.bgInput,
  border: `1px solid ${C.border}`,
  borderRadius: 0,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
};

const ERROR_COLOR = '#EF4444';
const ERROR_GLOW = 'rgba(239,68,68,0.15)';

export function Field({
  label, required, hint, children, span = 12, error,
}: {
  label: string; required?: boolean; hint?: string;
  children: ReactNode; span?: number; error?: boolean;
}) {
  return (
    <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: error ? ERROR_COLOR : C.inkMuted,
      }}>
        {label}{required && <span style={{ color: error ? ERROR_COLOR : C.blue, marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 12, color: C.inkDim, marginTop: 2,
        }}>{hint}</div>
      )}
    </div>
  );
}

export function TextInput({
  value, onChange, placeholder, type = 'text', error, min,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: boolean; min?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? C.blue : (error ? ERROR_COLOR : C.border),
        boxShadow: focused
          ? `0 0 0 3px ${C.blueGlow}`
          : error ? `0 0 0 3px ${ERROR_GLOW}` : 'none',
      }}
    />
  );
}

export function TextArea({
  value, onChange, placeholder, rows = 4, error,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase, resize: 'vertical', minHeight: 110, lineHeight: 1.55,
        borderColor: focused ? C.blue : (error ? ERROR_COLOR : C.border),
        boxShadow: focused
          ? `0 0 0 3px ${C.blueGlow}`
          : error ? `0 0 0 3px ${ERROR_GLOW}` : 'none',
      }}
    />
  );
}

export function Select({
  value, onChange, options, placeholder = 'Select…',
}: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase, appearance: 'none', cursor: 'pointer',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%234FB0D1' stroke-width='1.5' fill='none'/></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
        paddingRight: 40,
        borderColor: focused ? C.blue : C.border,
        boxShadow: focused ? `0 0 0 3px ${C.blueGlow}` : 'none',
      }}
    >
      <option value="" style={{ background: C.bgInput }}>{placeholder}</option>
      {options.map((o) => <option key={o} value={o} style={{ background: C.bgInput }}>{o}</option>)}
    </select>
  );
}

export function CheckGroup({
  options, values, onChange, columns = 2, error,
}: {
  options: string[]; values: string[];
  onChange: (v: string[]) => void; columns?: number; error?: boolean;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter(v => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: 8,
      padding: error ? '8px' : undefined,
      outline: error ? `2px solid ${ERROR_COLOR}` : undefined,
      boxShadow: error ? `0 0 0 4px ${ERROR_GLOW}` : undefined,
    }}>
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '12px 14px',
              background: active ? C.blueDeep : C.bgInput,
              color: active ? '#fff' : C.ink,
              border: `1px solid ${active ? C.blue : C.border}`,
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 14, fontWeight: 500,
              textAlign: 'left', cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = C.borderHi;
                e.currentTarget.style.background = C.bgHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.bgInput;
              }
            }}
          >
            <span style={{
              width: 16, height: 16,
              border: `1.5px solid ${active ? '#fff' : C.borderHi}`,
              background: active ? C.blue : 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {active && <Check size={11} strokeWidth={3.5} color="#000" />}
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RadioButtons({
  options, value, onChange, columns, error,
}: {
  options: string[]; value: string;
  onChange: (v: string) => void; columns?: number; error?: boolean;
}) {
  const containerStyle: React.CSSProperties = {
    ...(columns
      ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 8 }
      : { display: 'flex', gap: 8, flexWrap: 'wrap' as const }),
    ...(error ? { padding: '8px', outline: `2px solid ${ERROR_COLOR}`, boxShadow: `0 0 0 4px ${ERROR_GLOW}` } : {}),
  };
  return (
    <div style={containerStyle}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: columns ? undefined : 1,
              padding: '12px 16px',
              background: active ? C.blueDeep : C.bgInput,
              color: active ? '#fff' : C.ink,
              border: `1px solid ${active ? C.blue : C.border}`,
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 140ms ease',
              minWidth: columns ? undefined : 80,
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = C.borderHi;
                e.currentTarget.style.background = C.bgHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.bgInput;
              }
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({
  value, onChange, error,
}: {
  value: string; onChange: (v: string) => void; error?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', gap: 8,
      ...(error ? { padding: '8px', outline: `2px solid ${ERROR_COLOR}`, boxShadow: `0 0 0 4px ${ERROR_GLOW}` } : {}),
    }}>
      {['Yes', 'No'].map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: 1, padding: '12px 16px',
              background: active ? C.blueDeep : C.bgInput,
              color: active ? '#fff' : C.ink,
              border: `1px solid ${active ? C.blue : C.border}`,
              fontFamily: '"Kimberley BL", "Inter", system-ui, sans-serif',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 140ms ease',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = C.borderHi;
                e.currentTarget.style.background = C.bgHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.bgInput;
              }
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function FileChips({
  files, onRemove,
}: {
  files: File[]; onRemove: (i: number) => void;
}) {
  if (!files.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
      {files.map((f, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: C.bgInput,
          border: `1px solid ${C.border}`,
          fontSize: 13,
          fontFamily: '"Inter", system-ui, sans-serif',
        }}>
          <Paperclip size={14} color={C.blue} />
          <span style={{ flex: 1, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {f.name}
          </span>
          <span style={{ color: C.inkDim, fontSize: 12 }}>
            {(f.size / 1024).toFixed(0)} KB
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.inkMuted, display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
