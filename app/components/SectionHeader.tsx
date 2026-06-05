import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { C } from '@/app/lib/constants';

export function SectionHeader({
  number, title, subtitle, icon: Icon,
}: {
  number: number; title: string; subtitle?: string; icon?: LucideIcon;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 22,
      paddingBottom: 22, marginBottom: 28,
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13, fontWeight: 600, color: C.blue,
        marginTop: 12, letterSpacing: '0.05em',
        flexShrink: 0, width: 38,
      }}>
        / {String(number).padStart(2, '0')}
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{
          fontFamily: '"Kimberley BL", "Inter", system-ui, sans-serif',
          fontSize: 30, fontWeight: 400,
          color: C.ink, margin: 0,
          letterSpacing: '0.01em', lineHeight: 1.05,
          textTransform: 'uppercase',
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 14, color: C.inkMuted,
            margin: '8px 0 0', lineHeight: 1.55,
          }}>{subtitle}</p>
        )}
      </div>
      {Icon && (
        <div style={{
          width: 40, height: 40,
          border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} color={C.blue} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

export function NestedBlock({ children }: { children: ReactNode }) {
  return (
    <div style={{
      gridColumn: 'span 12',
      paddingLeft: 22,
      borderLeft: `2px solid ${C.blueDeep}`,
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 20,
      marginTop: 4,
    }}>
      {children}
    </div>
  );
}
