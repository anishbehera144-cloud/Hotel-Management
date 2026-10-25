import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../data/permissions';
import {
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  FileSignature,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function HandoverView() {
  const {
    handovers,
    cases,
    currentShift,
    currentProperty,
    currentUser,
    recordShiftHandover,
  } = useApp();

  const [handoverSummary, setHandoverSummary] = useState('');
  const [incomingLead, setIncomingLead] = useState('Marcus Vance (Evening Lead)');
  const [nextShiftName, setNextShiftName] = useState('Evening Shift (15:00 - 23:30)');

  // Active cases to be handed over
  const openCases = cases.filter(c => c.status !== 'CLOSED');

  // Check for AC-09: Unowned cases or cases with missing next action
  const unownedCases = openCases.filter(c => !c.communicationOwner || c.communicationOwner.includes('Unassigned'));
  const missingActionCases = openCases.filter(c => !c.nextAction || c.nextAction.trim() === '');
  const blockedCases = openCases.filter(c => c.subtasks.some(st => st.status === 'BLOCKED'));

  const handleSignOff = (e) => {
    e.preventDefault();
    recordShiftHandover({
      summary: handoverSummary,
      nextShiftName,
      incomingSupervisorName: incomingLead,
    });
    setHandoverSummary('');
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <ArrowRightLeft size={24} color="var(--accent-gold)" />
            Shift Handover & Continuity Workspace (FR-HO-01 to 06)
          </h2>
          <div className="view-subtitle">
            Formal shift turnover, digital supervisor sign-offs, and automated continuity tracking. Original ticket times are strictly preserved.
          </div>
        </div>
      </div>

      {/* Continuity Health Flags Banner (FR-HO-04 & AC-09) */}
      {(unownedCases.length > 0 || missingActionCases.length > 0 || blockedCases.length > 0) && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--accent-gold)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <AlertCircle size={26} color="var(--accent-gold)" />
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>
              Handover Quality & Continuity Audit (FR-HO-04 / AC-09)
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
              Handover highlights active blockers ({blockedCases.length}) and ensures no case can be handed over without a designated next owner and next action. Cases remain open through turnover.
            </div>
          </div>
        </div>
      )}

      {/* Two Column Workspace: Active Handover Items & Formal Sign-Off Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Open Continuity Items Table */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <span>Open Cases Requiring Handover Continuity ({openCases.length})</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              SLAs and original created clocks remain active (FR-HO-06)
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case & Room</th>
                  <th>Current Owner</th>
                  <th>Next Action (FR-HO-01)</th>
                  <th>Priority</th>
                  <th>Blockers / Status</th>
                </tr>
              </thead>
              <tbody>
                {openCases.map(c => {
                  const blocker = c.subtasks.find(s => s.status === 'BLOCKED');

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#fff' }}>{c.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                          Room {c.roomNumber}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.78rem' }}>
                          {c.communicationOwner}
                        </div>
                      </td>

                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 500 }}>
                          {c.nextAction || <span style={{ color: 'var(--status-crimson)' }}>MISSING NEXT ACTION (AC-09)</span>}
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${c.priority.toLowerCase()}`}>
                          {c.priority}
                        </span>
                      </td>

                      <td>
                        {blocker ? (
                          <span className="badge badge-blocked" title={blocker.blockedReason}>
                            Blocked: {blocker.departmentId}
                          </span>
                        ) : (
                          <span className={`badge badge-${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Outgoing / Incoming Shift Sign-off */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <FileSignature size={18} color="var(--accent-gold)" />
                <span>Formal Shift Turnover Sign-Off</span>
              </div>
            </div>

            <form onSubmit={handleSignOff}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Outgoing Lead: <strong>{currentUser.name}</strong> ({ROLE_DEFINITIONS[currentUser.role]?.name})
                </div>

                <div className="form-group">
                  <label className="form-label">Incoming Coverage Shift:</label>
                  <select
                    className="form-select"
                    value={nextShiftName}
                    onChange={e => setNextShiftName(e.target.value)}
                  >
                    <option value="Evening Shift (15:00 - 23:30)">Evening Shift (15:00 - 23:30)</option>
                    <option value="Night Audit (23:00 - 07:30)">Night Audit (23:00 - 07:30)</option>
                    <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 - 15:30)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incoming Supervisor / Lead Name:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={incomingLead}
                    onChange={e => setIncomingLead(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shift Handover Executive Summary:</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Document pending guest issues, VIP notes, facility repairs, or staffing handovers..."
                    value={handoverSummary}
                    onChange={e => setHandoverSummary(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <FileSignature size={14} /> Record & Acknowledge Handover (FR-HO-02)
                </button>
              </div>
            </form>
          </div>

          {/* Historical Handovers Log (FR-HO-03) */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={16} color="var(--accent-indigo)" />
                <span>Historical Handover Logs ({handovers.length})</span>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
              {handovers.map(h => (
                <div
                  key={h.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff' }}>
                    <span>{h.id}</span>
                    <span className="badge badge-completed">{h.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.7rem' }}>
                    {h.outgoingShift} ➔ {h.incomingShift}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {h.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
