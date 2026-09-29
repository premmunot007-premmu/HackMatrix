'use client';

import React, { useState } from 'react';
import {
  Send,
  HelpCircle,
  AlertTriangle,
  FileCheck,
  BookOpen,
  Info,
  Sparkles,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { DatabaseState, PolicyClause, QAEntry } from '../types/insurance';
import { answerPolicyQuestion } from '../lib/qaEngine';

interface QaViewProps {
  selectedPolicyKey: string;
  onSelectPolicy: (key: string) => void;
  qaHistory: QAEntry[];
  setQaHistory: React.Dispatch<React.SetStateAction<QAEntry[]>>;
  onOpenEvidence: (ids: string[]) => void;
  db: DatabaseState;
}

const SAMPLE_QUESTIONS = [
  'Is cataract surgery covered?',
  'What is my waiting period?',
  'Does this policy cover a private room?',
  'What is the ICU room rent limit?',
  'How does cashless claim work vs reimbursement?',
  'Are day care procedures covered?',
  'What documents are required for a claim?',
  'What exclusions should I know about?'
];

export const QaView: React.FC<QaViewProps> = ({
  selectedPolicyKey,
  onSelectPolicy,
  qaHistory,
  setQaHistory,
  onOpenEvidence,
  db
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentPolicy = db.pol[selectedPolicyKey] || Object.values(db.pol)[0];

  const handleAsk = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const result = answerPolicyQuestion(trimmed, selectedPolicyKey, db);
    setQaHistory((prev) => [result, ...prev]);
    setInputQuestion('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getConfidenceBadgeClass = (conf: 'High' | 'Medium' | 'Low') => {
    switch (conf) {
      case 'High':
        return 'tag-success';
      case 'Medium':
        return 'tag-warning';
      case 'Low':
        return 'tag-danger';
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2>Policy Coverage &amp; Eligibility Inquirer</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Direct queries against verified contract schedules with verbatim page and section citations.
          </p>
        </div>

        {/* Policy Selector & History Clear */}
        <div className="flex-center" style={{ gap: '10px' }}>
          {qaHistory.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setQaHistory([])}
              title="Clear Q&A conversation thread"
            >
              <Trash2 size={13} /> Clear Thread
            </button>
          )}

          <div style={{ minWidth: '220px' }}>
            <label htmlFor="qa-policy-select">Active Policy Schedule</label>
            <select
              id="qa-policy-select"
              value={selectedPolicyKey}
              onChange={(e) => onSelectPolicy(e.target.value)}
            >
              {Object.entries(db.pol).map(([key, p]) => (
                <option key={key} value={key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Common eligibility inquiries:
        </div>
        <div className="chip-row">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              className="chip-btn"
              onClick={() => handleAsk(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Box */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuestion);
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            id="qa-input-field"
            type="text"
            placeholder={`Ask about ${currentPolicy?.name || 'your policy'} (e.g., knee surgery waiting, room rent, ICU, cashless)...`}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            style={{ fontSize: '15px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            id="qa-submit-btn"
            style={{ padding: '10px 22px', flexShrink: 0 }}
          >
            <Send size={16} />
            <span>Ask</span>
          </button>
        </form>
      </div>

      {/* Q&A Thread Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {qaHistory.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)'
            }}
          >
            <HelpCircle size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>No questions asked yet</h3>
            <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
              Select a quick question chip above or type any coverage question to see verbatim
              clause citations and out-of-pocket conditions.
            </p>
          </div>
        ) : (
          qaHistory.map((item) => (
            <div key={item.id} className="card" style={{ padding: '20px' }}>
              {/* Question Header */}
              <div
                className="flex-between"
                style={{
                  paddingBottom: '12px',
                  marginBottom: '14px',
                  borderBottom: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    Q
                  </span>
                  <b style={{ fontSize: '16px' }}>{item.q}</b>
                </div>

                <div className="flex-center" style={{ gap: '8px' }}>
                  <span className="tag">{item.pol}</span>
                  <span className={`tag ${getConfidenceBadgeClass(item.conf)}`}>
                    Confidence: {item.conf}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                    onClick={() => handleCopy(item.id, `${item.q}\n\n${item.a}`)}
                    title="Copy Answer to Clipboard"
                  >
                    {copiedId === item.id ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Answer Content */}
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  marginBottom: '14px'
                }}
              >
                {item.a}
              </p>

              {/* Warning if ambiguous */}
              {item.warn && (
                <div className="alert-box alert-warning" style={{ margin: '10px 0' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Attention:</strong> {item.warn}
                  </div>
                </div>
              )}

              {/* Verbatim Supporting Evidence Section */}
              <div style={{ marginTop: '16px' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} color="var(--primary)" />
                    <span>Policy Evidence &amp; Citations</span>
                  </h4>

                  {item.ev.length > 0 && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '12px', padding: '3px 8px' }}
                      onClick={() => onOpenEvidence(item.ev)}
                    >
                      Inspect in Full View
                    </button>
                  )}
                </div>

                {item.ev.length === 0 ? (
                  <div className="alert-box alert-warning" style={{ fontSize: '13px' }}>
                    No specific supporting clause was isolated in the seeded contract.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {item.ev.map((id) => {
                      const pKey = id[0];
                      const clause = db.pol[pKey]?.cl.find((c) => c.id === id);
                      if (!clause) return null;
                      return (
                        <div key={id} className="evidence-quote">
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px'
                            }}
                          >
                            <b>{clause.sec}</b>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              · Page {clause.pg}
                            </span>
                            <span className="tag tag-primary" style={{ fontSize: '11px', padding: '1px 6px' }}>
                              {clause.cat}
                            </span>
                          </div>
                          <blockquote>&ldquo;{clause.q}&rdquo;</blockquote>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              marginTop: '4px'
                            }}
                          >
                            <strong>Rule:</strong> {clause.rule}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* What Could Change This Answer */}
              {item.chg && (
                <div
                  className="alert-box alert-info"
                  style={{ marginTop: '14px', background: 'transparent' }}
                >
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>What could change this answer?</strong> {item.chg}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Regulatory Notice */}
      <div className="alert-box alert-warning" style={{ marginTop: '24px' }}>
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <div>
          <b>Claim Approval Disclaimer:</b> All answers reflect automated parsing of seeded
          clauses. Real-world claims are subject to medical necessity checks, insurer network
          admissibility, and formal claims adjudications.
        </div>
      </div>
    </div>
  );
};
