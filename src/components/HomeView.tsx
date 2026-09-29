'use client';

import React from 'react';
import {
  FileText,
  Sliders,
  AlertTriangle,
  ArrowRight,
  Shield,
  HelpCircle,
  Calculator,
  Search,
  CheckCircle2,
  Building2,
  Clock
} from 'lucide-react';
import { DatabaseState } from '../types/insurance';
import { calculatePolicyReadiness, formatINR } from '../lib/calculator';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onSelectPolicy: (key: string) => void;
  db: DatabaseState;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectPolicy,
  db
}) => {
  return (
    <div>
      {/* Editorial Tech Hero Header */}
      <section className="card-hero" id="home-hero">
        <div style={{ maxWidth: '780px' }}>
          <div
            className="tag"
            style={{
              marginBottom: '16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)'
            }}
          >
            <Shield size={13} color="var(--primary-accent)" />
            <span>Health Insurance Coverage &amp; Out-of-Pocket Intelligence</span>
          </div>

          <h1 style={{ marginBottom: '12px' }}>
            Health cover is full of hidden caps. We make the math and clauses transparent.
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            Most hospital claim deductions aren&apos;t surprises by chance—they stem from proportionate
            room-rent penalties, sub-limit caps, and waiting schedules buried in policy annexures.
            CoverWise audits your exact policy wording and predicts your real patient share.
          </p>

          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              id="cta-try-demo"
              onClick={() => {
                onSelectPolicy('A');
                onNavigate('est');
              }}
            >
              <Calculator size={15} />
              <span>Simulate Treatment Claim</span>
            </button>

            <button
              className="btn btn-secondary"
              id="cta-analyse-policy"
              onClick={() => onNavigate('upload')}
            >
              <FileText size={15} />
              <span>Upload &amp; Audit Policy PDF</span>
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                onSelectPolicy('A');
                onNavigate('qa');
              }}
            >
              <Search size={15} />
              <span>Ask a Coverage Question</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Analytical Pillars */}
      <section style={{ margin: '28px 0' }}>
        <div className="grid">
          <div className="card">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1px solid var(--border)'
              }}
            >
              <Sliders size={18} />
            </div>
            <h3>Proportionate Room Rent Math</h3>
            <p>
              Exceeding your daily room limit (e.g. ₹5,000/day) triggers proportionate deduction
              across associated surgeon, OT, and nursing fees. We calculate the exact multiplier.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1px solid var(--border)'
              }}
            >
              <FileText size={18} />
            </div>
            <h3>Verbatim Clause Citations</h3>
            <p>
              Every eligibility answer cites the exact policy page, section heading, and verbatim
              quotation. We never hallucinate or guess coverage.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                border: '1px solid var(--border)'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3>Explicit Ambiguity Flagging</h3>
            <p>
              If a policy contract omits ICU caps, ambulance limits, or uses vague pre-existing
              disease definitions, CoverWise explicitly flags the gap and lowers confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Available Verified Policy Contracts */}
      <section style={{ margin: '32px 0' }}>
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Verified Benchmark Policy Contracts</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
              Select a benchmark schedule to explore clauses, query coverage, or run treatment simulations.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('upload')}
          >
            Manage Policies
          </button>
        </div>

        <div className="grid-2">
          {Object.entries(db.pol).map(([key, policy]) => {
            const readiness = calculatePolicyReadiness(policy);
            return (
              <div key={key} className="card card-interactive" style={{ margin: 0 }}>
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{policy.name}</h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Sum Insured: {formatINR(policy.si)} · {policy.cl.length} seeded clauses
                    </div>
                  </div>
                  <span
                    className={`tag ${
                      readiness >= 80 ? 'tag-success' : readiness >= 60 ? 'tag-warning' : 'tag-danger'
                    }`}
                  >
                    {readiness}% Verified
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    fontSize: '12px',
                    padding: '10px 12px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    margin: '12px 0'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Co-pay:</span><br />
                    <strong>{policy.copay}%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Room limit:</span><br />
                    <strong>{formatINR(policy.rent)}/day</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Initial wait:</span><br />
                    <strong>{policy.init} days</strong>
                  </div>
                </div>

                <div className="flex-between" style={{ marginTop: '14px' }}>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      onSelectPolicy(key);
                      onNavigate('qa');
                    }}
                  >
                    <Search size={13} /> Ask Questions
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      onSelectPolicy(key);
                      onNavigate('est');
                    }}
                  >
                    <Calculator size={13} /> Calculate Out-of-Pocket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Professional Legal / Educational Disclaimer */}
      <div className="alert-box alert-info" style={{ marginTop: '24px' }}>
        <Shield size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
        <div>
          <strong>Educational &amp; Pre-Authorization Advisory:</strong> Calculations are generated
          using parsed policy clauses and synthetic regional hospital tariffs. Figures illustrate
          potential out-of-pocket liabilities and are not a final claims settlement guarantee.
          Always confirm pre-authorization terms with your hospital TPA desk before scheduled admissions.
        </div>
      </div>
    </div>
  );
};
