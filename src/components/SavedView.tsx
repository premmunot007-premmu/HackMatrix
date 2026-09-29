'use client';

import React, { useState } from 'react';
import {
  BookmarkCheck,
  FolderOpen,
  Edit2,
  Trash2,
  AlertCircle,
  Calculator,
  ShieldAlert,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { DatabaseState, EstimatorParams, SavedAnalysis } from '../types/insurance';
import { calculatePolicyReadiness, formatINR } from '../lib/calculator';

interface SavedViewProps {
  savedAnalyses: SavedAnalysis[];
  setSavedAnalyses: React.Dispatch<React.SetStateAction<SavedAnalysis[]>>;
  onOpenAnalysis: (params: EstimatorParams) => void;
  onNavigate: (tab: string) => void;
  db: DatabaseState;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedAnalyses,
  setSavedAnalyses,
  onOpenAnalysis,
  onNavigate,
  db
}) => {
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');

  const handleStartRename = (item: SavedAnalysis) => {
    setRenamingId(item.id);
    setRenameText(item.name);
  };

  const handleSaveRename = (id: number) => {
    if (!renameText.trim()) return;
    setSavedAnalyses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: renameText.trim() } : item))
    );
    setRenamingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to remove this saved estimate?')) {
      setSavedAnalyses((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2>Audited Policy Readiness &amp; Saved Scenarios</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Review contract completeness audits and re-open saved out-of-pocket scenario calculations.
          </p>
        </div>
      </div>

      {/* Policy Readiness Cards */}
      <h3 style={{ marginBottom: '12px' }}>Policy Contract Verification Index</h3>
      <div className="grid" style={{ marginBottom: '28px' }}>
        {Object.entries(db.pol).map(([key, policy]) => {
          const readiness = calculatePolicyReadiness(policy);
          return (
            <div key={key} className="card" style={{ margin: 0, padding: '18px 20px' }}>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <b style={{ fontSize: '15px' }}>{policy.name}</b>
                <span
                  className={`tag ${
                    readiness >= 80
                      ? 'tag-success'
                      : readiness >= 60
                      ? 'tag-warning'
                      : 'tag-danger'
                  }`}
                >
                  {readiness}% Verified
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Clause coverage &amp; ambiguity audit score
              </div>

              <div className="progress-track" style={{ height: '8px', marginBottom: '12px' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${readiness}%`,
                    background:
                      readiness >= 80
                        ? 'var(--success)'
                        : readiness >= 60
                        ? 'var(--warning)'
                        : 'var(--danger)'
                  }}
                />
              </div>

              {policy.gaps.length > 0 ? (
                <div style={{ fontSize: '12.5px', color: 'var(--warning-text)' }}>
                  <strong>Flagged Gaps / Ambiguities:</strong>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                    {policy.gaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={14} /> Comprehensive clause set verified
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Saved Out-of-Pocket Snapshots */}
      <div className="flex-between" style={{ marginBottom: '14px' }}>
        <h3 style={{ margin: 0 }}>Saved Out-of-Pocket Calculations ({savedAnalyses.length})</h3>
        {savedAnalyses.length === 0 && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('est')}
          >
            Go to Estimator
          </button>
        )}
      </div>

      {savedAnalyses.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)'
          }}
        >
          <FolderOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No saved analyses yet</h3>
          <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto 16px' }}>
            Run an out-of-pocket simulation in the Estimator and click &ldquo;Save Analysis&rdquo; to
            bookmark it here for quick access.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('est')}>
            <Calculator size={16} /> Open Estimator
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {savedAnalyses.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                margin: 0,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                {renamingId === item.id ? (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '14px' }}
                      autoFocus
                    />
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSaveRename(item.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setRenamingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                    <b style={{ fontSize: '16px' }}>{item.name}</b>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      · {item.at}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginTop: '4px'
                  }}
                >
                  {item.e.city} · {item.e.h} · {item.e.room}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Insurer: <strong style={{ color: 'var(--success)' }}>{formatINR(item.ins)}</strong>
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--primary)' }}>
                    You pay: {formatINR(item.oop)}
                  </div>
                </div>

                <div className="flex-center" style={{ gap: '8px' }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onOpenAnalysis(item.e)}
                    title="Load these parameters in Estimator"
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleStartRename(item)}
                    title="Rename"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-sm btn-danger-outline"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
