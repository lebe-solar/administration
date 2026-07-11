import type { ReactNode } from 'react';

interface RangeSliderProps {
  label: ReactNode;
  valueLabel: ReactNode;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

/** Labeled range input matching the prototype's `.lebe-range` sliders. */
export function RangeSlider({ label, valueLabel, min, max, step = 1, value, onChange }: RangeSliderProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-p7)', color: 'var(--gray-mid)', marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--sage)' }}>{valueLabel}</span>
      </div>
      <input
        type="range"
        className="lebe-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
