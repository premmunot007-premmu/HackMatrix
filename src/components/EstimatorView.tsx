'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Save,
  GitCompare,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CityKey,
  DatabaseState,
  EstimatorParams,
  HospitalKey,
  RoomKey,
  SavedAnalysis,
  TreatmentKey
} from '../types/insurance';
import {
  calculateCover,
  formatINR,
  monthsAgoDate
} from '../lib/calculator';
import { TN } from '../data/defaultData';
import { ProportionBar, SEGMENT_LABELS } from './ProportionBar';
import { ClaimReportModal } from './ClaimReportModal';

interface EstimatorViewProps {
  estimatorParams: EstimatorParams;
  setEstimatorParams: React.Dispatch<React.SetStateAction<EstimatorParams>>;
  onSaveSnapshot: (analysis: SavedAnalysis) => void;
  onNavigate: (tab: string) => void;
  db: DatabaseState;
}

export const EstimatorView: React.FC<EstimatorViewProps> = ({
  estimatorParams,
  setEstimatorParams,
  onSaveSnapshot,
  onNavigate,
  db
}) => {
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [showItemizedBill, setShowItemizedBill] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [customRoomRateSlider, setCustomRoomRateSlider] = useState<number | null>(null);

  const result = calculateCover(estimatorParams, db);

  const handleParamChange = <K extends keyof EstimatorParams>(
    key: K,
    value: EstimatorParams[K]
  ) => {
    setEstimatorParams((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    const policyName = db.pol[estimatorParams.pol]?.name || 'Policy';
    const snapshot: SavedAnalysis = {
      id: Date.now(),
      name: `${TN[estimatorParams.t]} · ${policyName}`,
      e: { ...estimatorParams },
      ins: result.ins,
      oop: result.oop,
      total: result.C,
      at: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    onSaveSnapshot(snapshot);
    setSaveSuccessMsg(true);
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.7 }
    });
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const getConfidenceClass = (conf: 'High' | 'Medium' | 'Low') => {
    switch (conf) {
      case 'High':
        return 'tag-success';
      case 'Medium':
        return 'tag-warning';
      case 'Low':
        return 'tag-danger';
    }
  };

  // Synthetic itemized billing values
  const roomDays = db.cost.proc[estimatorParams.t]?.[1] || 2;
  const roomBill = result.roomRate * roomDays;
  const surgeonOtBill = Math.round(result.C * 0.45);
  const diagnosticsBill = Math.round(result.C * 0.15);
  const implantsBill = Math.max(0, Math.round(result.C - roomBill - surgeonOtBill - diagnosticsBill));
  const excessFactor = result.roomRate > result.p.rent ? result.p.rent / result.roomRate : 1;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2>Treatment Cost &amp; Out-of-Pocket Estimator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
            Simulate medical claims across procedures, room categories, and hospital tiers to
            calculate your real patient share.
          </p>
        </div>

        <div className="flex-center" style={{ gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={() => setShowReportModal(true)}
            id="btn-open-claim-report"
          >
            <FileText size={16} /> Generate Feasibility Report
          </button>
        </div>
      </div>

      {/* Input Parameters Form Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} color="var(--primary)" />
          Treatment &amp; Admission Parameters
        </h3>

        <div className="grid">
          {/* Treatment Selection */}
          <div className="form-group">
            <label htmlFor="param-treatment">Medical Procedure / Treatment</label>
            <select
              id="param-treatment"
              value={estimatorParams.t}
              onChange={(e) => handleParamChange('t', e.target.value as TreatmentKey)}
            >
              {(Object.keys(TN) as TreatmentKey[]).map((key) => (
                <option key={key} value={key}>
                  {TN[key]}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div className="form-group">
            <label htmlFor="param-city">City (Cost Multiplier)</label>
            <select
              id="param-city"
              value={estimatorParams.city}
              onChange={(e) => handleParamChange('city', e.target.value as CityKey)}
            >
              {Object.keys(db.cost.city).map((city) => (
                <option key={city} value={city}>
                  {city} (×{db.cost.city[city as CityKey]})
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Type */}
          <div className="form-group">
            <label htmlFor="param-hospital">Hospital Tier</label>
            <select
              id="param-hospital"
              value={estimatorParams.h}
              onChange={(e) => handleParamChange('h', e.target.value as HospitalKey)}
            >
              {Object.keys(db.cost.hosp).map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp} (×{db.cost.hosp[hosp as HospitalKey]})
                </option>
              ))}
            </select>
          </div>

          {/* Room Type */}
          <div className="form-group">
            <label htmlFor="param-room">Room Category</label>
            <select
              id="param-room"
              value={estimatorParams.room}
              onChange={(e) => handleParamChange('room', e.target.value as RoomKey)}
            >
              {Object.keys(db.cost.room).map((room) => (
                <option key={room} value={room}>
                  {room} ({formatINR(db.cost.room[room as RoomKey])}/day)
                </option>
              ))}
            </select>
          </div>

          {/* Policy */}
          <div className="form-group">
            <label htmlFor="param-policy">Policy Applied</label>
            <select
              id="param-policy"
              value={estimatorParams.pol}
              onChange={(e) => handleParamChange('pol', e.target.value)}
            >
              {Object.entries(db.pol).map(([key, p]) => (
                <option key={key} value={key}>
                  {p.name} (SI: {formatINR(p.si)})
                </option>
              ))}
            </select>
          </div>

          {/* Policy Start Date */}
          <div className="form-group">
            <label htmlFor="param-start-date">Policy Inception Date</label>
            <input
              id="param-start-date"
              type="date"
              value={estimatorParams.start}
              onChange={(e) => handleParamChange('start', e.target.value)}
            />
            {/* Quick date shortcuts */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {[
                { label: '6m ago', months: 6 },
                { label: '1 yr ago', months: 12 },
                { label: '2 yrs ago', months: 24 },
                { label: '3 yrs ago', months: 36 },
                { label: '4 yrs ago', months: 48 }
              ].map((pill) => (
                <button
                  key={pill.months}
                  type="button"
                  className="chip-btn"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                  onClick={() => handleParamChange('start', monthsAgoDate(pill.months))}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pre-Existing Condition Checkbox */}
        <div style={{ marginTop: '10px' }}>
          <label
            htmlFor="param-ped"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          >
            <input
              id="param-ped"
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              checked={estimatorParams.ped}
              onChange={(e) => handleParamChange('ped', e.target.checked)}
            />
            <span>
              Pre-existing condition (PED): Check if condition was diagnosed before policy
              issuance
            </span>
          </label>
        </div>
      </div>

      {/* Primary Results Display */}
      <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
        <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Estimated Claims Adjudication Outcome</h3>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Computed against {result.p.name} underwriting schedules
            </div>
          </div>
          <span className={`tag ${getConfidenceClass(result.conf)}`}>
            Confidence: {result.conf}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid-4" style={{ marginBottom: '18px' }}>
          <div className="metric-box">
            <div className="metric-title">Total Hospital Bill</div>
            <div className="metric-value tnum">{formatINR(result.C)}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Benchmark: {formatINR(result.rangeLow)} – {formatINR(result.rangeHigh)}
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-title">Policy Sum Insured</div>
            <div className="metric-value tnum">{formatINR(result.p.si)}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Annual Limit
            </div>
          </div>

          <div className="metric-box" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
            <div className="metric-title" style={{ color: 'var(--success)' }}>
              Insurer Admissible
            </div>
            <div className="metric-value success tnum">{formatINR(result.ins)}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--success)', marginTop: '3px' }}>
              Payable by Policy
            </div>
          </div>

          <div className="metric-box metric-box-primary">
            <div className="metric-title">
              Patient Out-of-Pocket
            </div>
            <div className="metric-value primary tnum">{formatINR(result.oop)}</div>
            <div className="metric-sub" style={{ fontSize: '11.5px', marginTop: '3px' }}>
              Estimated Personal Liability
            </div>
          </div>
        </div>

        {/* Stacked Proportion Bar */}
        <ProportionBar
          totalCost={result.C}
          insurerPays={result.ins}
          deductions={result.y}
        />
      </div>

      {/* Itemized Hospital Bill Simulation (Expandable Card) */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div
          className="flex-between"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowItemizedBill(!showItemizedBill)}
        >
          <div className="flex-center" style={{ gap: '10px' }}>
            <FileText size={18} color="var(--primary)" />
            <div>
              <b style={{ fontSize: '15.5px' }}>Itemized Hospital Bill &amp; TPA Audit Breakdown</b>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Inspect how room tariff limits scale surgeon &amp; OT charges proportionally
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
            {showItemizedBill ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showItemizedBill && (
          <div style={{ marginTop: '16px' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Hospital Billing Head</th>
                    <th>Estimated Charge</th>
                    <th>Audit Factor / Condition</th>
                    <th>Payable by Insurer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Room &amp; Nursing</strong> ({roomDays} days)</td>
                    <td>{formatINR(roomBill)}</td>
                    <td>Limit: {formatINR(result.p.rent)}/day</td>
                    <td>{formatINR(Math.min(roomBill, result.p.rent * roomDays))}</td>
                  </tr>
                  <tr>
                    <td><strong>Surgeon, OT &amp; Specialist Fees</strong></td>
                    <td>{formatINR(surgeonOtBill)}</td>
                    <td>
                      Proportionate factor: {excessFactor.toFixed(2)}x
                    </td>
                    <td>{formatINR(Math.round(surgeonOtBill * excessFactor))}</td>
                  </tr>
                  <tr>
                    <td><strong>Diagnostics &amp; Investigations</strong></td>
                    <td>{formatINR(diagnosticsBill)}</td>
                    <td>Admissible within policy terms</td>
                    <td>{formatINR(diagnosticsBill)}</td>
                  </tr>
                  <tr>
                    <td><strong>Pharmacy &amp; Consumables</strong></td>
                    <td>{formatINR(implantsBill)}</td>
                    <td>Subject to standard non-medical list</td>
                    <td>{formatINR(implantsBill)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Why You May Pay & Step-by-Step Reasoning */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '14px' }}>Why You May Pay (Deduction Trace)</h3>

        <div className="table-container" style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Deduction Head</th>
                <th>Patient Borne Amount</th>
                <th>Underlying Cause / Policy Provision</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.y).map(([key, amount]) => {
                if (amount <= 0.5) return null;
                return (
                  <tr key={key}>
                    <td style={{ fontWeight: 600 }}>{SEGMENT_LABELS[key] || key}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {formatINR(amount)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {key === 'rent'
                        ? `Daily room tariff (${formatINR(
                            result.roomRate
                          )}) exceeded policy limit (${formatINR(
                            result.p.rent
                          )}); proportionate deduction applied to hospital services.`
                        : key === 'waiting'
                        ? `Required waiting period not met (${result.mo.toFixed(
                            1
                          )} months elapsed vs ${result.need} months required).`
                        : key === 'excl'
                        ? 'Treatment is permanently excluded in policy schedule.'
                        : key === 'copay'
                        ? `${result.p.copay}% co-pay applied to admissible expenses.`
                        : key === 'ded'
                        ? `Policy deductible of ${formatINR(result.p.ded)} paid first by patient.`
                        : key === 'sub'
                        ? `Treatment sub-limit of ${formatINR(
                            result.p.sub[estimatorParams.t] || 0
                          )} reached.`
                        : 'Exceeds maximum available annual sum insured.'}
                    </td>
                  </tr>
                );
              })}
              {result.oop <= 0.5 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--success)' }}>
                    100% of estimated treatment cost is payable by insurer within policy limits!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Step by Step Calculation Steps */}
        <h4 style={{ marginBottom: '10px' }}>Step-by-Step Calculation Audit Log</h4>
        <ol className="step-list">
          {result.st.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Action Footer */}
      <div
        className="flex-between"
        style={{ marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}
      >
        <div className="flex-center" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-success"
            id="btn-save-analysis"
            onClick={handleSave}
          >
            <Save size={16} /> Save Analysis to Dashboard
          </button>
          <button
            className="btn btn-outline"
            id="btn-compare-what-ifs"
            onClick={() => onNavigate('cmp')}
          >
            <GitCompare size={16} /> Compare What-If Scenarios
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowReportModal(true)}
          >
            <FileText size={16} /> View Official Report
          </button>
        </div>

        {saveSuccessMsg && (
          <span
            className="tag tag-success"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            <CheckCircle2 size={16} /> Saved to Dashboard successfully!
          </span>
        )}
      </div>

      {/* Official Claim Feasibility Report Modal */}
      <ClaimReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        result={result}
        params={estimatorParams}
        db={db}
      />
    </div>
  );
};
