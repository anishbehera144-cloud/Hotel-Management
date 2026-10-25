import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../data/permissions';
import {
  LayoutDashboard,
  CheckSquare,
  GitFork,
  Layers,
  Clock,
  ArrowRightLeft,
  Key,
  Receipt,
  ShieldAlert,
  Wrench,
  BarChart3,
  Users,
  History,
  PlayCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  CheckSquare,
  GitFork,
  Layers,
  Clock,
  ArrowRightLeft,
  Key,
  Receipt,
  ShieldAlert,
  Wrench,
  BarChart3,
  Users,
  History,
  PlayCircle,
};

export default function Sidebar() {
  const {
    currentView,
    setCurrentView,
    currentUser,
    currentStaffId,
    setCurrentStaffId,
    staffList,
    tasks,
    cases,
    financialExceptions,
    securityIncidents,
    setRoleSwitcherModalOpen,
  } = useApp();

  const [allServicesExpanded, setAllServicesExpanded] = useState(false);

  const userRole = currentUser.role;
  const roleDef = ROLE_DEFINITIONS[userRole];

  // Dynamic Badges
  const myTasksCount = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'COMPLETED').length;
  const pendingApprovalsCount = financialExceptions.filter(f => f.status === 'UNDER_REVIEW').length;
  const activeSecurityCount = securityIncidents.filter(s => s.status !== 'CLOSED').length;
  const urgentCasesCount = cases.filter(c => c.priority === 'URGENT' && c.status !== 'CLOSED').length;
  const blockedTasksCount = tasks.filter(t => t.status === 'BLOCKED').length;

  const getBadgeForView = (viewId) => {
    switch (viewId) {
      case 'my_tasks':
        return myTasksCount > 0 ? { text: myTasksCount, type: 'info' } : null;
      case 'finance':
        return pendingApprovalsCount > 0 ? { text: pendingApprovalsCount, type: 'warning' } : null;
      case 'security':
        return activeSecurityCount > 0 ? { text: activeSecurityCount, type: 'danger' } : null;
      case 'cases':
        return urgentCasesCount > 0 ? { text: `${urgentCasesCount} Urgent`, type: 'danger' } : null;
      case 'dispatch_board':
        return blockedTasksCount > 0 ? { text: `${blockedTasksCount} Blocked`, type: 'warning' } : null;
      default:
        return null;
    }
  };

  const primaryServices = roleDef?.primaryServices || [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  ];

  // System/Audit tools available across roles
  const complianceTools = [
    { id: 'test_runner', label: '24 Acceptance Tests (AC-01..24)', icon: 'PlayCircle', highlight: true },
    { id: 'audit_trail', label: 'Appendix B Audit Trail', icon: 'History' },
  ];

  // All other hotel services in case the user wants to browse outside active role scope
  const allOtherServices = [
    { id: 'cases', label: 'Guest Cases & Subtasks', icon: 'Layers' },
    { id: 'dispatch_board', label: 'Department Dispatch Queue', icon: 'GitFork' },
    { id: 'front_desk', label: 'Front Desk & Suite Moves', icon: 'Key' },
    { id: 'finance', label: 'Financial Exceptions & Refunds', icon: 'Receipt' },
    { id: 'security', label: 'Security & Evidence Vault', icon: 'ShieldAlert' },
    { id: 'maintenance', label: 'Maintenance & Safety Clearance', icon: 'Wrench' },
    { id: 'sla_escalation', label: 'SLA Escalation Radar', icon: 'Clock' },
    { id: 'handover', label: 'Shift Handover Desk', icon: 'ArrowRightLeft' },
    { id: 'reports', label: 'Operational Reports & PII Export', icon: 'BarChart3' },
    { id: 'admin', label: 'Platform Access & Governance', icon: 'Users' },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div className="brand-text">
          <h1>GRAND HORIZON</h1>
          <p>Operational Ops v1.0</p>
        </div>
      </div>

      {/* Prominent Active Role Switcher Card */}
      <div style={{ padding: '0.85rem 0.85rem 0.4rem 0.85rem' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${roleDef?.badgeColor}55`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Active Role Persona
            </span>
            <button
              onClick={() => setRoleSwitcherModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-gold)',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Browse 9 Roles
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${roleDef?.badgeColor}` }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <select
                className="select-pill"
                style={{ width: '100%', fontSize: '0.74rem', padding: '0.3rem 0.5rem', fontWeight: 700 }}
                value={currentStaffId}
                onChange={e => {
                  setCurrentStaffId(e.target.value);
                  setCurrentView('dashboard');
                }}
                title="Switch Active Persona to test this role's tailored dashboard"
              >
                {staffList.map(s => {
                  const def = ROLE_DEFINITIONS[s.role];
                  return (
                    <option key={s.id} value={s.id}>
                      [{def?.name || s.role}] {s.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation: Role-Specific Primary Services */}
      <nav className="sidebar-nav">
        <div className="nav-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{roleDef?.name} Services</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>Role-Filtered</span>
        </div>

        {primaryServices.map(service => {
          const Icon = iconMap[service.icon] || LayoutDashboard;
          const isActive = currentView === service.id;
          const badge = getBadgeForView(service.id);

          return (
            <button
              key={service.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(service.id)}
            >
              <div className="nav-item-content">
                <Icon size={17} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
                <span>{service.label}</span>
              </div>
              {badge && (
                <span className={`nav-badge ${badge.type}`}>
                  {badge.text}
                </span>
              )}
            </button>
          );
        })}

        {/* Compliance & Audit Tools */}
        <div className="nav-section-title" style={{ marginTop: '0.6rem' }}>
          <span>Compliance & Acceptance</span>
        </div>

        {complianceTools.map(item => {
          const Icon = iconMap[item.icon] || PlayCircle;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              style={item.highlight && !isActive ? { background: 'rgba(99, 102, 241, 0.08)', border: '1px dashed rgba(99, 102, 241, 0.3)' } : {}}
            >
              <div className="nav-item-content">
                <Icon size={17} color={isActive ? 'var(--accent-gold)' : '#818cf8'} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Collapsible: All Other Hotel Modules */}
        <div style={{ marginTop: '0.6rem' }}>
          <button
            className="nav-item-btn"
            style={{ fontSize: '0.74rem', color: 'var(--text-muted)', padding: '0.4rem 0.75rem' }}
            onClick={() => setAllServicesExpanded(!allServicesExpanded)}
          >
            <div className="nav-item-content">
              {allServicesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>All Other Hotel Services</span>
            </div>
            <span style={{ fontSize: '0.64rem' }}>{allServicesExpanded ? 'Hide' : 'Expand'}</span>
          </button>

          {allServicesExpanded && (
            <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
              {allOtherServices
                .filter(s => !primaryServices.some(p => p.id === s.id))
                .map(item => {
                  const Icon = iconMap[item.icon] || Layers;
                  const isActive = currentView === item.id;
                  const badge = getBadgeForView(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setCurrentView(item.id)}
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.7rem' }}
                    >
                      <div className="nav-item-content">
                        <Icon size={15} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
                        <span>{item.label}</span>
                      </div>
                      {badge && (
                        <span className={`nav-badge ${badge.type}`} style={{ fontSize: '0.62rem' }}>
                          {badge.text}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer: Quick Boundaries Reminder */}
      <div className="sidebar-footer" style={{ padding: '0.75rem' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="var(--accent-gold)" />
          <span>Least-Privilege Scoping Active (PRD §3)</span>
        </div>
      </div>
    </aside>
  );
}
