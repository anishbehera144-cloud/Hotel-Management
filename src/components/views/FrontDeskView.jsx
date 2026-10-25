import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Key,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Building,
} from 'lucide-react';

export default function FrontDeskView() {
  const {
    rooms,
    qrSessions,
    executeRoomMove,
    currentUser,
    dataPrivacyMasking,
  } = useApp();

  const [selectedSourceRoom, setSelectedSourceRoom] = useState('304');
  const [selectedTargetRoom, setSelectedTargetRoom] = useState('712');
  const [testOldTokenInput, setTestOldTokenInput] = useState('');
  const [tokenVerificationResult, setTokenVerificationResult] = useState(null);

  // Helper for masking PII
  const maskText = (text) => {
    if (!dataPrivacyMasking || !text) return text;
    const parts = text.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}***`;
    }
    return `${text.slice(0, 2)}***`;
  };

  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');
  const availableRooms = rooms.filter(r => r.status === 'CLEAN_VACANT');
  const sourceRoomObj = rooms.find(r => r.roomNumber === selectedSourceRoom);

  const handleRoomMoveSubmit = (e) => {
    e.preventDefault();
    if (!selectedSourceRoom || !selectedTargetRoom || !sourceRoomObj?.guestName) return;

    const res = executeRoomMove(selectedSourceRoom, selectedTargetRoom, sourceRoomObj.guestName);
    if (res?.oldTokenRevoked) {
      setTestOldTokenInput(res.oldTokenRevoked);
    }
  };

  const handleTestTokenApi = () => {
    if (!testOldTokenInput.trim()) return;

    // Check against qrSessions
    const session = qrSessions.find(s => s.token === testOldTokenInput.trim());

    if (!session) {
      setTokenVerificationResult({
        valid: false,
        statusCode: 401,
        message: 'TOKEN_UNKNOWN: QR session token does not exist in registry.',
      });
    } else if (session.status !== 'ACTIVE') {
      setTokenVerificationResult({
        valid: false,
        statusCode: 401,
        message: `TOKEN_REVOKED (${session.status}): Prior room-linked session was invalidated immediately upon room move / departure (FR-FD-05, AC-15).`,
      });
    } else {
      setTokenVerificationResult({
        valid: true,
        statusCode: 200,
        message: `TOKEN_ACTIVE: Authorized for Room ${session.roomNumber} (${session.guestName}).`,
      });
    }
  };

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Key size={24} color="var(--accent-gold)" />
            Front Desk & Room Move Session Revocation (FR-FD-01 to 08 & AC-15)
          </h2>
          <div className="view-subtitle">
            Reservation synchronization, identity validation, suite transfers, and server-side QR guest session invalidation.
          </div>
        </div>
      </div>

      {/* Two Column Grid: Left Room Inventory & Right Room Move / Token Revocation Engine */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: '1.5rem' }}>
        {/* Left Column: Room Inventory & Status Table */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <DoorOpen size={18} color="var(--accent-gold)" />
              <span>Room Status & Active Guest Sessions ({rooms.length})</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type & Floor</th>
                  <th>Current Guest</th>
                  <th>PMS Status</th>
                  <th>Safety State</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.roomNumber}>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{r.roomNumber}</strong>
                    </td>
                    <td>
                      <div style={{ color: '#fff', fontSize: '0.78rem' }}>{r.type}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Floor {r.floor}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: r.guestName ? '#fff' : 'var(--text-muted)' }}>
                        {r.guestName ? maskText(r.guestName) : 'Vacant'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            r.status === 'OCCUPIED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : r.status === 'CLEAN_VACANT'
                              ? 'rgba(14, 165, 233, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            r.status === 'OCCUPIED'
                              ? 'var(--status-emerald)'
                              : r.status === 'CLEAN_VACANT'
                              ? 'var(--status-sky)'
                              : 'var(--status-crimson)',
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: r.safeState === 'CLEARED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: r.safeState === 'CLEARED' ? 'var(--status-emerald)' : 'var(--status-crimson)',
                        }}
                      >
                        {r.safeState}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Room Move Workflow & Token Revocation Proof (AC-15) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Room Move Simulator Card */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <RefreshCw size={18} color="var(--accent-gold)" />
                <span>Execute Room Move & Rebind Session (FR-FD-05 / AC-15)</span>
              </div>
            </div>

            <form onSubmit={handleRoomMoveSubmit}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Per <strong>FR-FD-05 & AC-15</strong>: Upon suite transfer or departure, the system must immediately invalidate prior room-linked tokens at the server layer. The app does not rely only on hiding the QR code.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Source Occupied Room:</label>
                    <select
                      className="form-select"
                      value={selectedSourceRoom}
                      onChange={e => setSelectedSourceRoom(e.target.value)}
                    >
                      {occupiedRooms.map(r => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} ({maskText(r.guestName)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Vacant Ready Room:</label>
                    <select
                      className="form-select"
                      value={selectedTargetRoom}
                      onChange={e => setSelectedTargetRoom(e.target.value)}
                    >
                      {availableRooms.map(r => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Guest to Transfer: <strong>{maskText(sourceRoomObj?.guestName || 'None')}</strong> • Initiator:{' '}
                  <strong>{currentUser.name} (Front Desk)</strong>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <RefreshCw size={14} /> Execute Room Move & Revoke Old Session (AC-15)
                </button>
              </div>
            </form>
          </div>

          {/* Live Token Verification / Penetration Tool (Testing AC-15) */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <QrCode size={18} color="var(--accent-indigo)" />
                <span>Server-Side QR Session Token Verifier (AC-15 Proof)</span>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Test whether an old token can still query guest data or make requests after room transfer:
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                  placeholder="Paste token string (e.g. qr_tok_304_alpha_live)..."
                  value={testOldTokenInput}
                  onChange={e => setTestOldTokenInput(e.target.value)}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleTestTokenApi}>
                  Verify Token API
                </button>
              </div>

              {/* API Response Display */}
              {tokenVerificationResult && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: tokenVerificationResult.valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${tokenVerificationResult.valid ? 'var(--status-emerald)' : 'var(--status-crimson)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  {tokenVerificationResult.valid ? (
                    <CheckCircle2 size={20} color="var(--status-emerald)" style={{ marginTop: '2px' }} />
                  ) : (
                    <XCircle size={20} color="var(--status-crimson)" style={{ marginTop: '2px' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: tokenVerificationResult.valid ? 'var(--status-emerald)' : 'var(--status-crimson)' }}>
                      HTTP {tokenVerificationResult.statusCode} — {tokenVerificationResult.valid ? 'AUTHORIZED' : 'ACCESS DENIED'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {tokenVerificationResult.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Active Session Directory Table */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Live Session Registry (Server-side Table):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {qrSessions.map(s => (
                    <div
                      key={s.sessionId}
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#fff' }}>Room {s.roomNumber}</strong>: {maskText(s.guestName)}
                        <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                          {s.token.slice(0, 16)}...
                        </span>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: s.status === 'ACTIVE' ? 'var(--status-emerald-bg)' : 'var(--status-crimson-bg)',
                          color: s.status === 'ACTIVE' ? 'var(--status-emerald)' : 'var(--status-crimson)',
                          fontSize: '0.62rem',
                        }}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
