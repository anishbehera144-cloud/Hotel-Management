import React from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_DEFINITIONS } from '../data/permissions';
import {
  ShieldCheck,
  Building2,
  Clock,
  UserCheck,
  Eye,
  EyeOff,
  PlusCircle,
  HelpCircle,
  TestTube2,
  Bell,
} from 'lucide-react';

export default function Header() {
  const {
    currentUser,
    currentStaffId,
    setCurrentStaffId,
    staffList,
    currentPropertyId,
    setCurrentPropertyId,
    properties,
    currentShift,
    setCurrentShift,
    dataPrivacyMasking,
    setDataPrivacyMasking,
    setInspectorModalOpen,
    roleSwitcherModalOpen,
    setRoleSwitcherModalOpen,
    setNewCaseModalOpen,
    setCurrentView,
    cases,
  } = useApp();

  const userRoleDef = ROLE_DEFINITIONS[currentUser.role];

  return (
    <header className="app-header">
      {/* Left controls: Property & Shift */}
      <div className="header-left">
        <div className="header-selectors">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
            <Building2 size={16} color="var(--accent-gold)" />
            <select
              className="select-pill"
              value={currentPropertyId}
              onChange={e => setCurrentPropertyId(e.target.value)}
              title="Select Operating Property Scope (FR-AUTH-02, SEC-04)"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currency})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
            <Clock size={16} color="var(--accent-indigo)" />
            <select
              className="select-pill"
              value={currentShift}
              onChange={e => setCurrentShift(e.target.value)}
              title="Active Shift Coverage Period"
            >
              <option value="morning">Morning Shift (07:00 - 15:30)</option>
              <option value="evening">Evening Shift (15:00 - 23:30)</option>
              <option value="night">Night Audit (23:00 - 07:30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right controls: Persona Switcher (9 Roles), Privacy Masking, Inspector, New Case */}
      <div className="header-right">
        {/* Data Privacy Masking Toggle (Section 10.4) */}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setDataPrivacyMasking(!dataPrivacyMasking)}
          title="Toggle PII Masking under DPDP / Privacy Rules"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {dataPrivacyMasking ? <EyeOff size={15} color="var(--status-amber)" /> : <Eye size={15} color="var(--status-emerald)" />}
          <span style={{ fontSize: '0.74rem' }}>{dataPrivacyMasking ? 'Masked PII' : 'Raw PII'}</span>
        </button>

        {/* Visual 9 Roles Grid Modal Trigger */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setRoleSwitcherModalOpen(true)}
          title="Browse & switch between all 9 PRD operational roles with one click"
          style={{
            background: 'rgba(217, 119, 6, 0.12)',
            borderColor: 'var(--accent-gold)',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          <UserCheck size={15} color="var(--accent-gold)" />
          <span>Switch Role (9)</span>
        </button>

        {/* Persona Switcher Quick Dropdown (9 Roles per PRD Section 4) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            className="select-pill"
            style={{
              fontWeight: 700,
              border: `1.5px solid ${userRoleDef?.badgeColor || 'var(--accent-gold)'}`,
              minWidth: '240px',
              fontSize: '0.78rem',
            }}
            value={currentStaffId}
            onChange={e => {
              setCurrentStaffId(e.target.value);
              setCurrentView('dashboard');
            }}
            title="Switch Active Persona (Test all 9 PRD Roles)"
          >
            {staffList.map(s => {
              const def = ROLE_DEFINITIONS[s.role];
              return (
                <option key={s.id} value={s.id}>
                  [{def?.name || s.role}] {s.name} ({s.department.replace('_', ' ')})
                </option>
              );
            })}
          </select>
        </div>

        {/* Permission Inspector Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setInspectorModalOpen(true)}
          title="Inspect Real-time 10-Step Server Permission Decision (PRD Section 4.10)"
        >
          <ShieldCheck size={15} color="var(--status-emerald)" />
          <span>RBAC Inspector</span>
        </button>

        {/* AC Test Suite Link */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setCurrentView('test_runner')}
          style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          title="Run 24 Acceptance Test Scenarios (AC-01 to AC-24)"
        >
          <TestTube2 size={15} color="#818cf8" />
          <span>AC Suite (24)</span>
        </button>

        {/* Create Master Case Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setNewCaseModalOpen(true)}
          title="Create New Master Case with Linked Departmental Tasks"
        >
          <PlusCircle size={15} />
          <span>New Case</span>
        </button>
      </div>
    </header>
  );
}
