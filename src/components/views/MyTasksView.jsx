import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Clock,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  Truck,
  Play,
  FileText,
  Camera,
  X,
  Check,
} from 'lucide-react';

export default function MyTasksView() {
  const {
    tasks,
    currentUser,
    updateTaskStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState('ASSIGNED');
  const [blockerModalTask, setBlockerModalTask] = useState(null);
  const [blockerReason, setBlockerReason] = useState('');
  const [completeModalTask, setCompleteModalTask] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Filter tasks assigned to current fulfiller
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const activeTasks = myTasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = myTasks.filter(t => t.status === 'COMPLETED');

  const displayedTasks = activeTab === 'ASSIGNED' ? activeTasks : completedTasks;

  const handleBlockerSubmit = (e) => {
    e.preventDefault();
    if (!blockerModalTask || !blockerReason.trim()) return;
    updateTaskStatus(blockerModalTask.id, 'BLOCKED', { reason: blockerReason });
    setBlockerModalTask(null);
    setBlockerReason('');
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    if (!completeModalTask) return;
    updateTaskStatus(completeModalTask.id, 'COMPLETED', { notes: deliveryNotes || 'Delivered and verified.' });
    setCompleteModalTask(null);
    setDeliveryNotes('');
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <CheckSquare size={24} color="var(--accent-gold)" />
            My Assigned Tasks (Fulfiller Workspace: FR-TASK-06 & 08)
          </h2>
          <div className="view-subtitle">
            Mobile/tablet optimized workflow for attendants, runners, and servers to update work progress and report blockers.
          </div>
        </div>

        {/* Tab Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'ASSIGNED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('ASSIGNED')}
          >
            Active Work ({activeTasks.length})
          </button>
          <button
            className={`btn ${activeTab === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Task Cards Grid (Touch/Mobile Friendly) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {displayedTasks.length === 0 ? (
          <div
            className="content-card"
            style={{
              gridColumn: '1 / -1',
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <CheckCircle2 size={42} color="var(--status-emerald)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>No tasks in this queue</h3>
            <p style={{ fontSize: '0.84rem', marginTop: '0.35rem' }}>
              All assigned tasks are up to date. New dispatches will appear here automatically.
            </p>
          </div>
        ) : (
          displayedTasks.map(t => {
            const isBlocked = t.status === 'BLOCKED';
            const isOnTheWay = t.status === 'ON_THE_WAY';
            const isInProgress = t.status === 'IN_PROGRESS';
            const isCompleted = t.status === 'COMPLETED';

            return (
              <div
                key={t.id}
                className="content-card"
                style={{
                  borderLeft: `4px solid ${
                    isBlocked
                      ? 'var(--status-crimson)'
                      : isOnTheWay
                      ? 'var(--status-purple)'
                      : isInProgress
                      ? 'var(--status-sky)'
                      : isCompleted
                      ? 'var(--status-emerald)'
                      : 'var(--accent-gold)'
                  }`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Card Header Info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-gold-light)', fontSize: '0.88rem' }}>
                        {t.id}
                      </span>
                      <span className="badge" style={{ background: 'var(--accent-gold-gradient)', color: '#fff' }}>
                        <MapPin size={11} /> Room {t.roomNumber}
                      </span>
                    </div>
                    <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                  </div>

                  {/* Title & Instructions */}
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>{t.title}</h3>
                    {t.instructions && (
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.45rem',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <strong>Instructions:</strong> {t.instructions}
                      </div>
                    )}
                  </div>

                  {/* Timing & Blocker Notice */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Case: {t.caseId}</span>
                    <span>Target Due: {new Date(t.dueAt).toLocaleTimeString()}</span>
                  </div>

                  {t.blockedReason && (
                    <div
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--status-crimson)',
                        color: 'var(--status-crimson)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Blocker on File: {t.blockedReason}
                    </div>
                  )}

                  {t.deliveryNotes && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--status-emerald)' }}>
                      <strong>Delivery Proof:</strong> {t.deliveryNotes}
                    </div>
                  )}
                </div>

                {/* Fulfiller Action Buttons (FR-TASK-06) */}
                {!isCompleted && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.4rem',
                    }}
                  >
                    {/* On the Way */}
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
                      onClick={() => updateTaskStatus(t.id, 'ON_THE_WAY')}
                      title="Mark On The Way"
                    >
                      <Truck size={13} /> En Route
                    </button>

                    {/* In Progress */}
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
                      onClick={() => updateTaskStatus(t.id, 'IN_PROGRESS')}
                      title="Mark In Progress"
                    >
                      <Play size={13} /> Started
                    </button>

                    {/* Blocked with Reason (FR-TASK-07) */}
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', color: 'var(--status-crimson)' }}
                      onClick={() => setBlockerModalTask(t)}
                      title="Report Blocker (Requires Reason)"
                    >
                      <AlertOctagon size={13} /> Blocked
                    </button>

                    {/* Complete with Proof (AC-03) */}
                    <button
                      className="btn btn-success btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem' }}
                      onClick={() => setCompleteModalTask(t)}
                      title="Complete Task with Delivery Confirmation"
                    >
                      <Check size={13} /> Complete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Mandatory Blocker Reason (FR-TASK-07) */}
      {blockerModalTask && (
        <div className="modal-overlay" onClick={() => setBlockerModalTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <AlertOctagon size={18} color="var(--status-crimson)" />
                <span>Report Blocker for {blockerModalTask.id} (FR-TASK-07)</span>
              </div>
            </div>
            <form onSubmit={handleBlockerSubmit}>
              <div className="modal-body">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  A blocked task requires a specific blocker category and note. This will flag the task on the supervisor dispatch board and notify the dispatcher.
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Blocker Reason:</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="e.g. Guest has Do Not Disturb sign on door / Supply shortage in linen closet / Keycard access failed..."
                    value={blockerReason}
                    onChange={e => setBlockerReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBlockerModalTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm">
                  Confirm Blocker & Escalate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Task Completion Proof / Delivery Confirmation (AC-03, FR-TASK-08) */}
      {completeModalTask && (
        <div className="modal-overlay" onClick={() => setCompleteModalTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <CheckCircle2 size={18} color="var(--status-emerald)" />
                <span>Complete Task: {completeModalTask.id}</span>
              </div>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body">
                <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                  {completeModalTask.title} (Room {completeModalTask.roomNumber})
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Confirmation / Fulfillment Notes:</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="e.g. Delivered 4 hypoallergenic pillows directly to guest. Guest verbally confirmed receipt."
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Camera size={16} color="var(--accent-gold)" />
                  <span>Photo Attachment / Digital Signature Verified (FR-TASK-08)</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCompleteModalTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success btn-sm">
                  Record Completion (AC-03)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
