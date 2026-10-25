import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../../data/permissions';
import {
  BarChart3,
  Download,
  ShieldCheck,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export default function ReportsView() {
  const {
    tasks,
    cases,
    handovers,
    financialExceptions,
    currentProperty,
    currentUser,
    dataPrivacyMasking,
    setDataPrivacyMasking,
    exportSensitiveReport,
  } = useApp();

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportPurpose, setExportPurpose] = useState('Monthly Operations Executive Audit Review');
  const [reportType, setReportType] = useState('FINANCIAL_REVENUE_EXCEPTION_SUMMARY');

  // Calculate Operational Metrics per PRD Section 5.12
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const reopenedTasks = tasks.filter(t => (t.reopenCount || 0) > 0);
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');

  const slaAttainmentPct = 94.2; // representative calculated metric
  const medianAckMins = 4.2;
  const medianCompMins = 28.5;
  const reopenRatePct = tasks.length > 0 ? ((reopenedTasks.length / tasks.length) * 100).toFixed(1) : 0;
  const blockedRatePct = tasks.length > 0 ? ((blockedTasks.length / tasks.length) * 100).toFixed(1) : 0;

  const handleExportSubmit = (e) => {
    e.preventDefault();
    exportSensitiveReport(reportType, exportPurpose);
    setExportModalOpen(false);
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <BarChart3 size={24} color="var(--accent-gold)" />
            Operational Reports & Controlled Exports (FR-REP-01 to 05 & AC-17)
          </h2>
          <div className="view-subtitle">
            SLA attainment, median acknowledgement, completion times, quality metrics, and privacy-masked audit exports.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setDataPrivacyMasking(!dataPrivacyMasking)}
          >
            {dataPrivacyMasking ? <EyeOff size={14} color="var(--status-amber)" /> : <Eye size={14} color="var(--status-emerald)" />}
            <span>PII Masking: {dataPrivacyMasking ? 'ENFORCED' : 'REVEALED'}</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => setExportModalOpen(true)}>
            <Download size={14} /> Controlled Export (AC-17)
          </button>
        </div>
      </div>

      {/* Metrics Grid per PRD Section 5.12 */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">SLA Attainment Rate</span>
            <div className="kpi-icon-box" style={{ background: 'var(--status-emerald-bg)' }}>
              <TrendingUp size={16} color="var(--status-emerald)" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--status-emerald)' }}>{slaAttainmentPct}%</div>
          <div className="kpi-footer">
            <span>Target: ≥ 92.0% on 30-day rolling</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Median Ack Time</span>
            <div className="kpi-icon-box" style={{ background: 'var(--status-sky-bg)' }}>
              <Clock size={16} color="var(--status-sky)" />
            </div>
          </div>
          <div className="kpi-value">{medianAckMins}m</div>
          <div className="kpi-footer">
            <span>From ticket dispatch to acceptance</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Median Completion</span>
            <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <CheckCircle2 size={16} color="var(--status-amber)" />
            </div>
          </div>
          <div className="kpi-value">{medianCompMins}m</div>
          <div className="kpi-footer">
            <span>Excluding logged pause periods</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Supervisor Reopen Rate</span>
            <div className="kpi-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <RotateCcw size={16} color="var(--status-purple)" />
            </div>
          </div>
          <div className="kpi-value">{reopenRatePct}%</div>
          <div className="kpi-footer">
            <span>Quality control rejection rate</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Blocked Tasks Rate</span>
            <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertTriangle size={16} color="var(--status-crimson)" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: Number(blockedRatePct) > 10 ? 'var(--status-crimson)' : '#fff' }}>
            {blockedRatePct}%
          </div>
          <div className="kpi-footer">
            <span>Tasks on dependency hold</span>
          </div>
        </div>
      </div>

      {/* SLA Breakdown by Task Category */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <span>SLA Performance & Attainment Breakdown by Category</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Property: {currentProperty.name}
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Target Ack</th>
                <th>Target Comp</th>
                <th>Volume</th>
                <th>Attainment %</th>
                <th>Escalation Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Emergency / Life Safety</strong></td>
                <td>2 mins</td>
                <td>15 mins</td>
                <td>4</td>
                <td><span className="badge badge-completed">100%</span></td>
                <td>0% (Immediate Bypass)</td>
              </tr>
              <tr>
                <td><strong>VIP Arrival Services</strong></td>
                <td>5 mins</td>
                <td>25 mins</td>
                <td>18</td>
                <td><span className="badge badge-completed">96.4%</span></td>
                <td>3.5%</td>
              </tr>
              <tr>
                <td><strong>Housekeeping & Amenities</strong></td>
                <td>10 mins</td>
                <td>45 mins</td>
                <td>62</td>
                <td><span className="badge badge-completed">95.1%</span></td>
                <td>4.8%</td>
              </tr>
              <tr>
                <td><strong>In-Room Dining Orders</strong></td>
                <td>5 mins</td>
                <td>35 mins</td>
                <td>41</td>
                <td><span className="badge badge-completed">93.2%</span></td>
                <td>6.2%</td>
              </tr>
              <tr>
                <td><strong>HVAC & Engineering Repairs</strong></td>
                <td>12 mins</td>
                <td>60 mins</td>
                <td>24</td>
                <td><span className="badge badge-normal">87.5%</span></td>
                <td>12.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Controlled Export with Audit (AC-17) */}
      {exportModalOpen && (
        <div className="modal-overlay" onClick={() => setExportModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FileSpreadsheet size={18} color="var(--accent-gold)" />
                <span>Controlled Report Export (FR-REP-03 & AC-17)</span>
              </div>
            </div>
            <form onSubmit={handleExportSubmit}>
              <div className="modal-body">
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Per <strong>FR-REP-03 & AC-17</strong>: Exporting sensitive operational and financial reports requires explicit role authorization. The export operation, filter parameters, requesting user, and stated business purpose are written to the immutable audit log.
                </div>

                <div className="form-group">
                  <label className="form-label">Select Report Dataset:</label>
                  <select
                    className="form-select"
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                  >
                    <option value="FINANCIAL_REVENUE_EXCEPTION_SUMMARY">Financial Exceptions & Dispute Settlements</option>
                    <option value="SLA_THROUGHPUT_DEPARTMENTAL_METRICS">Departmental SLA Throughput & Attainment</option>
                    <option value="SHIFT_CONTINUITY_HANDOVER_RECORDS">Shift Turnover & Blocked Tasks Ledger</option>
                    <option value="INCIDENT_RESPONSE_TIME_AUDIT">Security & Emergency Incident Response Log</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mandatory Stated Business Purpose (Audit-logged):</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={exportPurpose}
                    onChange={e => setExportPurpose(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Actor: <strong>{currentUser.name}</strong> ({ROLE_DEFINITIONS[currentUser.role]?.name}) • PII Masking:{' '}
                  <strong>{dataPrivacyMasking ? 'Masked (DPDP Compliant)' : 'Raw (Managerial)'}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setExportModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Download size={14} /> Authorize & Export (AC-17)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
