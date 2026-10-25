import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../../data/permissions';
import {
  ShieldAlert,
  Lock,
  FileCheck,
  Eye,
  Trash2,
  AlertTriangle,
  Flame,
  Radio,
  FileLock2,
  CheckCircle2,
  XCircle,
  KeyRound,
} from 'lucide-react';

export default function SecurityView() {
  const {
    securityIncidents,
    accessSecurityEvidence,
    attemptDeleteSecurityEvidence,
    currentUser,
    logAuditEvent,
    addToast,
  } = useApp();

  const [selectedIncidentId, setSelectedIncidentId] = useState(securityIncidents[0]?.id || 'SEC-701');
  const [evidenceViewerModal, setEvidenceViewerModal] = useState(null);

  const selectedIncident = securityIncidents.find(s => s.id === selectedIncidentId) || securityIncidents[0];

  // Need to know check
  const hasSecurityClearance = [
    ROLES.SECURITY_RESPONDER,
    ROLES.EXECUTIVE_VIEWER_APPROVER,
  ].includes(currentUser.role);

  const handleOpenEvidence = (incidentId, evidence) => {
    const success = accessSecurityEvidence(incidentId, evidence.id);
    if (success) {
      setEvidenceViewerModal(evidence);
    }
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <ShieldAlert size={24} color="#dc2626" />
            Security Incidents & Restricted Evidence Vault (FR-SEC-01 to 07 & AC-16)
          </h2>
          <div className="view-subtitle">
            Restricted need-to-know incident command, response logging, SHA-256 evidence integrity, and strict anti-tamper deletion controls.
          </div>
        </div>

        {/* Clearance Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            className="badge"
            style={{
              background: hasSecurityClearance ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: hasSecurityClearance ? 'var(--status-emerald)' : 'var(--status-crimson)',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
            }}
          >
            {hasSecurityClearance ? (
              <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
            ) : (
              <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            )}
            Clearance Status: {hasSecurityClearance ? 'NEED-TO-KNOW GRANTED' : 'RESTRICTED / NO CLEARANCE (AC-16)'}
          </span>
        </div>
      </div>

      {/* Security Incident Command Center */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr', gap: '1.5rem', minHeight: '600px' }}>
        {/* Left Column: Incidents Directory */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <span>Incident Command Queue ({securityIncidents.length})</span>
            </div>
            <span className="badge badge-urgent">Priority Feed</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {securityIncidents.map(inc => {
              const isSelected = inc.id === selectedIncident?.id;
              const isUrgent = inc.severity === 'URGENT';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(220, 38, 38, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? '#dc2626' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{inc.id}</span>
                      <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>
                        {inc.classification}
                      </span>
                    </div>
                    <span className={`badge badge-${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                  </div>

                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem' }}>{inc.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Location: <strong>{inc.location}</strong> • Responder: {inc.assignedResponderName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Incident Facts, Action Logs & Evidence Vault */}
        {selectedIncident && (
          <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{selectedIncident.id}</span>
                  <span className="badge" style={{ background: '#dc2626', color: '#fff' }}>
                    {selectedIncident.severity}
                  </span>
                  <span className={`badge badge-${selectedIncident.status.toLowerCase()}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Location: <strong>{selectedIncident.location}</strong> • Reported:{' '}
                  {new Date(selectedIncident.reportedAt).toLocaleTimeString()}
                </div>
              </div>

              {/* Anti-tamper Evidence Delete Test Button (FR-SEC-05) */}
              <button
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--status-crimson)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                onClick={attemptDeleteSecurityEvidence}
                title="Attempt to delete evidence (Tested for FR-SEC-05 protection)"
              >
                <Trash2 size={13} /> Delete Evidence (FR-SEC-05)
              </button>
            </div>

            <div className="card-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Summary Facts */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>Incident Synopsis:</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {selectedIncident.summary}
                </div>
              </div>

              {/* Officer Response Log */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Officer Response Log:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedIncident.actionsTaken.map((act, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.76rem',
                      }}
                    >
                      <strong style={{ color: 'var(--accent-gold-light)', marginRight: '6px' }}>{act.time}:</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{act.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restricted Evidence Vault (FR-SEC-03 & AC-16) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Restricted Evidence Vault ({selectedIncident.evidence.length} Files):
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    SHA-256 Checksums Logged • Need-to-Know Enforced (AC-16)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedIncident.evidence.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileLock2 size={16} color="var(--accent-gold)" />
                          <strong style={{ color: '#fff', fontSize: '0.82rem' }}>{ev.filename}</strong>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.64rem' }}>
                            {ev.fileSize}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>
                          SHA-256: {ev.sha256}
                        </div>

                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Uploaded by: {ev.uploadedBy} • Retention: <strong>{ev.retentionPolicy}</strong> • Access Views: <strong>{ev.accessCount}</strong>
                        </div>
                      </div>

                      {/* Open / Download Evidence Button (triggers AC-16 check) */}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => handleOpenEvidence(selectedIncident.id, ev)}
                        title="Open protected evidence file"
                      >
                        <Eye size={13} /> View Evidence (AC-16)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Protected Evidence Viewer */}
      {evidenceViewerModal && (
        <div className="modal-overlay" onClick={() => setEvidenceViewerModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileCheck size={18} color="var(--status-emerald)" />
                <span>Evidence Viewer: {evidenceViewerModal.filename}</span>
              </div>
            </div>
            <div className="modal-body">
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--status-emerald)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.76rem',
                  color: 'var(--status-emerald)',
                }}
              >
                <strong>Security Audit Verified (AC-16):</strong> User <strong>{currentUser.name}</strong> cleared under Need-to-Know policy. Event logged with tamper-evident correlation ID.
              </div>

              <div style={{ fontSize: '0.8rem', color: '#fff' }}>
                <div><strong>Integrity Checksum (SHA-256):</strong></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-gold-light)', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '4px', marginTop: '2px' }}>
                  {evidenceViewerModal.sha256}
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div><strong>Evidence Classification:</strong> RESTRICTED_LEGAL_EVIDENCE</div>
                <div><strong>Uploaded By:</strong> {evidenceViewerModal.uploadedBy}</div>
                <div><strong>Compliance Retention:</strong> {evidenceViewerModal.retentionPolicy}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setEvidenceViewerModal(null)}>
                Close Vault Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
