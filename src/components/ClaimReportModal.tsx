'use client';

import React from 'react';
import {
  Printer,
  X,
  FileCheck2,
  ShieldAlert,
  Building2,
  Calendar,
  AlertTriangle,
  Award
} from 'lucide-react';
import { CalculationResult, DatabaseState, EstimatorParams } from '../types/insurance';
import { formatINR } from '../lib/calculator';
import { TN } from '../data/defaultData';
import { SEGMENT_LABELS } from './ProportionBar';

interface ClaimReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  params: EstimatorParams;
  db: DatabaseState;
}

export const ClaimReportModal: React.FC<ClaimReportModalProps> = ({
  isOpen,
  onClose,
  result,
  params,
  db
}) => {
  if (!isOpen) return null;

  const reportId = `CW-REP-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  // Synthetic bill itemization for clinical realism
  const roomDays = db.cost.proc[params.t]?.[1] || 2;
  const totalRoomBill = result.roomRate * roomDays;
  const surgeonOtBill = Math.round(result.C * 0.45);
  const diagnosticsBill = Math.round(result.C * 0.15);
  const pharmacyImplantsBill = Math.max(0, Math.round(result.C - totalRoomBill - surgeonOtBill - diagnosticsBill));

  const roomExcessFactor = result.roomRate > result.p.rent ? result.p.rent / result.roomRate : 1;

  return (
    <div
      className="modal-overlay"
      id="claim-report-overlay"
      onClick={onClose}
      style={{ overflowY: 'auto', padding: '24px 12px' }}
    >
      <div
        className="modal-dialog"
        id="printable-report"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          background: 'var(--bg-surface-elevated)',
          padding: '32px'
        }}
      >
        {/* Header Controls */}
        <div className="flex-between no-print" style={{ marginBottom: '24px' }}>
          <span className="tag tag-primary">Official Assessment Preview</span>
          <div className="flex-center" style={{ gap: '10px' }}>
            <button className="btn btn-sm btn-primary" onClick={handlePrint}>
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={onClose}
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Report Document Header */}
        <div
          style={{
            borderBottom: '2px solid var(--border)',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}
        >
          <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🛡️ CoverWise</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Intelligence System
                </span>
              </div>
              <h2 style={{ margin: '6px 0 2px', fontSize: '20px' }}>
                Health Claim Feasibility &amp; Out-of-Pocket Assessment
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Evidence-Grounded Audit &amp; Deductions Breakdown
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <div><strong>Report ID:</strong> {reportId}</div>
              <div><strong>Date:</strong> {dateStr}</div>
              <div><strong>Assessment Policy:</strong> {result.p.name}</div>
            </div>
          </div>
        </div>

        {/* Admission Scenario Summary Grid */}
        <div
          style={{
            background: 'var(--bg-muted)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}
        >
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Treatment &amp; Hospital Admission Scenario
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              fontSize: '13px'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Procedure:</span><br />
              <strong>{TN[params.t]}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>City Tier:</span><br />
              <strong>{params.city} (×{db.cost.city[params.city]})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Hospital:</span><br />
              <strong>{params.h}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Room Selected:</span><br />
              <strong>{params.room} ({formatINR(result.roomRate)}/day)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Policy Tenure:</span><br />
              <strong>{result.mo.toFixed(1)} months elapsed</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pre-Existing (PED):</span><br />
              <strong>{params.ped ? 'Yes (Declared)' : 'No'}</strong>
            </div>
          </div>
        </div>

        {/* Primary Financial Outcome */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <div className="metric-box">
            <div className="metric-title">Total Estimated Expense</div>
            <div className="metric-value">{formatINR(result.C)}</div>
          </div>
          <div className="metric-box">
            <div className="metric-title">Annual Sum Insured</div>
            <div className="metric-value">{formatINR(result.p.si)}</div>
          </div>
          <div className="metric-box" style={{ borderColor: 'var(--success-border)' }}>
            <div className="metric-title" style={{ color: 'var(--success)' }}>
              Insurer Admissible Share
            </div>
            <div className="metric-value success">{formatINR(result.ins)}</div>
          </div>
          <div className="metric-box metric-box-primary">
            <div className="metric-title">
              Your Out-of-Pocket Share
            </div>
            <div className="metric-value primary">{formatINR(result.oop)}</div>
          </div>
        </div>

        {/* Itemized Hospital Bill Simulation */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Itemized Hospital Bill &amp; TPA Proportionate Audit
          </h4>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Hospital Charge Head</th>
                  <th>Estimated Bill (₹)</th>
                  <th>Policy Threshold / Audit Factor</th>
                  <th>Insurer Admissible (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Room Tariff &amp; Nursing</strong> ({roomDays} days)
                  </td>
                  <td>{formatINR(totalRoomBill)}</td>
                  <td>
                    Daily cap: {formatINR(result.p.rent)}/day{' '}
                    {result.roomRate > result.p.rent && (
                      <span className="tag tag-warning" style={{ fontSize: '11px' }}>
                        Tariff Exceeded
                      </span>
                    )}
                  </td>
                  <td>
                    {formatINR(Math.min(totalRoomBill, result.p.rent * roomDays))}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Surgeon, OT &amp; Specialist Fees</strong>
                  </td>
                  <td>{formatINR(surgeonOtBill)}</td>
                  <td>
                    Proportionate deduction factor: {roomExcessFactor.toFixed(2)}x
                  </td>
                  <td>{formatINR(Math.round(surgeonOtBill * roomExcessFactor))}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Diagnostics, Imaging &amp; Labs</strong>
                  </td>
                  <td>{formatINR(diagnosticsBill)}</td>
                  <td>100% admissible (subject to co-pay)</td>
                  <td>{formatINR(diagnosticsBill)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Pharmacy, Consumables &amp; Implants</strong>
                  </td>
                  <td>{formatINR(pharmacyImplantsBill)}</td>
                  <td>Standard policy annexure terms</td>
                  <td>{formatINR(pharmacyImplantsBill)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions Breakdown Table */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Applied Policy Deductions Breakdown
          </h4>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Deduction Head</th>
                  <th>Amount Borne by Patient</th>
                  <th>Governing Policy Provision</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.y).map(([k, amount]) => {
                  if (amount <= 0.5) return null;
                  return (
                    <tr key={k}>
                      <td><strong>{SEGMENT_LABELS[k] || k}</strong></td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {formatINR(amount)}
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {k === 'rent'
                          ? `Room tariff ${formatINR(result.roomRate)} exceeded ${formatINR(result.p.rent)} limit.`
                          : k === 'waiting'
                          ? `Tenure of ${result.mo.toFixed(1)}m did not satisfy required ${result.need}m waiting.`
                          : k === 'excl'
                          ? 'Procedure listed in permanent exclusions.'
                          : k === 'copay'
                          ? `${result.p.copay}% co-payment on claim balance.`
                          : k === 'ded'
                          ? `First ${formatINR(result.p.ded)} deductible.`
                          : k === 'sub'
                          ? `Sub-limit cap for ${TN[params.t]}.`
                          : 'Sum insured exhausted.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citing Policy Evidence Clauses */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            4. Supporting Policy Clauses &amp; Verbatim Citations
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.p.cl.slice(0, 4).map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-muted)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--primary)',
                  fontSize: '12.5px'
                }}
              >
                <div>
                  <strong>{c.sec}</strong> · Page {c.pg} · <span className="tag">{c.cat}</span>
                </div>
                <div style={{ fontStyle: 'italic', margin: '4px 0', color: 'var(--text-primary)' }}>
                  &ldquo;{c.q}&rdquo;
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11.5px' }}>
                  Rule: {c.rule}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '14px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.4
          }}
        >
          <strong>Notice:</strong> This assessment is an automated projection based on parsed policy
          clauses and standard synthetic tariff benchmarks. Actual claim admissibility depends on
          hospital network status, physician certificates, and official TPA adjudication.
        </div>
      </div>
    </div>
  );
};
