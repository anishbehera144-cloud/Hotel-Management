import React from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, ROLE_DEFINITIONS } from '../data/permissions';
import {
  X,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function RoleSwitcherModal() {
  const {
    roleSwitcherModalOpen,
    setRoleSwitcherModalOpen,
    currentStaffId,
    setCurrentStaffId,
    setCurrentView,
    staffList,
    addToast,
  } = useApp();

  if (!roleSwitcherModalOpen) return null;

  // Distinct representative staff for each of the 9 roles
  const roleStaffMap = [
    { roleKey: ROLES.TASK_FULFILLER, staffId: 'EMP-101', icon: '🛌' },
    { roleKey: ROLES.DEPARTMENT_DISPATCHER, staffId: 'EMP-102', icon: '🔀' },
    { roleKey: ROLES.DEPARTMENT_SUPERVISOR, staffId: 'EMP-103', icon: '📋' },
    { roleKey: ROLES.DEPARTMENT_MANAGER, staffId: 'EMP-104', icon: '💼' },
    { roleKey: ROLES.FRONT_DESK_COORDINATOR, staffId: 'EMP-105', icon: '🛎️' },
    { roleKey: ROLES.FINANCIAL_OPERATOR, staffId: 'EMP-106', icon: '💳' },
    { roleKey: ROLES.SECURITY_RESPONDER, staffId: 'EMP-107', icon: '🛡️' },
    { roleKey: ROLES.EXECUTIVE_VIEWER_APPROVER, staffId: 'EMP-108', icon: '👑' },
    { roleKey: ROLES.PLATFORM_ADMINISTRATOR, staffId: 'EMP-109', icon: '⚙️' },
  ];

  const handleSelectRole = (staffId, roleName) => {
    setCurrentStaffId(staffId);
    setCurrentView('dashboard');
    setRoleSwitcherModalOpen(false);
    addToast('info', 'Role Switched', `Active operational persona changed to ${roleName}. Tailored role dashboard loaded.`);
  };

  return (
    <div className="modal-overlay" onClick={() => setRoleSwitcherModalOpen(false)}>
      <div
        className="modal-container"
        style={{ maxWidth: '980px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(217, 119, 6, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Select Operational Role (9 Distinct Personas)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                PRD Section 4: Role-based dashboards, tailored permissions, and operational feature sets.
              </p>
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem 0.6rem' }}
            onClick={() => setRoleSwitcherModalOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* 3x3 Luxury Grid of Roles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem', padding: '1.25rem 0' }}>
          {roleStaffMap.map(({ roleKey, staffId, icon }) => {
            const roleDef = ROLE_DEFINITIONS[roleKey];
            const staff = staffList.find(s => s.id === staffId) || staffList[0];
            const isCurrent = staff.id === currentStaffId;

            return (
              <div
                key={roleKey}
                onClick={() => handleSelectRole(staff.id, roleDef?.name)}
                style={{
                  background: isCurrent ? 'rgba(217, 119, 6, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1.5px solid ${isCurrent ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrent ? '0 0 20px rgba(217, 119, 6, 0.2)' : 'none',
                }}
              >
                {/* Role Top Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: roleDef?.badgeColor || '#4f46e5',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                        }}
                      >
                        {roleDef?.name}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="badge badge-completed" style={{ fontSize: '0.65rem' }}>
                        <CheckCircle2 size={11} /> ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Staff Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.6rem 0' }}>
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-full)',
                        border: `2px solid ${roleDef?.badgeColor || 'var(--border-subtle)'}`,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{staff.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {staff.id} • {staff.department.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0.4rem 0' }}>
                    {roleDef?.description}
                  </p>

                  {/* Primary Services Pills */}
                  <div style={{ marginTop: '0.6rem' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Primary Services:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                      {roleDef?.primaryServices.map(s => (
                        <span
                          key={s.id}
                          style={{
                            fontSize: '0.68rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.2rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Button */}
                <button
                  className={`btn ${isCurrent ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectRole(staff.id, roleDef?.name);
                  }}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 size={14} /> Currently Viewing
                    </>
                  ) : (
                    <>
                      <span>Open {roleDef?.name}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>All 9 role workspaces have fully segregated permissions and distinct dashboards.</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setRoleSwitcherModalOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
