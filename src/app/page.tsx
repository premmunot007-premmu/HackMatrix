'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseState, EstimatorParams, Policy, QAEntry, SavedAnalysis } from '../types/insurance';
import { INITIAL_DATABASE } from '../data/defaultData';
import { monthsAgoDate } from '../lib/calculator';
import { Navbar } from '../components/Navbar';
import { HomeView } from '../components/HomeView';
import { UploadView } from '../components/UploadView';
import { QaView } from '../components/QaView';
import { EstimatorView } from '../components/EstimatorView';
import { WhatIfView } from '../components/WhatIfView';
import { SavedView } from '../components/SavedView';
import { AdminView } from '../components/AdminView';
import { EvidenceModal } from '../components/EvidenceModal';
import { Shield } from 'lucide-react';

export default function CoverWiseApp() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>('A');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Database State with fallback to default
  const [db, setDb] = useState<DatabaseState>(INITIAL_DATABASE);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  const [modalClauseIds, setModalClauseIds] = useState<string[] | null>(null);

  // Estimator Form State
  const [estimatorParams, setEstimatorParams] = useState<EstimatorParams>({
    t: 'cataract',
    city: 'Pune',
    h: 'Mid-range private',
    room: 'Shared room',
    pol: 'A',
    start: monthsAgoDate(30),
    ped: false
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedDb = localStorage.getItem('cw');
      if (storedDb) {
        setDb(JSON.parse(storedDb));
      }
      const storedSaved = localStorage.getItem('cwsv');
      if (storedSaved) {
        setSavedAnalyses(JSON.parse(storedSaved));
      }
      const storedTheme = localStorage.getItem('cw_theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
  }, []);

  // Save DB and Saved Analyses to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('cw', JSON.stringify(db));
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }, [db]);

  useEffect(() => {
    try {
      localStorage.setItem('cwsv', JSON.stringify(savedAnalyses));
    } catch (e) {
      console.error('Error persisting saved analyses:', e);
    }
  }, [savedAnalyses]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('cw_theme', nextTheme);
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  };

  const handleResetSeedData = () => {
    if (confirm('Reset all policy clauses and cost tables to default factory values?')) {
      setDb(INITIAL_DATABASE);
      try {
        localStorage.removeItem('cw');
      } catch (e) {}
    }
  };

  const handleAddCustomPolicy = (key: string, newPolicy: Policy) => {
    setDb((prev) => ({
      ...prev,
      pol: {
        ...prev.pol,
        [key]: newPolicy
      }
    }));
    setSelectedPolicyKey(key);
    setEstimatorParams((prev) => ({ ...prev, pol: key }));
  };

  const handleOpenAnalysisFromSaved = (params: EstimatorParams) => {
    setEstimatorParams(params);
    setSelectedPolicyKey(params.pol);
    setActiveTab('est');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={handleNavigate}
        selectedPolicyKey={selectedPolicyKey}
        db={db}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="container" id="app" style={{ flex: '1 0 auto' }}>
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectPolicy={(key) => {
              setSelectedPolicyKey(key);
              setEstimatorParams((prev) => ({ ...prev, pol: key }));
            }}
            db={db}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView
            selectedPolicyKey={selectedPolicyKey}
            onSelectPolicy={(key) => {
              setSelectedPolicyKey(key);
              setEstimatorParams((prev) => ({ ...prev, pol: key }));
            }}
            onNavigate={handleNavigate}
            onOpenEvidence={(ids) => setModalClauseIds(ids)}
            db={db}
            onAddCustomPolicy={handleAddCustomPolicy}
          />
        )}

        {activeTab === 'qa' && (
          <QaView
            selectedPolicyKey={selectedPolicyKey}
            onSelectPolicy={(key) => {
              setSelectedPolicyKey(key);
              setEstimatorParams((prev) => ({ ...prev, pol: key }));
            }}
            qaHistory={qaHistory}
            setQaHistory={setQaHistory}
            onOpenEvidence={(ids) => setModalClauseIds(ids)}
            db={db}
          />
        )}

        {activeTab === 'est' && (
          <EstimatorView
            estimatorParams={estimatorParams}
            setEstimatorParams={setEstimatorParams}
            onSaveSnapshot={(snap) => setSavedAnalyses((prev) => [snap, ...prev])}
            onNavigate={handleNavigate}
            db={db}
          />
        )}

        {activeTab === 'cmp' && (
          <WhatIfView
            baseParams={estimatorParams}
            setBaseParams={setEstimatorParams}
            db={db}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            savedAnalyses={savedAnalyses}
            setSavedAnalyses={setSavedAnalyses}
            onOpenAnalysis={handleOpenAnalysisFromSaved}
            onNavigate={handleNavigate}
            db={db}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            selectedPolicyKey={selectedPolicyKey}
            onSelectPolicy={(key) => {
              setSelectedPolicyKey(key);
              setEstimatorParams((prev) => ({ ...prev, pol: key }));
            }}
            db={db}
            setDb={setDb}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* Evidence Citations Modal */}
      <EvidenceModal
        clauseIds={modalClauseIds}
        db={db}
        onClose={() => setModalClauseIds(null)}
      />

      {/* Polished Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '24px 20px',
          marginTop: 'auto'
        }}
      >
        <div
          className="container"
          style={{
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div className="flex-center" style={{ gap: '8px' }}>
            <Shield size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              CoverWise
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              — Health cover intelligence &amp; out-of-pocket prediction engine.
            </span>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Built with Next.js App Router · TypeScript · Clinical Insurance Ontology
          </div>
        </div>
      </footer>
    </div>
  );
}
