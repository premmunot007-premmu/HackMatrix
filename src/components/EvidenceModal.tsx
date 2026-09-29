'use client';

import React, { useEffect } from 'react';
import { DatabaseState, PolicyClause } from '../types/insurance';
import { X, BookOpen, AlertCircle } from 'lucide-react';

interface EvidenceModalProps {
  clauseIds: string[] | null;
  db: DatabaseState;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  clauseIds,
  db,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!clauseIds || clauseIds.length === 0) return null;

  const clauses: PolicyClause[] = [];
  clauseIds.forEach((id) => {
    const policyKey = id[0];
    const policy = db.pol[policyKey];
    if (policy) {
      const match = policy.cl.find((c) => c.id === id);
      if (match) clauses.push(match);
    }
  });

  return (
    <div
      className="modal-overlay"
      id="evidence-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        id="evidence-modal-content"
      >
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div className="flex-center" style={{ gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={18} />
            </div>
            <h3 id="evidence-modal-title" style={{ margin: 0, fontSize: '18px' }}>
              Policy Evidence &amp; Verbatim Citations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
            aria-label="Close evidence modal"
          >
            <X size={18} />
          </button>
        </div>

        {clauses.length === 0 ? (
          <div className="alert-box alert-warning">
            <AlertCircle size={18} />
            <div>No specific clause text found for the requested evidence IDs.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {clauses.map((clause) => {
              const policyKey = clause.id[0];
              const policyName = db.pol[policyKey]?.name || 'Policy';

              return (
                <div
                  key={clause.id}
                  className="card"
                  style={{
                    margin: 0,
                    padding: '16px',
                    borderLeft: '4px solid var(--primary)',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div
                    className="flex-between"
                    style={{ marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}
                  >
                    <div>
                      <b style={{ fontSize: '14.5px' }}>{clause.sec}</b>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: 'var(--text-muted)',
                          marginLeft: '8px'
                        }}
                      >
                        {policyName} · Page {clause.pg}
                      </span>
                    </div>
                    <span className="tag tag-primary">{clause.cat}</span>
                  </div>

                  <blockquote
                    style={{
                      fontStyle: 'italic',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-muted)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--success)',
                      margin: '8px 0'
                    }}
                  >
                    &ldquo;{clause.q}&rdquo;
                  </blockquote>

                  <div
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      marginTop: '6px'
                    }}
                  >
                    <strong>Applicability Rule:</strong> {clause.rule}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose} id="evidence-modal-close-btn">
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
