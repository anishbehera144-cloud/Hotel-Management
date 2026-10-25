import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  ShieldCheck,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Layers,
  FileCode,
} from 'lucide-react';

export default function AuditTrailView() {
  const { auditLogs, currentProperty } = useApp();

  const [filterResult, setFilterResult] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const filteredLogs = auditLogs.filter(log => {
    if (filterResult !== 'ALL' && log.result !== filterResult) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        log.eventId.toLowerCase().includes(term) ||
        log.actorName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.reasonCode.toLowerCase().includes(term) ||
        log.resourceId.toLowerCase().includes(term) ||
        log.correlationId.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <History size={24} color="var(--accent-gold)" />
            Tamper-Evident Audit Trail (PRD Appendix B & Section 10.3)
          </h2>
          <div className="view-subtitle">
            Immutable structured event store capturing actor, action, resource, property scope, outcome, reason code, and correlation ID.
          </div>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2rem', fontSize: '0.8rem', minWidth: '240px' }}
              placeholder="Search actor, action, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select className="select-pill" value={filterResult} onChange={e => setFilterResult(e.target.value)}>
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">Success Only</option>
            <option value="DENIED">Denied Only (Security Checks)</option>
            <option value="PENDING">Pending / Reconciliation</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <span>Recorded Audit Stream ({filteredLogs.length} Events)</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            NIST & OWASP Security Logging Standard • Deletion Strictly Prohibited
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID & Time</th>
                <th>Actor Identity</th>
                <th>Action Attempted</th>
                <th>Target Resource</th>
                <th>Outcome Result</th>
                <th>Reason Code (Appendix B)</th>
                <th>Correlation ID</th>
                <th>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const isSuccess = log.result === 'SUCCESS';
                const isDenied = log.result === 'DENIED';
                const isPending = log.result === 'PENDING';

                return (
                  <tr key={log.eventId} style={isDenied ? { background: 'rgba(239, 68, 68, 0.05)' } : {}}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {log.eventId}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {new Date(log.occurredAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>
                        {log.actorName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        ID: {log.actorId} • {log.actorType}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: isDenied ? 'var(--status-crimson)' : 'var(--accent-gold-light)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                        {log.action}
                      </span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Source: {log.source}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#fff' }}>
                        {log.resourceType}: <strong style={{ color: 'var(--accent-gold-light)' }}>{log.resourceId}</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Property: {log.propertyId}</div>
                    </td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          background: isSuccess
                            ? 'var(--status-emerald-bg)'
                            : isDenied
                            ? 'var(--status-crimson-bg)'
                            : isPending
                            ? 'var(--status-amber-bg)'
                            : 'rgba(255,255,255,0.08)',
                          color: isSuccess
                            ? 'var(--status-emerald)'
                            : isDenied
                            ? 'var(--status-crimson)'
                            : isPending
                            ? 'var(--status-amber)'
                            : '#fff',
                        }}
                      >
                        {isSuccess ? <CheckCircle2 size={11} /> : isDenied ? <XCircle size={11} /> : <Clock size={11} />}
                        {log.result}
                      </span>
                    </td>

                    <td style={{ maxWidth: '220px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {log.reasonCode}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {log.correlationId}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <FileCode size={12} /> Meta
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileCode size={18} color="var(--accent-gold)" />
                <span>Audit Event Metadata: {selectedLog.eventId}</span>
              </div>
            </div>
            <div className="modal-body">
              <pre
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--accent-gold-light)',
                  overflowX: 'auto',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
