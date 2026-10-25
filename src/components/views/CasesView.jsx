import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../data/permissions';
import {
  Layers,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  Send,
  Link as LinkIcon,
  XCircle,
  Check,
} from 'lucide-react';

export default function CasesView() {
  const {
    cases,
    resolveCase,
    triggerEmergencyEscalation,
    setNewCaseModalOpen,
    dataPrivacyMasking,
    currentUser,
    tasks,
    updateTaskStatus,
  } = useApp();

  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'CASE-801');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [newTimelineMessage, setNewTimelineMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('Front Desk');

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Helper for masking PII
  const maskText = (text) => {
    if (!dataPrivacyMasking || !text) return text;
    const parts = text.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}***`;
    }
    return `${text.slice(0, 2)}***`;
  };

  const filteredCases = cases.filter(c => {
    if (filterPriority !== 'ALL' && c.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    return true;
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newTimelineMessage.trim()) return;

    if (selectedCase) {
      selectedCase.guestTimeline.push({
        id: `GT-${Date.now()}`,
        channel: selectedChannel,
        sender: currentUser.name,
        time: new Date().toLocaleTimeString(),
        text: newTimelineMessage,
      });
      setNewTimelineMessage('');
    }
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Layers size={24} color="var(--accent-gold)" />
            Guest Cases & Master Subtask Engine (FR-CASE-01 to 09)
          </h2>
          <div className="view-subtitle">
            One master guest case coordinating linked departmental tasks across Housekeeping, Maintenance, F&B and Front Desk.
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setNewCaseModalOpen(true)}>
          <PlusCircle size={15} /> + New Master Case
        </button>
      </div>

      {/* Main Grid: Left Cases List, Right Case Detail & Subtask Orchestrator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', minHeight: '650px' }}>
        {/* Left Column: Filterable Cases List */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="card-title">
                <span>Active Cases ({filteredCases.length})</span>
              </div>
              <span className="badge badge-normal">{cases.length} Total</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="select-pill"
                style={{ flex: 1, fontSize: '0.75rem' }}
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent Only</option>
                <option value="HIGH">High Only</option>
                <option value="NORMAL">Normal</option>
              </select>

              <select
                className="select-pill"
                style={{ flex: 1, fontSize: '0.75rem' }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ESCALATED">Escalated</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredCases.map(c => {
              const isSelected = c.id === selectedCase?.id;
              const completedCount = c.subtasks.filter(s => s.status === 'COMPLETED').length;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{c.id}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
                        Room {c.roomNumber}
                      </span>
                      {c.isDuplicateLinked && (
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)' }} title="Duplicate linked per FR-CASE-04">
                          <LinkIcon size={10} /> Linked
                        </span>
                      )}
                    </div>
                    <span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span>
                  </div>

                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem', lineHeight: 1.3 }}>
                    {c.title}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>Guest: {maskText(c.guestName)}</span>
                    <span style={{ color: completedCount === c.subtasks.length ? 'var(--status-emerald)' : 'var(--accent-gold-light)', fontWeight: 600 }}>
                      {completedCount}/{c.subtasks.length} Subtasks Done
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Master Case Details, Linked Subtasks & Timeline */}
        {selectedCase && (
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{selectedCase.id}</span>
                  <span className="badge" style={{ background: 'var(--accent-gold-gradient)', color: '#fff' }}>
                    Room {selectedCase.roomNumber}
                  </span>
                  <span className={`badge badge-${selectedCase.status.toLowerCase()}`}>{selectedCase.status}</span>
                  <span className={`badge badge-${selectedCase.priority.toLowerCase()}`}>{selectedCase.priority}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Guest: <strong>{maskText(selectedCase.guestName)}</strong> • Single Communication Owner: <strong>{selectedCase.communicationOwner}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Emergency Bypass Button (AC-08) */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => triggerEmergencyEscalation(selectedCase.id)}
                  title="Trigger Emergency Bypass (FR-SLA-07, AC-08)"
                >
                  <Flame size={14} /> Emergency Plan
                </button>

                {/* Close Master Case Button (gated by FR-CASE-08 subtask completion check) */}
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => resolveCase(selectedCase.id)}
                  title="Resolve Master Case (requires all subtasks completed per FR-CASE-08)"
                >
                  <CheckCircle2 size={14} /> Resolve Case
                </button>
              </div>
            </div>

            <div className="card-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Case Title & Next Action */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>{selectedCase.title}</div>
                <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong>Next Action:</strong> {selectedCase.nextAction}
                </div>
              </div>

              {/* Linked Departmental Subtasks Section (FR-CASE-03) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Linked Departmental Tasks ({selectedCase.subtasks.length}):
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Closure rule: Master case blocked until all subtasks resolve (FR-CASE-08)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedCase.subtasks.map(st => {
                    const isDone = st.status === 'COMPLETED';
                    const isBlocked = st.status === 'BLOCKED';

                    return (
                      <div
                        key={st.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isBlocked ? 'var(--status-crimson)' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.84rem' }}>{st.title}</span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent-gold-light)' }}>
                              {st.departmentId.toUpperCase()}
                            </span>
                            <span className={`badge badge-${st.status.toLowerCase()}`}>{st.status}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Assignee: <strong>{st.assigneeName}</strong>
                            {st.blockedReason && (
                              <span style={{ color: 'var(--status-crimson)', marginLeft: '8px', fontWeight: 600 }}>
                                Blocker: {st.blockedReason}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick state button for demoing subtask completion */}
                        {!isDone && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => updateTaskStatus(st.id, 'COMPLETED', { notes: 'Completed from Case desk' })}
                          >
                            <Check size={12} color="var(--status-emerald)" /> Mark Done
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guest Communication Timeline & Channels (FR-CASE-05) */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Guest Communication History (Multi-Channel Timeline):
                </div>

                <div
                  style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {selectedCase.guestTimeline?.map(gt => (
                    <div key={gt.id} style={{ fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.65rem' }}>
                          {gt.channel}
                        </span>
                        <strong>{gt.sender}</strong>
                        <span>•</span>
                        <span>{gt.time}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', paddingLeft: '4px' }}>
                        {gt.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Communication Event */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <select
                    className="select-pill"
                    style={{ fontSize: '0.75rem' }}
                    value={selectedChannel}
                    onChange={e => setSelectedChannel(e.target.value)}
                  >
                    <option value="Front Desk">Front Desk</option>
                    <option value="In-Room Tablet">In-Room Tablet</option>
                    <option value="SMS">SMS / WhatsApp</option>
                    <option value="Phone Call">Phone Note</option>
                  </select>

                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    placeholder="Send update to guest or log interaction note..."
                    value={newTimelineMessage}
                    onChange={e => setNewTimelineMessage(e.target.value)}
                  />

                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} /> Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
