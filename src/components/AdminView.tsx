'use client';

import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  CheckCircle2,
  Table,
  Plus,
  Trash2,
  Database
} from 'lucide-react';
import {
  CityKey,
  ClauseCategory,
  DatabaseState,
  PolicyClause,
  TreatmentKey
} from '../types/insurance';
import { RD, TN } from '../data/defaultData';

interface AdminViewProps {
  selectedPolicyKey: string;
  onSelectPolicy: (key: string) => void;
  db: DatabaseState;
  setDb: React.Dispatch<React.SetStateAction<DatabaseState>>;
  onResetSeedData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  selectedPolicyKey,
  onSelectPolicy,
  db,
  setDb,
  onResetSeedData
}) => {
  const [saveBanner, setSaveBanner] = useState(false);

  const policy = db.pol[selectedPolicyKey] || Object.values(db.pol)[0];

  const handleClauseChange = (
    index: number,
    field: keyof PolicyClause,
    value: string | number
  ) => {
    setDb((prev) => {
      const updatedPol = { ...prev.pol };
      const currentCl = [...updatedPol[selectedPolicyKey].cl];
      currentCl[index] = {
        ...currentCl[index],
        [field]: value
      };
      updatedPol[selectedPolicyKey] = {
        ...updatedPol[selectedPolicyKey],
        cl: currentCl
      };
      return {
        ...prev,
        pol: updatedPol
      };
    });
    flashSaveBanner();
  };

  const handleProcedureCostChange = (
    key: TreatmentKey,
    fieldIdx: 0 | 1,
    value: number
  ) => {
    setDb((prev) => {
      const currentProc = { ...prev.cost.proc };
      const tuple = [...currentProc[key]] as [number, number];
      tuple[fieldIdx] = value;
      currentProc[key] = tuple;
      return {
        ...prev,
        cost: {
          ...prev.cost,
          proc: currentProc
        }
      };
    });
    flashSaveBanner();
  };

  const handleCityMultiplierChange = (city: CityKey, value: number) => {
    setDb((prev) => {
      return {
        ...prev,
        cost: {
          ...prev.cost,
          city: {
            ...prev.cost.city,
            [city]: value
          }
        }
      };
    });
    flashSaveBanner();
  };

  const flashSaveBanner = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
            <h2 style={{ margin: 0 }}>Admin &amp; Policy Ontology Editor</h2>
            <span className="tag tag-warning">Prototype Data Management</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Live configure clauses, synthetic hospital tariffs, and city multipliers. Changes
            persist automatically to local storage.
          </p>
        </div>

        <div className="flex-center" style={{ gap: '10px' }}>
          {saveBanner && (
            <span className="tag tag-success">
              <CheckCircle2 size={13} /> Autosaved
            </span>
          )}
          <button
            className="btn btn-sm btn-danger-outline"
            onClick={onResetSeedData}
            title="Reset to factory baseline seed data"
          >
            <RotateCcw size={14} /> Reset Seed Data
          </button>
        </div>
      </div>

      {/* Policy Selector */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ maxWidth: '300px' }}>
          <label htmlFor="admin-policy-select">Policy to Edit</label>
          <select
            id="admin-policy-select"
            value={selectedPolicyKey}
            onChange={(e) => onSelectPolicy(e.target.value)}
          >
            {Object.entries(db.pol).map(([key, p]) => (
              <option key={key} value={key}>
                {p.name} ({p.cl.length} clauses)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Policy Clauses Table */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>
          Policy Clauses &amp; Verbatim Text ({policy.name})
        </h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Category</th>
                <th style={{ width: '70px' }}>Page</th>
                <th style={{ width: '180px' }}>Section</th>
                <th>Verbatim Policy Quote</th>
                <th>Applicability Rule</th>
              </tr>
            </thead>
            <tbody>
              {policy.cl.map((clause, idx) => (
                <tr key={clause.id}>
                  <td>
                    <select
                      value={clause.cat}
                      onChange={(e) =>
                        handleClauseChange(idx, 'cat', e.target.value as ClauseCategory)
                      }
                      style={{ fontSize: '12.5px', padding: '6px' }}
                    >
                      {(Object.keys(RD) as ClauseCategory[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={clause.pg}
                      onChange={(e) => handleClauseChange(idx, 'pg', parseInt(e.target.value) || 1)}
                      style={{ width: '56px', fontSize: '12.5px', padding: '6px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={clause.sec}
                      onChange={(e) => handleClauseChange(idx, 'sec', e.target.value)}
                      style={{ fontSize: '12.5px', padding: '6px' }}
                    />
                  </td>
                  <td>
                    <textarea
                      rows={2}
                      value={clause.q}
                      onChange={(e) => handleClauseChange(idx, 'q', e.target.value)}
                      style={{ fontSize: '12.5px', padding: '6px' }}
                    />
                  </td>
                  <td>
                    <textarea
                      rows={2}
                      value={clause.rule}
                      onChange={(e) => handleClauseChange(idx, 'rule', e.target.value)}
                      style={{ fontSize: '12.5px', padding: '6px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic Cost Data Table */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>
          Synthetic Cost Table (Baseline: Pune, Mid-Range Private)
        </h3>

        <div className="table-container" style={{ marginBottom: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Medical Procedure</th>
                <th>Base Procedure Tariff (₹)</th>
                <th>Typical In-Hospital Stay (Days)</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(db.cost.proc) as TreatmentKey[]).map((key) => {
                const [cost, days] = db.cost.proc[key];
                return (
                  <tr key={key}>
                    <td>
                      <strong>{TN[key]}</strong>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) =>
                          handleProcedureCostChange(key, 0, parseInt(e.target.value) || 0)
                        }
                        style={{ maxWidth: '160px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={days}
                        onChange={(e) =>
                          handleProcedureCostChange(key, 1, parseInt(e.target.value) || 1)
                        }
                        style={{ maxWidth: '100px', fontSize: '13px' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* City Multipliers */}
        <h4 style={{ marginBottom: '8px' }}>City Tier Cost Multipliers</h4>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {(Object.keys(db.cost.city) as CityKey[]).map((city) => (
            <div
              key={city}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-muted)',
                padding: '8px 12px',
                borderRadius: '8px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{city}:</span>
              <input
                type="number"
                step="0.05"
                value={db.cost.city[city]}
                onChange={(e) =>
                  handleCityMultiplierChange(city, parseFloat(e.target.value) || 1)
                }
                style={{ width: '64px', padding: '4px 6px', fontSize: '13px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
