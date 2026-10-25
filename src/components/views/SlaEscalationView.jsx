import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_SLA_POLICIES, INITIAL_ESCALATION_CONTACTS } from '../../data/mockData';
import {
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  PhoneCall,
  Bell,
  ArrowUpRight,
} from 'lucide-react';

export default function SlaEscalationView() {
  const {
    tasks,
    cases,
    currentPropertyId,
    currentShift,
    triggerEmergencyEscalation,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const contacts = INITIAL_ESCALATION_CONTACTS[currentPropertyId]?.[currentShift] || {};

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Clock size={24} color="var(--accent-gold)" />
            SLA Countdown & Multi-Tier Escalation Ladder (FR-SLA-01 to 09)
          </h2>
          <div className="view-subtitle">
            Immutable server timestamp tracking, pre-breach alerts, automatic supervisor escalation, and emergency bypass controls.
          </div>
        </div>

        {/* Real-time sync ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="badge badge-normal" style={{ fontSize: '0.78rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-emerald)', marginRight: '6px' }} />
            Clock Sync: {new Date(currentTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Emergency Bypass Notice Banner (FR-SLA-07, AC-08) */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)',
          border: '1px solid var(--status-crimson)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Flame size={24} color="var(--status-crimson)" />
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>
              Emergency / Security Immediate Bypass Protocol (FR-SLA-07 & AC-08)
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Urgent life safety, medical, or security events bypass routine SLA countdowns and trigger immediate response broadcast.
            </div>
          </div>
        </div>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => triggerEmergencyEscalation(cases[0]?.id || 'CASE-801')}
        >
          <Flame size={14} /> Dispatch Emergency Alert Now
        </button>
      </div>

      {/* Two Columns: Live Tasks SLA Countdown & Escalation Ladder Contacts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Live SLA Clocks */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <span>Active Work Target Timers ({tasks.filter(t => t.status !== 'COMPLETED').length} Active)</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Server Timezone Enforced • Pauses Logged Separately (FR-SLA-04)
            </span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem' }}>
            {tasks
              .filter(t => t.status !== 'COMPLETED')
              .map(t => {
                const targetMs = new Date(t.dueAt).getTime();
                const diffMs = targetMs - currentTime;
                const isBreached = diffMs < 0;
                const isAtRisk = !isBreached && diffMs < 15 * 60000; // less than 15 mins

                const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);
                const mins = Math.floor(absDiffSec / 60);
                const secs = absDiffSec % 60;
                const countdownStr = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

                return (
                  <div
                    key={t.id}
                    style={{
                      background: isBreached
                        ? 'rgba(239, 68, 68, 0.08)'
                        : isAtRisk
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${
                        isBreached ? 'var(--status-crimson)' : isAtRisk ? 'var(--status-amber)' : 'var(--border-subtle)'
                      }`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.88rem' }}>{t.id}</span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent-gold-light)' }}>
                          Room {t.roomNumber}
                        </span>
                        <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                        <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                      </div>

                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem', marginTop: '0.3rem' }}>
                        {t.title}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Assignee: <strong>{t.assigneeName}</strong> • Target: {new Date(t.dueAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Countdown Display Box */}
                    <div
                      style={{
                        textAlign: 'right',
                        padding: '0.5rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(0,0,0,0.3)',
                        minWidth: '130px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isBreached ? 'var(--status-crimson)' : isAtRisk ? 'var(--status-amber)' : 'var(--status-emerald)',
                        }}
                      >
                        {isBreached ? `+${countdownStr}` : countdownStr}
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: isBreached ? 'var(--status-crimson)' : isAtRisk ? 'var(--status-amber)' : 'var(--status-emerald)',
                        }}
                      >
                        {isBreached ? 'SLA BREACHED (ESCALATED)' : isAtRisk ? 'APPROACHING BREACH' : 'ON TRACK'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Multi-Tier Escalation Path & Shift Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Escalation Ladder Breakdown (FR-SLA-05, FR-SLA-06) */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <ArrowUpRight size={18} color="var(--accent-gold)" />
                <span>Multi-Tier Escalation Ladder (FR-SLA-05)</span>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
                <span className="badge" style={{ background: '#0284c7', color: '#fff' }}>Tier 1</span>
                <div>
                  <strong style={{ color: '#fff' }}>Assignee & Dispatcher</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Initial assignment notification & 5m warning</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
                <span className="badge" style={{ background: '#ca8a04', color: '#fff' }}>Tier 2</span>
                <div>
                  <strong style={{ color: '#fff' }}>Department Supervisor</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Triggered at SLA target breach or blocker report</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
                <span className="badge" style={{ background: '#d97706', color: '#fff' }}>Tier 3</span>
                <div>
                  <strong style={{ color: '#fff' }}>Department Manager</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unresolved departmental failure after 15m breach</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
                <span className="badge" style={{ background: '#dc2626', color: '#fff' }}>Tier 4</span>
                <div>
                  <strong style={{ color: '#fff' }}>Hotel Manager / GM</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Serious, unowned, cross-department exceptions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Escalation Contacts (FR-SLA-08) */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <PhoneCall size={18} color="var(--accent-indigo)" />
                <span>Shift Escalation Contacts (FR-SLA-08)</span>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Active contacts for <strong>{currentShift.toUpperCase()}</strong>:
              </div>

              {Object.entries(contacts).map(([dept, cInfo]) => (
                <div
                  key={dept}
                  style={{
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--accent-gold-light)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {dept.replace('_', ' ')}
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.75rem', marginTop: '2px' }}>
                    Primary: <strong>{cInfo.primary}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    Backup: {cInfo.backup}
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
