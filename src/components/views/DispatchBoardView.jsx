import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../../data/permissions';
import {
  GitFork,
  UserCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  UserPlus,
  Shield,
  Layers,
} from 'lucide-react';

export default function DispatchBoardView() {
  const {
    tasks,
    staffList,
    departments,
    currentUser,
    assignTask,
    reopenTask,
    updateTaskStatus,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Modal states
  const [assignModalTask, setAssignModalTask] = useState(null);
  const [reopenModalTask, setReopenModalTask] = useState(null);
  const [reopenReason, setReopenReason] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  const isSupervisorOrManager = [
    ROLES.DEPARTMENT_SUPERVISOR,
    ROLES.DEPARTMENT_MANAGER,
    ROLES.EXECUTIVE_VIEWER_APPROVER,
  ].includes(currentUser.role);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedDept !== 'ALL' && t.departmentId !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    return true;
  });

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignModalTask || !selectedAssigneeId) return;
    assignTask(assignModalTask.id, selectedAssigneeId);
    setAssignModalTask(null);
  };

  const handleReopenSubmit = (e) => {
    e.preventDefault();
    if (!reopenModalTask || !reopenReason.trim()) return;
    reopenTask(reopenModalTask.id, reopenReason);
    setReopenModalTask(null);
    setReopenReason('');
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <GitFork size={24} color="var(--accent-gold)" />
            Department Dispatch Board & Staff Workload (FR-TASK-01 to 12)
          </h2>
          <div className="view-subtitle">
            Monitor scoped departmental queues, real-time staff workload, assignment eligibility, and supervisor quality checks.
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <select className="select-pill" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select className="select-pill" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="QUEUED">Queued (Unassigned)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_THE_WAY">On the Way</option>
            <option value="BLOCKED">Blocked</option>
            <option value="REOPENED">Reopened</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select className="select-pill" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Two Columns: Left Queue & Right Eligible Staff Workload Monitor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Tasks Queue Table */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <span>Scoped Operational Tasks ({filteredTasks.length})</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Original created clock preserved on reassignment & reopen (FR-TASK-10)
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task ID & Room</th>
                  <th>Description</th>
                  <th>Dept</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => {
                  const isBlocked = t.status === 'BLOCKED';
                  const isCompleted = t.status === 'COMPLETED';

                  return (
                    <tr key={t.id} style={isBlocked ? { background: 'rgba(239, 68, 68, 0.05)' } : {}}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#fff' }}>{t.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                          Room {t.roomNumber}
                        </div>
                      </td>

                      <td style={{ maxWidth: '220px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{t.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Case: {t.caseId} • Created: {new Date(t.createdAt).toLocaleTimeString()}
                        </div>
                        {t.blockedReason && (
                          <div style={{ color: 'var(--status-crimson)', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>
                            Blocker: {t.blockedReason}
                          </div>
                        )}
                        {t.reopenNotes && (
                          <div style={{ color: 'var(--status-amber)', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>
                            Reopened: {t.reopenNotes}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent-gold-light)' }}>
                          {t.departmentId.slice(0, 3).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: t.assigneeId ? '#fff' : 'var(--status-crimson)' }}>
                          {t.assigneeName}
                        </span>
                      </td>

                      <td>
                        <span className={`badge badge-${t.priority.toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </td>

                      <td>
                        <span className={`badge badge-${t.status.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {/* Assign / Reassign Button */}
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => {
                              setAssignModalTask(t);
                              setSelectedAssigneeId(t.assigneeId || staffList[0].id);
                            }}
                            title="Assign to eligible staff member"
                          >
                            <UserPlus size={13} /> Assign
                          </button>

                          {/* Supervisor Reopen Button (AC-05) */}
                          {isCompleted && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--status-amber)' }}
                              onClick={() => {
                                setReopenModalTask(t);
                              }}
                              title="Supervisor Reopen Incomplete Task with Reason (AC-05)"
                            >
                              <RotateCcw size={13} /> Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Staff Workload & Availability Tracker (FR-TASK-03, FR-TASK-04) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <UserCheck size={18} color="var(--accent-gold)" />
                <span>Eligible Staff Workload ({staffList.length})</span>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active staff count by current shift and active task burden:
              </div>

              {staffList.map(s => {
                const assignedCount = tasks.filter(t => t.assigneeId === s.id && t.status !== 'COMPLETED').length;
                const isHeavy = assignedCount >= 3;

                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={s.avatar}
                        alt={s.name}
                        style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {ROLE_DEFINITIONS[s.role]?.name} • {s.department}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="badge"
                        style={{
                          background: isHeavy ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isHeavy ? 'var(--status-crimson)' : 'var(--status-emerald)',
                        }}
                      >
                        {assignedCount} Active Tasks
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign / Reassign Task */}
      {assignModalTask && (
        <div className="modal-overlay" onClick={() => setAssignModalTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <UserPlus size={18} color="var(--accent-gold)" />
                <span>Assign Task: {assignModalTask.id}</span>
              </div>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{assignModalTask.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Room: {assignModalTask.roomNumber} • Department: {assignModalTask.departmentId}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Eligible Staff Member:</label>
                  <select
                    className="form-select"
                    value={selectedAssigneeId}
                    onChange={e => setSelectedAssigneeId(e.target.value)}
                    required
                  >
                    {staffList.map(s => {
                      const load = tasks.filter(t => t.assigneeId === s.id && t.status !== 'COMPLETED').length;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({ROLE_DEFINITIONS[s.role]?.name}) — {load} Active Tasks
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAssignModalTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Supervisor Reopen Incomplete Task (AC-05) */}
      {reopenModalTask && (
        <div className="modal-overlay" onClick={() => setReopenModalTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <RotateCcw size={18} color="var(--status-amber)" />
                <span>Supervisor Reopen Task (AC-05 / FR-TASK-09)</span>
              </div>
            </div>
            <form onSubmit={handleReopenSubmit}>
              <div className="modal-body">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Reopening task <strong>{reopenModalTask.id}</strong> ({reopenModalTask.title}) for room{' '}
                  <strong>{reopenModalTask.roomNumber}</strong>. Original ticket creation time will remain intact.
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Corrective Action Explanation:</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe specific defects or incomplete items requiring corrective action..."
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReopenModalTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: 'var(--accent-gold)' }}>
                  Reopen Task with Audit Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
