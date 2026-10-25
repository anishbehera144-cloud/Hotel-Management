import React from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../data/permissions';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  UserX,
  UserCheck,
  Lock,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';

export default function AdminView() {
  const {
    staffList,
    currentUser,
    setCurrentStaffId,
    setCurrentView,
    toggleAccountActiveStatus,
    attemptSelfPrivilegeElevation,
  } = useApp();

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Users size={24} color="var(--accent-gold)" />
            Access Administration & Security Governance (FR-AUTH-01 to 08)
          </h2>
          <div className="view-subtitle">
            User provisioning, multi-factor authentication enforcement, session revocation, and privilege escalation guards.
          </div>
        </div>

        {/* AC-14 Privilege Escalation Test Trigger */}
        <button
          className="btn btn-danger btn-sm"
          onClick={attemptSelfPrivilegeElevation}
          title="Simulate Admin Self-Privilege Elevation Attempt (AC-14)"
        >
          <ShieldAlert size={14} /> Simulate Self-Privilege Elevation (AC-14)
        </button>
      </div>

      {/* Security Governance Notice */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          fontSize: '0.78rem',
        }}
      >
        <div>
          <strong style={{ color: 'var(--status-crimson)' }}>Privilege Escalation Guard (AC-14):</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            Technical administrators cannot self-grant financial or executive business powers. All elevation attempts are logged to the immutable audit stream.
          </div>
        </div>

        <div>
          <strong style={{ color: 'var(--status-amber)' }}>Session Invalidation (AC-23):</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            When an account is deactivated by HR or IT, active web sessions and API tokens are revoked within seconds.
          </div>
        </div>

        <div>
          <strong style={{ color: 'var(--accent-gold-light)' }}>Individual Accounts Only (FR-AUTH-01):</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            Shared terminal logins are strictly prohibited; individual accountability is enforced on every transaction.
          </div>
        </div>
      </div>

      {/* Staff Accounts Directory */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Server size={18} color="var(--accent-gold)" />
            <span>Staff Directory & Session Status ({staffList.length})</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Deny-by-Default RBAC Active (SEC-01)
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Staff Member</th>
                <th>Assigned Role Profile</th>
                <th>Department</th>
                <th>MFA Status</th>
                <th>Account Status</th>
                <th>Session Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(s => {
                const isActive = s.status === 'ACTIVE';
                const roleDef = ROLE_DEFINITIONS[s.role];

                return (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.84rem' }}>{s.id}</strong>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img
                          src={s.avatar}
                          alt={s.name}
                          style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-full)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{s.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ backgroundColor: roleDef?.badgeColor, color: '#fff' }}>
                        {roleDef?.name || s.role}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {s.department.replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      {s.mfaEnabled ? (
                        <span className="badge badge-completed" style={{ fontSize: '0.66rem' }}>
                          <ShieldCheck size={11} /> MFA Enforced
                        </span>
                      ) : (
                        <span className="badge badge-queued" style={{ fontSize: '0.66rem' }}>
                          Password Only
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          background: isActive ? 'var(--status-emerald-bg)' : 'var(--status-crimson-bg)',
                          color: isActive ? 'var(--status-emerald)' : 'var(--status-crimson)',
                        }}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                          onClick={() => {
                            setCurrentStaffId(s.id);
                            setCurrentView('dashboard');
                          }}
                          title="Switch active session persona to this user"
                        >
                          <UserCheck size={12} color="var(--accent-gold)" /> Switch
                        </button>
                        <button
                          className={`btn ${isActive ? 'btn-outline' : 'btn-success'} btn-sm`}
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                          onClick={() => toggleAccountActiveStatus(s.id)}
                          title={isActive ? 'Deactivate account and revoke session (AC-23)' : 'Reactivate account'}
                        >
                          {isActive ? (
                            <>
                              <UserX size={12} color="var(--status-crimson)" /> Deactivate (AC-23)
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} /> Reactivate
                            </>
                          )}
                        </button>
                      </div>
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
