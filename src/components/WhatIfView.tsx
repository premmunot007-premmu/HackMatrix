'use client';

import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Table,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import {
  CityKey,
  DatabaseState,
  EstimatorParams,
  HospitalKey,
  Policy,
  RoomKey,
  TreatmentKey
} from '../types/insurance';
import {
  calculateCover,
  calculatePolicyReadiness,
  formatINR,
  monthsAgoDate
} from '../lib/calculator';
import { TN } from '../data/defaultData';
import { ProportionBar } from './ProportionBar';

interface WhatIfViewProps {
  baseParams: EstimatorParams;
  setBaseParams: React.Dispatch<React.SetStateAction<EstimatorParams>>;
  db: DatabaseState;
}

const COMPARISON_PRESETS = [
  {
    id: 0,
    title: 'Shared vs Private Room',
    desc: 'Impact of room rent caps triggering proportionate deduction',
    overrides: [
      { room: 'Shared room' as RoomKey },
      { room: 'Single private room' as RoomKey }
    ],
    labels: ['Shared Room', 'Single Private Room']
  },
  {
    id: 1,
    title: 'Before vs After Waiting Period',
    desc: 'Claim admissibility during policy infancy vs mature tenure',
    overrides: [
      { start: monthsAgoDate(6) },
      { start: monthsAgoDate(48) }
    ],
    labels: ['6 Months Since Inception', '48 Months Since Inception']
  },
  {
    id: 2,
    title: 'Mid-Range vs Premium Hospital',
    desc: 'Cost escalation and tariff multipliers across hospital tiers',
    overrides: [
      { h: 'Mid-range private' as HospitalKey },
      { h: 'Premium private' as HospitalKey }
    ],
    labels: ['Mid-Range Private Hospital', 'Premium Private Hospital']
  },
  {
    id: 3,
    title: 'Policy A vs Policy B',
    desc: 'Direct clause comparison between SecureHealth Plus and FamilyCare Essential',
    overrides: [{ pol: 'A' }, { pol: 'B' }],
    labels: ['SecureHealth Plus', 'FamilyCare Essential']
  }
];

export const WhatIfView: React.FC<WhatIfViewProps> = ({
  baseParams,
  setBaseParams,
  db
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'matrix'>('scenarios');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const preset = COMPARISON_PRESETS[selectedPresetIndex];

  const paramsA: EstimatorParams = {
    ...baseParams,
    ...preset.overrides[0]
  };

  const paramsB: EstimatorParams = {
    ...baseParams,
    ...preset.overrides[1]
  };

  const resA = calculateCover(paramsA, db);
  const resB = calculateCover(paramsB, db);

  const oopDelta = resB.oop - resA.oop;
  const insDelta = resB.ins - resA.ins;

  const policyA: Policy = db.pol.A;
  const policyB: Policy = db.pol.B;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2>Sensitivity &amp; Policy What-If Engine</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Explore how modifying hospital choice, room category, waiting tenure, or policy contract
            affects coverage and out-of-pocket expenses.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="chip-row" style={{ margin: 0 }}>
          <button
            className={`chip-btn ${activeSubTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('scenarios')}
          >
            <GitCompare size={14} /> Scenario Explorer
          </button>
          <button
            className={`chip-btn ${activeSubTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('matrix')}
          >
            <Table size={14} /> Policy Comparison Matrix
          </button>
        </div>
      </div>

      {activeSubTab === 'scenarios' ? (
        <>
          {/* Preset Tabs */}
          <div className="chip-row" style={{ marginBottom: '20px' }}>
            {COMPARISON_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                className={`chip-btn ${selectedPresetIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedPresetIndex(idx)}
                style={{ padding: '8px 16px', fontSize: '13.5px' }}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Base Parameters Adjustment */}
          <div className="card" style={{ padding: '18px 22px', marginBottom: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--primary)" />
                Baseline Parameters (Applied to both scenarios)
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Preset overrides the active comparison variable
              </span>
            </div>

            <div className="grid">
              <div className="form-group" style={{ margin: 0 }}>
                <label>Treatment</label>
                <select
                  value={baseParams.t}
                  onChange={(e) =>
                    setBaseParams((prev) => ({ ...prev, t: e.target.value as TreatmentKey }))
                  }
                >
                  {(Object.keys(TN) as TreatmentKey[]).map((k) => (
                    <option key={k} value={k}>
                      {TN[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>City</label>
                <select
                  value={baseParams.city}
                  onChange={(e) =>
                    setBaseParams((prev) => ({ ...prev, city: e.target.value as CityKey }))
                  }
                >
                  {Object.keys(db.cost.city).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Pre-existing condition (PED)</label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '42px',
                    cursor: 'pointer',
                    fontSize: '13.5px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={baseParams.ped}
                    onChange={(e) =>
                      setBaseParams((prev) => ({ ...prev, ped: e.target.checked }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span>Applies to treatment</span>
                </label>
              </div>
            </div>
          </div>

          {/* Delta Callout Card */}
          <div
            className="card"
            style={{
              padding: '20px 24px',
              background:
                oopDelta > 0
                  ? 'rgba(239, 68, 68, 0.08)'
                  : oopDelta < 0
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--bg-muted)',
              borderLeft: `5px solid ${
                oopDelta > 0 ? 'var(--danger)' : oopDelta < 0 ? 'var(--success)' : 'var(--primary)'
              }`,
              marginBottom: '24px'
            }}
          >
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px' }}>
                  Comparative Impact Analysis
                </h3>
                <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--text-secondary)' }}>
                  Moving from <strong>{preset.labels[0]}</strong> to{' '}
                  <strong>{preset.labels[1]}</strong> alters your personal share from{' '}
                  <strong>{formatINR(resA.oop)}</strong> to <strong>{formatINR(resB.oop)}</strong> (
                  <span
                    style={{
                      fontWeight: 700,
                      color: oopDelta > 0 ? 'var(--danger)' : oopDelta < 0 ? 'var(--success)' : 'inherit'
                    }}
                  >
                    {oopDelta >= 0 ? `+ ${formatINR(oopDelta)}` : `- ${formatINR(Math.abs(oopDelta))}`}
                  </span>
                  ).
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Insurer Contribution Shift
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: insDelta >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}
                >
                  {insDelta >= 0 ? `+ ${formatINR(insDelta)}` : `- ${formatINR(Math.abs(insDelta))}`}
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {/* Scenario A Card */}
            <div className="card" style={{ padding: '22px' }}>
              <div className="flex-between" style={{ marginBottom: '14px' }}>
                <div>
                  <span className="tag tag-primary" style={{ marginBottom: '4px' }}>
                    Scenario A
                  </span>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{preset.labels[0]}</h3>
                </div>
                <span className="tag">{resA.p.name}</span>
              </div>

              <div className="grid" style={{ marginBottom: '16px' }}>
                <div className="metric-box">
                  <div className="metric-title">Total Cost</div>
                  <div className="metric-value" style={{ fontSize: '20px' }}>
                    {formatINR(resA.C)}
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-title">Insurer Pays</div>
                  <div className="metric-value success" style={{ fontSize: '20px' }}>
                    {formatINR(resA.ins)}
                  </div>
                </div>
                <div className="metric-box" style={{ gridColumn: 'span 2' }}>
                  <div className="metric-title">Your Out-of-Pocket</div>
                  <div className="metric-value primary" style={{ fontSize: '22px' }}>
                    {formatINR(resA.oop)}
                  </div>
                </div>
              </div>

              <ProportionBar totalCost={resA.C} insurerPays={resA.ins} deductions={resA.y} />

              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Key Deductions:</strong>
                <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                  {resA.st
                    .filter((s) => /^(Waiting|Exclusion|Room rent|Co-pay|Sub-limit)/.test(s))
                    .slice(0, 3)
                    .map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Scenario B Card */}
            <div className="card" style={{ padding: '22px' }}>
              <div className="flex-between" style={{ marginBottom: '14px' }}>
                <div>
                  <span className="tag tag-warning" style={{ marginBottom: '4px' }}>
                    Scenario B
                  </span>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{preset.labels[1]}</h3>
                </div>
                <span className="tag">{resB.p.name}</span>
              </div>

              <div className="grid" style={{ marginBottom: '16px' }}>
                <div className="metric-box">
                  <div className="metric-title">Total Cost</div>
                  <div className="metric-value" style={{ fontSize: '20px' }}>
                    {formatINR(resB.C)}
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-title">Insurer Pays</div>
                  <div className="metric-value success" style={{ fontSize: '20px' }}>
                    {formatINR(resB.ins)}
                  </div>
                </div>
                <div className="metric-box" style={{ gridColumn: 'span 2' }}>
                  <div className="metric-title">Your Out-of-Pocket</div>
                  <div className="metric-value primary" style={{ fontSize: '22px' }}>
                    {formatINR(resB.oop)}
                  </div>
                </div>
              </div>

              <ProportionBar totalCost={resB.C} insurerPays={resB.ins} deductions={resB.y} />

              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Key Deductions:</strong>
                <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                  {resB.st
                    .filter((s) => /^(Waiting|Exclusion|Room rent|Co-pay|Sub-limit)/.test(s))
                    .slice(0, 3)
                    .map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Comparative Insights Box */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Clause &amp; Mathematical Impact Notes</h4>
            <ol className="step-list">
              <li>
                <strong>Scenario A Clause Evaluation:</strong>{' '}
                {resA.st.filter((s) => /^(Waiting|Exclusion)/.test(s)).join(' ')}
              </li>
              <li>
                <strong>Scenario B Clause Evaluation:</strong>{' '}
                {resB.st.filter((s) => /^(Waiting|Exclusion)/.test(s)).join(' ')}
              </li>
              <li>
                <strong>Room Tariff Evaluation A:</strong>{' '}
                {resA.st.find((s) => s.startsWith('Room')) || 'Within room limits'}
              </li>
              <li>
                <strong>Room Tariff Evaluation B:</strong>{' '}
                {resB.st.find((s) => s.startsWith('Room')) || 'Within room limits'}
              </li>
            </ol>
          </div>
        </>
      ) : (
        /* Policy Comparison Matrix Tab */
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '6px' }}>Policy Contract Comparison Matrix</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '20px' }}>
            Side-by-side feature comparison between seeded health insurance policies.
          </p>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '220px' }}>Policy Dimension</th>
                  <th>{policyA.name}</th>
                  <th>{policyB.name}</th>
                  <th style={{ width: '180px' }}>Consumer Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Annual Sum Insured</strong></td>
                  <td><strong>{formatINR(policyA.si)}</strong> (Individual)</td>
                  <td><strong>{formatINR(policyB.si)}</strong> (Floater)</td>
                  <td><span className="tag tag-success">Policy A Higher Cap</span></td>
                </tr>
                <tr>
                  <td><strong>Co-payment Share</strong></td>
                  <td><strong>{policyA.copay}%</strong></td>
                  <td><strong>{policyB.copay}%</strong></td>
                  <td><span className="tag tag-success">Policy A Lower Co-pay</span></td>
                </tr>
                <tr>
                  <td><strong>Per-Claim Deductible</strong></td>
                  <td>{policyA.ded === 0 ? 'None (₹0)' : formatINR(policyA.ded)}</td>
                  <td><strong>{formatINR(policyB.ded)}</strong></td>
                  <td><span className="tag tag-success">Policy A No Deductible</span></td>
                </tr>
                <tr>
                  <td><strong>Daily Room Rent Limit</strong></td>
                  <td><strong>{formatINR(policyA.rent)} / day</strong> (1% of SI)</td>
                  <td><strong>{formatINR(policyB.rent)} / day</strong></td>
                  <td><span className="tag tag-success">Policy A Higher Room Cap</span></td>
                </tr>
                <tr>
                  <td><strong>Initial Waiting Period</strong></td>
                  <td>{policyA.init} Days</td>
                  <td>{policyB.init} Days</td>
                  <td><span className="tag">Equal (30 Days)</span></td>
                </tr>
                <tr>
                  <td><strong>Pre-Existing (PED) Waiting</strong></td>
                  <td><strong>{policyA.ped} Months</strong> (3 Years)</td>
                  <td><strong>{policyB.ped} Months</strong> (4 Years)</td>
                  <td><span className="tag tag-success">Policy A 1 Year Shorter</span></td>
                </tr>
                <tr>
                  <td><strong>Cataract Waiting Period</strong></td>
                  <td>{policyA.w.cataract} Months</td>
                  <td>{policyB.w.cataract} Months</td>
                  <td><span className="tag tag-success">Policy A Covers Earlier</span></td>
                </tr>
                <tr>
                  <td><strong>Cataract Sub-Limit</strong></td>
                  <td>{formatINR(policyA.sub.cataract || 0)} / eye</td>
                  <td>{formatINR(policyB.sub.cataract || 0)} / event</td>
                  <td><span className="tag tag-success">Policy A Higher Sub-limit</span></td>
                </tr>
                <tr>
                  <td><strong>Exclusions</strong></td>
                  <td>Maternity excluded</td>
                  <td>Dialysis excluded</td>
                  <td><span className="tag tag-warning">Different Exclusions</span></td>
                </tr>
                <tr>
                  <td><strong>Readiness Score</strong></td>
                  <td>{calculatePolicyReadiness(policyA)}% Verified</td>
                  <td>{calculatePolicyReadiness(policyB)}% Verified</td>
                  <td>
                    {policyB.gaps.length > 0 && (
                      <span className="tag tag-warning">{policyB.gaps.length} Ambiguities</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
