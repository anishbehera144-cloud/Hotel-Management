import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../../data/permissions';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Receipt,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  User,
  Users,
  Flame,
  ArrowRightLeft,
  Key,
  DoorOpen,
  MapPin,
  Play,
  Truck,
  AlertOctagon,
  Check,
  RotateCcw,
  UserPlus,
  CreditCard,
  Lock,
  Eye,
  FileCheck,
  ShieldCheck,
  Sparkles,
  PlayCircle,
  HardHat,
  DoorClosed,
  QrCode,
  RefreshCw,
  Trash2,
  Radio,
  FileText,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Send,
  CheckSquare,
  GitFork,
  Wrench,
  BarChart3,
} from 'lucide-react';

export default function DashboardView() {
  const {
    currentUser,
    setCurrentView,
    currentProperty,
    currentShift,
    cases,
    tasks,
    financialExceptions,
    securityIncidents,
    rooms,
    handovers,
    qrSessions,
    dataPrivacyMasking,
    updateTaskStatus,
    reopenTask,
    assignTask,
    executeFinancialRefund,
    approveFinancialException,
    triggerEmergencyEscalation,
    setNewCaseModalOpen,
    inspectAndClearRoomSafety,
    maintenanceIssues,
    attemptSelfPrivilegeElevation,
    toggleAccountActiveStatus,
    executeRoomMove,
    accessSecurityEvidence,
    attemptDeleteSecurityEvidence,
    staffList,
    addToast,
    logAuditEvent,
  } = useApp();

  const role = currentUser.role;
  const roleDef = ROLE_DEFINITIONS[role];

  // Local states for interactive dashboard widgets
  const [testOldTokenInput, setTestOldTokenInput] = useState('qr_tok_304_alpha_live');
  const [tokenResult, setTokenResult] = useState(null);
  const [reopenModalTaskId, setReopenModalTaskId] = useState(null);
  const [reopenReasonText, setReopenReasonText] = useState('');
  const [quickMessageText, setQuickMessageText] = useState('');

  // Helper for masking PII
  const maskText = (text) => {
    if (!dataPrivacyMasking || !text) return text;
    const parts = text.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}***`;
    }
    return `${text.slice(0, 2)}***`;
  };

  // -------------------------------------------------------------
  // 1. TASK FULFILLER DASHBOARD (Attendant / Runner)
  // -------------------------------------------------------------
  if (role === ROLES.TASK_FULFILLER) {
    const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
    const activeTasks = myTasks.filter(t => t.status !== 'COMPLETED');
    const completedTasks = myTasks.filter(t => t.status === 'COMPLETED');

    return (
      <div className="view-content-wrapper">
        {/* Fulfiller Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(2, 132, 199, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-full)', border: '2px solid #0284c7' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Attendant Station: {currentUser.name}</h2>
                <span className="badge" style={{ background: '#0284c7', color: '#fff' }}>Room Fulfiller</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Department: <strong>Housekeeping</strong> • Shift: <strong>{currentShift.toUpperCase()}</strong> • Property: <strong>{currentProperty.name}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('my_tasks')}>
              <CheckSquare size={14} /> Full Task Workspace ({activeTasks.length})
            </button>
          </div>
        </div>

        {/* Fulfiller KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Work To Do</span>
            <div className="kpi-value" style={{ color: 'var(--status-sky)' }}>{activeTasks.length}</div>
            <div className="kpi-footer">Active assigned room deliveries</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Completed Today</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>{completedTasks.length}</div>
            <div className="kpi-footer">With delivery proof recorded</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Shift Status</span>
            <div className="kpi-value" style={{ fontSize: '1.3rem', color: '#fff' }}>ACTIVE ON DUTY</div>
            <div className="kpi-footer">Coverage until 15:30</div>
          </div>
        </div>

        {/* Active Assigned Tasks Queue with 1-Click Action Buttons */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} color="var(--accent-gold)" />
              <span>My Active Room Orders & Quick Actions ({activeTasks.length})</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              1-click status transitions update master case in real time
            </span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            {activeTasks.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} color="var(--status-emerald)" style={{ margin: '0 auto 0.5rem auto' }} />
                <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>All assigned tasks completed!</h3>
                <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>You have zero pending work in your queue.</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: task.status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${task.status === 'BLOCKED' ? 'var(--status-crimson)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="badge" style={{ background: 'var(--accent-gold-gradient)', color: '#fff', fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}>
                        Room {task.roomNumber}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{task.id}: {task.title}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className={`badge badge-${task.status.toLowerCase()}`}>{task.status}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>Instructions:</strong> {task.instructions || 'Standard luxury service delivery.'}
                  </div>

                  {task.blockedReason && (
                    <div style={{ color: 'var(--status-crimson)', fontSize: '0.78rem', fontWeight: 600 }}>
                      Blocker on File: {task.blockedReason}
                    </div>
                  )}

                  {/* 4 Instant Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => updateTaskStatus(task.id, 'ON_THE_WAY')}
                    >
                      <Truck size={14} /> En Route
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                    >
                      <Play size={14} /> In Room
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--status-crimson)' }}
                      onClick={() => updateTaskStatus(task.id, 'BLOCKED', { reason: 'Guest placed Do Not Disturb sign on door' })}
                    >
                      <AlertOctagon size={14} /> Report Blocker
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateTaskStatus(task.id, 'COMPLETED', { notes: 'Delivered directly to guest and verified' })}
                    >
                      <Check size={14} /> Complete (AC-03)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fulfiller Scope Boundaries Banner */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: '#fff' }}>Security & Policy Boundaries (PRD §4.1):</strong> As a Task Fulfiller, you have access only to assigned work and room delivery notes. You cannot view guest billing folios, issue refunds, or reassign work to colleagues.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. DEPARTMENT DISPATCHER DASHBOARD (Marcus Vance)
  // -------------------------------------------------------------
  if (role === ROLES.DEPARTMENT_DISPATCHER) {
    const unassignedTasks = tasks.filter(t => t.status === 'QUEUED' || !t.assigneeId);
    const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <GitFork size={24} color="#0d9488" />
              Housekeeping Dispatch Command (Marcus Vance)
            </h2>
            <div className="view-subtitle">
              Monitor queue deadlines, assign eligible staff, and link duplicate guest requests.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setNewCaseModalOpen(true)}>
              + Dispatch New Case
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('dispatch_board')}>
              Full Dispatch Board
            </button>
          </div>
        </div>

        {/* Dispatcher KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => setCurrentView('dispatch_board')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Unassigned Backlog</span>
            <div className="kpi-value" style={{ color: unassignedTasks.length > 0 ? 'var(--status-crimson)' : 'var(--status-emerald)' }}>
              {unassignedTasks.length}
            </div>
            <div className="kpi-footer">Tasks awaiting attendant assignment</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Active Workload</span>
            <div className="kpi-value">{activeTasks.length}</div>
            <div className="kpi-footer">Across staff on shift</div>
          </div>

          <div className="kpi-card" onClick={() => setCurrentView('sla_escalation')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">SLA Risk Monitor</span>
            <div className="kpi-value" style={{ color: 'var(--status-amber)' }}>1</div>
            <div className="kpi-footer">Task approaching breach threshold</div>
          </div>
        </div>

        {/* Dispatch Table with Direct Inline Assignment */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <span>Department Queue: Immediate Staff Assignment</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Select staff from dropdown to assign instantly
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task & Room</th>
                  <th>Action Needed</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Current Assignee</th>
                  <th>Quick Assign Eligible Staff (AC-02)</th>
                </tr>
              </thead>
              <tbody>
                {activeTasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.id}</strong> (Room {t.roomNumber})
                    </td>
                    <td style={{ maxWidth: '220px' }}>{t.title}</td>
                    <td>
                      <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                    </td>
                    <td>
                      <strong style={{ color: t.assigneeId ? '#fff' : 'var(--status-crimson)' }}>
                        {t.assigneeName}
                      </strong>
                    </td>
                    <td>
                      <select
                        className="select-pill"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        value={t.assigneeId || ''}
                        onChange={e => {
                          if (e.target.value) assignTask(t.id, e.target.value);
                        }}
                      >
                        <option value="">-- Assign Staff --</option>
                        {staffList
                          .filter(s => s.role === ROLES.TASK_FULFILLER)
                          .map(s => {
                            const load = tasks.filter(x => x.assigneeId === s.id && x.status !== 'COMPLETED').length;
                            return (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.department} - {load} active)
                              </option>
                            );
                          })}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. DEPARTMENT SUPERVISOR DASHBOARD (Sofia Chen)
  // -------------------------------------------------------------
  if (role === ROLES.DEPARTMENT_SUPERVISOR) {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
    const unsafeRooms = maintenanceIssues.filter(m => m.safetyRestricted && !m.supervisorInspected);

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <CheckSquare size={24} color="#ca8a04" />
              Supervisor Quality & Operations Desk (Sofia Chen)
            </h2>
            <div className="view-subtitle">
              Inspect completed work, reopen incomplete tasks with corrective notes (AC-05), and manage blockers.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('handover')}>
              <ArrowRightLeft size={14} /> Shift Handover Desk
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('maintenance')}>
              <Wrench size={14} /> Maintenance Desk
            </button>
          </div>
        </div>

        {/* Supervisor KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Completed For Inspection</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>{completedTasks.length}</div>
            <div className="kpi-footer">Eligible for supervisor quality check</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Active Blockers</span>
            <div className="kpi-value" style={{ color: blockedTasks.length > 0 ? 'var(--status-crimson)' : '#fff' }}>
              {blockedTasks.length}
            </div>
            <div className="kpi-footer">Requires supervisor intervention</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Unsafe Rooms Clearance</span>
            <div className="kpi-value" style={{ color: unsafeRooms.length > 0 ? 'var(--status-amber)' : 'var(--status-emerald)' }}>
              {unsafeRooms.length}
            </div>
            <div className="kpi-footer">Mandatory physical check (AC-22)</div>
          </div>
        </div>

        {/* Section 1: Active Blockers Requiring Supervisor Intervention */}
        {blockedTasks.length > 0 && (
          <div className="content-card" style={{ border: '1px solid var(--status-crimson)' }}>
            <div className="card-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
              <div className="card-title">
                <AlertOctagon size={18} color="var(--status-crimson)" />
                <span>Active Work Blockers Requiring Supervisor Intervention</span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task & Room</th>
                    <th>Reported Blocker Reason</th>
                    <th>Assignee</th>
                    <th>Supervisor Resolution Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedTasks.map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.id}</strong> (Room {t.roomNumber})</td>
                      <td style={{ color: 'var(--status-crimson)', fontWeight: 600 }}>{t.blockedReason}</td>
                      <td>{t.assigneeName}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateTaskStatus(t.id, 'IN_PROGRESS', { notes: 'Supervisor cleared riser isolation issue' })}
                        >
                          <CheckCircle2 size={13} /> Authorize & Clear Blocker
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Room Safety Inspection Clearance Gate (AC-22) */}
        {unsafeRooms.length > 0 && (
          <div className="content-card" style={{ border: '1px solid var(--accent-gold)' }}>
            <div className="card-header" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
              <div className="card-title">
                <HardHat size={18} color="var(--accent-gold)" />
                <span>Room Readiness Safety Gate (AC-22 / FR-MNT-05)</span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room & Ticket</th>
                    <th>Hazard Details</th>
                    <th>Vendor / Tech</th>
                    <th>PMS Release Status</th>
                    <th>Physical Inspection Clearance Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unsafeRooms.map(m => (
                    <tr key={m.id}>
                      <td><strong>Room {m.roomNumber}</strong> ({m.id})</td>
                      <td style={{ maxWidth: '240px' }}>{m.issue}</td>
                      <td>{m.vendor}</td>
                      <td><span className="badge badge-blocked">Blocked in PMS (AC-22)</span></td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => inspectAndClearRoomSafety(m.id)}
                        >
                          <ShieldCheck size={13} /> Supervisor Safety Sign-off (AC-22)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Completed Tasks Quality Inspection Desk (AC-05 Reopen) */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} color="var(--status-emerald)" />
              <span>Inspection Desk: Completed Tasks (Reopen Incomplete Work: AC-05)</span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task & Room</th>
                  <th>Description</th>
                  <th>Assignee Proof</th>
                  <th>Completed At</th>
                  <th>Supervisor Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedTasks.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.id}</strong> (Room {t.roomNumber})</td>
                    <td>{t.title}</td>
                    <td style={{ fontSize: '0.74rem', color: 'var(--status-emerald)' }}>{t.deliveryNotes || 'Delivery verified.'}</td>
                    <td>{new Date(t.completedAt || t.createdAt).toLocaleTimeString()}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--status-amber)' }}
                        onClick={() => reopenTask(t.id, 'Quality inspection found missing pillow protector')}
                        title="Reopen incomplete task with corrective action note (AC-05)"
                      >
                        <RotateCcw size={13} /> Reopen Incomplete (AC-05)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. DEPARTMENT MANAGER DASHBOARD (Arthur Pendelton - F&B)
  // -------------------------------------------------------------
  if (role === ROLES.DEPARTMENT_MANAGER) {
    const pendingManagerApprovals = financialExceptions.filter(f => f.status === 'UNDER_REVIEW' && f.amount <= 150);

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <Receipt size={24} color="#d97706" />
              Department Manager Command: {currentUser.name} (F&B)
            </h2>
            <div className="view-subtitle">
              SLA throughput oversight, staffing schedules, and service recovery approvals within delegated authority (≤ $150).
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('reports')}>
              <BarChart3 size={14} /> Full SLA Reports
            </button>
          </div>
        </div>

        {/* Manager KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Department SLA Attainment</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>95.4%</div>
            <div className="kpi-footer">Rolling 30-day target ≥ 92.0%</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Pending Recovery Approvals</span>
            <div className="kpi-value" style={{ color: 'var(--status-amber)' }}>{pendingManagerApprovals.length}</div>
            <div className="kpi-footer">Within $150 delegated limit</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Active Department Cases</span>
            <div className="kpi-value">{cases.filter(c => c.status !== 'CLOSED').length}</div>
            <div className="kpi-footer">Across all guest requests</div>
          </div>
        </div>

        {/* Recovery Approval Desk (≤ $150 limit) */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={18} color="var(--accent-gold)" />
              <span>Delegated Service Recovery Approvals (≤ $150 threshold)</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Maker-Checker Dual Control Enforced (AC-11)
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref & Room</th>
                  <th>Claim Reason</th>
                  <th>Amount</th>
                  <th>Requester</th>
                  <th>Dual Control Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingManagerApprovals.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.id}</strong> (Room {f.roomNumber})</td>
                    <td>{f.reason}</td>
                    <td><strong style={{ color: '#fff' }}>£{f.amount.toFixed(2)}</strong></td>
                    <td>{f.requesterName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => approveFinancialException(f.id, true, 'Approved within $150 manager threshold')}
                        >
                          <CheckCircle2 size={13} /> Approve (≤ $150)
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--status-crimson)' }}
                          onClick={() => approveFinancialException(f.id, false, 'Rejected by department manager')}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. FRONT DESK COORDINATOR DASHBOARD (Priya Sharma)
  // -------------------------------------------------------------
  if (role === ROLES.FRONT_DESK_COORDINATOR) {
    const occupied = rooms.filter(r => r.status === 'OCCUPIED').length;
    const readyRooms = rooms.filter(r => r.status === 'CLEAN_VACANT').length;
    const activeGuestCases = cases.filter(c => c.status !== 'CLOSED');

    const handleQuickTestToken = () => {
      const session = qrSessions.find(s => s.token === testOldTokenInput.trim());
      if (!session) {
        setTokenResult({ valid: false, code: 401, msg: 'Token unknown in registry' });
      } else if (session.status !== 'ACTIVE') {
        setTokenResult({ valid: false, code: 401, msg: `HTTP 401: Token revoked immediately on room move (${session.status}) (AC-15)` });
      } else {
        setTokenResult({ valid: true, code: 200, msg: `HTTP 200: Active token for Room ${session.roomNumber}` });
      }
    };

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <Key size={24} color="#4f46e5" />
              Front Desk & Guest Services Hub (Priya Sharma)
            </h2>
            <div className="view-subtitle">
              Intake guest requests, coordinate multi-department subtasks, and manage suite moves with QR session revocation.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setNewCaseModalOpen(true)}>
              + New Guest Request (Master Case)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('front_desk')}>
              <DoorOpen size={14} /> Full Room Inventory
            </button>
          </div>
        </div>

        {/* Front Desk KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => setCurrentView('front_desk')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Ready Clean Rooms</span>
            <div className="kpi-value" style={{ color: 'var(--status-sky)' }}>{readyRooms}</div>
            <div className="kpi-footer">Available for check-in / transfers</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Occupied Suites</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>{occupied}</div>
            <div className="kpi-footer">Active resident guests</div>
          </div>

          <div className="kpi-card" onClick={() => setCurrentView('cases')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Open Guest Cases</span>
            <div className="kpi-value" style={{ color: 'var(--accent-gold-light)' }}>{activeGuestCases.length}</div>
            <div className="kpi-footer">Across all departments</div>
          </div>
        </div>

        {/* Interactive Suite Move & QR Revocation Simulator (AC-15) */}
        <div className="content-card" style={{ border: '1px solid var(--accent-gold)' }}>
          <div className="card-header" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
            <div className="card-title">
              <RefreshCw size={18} color="var(--accent-gold)" />
              <span>Suite Move & Server-Side QR Token Revocation Engine (AC-15)</span>
            </div>
          </div>

          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', padding: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 700 }}>
                Transfer Guest: Room 304 (Charles Montgomery) ➔ Room 712 (Executive Suite)
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Per FR-FD-05: Upon suite transfer, previous room-linked QR sessions and tokens are immediately revoked at the server layer.
              </p>

              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.85rem' }}
                onClick={() => {
                  const res = executeRoomMove('304', '712', 'Charles Montgomery');
                  if (res?.oldTokenRevoked) setTestOldTokenInput(res.oldTokenRevoked);
                }}
              >
                <RefreshCw size={14} /> Execute Suite Move & Invalidate Old Session (AC-15)
              </button>
            </div>

            {/* Live Token Verifier Tool */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <QrCode size={16} color="var(--accent-indigo)" />
                <span>Test Revoked Token API (AC-15 Proof)</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}
                  value={testOldTokenInput}
                  onChange={e => setTestOldTokenInput(e.target.value)}
                />
                <button className="btn btn-secondary btn-sm" onClick={handleQuickTestToken}>
                  Verify
                </button>
              </div>

              {tokenResult && (
                <div
                  style={{
                    marginTop: '0.6rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: tokenResult.valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${tokenResult.valid ? 'var(--status-emerald)' : 'var(--status-crimson)'}`,
                    fontSize: '0.74rem',
                    color: tokenResult.valid ? 'var(--status-emerald)' : 'var(--status-crimson)',
                    fontWeight: 700,
                  }}
                >
                  {tokenResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. FINANCIAL OPERATOR DASHBOARD (David Miller)
  // -------------------------------------------------------------
  if (role === ROLES.FINANCIAL_OPERATOR) {
    const approvedToExecute = financialExceptions.filter(f => f.status === 'APPROVED');
    const executedToday = financialExceptions.filter(f => f.status === 'EXECUTED');

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <Receipt size={24} color="#059669" />
              Financial Operations & Night Audit (David Miller)
            </h2>
            <div className="view-subtitle">
              Execute approved adjustments up to $1,000, reconcile payment gateway settlements, and manage chargebacks.
            </div>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('finance')}>
            Full Financial Ledger
          </button>
        </div>

        {/* Finance KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => setCurrentView('finance')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Ready For Execution</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>{approvedToExecute.length}</div>
            <div className="kpi-footer">Approved exceptions awaiting settlement</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Settled Today</span>
            <div className="kpi-value">{executedToday.length}</div>
            <div className="kpi-footer">Reconciled to gateway reference</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Operator Execution Cap</span>
            <div className="kpi-value" style={{ color: '#fff' }}>£1,000</div>
            <div className="kpi-footer">Per transaction limit</div>
          </div>
        </div>

        {/* Execution Desk */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <CreditCard size={18} color="var(--status-emerald)" />
              <span>Approved Exceptions Ready For Gateway Execution (AC-12)</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref & Room</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Approved By</th>
                  <th>Gateway Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedToExecute.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.id}</strong> (Room {f.roomNumber})</td>
                    <td><strong style={{ color: '#fff' }}>£{f.amount.toFixed(2)}</strong></td>
                    <td>{f.reason}</td>
                    <td>{f.approverName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => executeFinancialRefund(f.id, false)}
                          title="Execute refund via payment token (AC-12)"
                        >
                          <CreditCard size={13} /> Execute Refund (AC-12)
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--status-amber)' }}
                          onClick={() => executeFinancialRefund(f.id, true)}
                          title="Simulate provider timeout (AC-13)"
                        >
                          Timeout Test (AC-13)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 7. SECURITY RESPONDER DASHBOARD (Viktor Ramos)
  // -------------------------------------------------------------
  if (role === ROLES.SECURITY_RESPONDER) {
    const activeIncidents = securityIncidents.filter(s => s.status !== 'CLOSED');

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <ShieldAlert size={24} color="#dc2626" />
              Security Command & Incident Radar (Viktor Ramos)
            </h2>
            <div className="view-subtitle">
              Emergency dispatch, response actions, need-to-know access control, and SHA-256 evidence preservation.
            </div>
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => triggerEmergencyEscalation(cases[0]?.id || 'CASE-801')}
          >
            <Flame size={14} /> Immediate Emergency Broadcast (AC-08)
          </button>
        </div>

        {/* Security KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => setCurrentView('security')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Active Incidents</span>
            <div className="kpi-value" style={{ color: 'var(--status-crimson)' }}>{activeIncidents.length}</div>
            <div className="kpi-footer">Urgent and High severity on radar</div>
          </div>

          <div className="kpi-card" onClick={() => setCurrentView('security')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Restricted Evidence Files</span>
            <div className="kpi-value">3</div>
            <div className="kpi-footer">SHA-256 checksums protected</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Security Clearance</span>
            <div className="kpi-value" style={{ fontSize: '1.25rem', color: 'var(--status-emerald)' }}>CLEARED</div>
            <div className="kpi-footer">Need-to-know vault access granted</div>
          </div>
        </div>

        {/* Live Incident Feed & Evidence Actions */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">Live Incident Radar ({activeIncidents.length})</div>
            <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('security')}>
              Evidence Vault <ArrowRight size={13} />
            </button>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeIncidents.map(inc => (
              <div
                key={inc.id}
                style={{
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid #dc2626',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{inc.id}</strong>
                    <span className="badge badge-urgent">{inc.severity}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{inc.title}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Location: <strong>{inc.location}</strong> • Responder: {inc.assignedResponderName}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => accessSecurityEvidence(inc.id, inc.evidence[0]?.id)}
                  >
                    <Eye size={13} /> View SHA-256 Evidence (AC-16)
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--status-crimson)' }}
                    onClick={attemptDeleteSecurityEvidence}
                  >
                    <Trash2 size={13} /> Delete Test (FR-SEC-05)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 8. EXECUTIVE VIEWER / APPROVER DASHBOARD (Claire Delacroix)
  // -------------------------------------------------------------
  if (role === ROLES.EXECUTIVE_VIEWER_APPROVER) {
    const executiveApprovals = financialExceptions.filter(f => f.status === 'UNDER_REVIEW' && f.amount > 150 && f.amount <= 2000);

    return (
      <div className="view-content-wrapper">
        <div className="view-header">
          <div className="view-title-group">
            <h2>
              <Sparkles size={24} color="#7c3aed" />
              Executive Command Center (Claire Delacroix - Hotel Manager)
            </h2>
            <div className="view-subtitle">
              Hotel-wide operational pulse, high-value financial exception approvals (≤ $2,000), and serious incident oversight.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('reports')}>
              <BarChart3 size={14} /> Performance Analytics
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('finance')}>
              <Receipt size={14} /> Financial Ledgers
            </button>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Property Occupancy</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>88.4%</div>
            <div className="kpi-footer">{currentProperty.name}</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Hotel-Wide SLA Attainment</span>
            <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>94.2%</div>
            <div className="kpi-footer">Target ≥ 92.0%</div>
          </div>

          <div className="kpi-card" onClick={() => setCurrentView('finance')} style={{ cursor: 'pointer' }}>
            <span className="kpi-label">Executive Approvals (≤ $2k)</span>
            <div className="kpi-value" style={{ color: 'var(--status-amber)' }}>{executiveApprovals.length}</div>
            <div className="kpi-footer">High-value exceptions awaiting review</div>
          </div>
        </div>

        {/* Executive Approvals Desk */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={18} color="var(--accent-gold)" />
              <span>High-Value Exception Approvals Desk ($150 to $2,000 Executive Threshold)</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref & Room</th>
                  <th>Reason</th>
                  <th>Amount</th>
                  <th>Requester</th>
                  <th>Executive Action</th>
                </tr>
              </thead>
              <tbody>
                {executiveApprovals.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.id}</strong> (Room {f.roomNumber})</td>
                    <td>{f.reason}</td>
                    <td><strong style={{ color: '#fff' }}>£{f.amount.toFixed(2)}</strong></td>
                    <td>{f.requesterName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => approveFinancialException(f.id, true, 'Approved by Hotel Manager authority')}
                        >
                          <CheckCircle2 size={13} /> Authorize (£{f.amount.toFixed(2)})
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--status-crimson)' }}
                          onClick={() => approveFinancialException(f.id, false, 'Declined by Hotel Manager')}
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 9. PLATFORM ADMINISTRATOR DASHBOARD (Alex Mercer)
  // -------------------------------------------------------------
  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Users size={24} color="#475569" />
            Platform IT & Governance Console (Alex Mercer)
          </h2>
          <div className="view-subtitle">
            Account provisioning, session revocation, MFA enforcement, integration queues, and privilege escalation guards.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('test_runner')}>
            <PlayCircle size={14} /> Run 24 Acceptance Tests (AC-01..24)
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={attemptSelfPrivilegeElevation}
            title="Simulate self-privilege elevation attempt (AC-14)"
          >
            <ShieldAlert size={14} /> Test Privilege Guard (AC-14)
          </button>
        </div>
      </div>

      {/* Admin KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => setCurrentView('admin')} style={{ cursor: 'pointer' }}>
          <span className="kpi-label">Active Staff Accounts</span>
          <div className="kpi-value">{staffList.length}</div>
          <div className="kpi-footer">All individual logins (FR-AUTH-01)</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">MFA Enforcement</span>
          <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>100%</div>
          <div className="kpi-footer">Privileged accounts secured</div>
        </div>

        <div className="kpi-card" onClick={() => setCurrentView('audit_trail')} style={{ cursor: 'pointer' }}>
          <span className="kpi-label">Audit Pipeline Health</span>
          <div className="kpi-value" style={{ fontSize: '1.25rem', color: 'var(--status-emerald)' }}>HEALTHY</div>
          <div className="kpi-footer">Appendix B compliant event store</div>
        </div>
      </div>

      {/* Quick Account Session Revocation Simulator (AC-23) */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Users size={18} color="var(--accent-gold)" />
            <span>Staff Account Lifecycle & Immediate Session Invalidation (AC-23)</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Staff Name</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Session Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.slice(0, 6).map(s => {
                const isActive = s.status === 'ACTIVE';
                const sRoleDef = ROLE_DEFINITIONS[s.role];

                return (
                  <tr key={s.id}>
                    <td><strong>{s.id}</strong></td>
                    <td>{s.name}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: sRoleDef?.badgeColor, color: '#fff' }}>
                        {sRoleDef?.name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${isActive ? 'completed' : 'blocked'}`}>{s.status}</span>
                    </td>
                    <td>
                      <button
                        className={`btn ${isActive ? 'btn-outline' : 'btn-success'} btn-sm`}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => toggleAccountActiveStatus(s.id)}
                      >
                        {isActive ? 'Deactivate (AC-23)' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
