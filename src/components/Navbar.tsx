'use client';

import React from 'react';
import {
  Shield,
  FileText,
  HelpCircle,
  Calculator,
  GitCompare,
  BookmarkCheck,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { DatabaseState } from '../types/insurance';
import { calculatePolicyReadiness } from '../lib/calculator';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedPolicyKey: string;
  db: DatabaseState;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedPolicyKey,
  db,
  theme,
  onToggleTheme
}) => {
  const currentPolicy = db.pol[selectedPolicyKey] || Object.values(db.pol)[0];
  const readiness = currentPolicy ? calculatePolicyReadiness(currentPolicy) : 100;

  const navItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'upload', label: 'Policy', icon: FileText },
    { id: 'qa', label: 'Q&A', icon: HelpCircle },
    { id: 'est', label: 'Estimator', icon: Calculator },
    { id: 'cmp', label: 'What-if', icon: GitCompare },
    { id: 'saved', label: 'Saved', icon: BookmarkCheck },
    { id: 'admin', label: 'Admin', icon: Settings }
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="flex-center" style={{ gap: '16px' }}>
          <div
            className="nav-brand"
            onClick={() => onSelectTab('home')}
            id="nav-brand-logo"
            title="Go to CoverWise Home"
          >
            <div className="nav-brand-icon">
              <Shield size={20} />
            </div>
            <span>CoverWise</span>
          </div>

          <nav className="nav-links" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="nav-actions">
          {currentPolicy && (
            <button
              className="tag tag-primary"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                fontSize: '12px',
                padding: '4px 10px',
                border: '1px solid var(--primary-border)'
              }}
              onClick={() => onSelectTab('upload')}
              title="Click to view or switch policy"
            >
              <span>{currentPolicy.name}</span>
              <span style={{ opacity: 0.7 }}>· {readiness}%</span>
            </button>
          )}

          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
