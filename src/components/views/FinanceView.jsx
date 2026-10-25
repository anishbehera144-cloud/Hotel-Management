import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../../data/permissions';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText,
  DollarSign,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';

export default function FinanceView() {
  const {
    financialExceptions,
    submitFinancialException,
    approveFinancialException,
    executeFinancialRefund,
    currentUser,
    dataPrivacyMasking,
    currentProperty,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('304');
  const [guestName, setGuestName] = useState('Charles Montgomery');
  const [type, setType] = useState('COMPENSATION_SERVICE_RECOVERY');
  const [amount, setAmount] = useState(120);
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('https://docs.grandhorizon.hotel/evidence/fin_receipt_claim.pdf');

  // Helper for masking PII
  const maskText = (text) => {
    if (!dataPrivacyMasking || !text) return text;
    const parts = text.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}***`;
    }
    return `${text.slice(0, 2)}***`;
  };

  const isFinancialOperator = currentUser.role === ROLES.FINANCIAL_OPERATOR;
  const isManagerOrExecutive = [
    ROLES.DEPARTMENT_MANAGER,
    ROLES.EXECUTIVE_VIEWER_APPROVER,
  ].includes(currentUser.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    submitFinancialException({
      roomNumber,
      guestName,
      type,
      amount,
      reason,
      evidenceUrl,
    });
    setModalOpen(false);
    setReason('');
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Receipt size={24} color="var(--accent-gold)" />
            Financial Controls & Separation of Duties (FR-FIN-01 to 09)
          </h2>
          <div className="view-subtitle">
            Maker-Checker dual-control approval, financial execution caps ($1,000 operator / $150 mgr / $2,000 exec), and timeout reconciliation.
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
          <PlusCircle size={15} /> Request Financial Exception (Maker)
        </button>
      </div>

      {/* Financial Governance Rules Strip */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          fontSize: '0.78rem',
        }}
      >
        <div>
          <strong style={{ color: 'var(--accent-gold-light)' }}>1. Maker-Checker Rule (AC-11):</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            Submitter can NEVER approve their own exception. Dual-control strictly enforced.
          </div>
        </div>

        <div>
          <strong style={{ color: 'var(--status-emerald)' }}>2. Execution Entitlement (AC-10 / 12):</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            Only entitled Financial Operators execute settlements. Front Desk can only request.
          </div>
        </div>

        <div>
          <strong style={{ color: 'var(--status-amber)' }}>3. Timeout Reconciliation (AC-13):</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            Provider timeouts transition to Pending Verification; automatic duplicate charges blocked.
          </div>
        </div>
      </div>

      {/* Main Table: Financial Exceptions Inbox */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <span>Financial Exception Ledger ({financialExceptions.length})</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Active Currency: {currentProperty.currency} • Stored as Decimal Minor Units (FR-FIN-08)
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference & Room</th>
                <th>Type & Reason</th>
                <th>Amount</th>
                <th>Maker (Requester)</th>
                <th>Status</th>
                <th>Approver (Checker)</th>
                <th>Execution Actions</th>
              </tr>
            </thead>
            <tbody>
              {financialExceptions.map(f => {
                const isUnderReview = f.status === 'UNDER_REVIEW';
                const isApproved = f.status === 'APPROVED';
                const isExecuted = f.status === 'EXECUTED';
                const isPendingRecon = f.status === 'PENDING_VERIFICATION_RECONCILIATION';
                const isOwnException = f.requesterId === currentUser.id;

                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#fff' }}>{f.id}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                        Room {f.roomNumber} ({maskText(f.guestName)})
                      </div>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>
                        {f.type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {f.reason}
                      </div>
                      <a
                        href="#evidence"
                        onClick={e => e.preventDefault()}
                        style={{ fontSize: '0.68rem', color: 'var(--accent-gold-light)', textDecoration: 'none' }}
                      >
                        [Attached Receipt Evidence]
                      </a>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.92rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                        £{f.amount.toFixed(2)}
                      </strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{f.currency}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 500 }}>
                        {f.requesterName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          background: isExecuted
                            ? 'var(--status-emerald-bg)'
                            : isApproved
                            ? 'rgba(14, 165, 233, 0.2)'
                            : isPendingRecon
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(255, 255, 255, 0.08)',
                          color: isExecuted
                            ? 'var(--status-emerald)'
                            : isApproved
                            ? 'var(--status-sky)'
                            : isPendingRecon
                            ? 'var(--status-amber)'
                            : '#fff',
                        }}
                      >
                        {f.status}
                      </span>
                      {f.providerTransactionRef && (
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          Ref: {f.providerTransactionRef.slice(0, 14)}...
                        </div>
                      )}
                    </td>

                    <td>
                      {f.approverName ? (
                        <div style={{ fontSize: '0.76rem', color: '#fff' }}>
                          <CheckCircle2 size={12} color="var(--status-emerald)" style={{ display: 'inline', marginRight: '4px' }} />
                          {f.approverName}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending Approval</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {/* Checker Approval Actions (AC-11 check: will fail if requester == currentUser) */}
                        {isUnderReview && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => approveFinancialException(f.id, true, 'Approved within threshold authority')}
                              title={isOwnException ? 'Self-approval is blocked by separation of duties (AC-11)' : 'Approve financial exception'}
                            >
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--status-crimson)' }}
                              onClick={() => approveFinancialException(f.id, false, 'Rejected by authority')}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}

                        {/* Execution Actions (AC-10 & AC-12): Gated to Financial Operator */}
                        {isApproved && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => executeFinancialRefund(f.id, false)}
                              title="Execute settlement via payment provider token (AC-12)"
                            >
                              <CreditCard size={12} /> Execute Refund (AC-12)
                            </button>

                            {/* Payment Timeout Simulation Button (AC-13) */}
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--status-amber)' }}
                              onClick={() => executeFinancialRefund(f.id, true)}
                              title="Simulate Payment Gateway Timeout (AC-13)"
                            >
                              <Clock size={12} /> Simulate Timeout (AC-13)
                            </button>
                          </>
                        )}

                        {isPendingRecon && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--status-amber)', fontWeight: 600 }}>
                            Awaiting Night Audit Reconciliation (AC-13)
                          </span>
                        )}

                        {isExecuted && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--status-emerald)', fontWeight: 600 }}>
                            Settled & Reconciled
                          </span>
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

      {/* Modal: Request Financial Exception (Maker Submission) */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Receipt size={18} color="var(--accent-gold)" />
                <span>Submit Financial Exception Request (Maker: FR-FIN-03)</span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Room Number:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Guest Name:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Exception Category:</label>
                    <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                      <option value="COMPENSATION_SERVICE_RECOVERY">Service Recovery Compensation</option>
                      <option value="ROOM_RATE_ADJUSTMENT">Room Rate / Disturbance Adjustment</option>
                      <option value="ERRONEOUS_MINIBAR_REVERSAL">Minibar Sensor Dispute Reversal</option>
                      <option value="LAUNDRY_GARMENT_DAMAGE">Damaged Laundry Garment Claim</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (£ / GBP):</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Justification & Reason:</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide operational reason and background facts..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proof / Evidence Document Reference URL:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={evidenceUrl}
                    onChange={e => setEvidenceUrl(e.target.value)}
                  />
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Submitted by: <strong>{currentUser.name}</strong> ({ROLE_DEFINITIONS[currentUser.role]?.name}).
                  Per policy, you will not be able to approve this request yourself.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit Exception to Inbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
