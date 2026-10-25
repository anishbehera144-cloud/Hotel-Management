import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, ROLES } from '../../data/permissions';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HardHat,
  DoorClosed,
  DoorOpen,
  UserCheck,
} from 'lucide-react';

export default function MaintenanceView() {
  const {
    maintenanceIssues,
    inspectAndClearRoomSafety,
    currentUser,
    tasks,
    updateTaskStatus,
  } = useApp();

  const isSupervisorOrManager = [
    ROLES.DEPARTMENT_SUPERVISOR,
    ROLES.DEPARTMENT_MANAGER,
    ROLES.EXECUTIVE_VIEWER_APPROVER,
  ].includes(currentUser.role);

  return (
    <div className="view-content-wrapper">
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            <Wrench size={24} color="var(--accent-gold)" />
            Maintenance & Room Safety Clearance (FR-MNT-01 to 06 & AC-22)
          </h2>
          <div className="view-subtitle">
            Vendor dispatch, ETA tracking, repair logging, and mandatory physical inspection clearance before releasing unsafe rooms to PMS inventory.
          </div>
        </div>
      </div>

      {/* Safety Clearance Rule Card (FR-MNT-05, AC-22) */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid var(--accent-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <HardHat size={26} color="var(--accent-gold)" />
        <div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>
            Room Readiness Safety Gate (FR-MNT-05 & AC-22)
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
            When a technician completes a repair in an unsafe/out-of-order room, the system strictly blocks automated release to ready PMS inventory until an authorized supervisor performs a physical safety clearance inspection.
          </div>
        </div>
      </div>

      {/* Maintenance Issues Table */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <span>Work Orders & Engineering Tickets ({maintenanceIssues.length})</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Supervisory Sign-off Mandatory for Safety Restricted Rooms
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID & Room</th>
                <th>Issue Description</th>
                <th>Assigned Vendor / Tech</th>
                <th>ETA</th>
                <th>Work Status</th>
                <th>Safety Restriction</th>
                <th>PMS Room Release</th>
                <th>Inspection Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceIssues.map(m => {
                const isCleared = m.supervisorInspected && m.pmsRoomReady;

                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#fff' }}>{m.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                        Room {m.roomNumber}
                      </div>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>{m.issue}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Notes: {m.technicianNotes}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 500 }}>{m.vendor}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.vendorContact}</div>
                    </td>

                    <td>
                      <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
                        {m.eta}
                      </span>
                    </td>

                    <td>
                      <span className={`badge badge-${m.workStatus.toLowerCase()}`}>{m.workStatus}</span>
                    </td>

                    <td>
                      {m.safetyRestricted ? (
                        <span className="badge badge-urgent" style={{ fontSize: '0.68rem' }}>
                          <AlertTriangle size={11} /> Unsafe / High Hazard
                        </span>
                      ) : (
                        <span className="badge badge-low" style={{ fontSize: '0.68rem' }}>
                          Standard Maintenance
                        </span>
                      )}
                    </td>

                    <td>
                      {m.pmsRoomReady ? (
                        <span className="badge badge-completed" style={{ fontSize: '0.68rem' }}>
                          <DoorOpen size={11} /> Released to PMS
                        </span>
                      ) : (
                        <span className="badge badge-blocked" style={{ fontSize: '0.68rem' }}>
                          <DoorClosed size={11} /> Blocked in PMS (AC-22)
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {!isCleared ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => inspectAndClearRoomSafety(m.id)}
                            title={
                              isSupervisorOrManager
                                ? 'Supervisor Physical Safety Inspection & Sign-off'
                                : 'Requires supervisor or manager role'
                            }
                          >
                            <ShieldCheck size={13} /> Supervisor Safety Sign-off (AC-22)
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: 'var(--status-emerald)', fontWeight: 600 }}>
                            <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            {m.inspectionSignOff}
                          </div>
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
    </div>
  );
}
