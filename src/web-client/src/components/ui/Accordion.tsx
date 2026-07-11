'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export interface AccordionItem {
  q: ReactNode;
  a: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number | null;
}

/** Single-open FAQ accordion, matching the prototype's "Häufige Fragen" pattern. */
export function Accordion({ items, defaultOpenIndex = null }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--gray-500)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div
              onClick={() => setOpenIndex(open ? null : i)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 'var(--text-p4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{item.q}</span>
              <span style={{ fontSize: 20, color: 'var(--sage)', flex: 'none' }}>{open ? '−' : '+'}</span>
            </div>
            {open && (
              <div style={{ padding: '0 20px 18px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{item.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
