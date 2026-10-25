import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_DEFINITIONS } from '../data/permissions';
import { ShieldCheck, X, CheckCircle2, XCircle, ArrowRight, AlertTriangle, Layers } from 'lucide-react';

export default function PermissionInspectorModal() {
  const {
    inspectorModalOpen,
    setInspectorModalOpen,
    currentUser,
    currentPropertyId,
    currentShift,
    checkPermission,
    financialExceptions,
    tasks,
    securityIncidents,
  } = useApp();

  const [testAction, setTestAction] = useState('ACCESS_SECURITY_EVIDENCE');
  const [testAmount, setTestAmount] = useState(250);

  if (!inspectorModalOpen) return null;

  const currentRoleDef = ROLE_DEFINITIONS[currentUser.role];

  // Actions list for interactive testing
  const sampleActions = [
    { id: 'ACCESS_SECURITY_EVIDENCE', label: 'Access Restricted Security Evidence (AC-16)', resourceType: 'SecurityIncident' },
    { id: 'EXECUTE_FINANCIAL_REFUND', label: 'Execute Approved Financial Refund (AC-10 / AC-12)', resourceType: 'FinancialException' },
    { id: 'APPROVE_FINANCIAL_EXCEPTION', label: 'Approve Financial Exception (Maker-Checker / AC-11)', resourceType: 'FinancialException' },
    { id: 'REOPEN_TASK', label: 'Supervisor Reopen Incomplete Task (AC-05)', resourceType: 'Task' },
    { id: 'MARK_ROOM_READY', label: 'Mark Unsafe Room Ready in PMS (AC-22)', resourceType: 'RoomInventory' },
    { id: 'ELEVATE_SELF_PRIVILEGES', label: 'Admin Self-Elevate Privileges (AC-14)', resourceType: 'UserAccount' },
    { id: 'EXPORT_SENSITIVE_REPORT', label: 'Export Sensitive Report with PII (AC-17)', resourceType: 'Report' },
    { id: 'RESOLVE_CASE', label: 'Close Master Case with Incomplete Subtasks (FR-CASE-08)', resourceType: 'Case' },
  ];

  // Dummy resource matching the selected action
  let sampleResource = null;
  if (testAction === 'APPROVE_FINANCIAL_EXCEPTION') {
    sampleResource = { requesterId: currentUser.id, requesterName: currentUser.name, amount: testAmount, status: 'UNDER_REVIEW' };
  } else if (testAction === 'EXECUTE_FINANCIAL_REFUND') {
    sampleResource = { requesterId: 'EMP-105', amount: testAmount, status: 'APPROVED' };
  } else if (testAction === 'MARK_ROOM_READY') {
    sampleResource = { roomNumber: '502', safetyRestricted: true, supervisorInspected: false };
  } else if (testAction === 'ACCESS_SECURITY_EVIDENCE') {
    sampleResource = { id: 'SEC-701', classification: 'RESTRICTED_SECURITY' };
  } else if (testAction === 'RESOLVE_CASE') {
    sampleResource = { id: 'CASE-802', subtasks: [{ id: 'TASK-201', status: 'BLOCKED' }] };
  }

  const result = checkPermission(testAction, sampleActions.find(a => a.id === testAction)?.resourceType, sampleResource, testAmount);

  return (
    <div className="modal-overlay" onClick={() => setInspectorModalOpen(false)}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ShieldCheck size={22} color="var(--accent-gold)" />
            <span>Server Permission Decision Engine (PRD Section 4.10)</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setInspectorModalOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Current Actor Scope Summary */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                Active Identity: {currentUser.name} ({currentUser.id})
              </div>
              <span className="badge" style={{ background: currentRoleDef?.badgeColor, color: '#fff' }}>
                {currentRoleDef?.name}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div><strong>Property Scope:</strong> {currentUser.propertyScope?.join(', ')}</div>
              <div><strong>Department:</strong> {currentUser.department}</div>
              <div><strong>Shift:</strong> {currentShift.toUpperCase()}</div>
            </div>
          </div>

          {/* Test Action Selector */}
          <div className="form-group">
            <label className="form-label">Select Action to Simulate Against Decision Engine:</label>
            <select
              className="form-select"
              value={testAction}
              onChange={e => setTestAction(e.target.value)}
            >
              {sampleActions.map(a => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {testAction === 'APPROVE_FINANCIAL_EXCEPTION' && (
            <div className="form-group">
              <label className="form-label">Exception Amount to Test ($):</label>
              <input
                type="number"
                className="form-input"
                value={testAmount}
                onChange={e => setTestAmount(Number(e.target.value))}
                min="10"
                max="5000"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Department Manager limit is $150. Hotel Manager limit is $2,000.
              </span>
            </div>
          )}

          {/* Decision Outcome Banner */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: result.allowed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${result.allowed ? 'var(--status-emerald)' : 'var(--status-crimson)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {result.allowed ? <CheckCircle2 size={24} color="var(--status-emerald)" /> : <XCircle size={24} color="var(--status-crimson)" />}
              <div>
                <div style={{ fontWeight: 800, color: result.allowed ? 'var(--status-emerald)' : 'var(--status-crimson)', fontSize: '0.95rem' }}>
                  {result.allowed ? 'ACCESS GRANTED (PERMITTED)' : `ACCESS DENIED: ${result.reason || 'REJECTED'}`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Evaluated across 10 security boundaries per PRD §4.10.
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: result.allowed ? 'var(--status-emerald)' : 'var(--status-crimson)', color: '#fff' }}>
              {result.allowed ? 'ALLOW' : 'DENY'}
            </span>
          </div>

          {/* Evaluation Pipeline Step Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Server Policy Evaluation Pipeline:
            </div>
            {result.steps?.map((st, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  fontSize: '0.78rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `3px solid ${st.passed ? 'var(--status-emerald)' : 'var(--status-crimson)'}`,
                }}
              >
                {st.passed ? <CheckCircle2 size={15} color="var(--status-emerald)" style={{ marginTop: '2px' }} /> : <XCircle size={15} color="var(--status-crimson)" style={{ marginTop: '2px' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: st.passed ? '#fff' : 'var(--status-crimson)' }}>
                    Check {i + 1}: {st.check}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>{st.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => setInspectorModalOpen(false)}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
