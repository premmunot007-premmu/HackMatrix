'use client';

import React from 'react';
import { DeductionBreakdown } from '../types/insurance';
import { formatINR } from '../lib/calculator';

interface ProportionBarProps {
  totalCost: number;
  insurerPays: number;
  deductions: DeductionBreakdown;
}

export const SEGMENT_COLORS: Record<string, string> = {
  ins: '#047857',       // Forest Emerald (Insurer Admissible)
  copay: '#2563eb',     // Sapphire Blue (Co-pay)
  ded: '#64748b',       // Slate Gray (Deductible)
  rent: '#d97706',      // Warm Amber (Room Rent Proportionate Penalty)
  sub: '#b45309',       // Deep Ochre (Treatment Sub-limit)
  waiting: '#b91c1c',   // Crimson (Waiting Period)
  excl: '#881337',      // Deep Rose Wine (Exclusion)
  beyond: '#475569'     // Muted Slate (Beyond Sum Insured)
};

export const SEGMENT_LABELS: Record<string, string> = {
  ins: 'Insurer Admissible',
  copay: 'Patient Co-Pay',
  ded: 'Deductible First-Pay',
  rent: 'Room-Rent Excess Deduction',
  sub: 'Procedure Sub-Limit Cap',
  waiting: 'Waiting Period Inadmissibility',
  excl: 'Policy Permanent Exclusion',
  beyond: 'Beyond Sum Insured'
};

export const ProportionBar: React.FC<ProportionBarProps> = ({
  totalCost,
  insurerPays,
  deductions
}) => {
  const parts: { key: string; amount: number; percentage: number }[] = [];

  const rawEntries = [
    { key: 'ins', amount: insurerPays },
    { key: 'rent', amount: deductions.rent },
    { key: 'sub', amount: deductions.sub },
    { key: 'waiting', amount: deductions.waiting },
    { key: 'excl', amount: deductions.excl },
    { key: 'ded', amount: deductions.ded },
    { key: 'copay', amount: deductions.copay },
    { key: 'beyond', amount: deductions.beyond }
  ];

  rawEntries.forEach(({ key, amount }) => {
    if (amount > 0.5 && totalCost > 0) {
      parts.push({
        key,
        amount,
        percentage: Math.min(100, Math.max(0.5, (amount / totalCost) * 100))
      });
    }
  });

  return (
    <div>
      <div
        className="stacked-bar"
        role="progressbar"
        aria-valuenow={Math.round(insurerPays)}
        aria-valuemin={0}
        aria-valuemax={Math.round(totalCost)}
        title={`Insurer: ${formatINR(insurerPays)} / Total: ${formatINR(totalCost)}`}
        style={{
          display: 'flex',
          height: '18px',
          borderRadius: '4px',
          overflow: 'hidden',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          gap: '1px'
        }}
      >
        {parts.map((part) => (
          <span
            key={part.key}
            className="stacked-segment"
            style={{
              width: `${part.percentage}%`,
              backgroundColor: SEGMENT_COLORS[part.key] || '#94a3b8'
            }}
            title={`${SEGMENT_LABELS[part.key]}: ${formatINR(part.amount)} (${part.percentage.toFixed(1)}%)`}
          />
        ))}
      </div>

      <div className="legend-grid" style={{ marginTop: '10px' }}>
        {parts.map((part) => (
          <div key={part.key} className="legend-item" style={{ fontSize: '11.5px' }}>
            <span
              className="legend-dot"
              style={{
                backgroundColor: SEGMENT_COLORS[part.key] || '#94a3b8',
                width: '8px',
                height: '8px',
                borderRadius: '2px'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>{SEGMENT_LABELS[part.key]}:</span>
            <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatINR(part.amount)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};
