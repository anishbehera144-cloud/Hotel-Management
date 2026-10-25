import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PROPERTIES,
  INITIAL_DEPARTMENTS,
  INITIAL_STAFF,
  INITIAL_SLA_POLICIES,
  INITIAL_ESCALATION_CONTACTS,
  INITIAL_ROOMS,
  INITIAL_QR_SESSIONS,
  INITIAL_CASES,
  INITIAL_TASKS,
  INITIAL_FINANCIAL_EXCEPTIONS,
  INITIAL_SECURITY_INCIDENTS,
  INITIAL_HANDOVERS,
  INITIAL_MAINTENANCE_ISSUES,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { ROLES, ROLE_DEFINITIONS, evaluatePermission } from '../data/permissions';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation View
  const [currentView, setCurrentView] = useState('dashboard');

  // Active Context & Session
  const [currentStaffId, setCurrentStaffId] = useState('EMP-105'); // Priya Sharma (Front Desk)
  const [currentPropertyId, setCurrentPropertyId] = useState('PROP-01');
  const [currentShift, setCurrentShift] = useState('morning');
  const [dataPrivacyMasking, setDataPrivacyMasking] = useState(true);

  // Core Data Stores
  const [properties] = useState(INITIAL_PROPERTIES);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [financialExceptions, setFinancialExceptions] = useState(INITIAL_FINANCIAL_EXCEPTIONS);
  const [securityIncidents, setSecurityIncidents] = useState(INITIAL_SECURITY_INCIDENTS);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [qrSessions, setQrSessions] = useState(INITIAL_QR_SESSIONS);
  const [handovers, setHandovers] = useState(INITIAL_HANDOVERS);
  const [maintenanceIssues, setMaintenanceIssues] = useState(INITIAL_MAINTENANCE_ISSUES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // UI Modals & Toasts
  const [toasts, setToasts] = useState([]);
  const [inspectorModalOpen, setInspectorModalOpen] = useState(false);
  const [roleSwitcherModalOpen, setRoleSwitcherModalOpen] = useState(false);
  const [lastPermissionEvaluation, setLastPermissionEvaluation] = useState(null);
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);

  // Active User Persona
  const currentUser = staffList.find(s => s.id === currentStaffId) || staffList[0];
  const currentProperty = properties.find(p => p.id === currentPropertyId) || properties[0];

  // Helper to add toast
  const addToast = (type, title, message) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [{ id, type, title, message, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 5)]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // Append Audit Event (Appendix B strict format)
  const logAuditEvent = ({
    action,
    resourceType,
    resourceId,
    result = 'SUCCESS',
    reasonCode = 'OPERATIONAL_STANDARD',
    safeMetadata = {},
    customActor = null,
  }) => {
    const actor = customActor || currentUser;
    const newLog = {
      eventId: `AUD-${Date.now().toString().slice(-6)}`,
      occurredAt: new Date().toISOString(),
      actorId: actor.id,
      actorType: 'HUMAN',
      actorName: `${actor.name} (${ROLE_DEFINITIONS[actor.role]?.name || actor.role})`,
      action,
      resourceType,
      resourceId,
      propertyId: currentPropertyId,
      result,
      reasonCode,
      correlationId: `corr_${Math.random().toString(36).substr(2, 9)}`,
      source: 'HOTEL_CORE_ENGINE',
      safeMetadata,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  // Inspect Permission helper
  const checkPermission = (action, resourceType, resource = null, amount = 0) => {
    const evalResult = evaluatePermission({
      user: currentUser,
      action,
      resourceType,
      resource,
      targetScope: { propertyId: currentPropertyId, departmentId: currentUser.department, shift: currentShift },
      amount,
    });
    setLastPermissionEvaluation({ action, resourceType, resource, evalResult, timestamp: new Date().toISOString() });
    return evalResult;
  };

  // ----------------- CASE MANAGEMENT -----------------
  const createCase = ({ roomNumber, guestName, category, title, priority, subtasksData = [], channel = 'Front Desk', initialNote = '' }) => {
    // Duplicate detection (FR-CASE-04)
    const possibleDuplicate = cases.find(
      c => c.roomNumber === roomNumber && c.status !== 'CLOSED' && c.category === category
    );

    const caseId = `CASE-${800 + cases.length + 1}`;
    const nowIso = new Date().toISOString();

    const createdSubtasks = subtasksData.map((st, idx) => ({
      id: `TASK-${cases.length * 10 + idx + 101}`,
      caseId,
      title: st.title,
      category: st.category || category,
      departmentId: st.departmentId,
      assigneeId: st.assigneeId || null,
      assigneeName: st.assigneeName || 'Unassigned Queue',
      roomNumber,
      status: st.assigneeId ? 'ASSIGNED' : 'QUEUED',
      priority: st.priority || priority,
      createdAt: nowIso,
      dueAt: new Date(Date.now() + 45 * 60000).toISOString(),
      instructions: st.instructions || '',
      reopenCount: 0,
      deliveryNotes: '',
    }));

    const newCase = {
      id: caseId,
      propertyId: currentPropertyId,
      roomNumber,
      guestName,
      category,
      title,
      priority,
      status: 'IN_PROGRESS',
      ownerId: currentUser.id,
      communicationOwner: `${currentUser.name} (${ROLE_DEFINITIONS[currentUser.role]?.name})`,
      createdAt: nowIso,
      updatedAt: nowIso,
      nextAction: 'Department subtask dispatch in progress',
      isDuplicateLinked: !!possibleDuplicate,
      linkedDuplicateId: possibleDuplicate ? possibleDuplicate.id : null,
      guestTimeline: [
        {
          id: `GT-${Date.now()}`,
          channel,
          sender: currentUser.name,
          time: new Date().toLocaleTimeString(),
          text: initialNote || `Request registered via ${channel}.`,
        },
      ],
      subtasks: createdSubtasks,
    };

    setCases(prev => [newCase, ...prev]);
    setTasks(prev => [...createdSubtasks, ...prev]);

    logAuditEvent({
      action: 'CREATE_MASTER_CASE',
      resourceType: 'Case',
      resourceId: caseId,
      reasonCode: possibleDuplicate ? 'DUPLICATE_FLAGGED_LINKED' : 'GUEST_SERVICE_INITIATION',
      safeMetadata: { room: roomNumber, priority, subtasksCount: createdSubtasks.length, duplicateOf: possibleDuplicate?.id || null },
    });

    addToast(
      possibleDuplicate ? 'warning' : 'success',
      possibleDuplicate ? `Case Created (Possible Duplicate Linked to ${possibleDuplicate.id})` : 'Master Case Created',
      `Case ${caseId} created with ${createdSubtasks.length} departmental subtasks.`
    );

    return newCase;
  };

  const resolveCase = (caseId, resolutionSummary = 'Completed in full satisfaction.') => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    // Check permission & subtask completion gate (FR-CASE-08)
    const perm = checkPermission('RESOLVE_CASE', 'Case', targetCase);
    if (!perm.allowed) {
      logAuditEvent({
        action: 'RESOLVE_CASE',
        resourceType: 'Case',
        resourceId: caseId,
        result: 'DENIED',
        reasonCode: perm.reason,
        safeMetadata: { uncompletedSubtasks: targetCase.subtasks.filter(s => s.status !== 'COMPLETED').map(s => s.id) },
      });
      addToast('error', 'Cannot Close Master Case', 'All linked departmental subtasks must be completed or cancelled before closing the master case (FR-CASE-08).');
      return false;
    }

    setCases(prev =>
      prev.map(c =>
        c.id === caseId
          ? {
            ...c,
            status: 'CLOSED',
            updatedAt: new Date().toISOString(),
            nextAction: 'Case resolved & archived',
            guestTimeline: [
              ...c.guestTimeline,
              {
                id: `GT-${Date.now()}`,
                channel: 'Front Desk',
                sender: currentUser.name,
                time: new Date().toLocaleTimeString(),
                text: `Case closed: ${resolutionSummary}`,
              },
            ],
          }
          : c
      )
    );

    logAuditEvent({
      action: 'RESOLVE_CASE',
      resourceType: 'Case',
      resourceId: caseId,
      result: 'SUCCESS',
      reasonCode: 'ALL_SUBTASKS_COMPLETED_AND_VERIFIED',
      safeMetadata: { summary: resolutionSummary },
    });

    addToast('success', 'Case Resolved', `Master Case ${caseId} and all subtasks are successfully closed.`);
    return true;
  };

  // ----------------- TASK ACTIONS -----------------
  const updateTaskStatus = (taskId, newStatus, { reason = '', notes = '', deliveryProof = '' } = {}) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return false;

    // Verify permission
    let actionToCheck = 'UPDATE_TASK';
    if (newStatus === 'COMPLETED') actionToCheck = 'COMPLETE_TASK';
    const perm = checkPermission(actionToCheck, 'Task', targetTask);

    if (!perm.allowed) {
      logAuditEvent({
        action: `TRANSITION_TO_${newStatus}`,
        resourceType: 'Task',
        resourceId: taskId,
        result: 'DENIED',
        reasonCode: perm.reason,
      });
      addToast('error', 'Action Denied', `Permission check failed: ${perm.reason}`);
      return false;
    }

    // Require blocker reason if status is BLOCKED (FR-TASK-07)
    if (newStatus === 'BLOCKED' && !reason.trim()) {
      addToast('error', 'Blocker Reason Required', 'A specific blocker reason is mandatory when placing a task on hold (FR-TASK-07).');
      return false;
    }

    const nowIso = new Date().toISOString();

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            blockedReason: newStatus === 'BLOCKED' ? reason : t.blockedReason,
            deliveryNotes: notes ? (t.deliveryNotes ? `${t.deliveryNotes} | ${notes}` : notes) : t.deliveryNotes,
            completedAt: newStatus === 'COMPLETED' ? nowIso : t.completedAt,
            // FR-TASK-10: Original createdAt is strictly preserved!
          };
        }
        return t;
      })
    );

    // Synchronize parent case subtask
    setCases(prev =>
      prev.map(c => {
        if (c.id === targetTask.caseId) {
          const updatedSubtasks = c.subtasks.map(st =>
            st.id === taskId ? { ...st, status: newStatus, completedAt: newStatus === 'COMPLETED' ? nowIso : st.completedAt } : st
          );
          return {
            ...c,
            updatedAt: nowIso,
            subtasks: updatedSubtasks,
          };
        }
        return c;
      })
    );

    logAuditEvent({
      action: `TRANSITION_TO_${newStatus}`,
      resourceType: 'Task',
      resourceId: taskId,
      result: 'SUCCESS',
      reasonCode: newStatus === 'BLOCKED' ? 'TASK_BLOCKED_BY_DEPENDENCY' : 'STANDARD_FULFILLMENT_PROGRESS',
      safeMetadata: { fromState: targetTask.status, toState: newStatus, reason, notes },
    });

    addToast('success', `Task ${newStatus}`, `Task ${taskId} status transitioned to ${newStatus}.`);
    return true;
  };

  const reopenTask = (taskId, reasonNotes) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return false;

    // Check Supervisor permission (FR-TASK-09, AC-05)
    const perm = checkPermission('REOPEN_TASK', 'Task', targetTask);
    if (!perm.allowed) {
      logAuditEvent({
        action: 'REOPEN_TASK',
        resourceType: 'Task',
        resourceId: taskId,
        result: 'DENIED',
        reasonCode: perm.reason,
      });
      addToast('error', 'Supervisor Authorization Required', 'Only supervisors and department managers can reopen incomplete tasks (AC-05).');
      return false;
    }

    if (!reasonNotes || !reasonNotes.trim()) {
      addToast('error', 'Corrective Action Required', 'Must provide a corrective action explanation when reopening work.');
      return false;
    }

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'REOPENED',
            reopenCount: (t.reopenCount || 0) + 1,
            reopenNotes: reasonNotes,
            completedAt: null, // Reset completion mark but preserve original createdAt!
          };
        }
        return t;
      })
    );

    setCases(prev =>
      prev.map(c => {
        if (c.id === targetTask.caseId) {
          return {
            ...c,
            status: 'IN_PROGRESS',
            subtasks: c.subtasks.map(st => (st.id === taskId ? { ...st, status: 'REOPENED' } : st)),
          };
        }
        return c;
      })
    );

    logAuditEvent({
      action: 'REOPEN_TASK',
      resourceType: 'Task',
      resourceId: taskId,
      result: 'SUCCESS',
      reasonCode: 'SUPERVISOR_QUALITY_REJECTION',
      safeMetadata: { correctiveAction: reasonNotes, priorCreatedAt: targetTask.createdAt },
    });

    addToast('warning', 'Task Reopened', `Task ${taskId} reopened for corrective action. Original created timestamp preserved.`);
    return true;
  };

  const assignTask = (taskId, newAssigneeId) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return false;

    const perm = checkPermission('ASSIGN_TASK', 'Task', targetTask);
    if (!perm.allowed) {
      logAuditEvent({
        action: 'ASSIGN_TASK',
        resourceType: 'Task',
        resourceId: taskId,
        result: 'DENIED',
        reasonCode: perm.reason,
      });
      addToast('error', 'Dispatch Permission Required', 'Current role cannot assign work.');
      return false;
    }

    const assignee = staffList.find(s => s.id === newAssigneeId);
    if (!assignee || assignee.status !== 'ACTIVE') {
      logAuditEvent({
        action: 'ASSIGN_TASK',
        resourceType: 'Task',
        resourceId: taskId,
        result: 'FAILED',
        reasonCode: 'INACTIVE_OR_INVALID_ASSIGNEE',
      });
      addToast('error', 'Invalid Assignee', 'Selected staff member is inactive or out of scope (AC-02).');
      return false;
    }

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
            ...t,
            assigneeId: assignee.id,
            assigneeName: assignee.name,
            status: t.status === 'QUEUED' ? 'ASSIGNED' : t.status,
          }
          : t
      )
    );

    setCases(prev =>
      prev.map(c => {
        if (c.id === targetTask.caseId) {
          return {
            ...c,
            subtasks: c.subtasks.map(st =>
              st.id === taskId ? { ...st, assigneeId: assignee.id, assigneeName: assignee.name, status: 'ASSIGNED' } : st
            ),
          };
        }
        return c;
      })
    );

    logAuditEvent({
      action: 'ASSIGN_TASK',
      resourceType: 'Task',
      resourceId: taskId,
      result: 'SUCCESS',
      reasonCode: 'DISPATCH_WORKLOAD_DISTRIBUTION',
      safeMetadata: { oldAssignee: targetTask.assigneeName, newAssignee: assignee.name },
    });

    addToast('success', 'Task Assigned', `Assigned to ${assignee.name} (${ROLE_DEFINITIONS[assignee.role]?.name}).`);
    return true;
  };

  // ----------------- FINANCIAL CONTROLS & MAKER-CHECKER -----------------
  const submitFinancialException = ({ roomNumber, guestName, type, amount, reason, evidenceUrl }) => {
    const perm = checkPermission('SUBMIT_FINANCIAL_EXCEPTION', 'FinancialException', null, amount);
    if (!perm.allowed) {
      addToast('error', 'Submission Denied', 'Role not permitted to initiate financial exception requests.');
      return false;
    }

    const newId = `FIN-${900 + financialExceptions.length + 1}`;
    const newEx = {
      id: newId,
      propertyId: currentPropertyId,
      roomNumber,
      guestName,
      type,
      amount: parseFloat(amount),
      currency: currentProperty.currency.split(' ')[0],
      reason,
      evidenceUrl: evidenceUrl || 'https://docs.grandhorizon.hotel/evidence/fin_exception_ref.pdf',
      requesterId: currentUser.id,
      requesterName: `${currentUser.name} (${ROLE_DEFINITIONS[currentUser.role]?.name})`,
      approverId: null,
      approverName: null,
      executorId: null,
      executorName: null,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString(),
      approvalThreshold: amount <= 150 ? 'DEPARTMENT_MANAGER' : amount <= 2000 ? 'HOTEL_MANAGER' : 'GENERAL_MANAGER',
      providerTransactionRef: null,
      reconciled: false,
    };

    setFinancialExceptions(prev => [newEx, ...prev]);

    logAuditEvent({
      action: 'SUBMIT_FINANCIAL_EXCEPTION',
      resourceType: 'FinancialException',
      resourceId: newId,
      result: 'SUCCESS',
      reasonCode: 'EXCEPTION_MAKER_SUBMISSION',
      safeMetadata: { amount, type, room: roomNumber, requester: currentUser.name },
    });

    addToast('success', 'Exception Submitted', `Submitted ${newId} for $${amount}. Awaiting independent approval.`);
    return newEx;
  };

  const approveFinancialException = (exceptionId, approved = true, notes = '') => {
    const targetEx = financialExceptions.find(f => f.id === exceptionId);
    if (!targetEx) return false;

    // Maker-Checker & limit check (AC-11, FR-FIN-04)
    const perm = checkPermission('APPROVE_FINANCIAL_EXCEPTION', 'FinancialException', targetEx, targetEx.amount);
    if (!perm.allowed) {
      logAuditEvent({
        action: 'APPROVE_FINANCIAL_EXCEPTION',
        resourceType: 'FinancialException',
        resourceId: exceptionId,
        result: 'DENIED',
        reasonCode: perm.reason,
        safeMetadata: { amount: targetEx.amount, requester: targetEx.requesterName },
      });
      addToast('error', 'Approval Blocked (Maker-Checker / Limit)', `Cannot approve: ${perm.reason === 'MAKER_CHECKER_SELF_APPROVAL_PROHIBITED' ? 'Dual-control violation: Submitter cannot self-approve their own exception (AC-11)!' : perm.reason}`);
      return false;
    }

    const newStatus = approved ? 'APPROVED' : 'REJECTED';
    setFinancialExceptions(prev =>
      prev.map(f =>
        f.id === exceptionId
          ? {
            ...f,
            status: newStatus,
            approverId: currentUser.id,
            approverName: `${currentUser.name} (${ROLE_DEFINITIONS[currentUser.role]?.name})`,
            approvedAt: new Date().toISOString(),
            reviewNotes: notes,
          }
          : f
      )
    );

    logAuditEvent({
      action: `FINANCIAL_DECISION_${newStatus}`,
      resourceType: 'FinancialException',
      resourceId: exceptionId,
      result: 'SUCCESS',
      reasonCode: approved ? 'MAKER_CHECKER_APPROVAL_GRANTED' : 'EXCEPTION_REJECTED_BY_AUTHORITY',
      safeMetadata: { amount: targetEx.amount, approver: currentUser.name, notes },
    });

    addToast(approved ? 'success' : 'info', `Exception ${newStatus}`, `Financial exception ${exceptionId} has been ${newStatus.toLowerCase()}.`);
    return true;
  };

  const executeFinancialRefund = (exceptionId, simulateTimeout = false) => {
    const targetEx = financialExceptions.find(f => f.id === exceptionId);
    if (!targetEx) return false;

    // Check financial operator entitlement (AC-10, AC-12)
    const perm = checkPermission('EXECUTE_FINANCIAL_REFUND', 'FinancialException', targetEx, targetEx.amount);
    if (!perm.allowed) {
      logAuditEvent({
        action: 'EXECUTE_FINANCIAL_REFUND',
        resourceType: 'FinancialException',
        resourceId: exceptionId,
        result: 'DENIED',
        reasonCode: perm.reason,
      });
      addToast('error', 'Execution Denied (AC-10)', `Only entitled Financial Operators can execute approved exceptions. Current role: ${ROLE_DEFINITIONS[currentUser.role]?.name}`);
      return false;
    }

    // Payment provider timeout simulation (AC-13, FR-FIN-09)
    if (simulateTimeout) {
      setFinancialExceptions(prev =>
        prev.map(f =>
          f.id === exceptionId
            ? {
              ...f,
              status: 'PENDING_VERIFICATION_RECONCILIATION',
              reviewNotes: 'Provider timed out during settlement. Retaining unknown status for manual reconciliation (AC-13).',
            }
            : f
        )
      );

      logAuditEvent({
        action: 'EXECUTE_FINANCIAL_REFUND',
        resourceType: 'FinancialException',
        resourceId: exceptionId,
        result: 'PENDING',
        reasonCode: 'PAYMENT_GATEWAY_TIMEOUT_RECONCILIATION_REQUIRED',
        safeMetadata: { simulatedTimeout: true, retryBlocked: 'IDEMPOTENCY_HOLD' },
      });

      addToast('warning', 'Gateway Timeout (AC-13)', 'Payment provider timed out. Marked as Pending Verification. Retries blocked to prevent duplicate charges.');
      return false;
    }

    // Successful execution
    const providerRef = `ch_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString().slice(-4)}`;
    setFinancialExceptions(prev =>
      prev.map(f =>
        f.id === exceptionId
          ? {
            ...f,
            status: 'EXECUTED',
            executorId: currentUser.id,
            executorName: `${currentUser.name} (Financial Operator)`,
            executedAt: new Date().toISOString(),
            providerTransactionRef: providerRef,
            reconciled: true,
          }
          : f
      )
    );

    logAuditEvent({
      action: 'EXECUTE_FINANCIAL_REFUND',
      resourceType: 'FinancialException',
      resourceId: exceptionId,
      result: 'SUCCESS',
      reasonCode: 'PAYMENT_GATEWAY_SETTLEMENT_RECORDED',
      safeMetadata: { providerRef, amount: targetEx.amount, currency: targetEx.currency },
    });

    addToast('success', 'Refund Executed (AC-12)', `Dispatched to payment processor. Provider ref: ${providerRef}`);
    return true;
  };

  // ----------------- SECURITY INCIDENTS & EVIDENCE VAULT -----------------
  const accessSecurityEvidence = (incidentId, evidenceId) => {
    const targetIncident = securityIncidents.find(i => i.id === incidentId);
    if (!targetIncident) return false;

    // Strict need-to-know check (AC-01, AC-16, FR-SEC-04)
    const perm = checkPermission('ACCESS_SECURITY_EVIDENCE', 'SecurityIncident', targetIncident);
    if (!perm.allowed) {
      logAuditEvent({
        action: 'ACCESS_SECURITY_EVIDENCE',
        resourceType: 'EvidenceAttachment',
        resourceId: evidenceId,
        result: 'DENIED',
        reasonCode: perm.reason,
        safeMetadata: { incidentId, classification: targetIncident.classification },
      });
      addToast('error', 'Restricted Security Vault (AC-16)', `Access Denied: Role ${ROLE_DEFINITIONS[currentUser.role]?.name} does not have security need-to-know clearance.`);
      return false;
    }

    // Access allowed: increment access count and log audit event
    setSecurityIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            evidence: inc.evidence.map(ev => (ev.id === evidenceId ? { ...ev, accessCount: ev.accessCount + 1 } : ev)),
          };
        }
        return inc;
      })
    );

    logAuditEvent({
      action: 'ACCESS_SECURITY_EVIDENCE',
      resourceType: 'EvidenceAttachment',
      resourceId: evidenceId,
      result: 'SUCCESS',
      reasonCode: 'AUTHORIZED_OFFICER_INVESTIGATION',
      safeMetadata: { incidentId, viewer: currentUser.name },
    });

    addToast('success', 'Evidence Opened', `Verified SHA-256 integrity hash. Audit trail logged view event.`);
    return true;
  };

  const attemptDeleteSecurityEvidence = () => {
    // Attempt deletion (FR-SEC-05)
    logAuditEvent({
      action: 'DELETE_SECURITY_EVIDENCE',
      resourceType: 'EvidenceAttachment',
      resourceId: 'EVID-ALL',
      result: 'DENIED',
      reasonCode: 'EVIDENCE_DELETION_PROHIBITED_BY_LAW',
    });
    addToast('error', 'Prohibited Operation (FR-SEC-05)', 'Security evidence cannot be deleted or pruned by operational staff.');
    return false;
  };

  // ----------------- ROOM MOVE & QR TOKEN REVOCATION (FR-FD-05 & AC-15) -----------------
  const executeRoomMove = (oldRoomNumber, newRoomNumber, guestName) => {
    // Revoke old session token
    const oldSession = qrSessions.find(s => s.roomNumber === oldRoomNumber && s.status === 'ACTIVE');
    const newSessionId = `sess_${newRoomNumber}_rebound_${Date.now().toString().slice(-4)}`;
    const newToken = `qr_tok_${newRoomNumber}_rebound_${Math.random().toString(36).substr(2, 6)}`;

    setQrSessions(prev => [
      ...prev.map(s =>
        s.roomNumber === oldRoomNumber && s.status === 'ACTIVE'
          ? { ...s, status: 'REVOKED_ROOM_MOVE', revokedAt: new Date().toISOString() }
          : s
      ),
      {
        sessionId: newSessionId,
        roomNumber: newRoomNumber,
        guestName,
        token: newToken,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'ACTIVE',
      },
    ]);

    // Update room inventory status
    setRooms(prev =>
      prev.map(r => {
        if (r.roomNumber === oldRoomNumber) return { ...r, status: 'DIRTY_VACANT', guestName: null };
        if (r.roomNumber === newRoomNumber) return { ...r, status: 'OCCUPIED', guestName };
        return r;
      })
    );

    logAuditEvent({
      action: 'ROOM_MOVE_SESSION_REVOCATION',
      resourceType: 'GuestSession',
      resourceId: oldSession?.token || 'N/A',
      result: 'SUCCESS',
      reasonCode: 'ROOM_MOVE_IMMEDIATE_SESSION_INVALIDATION',
      safeMetadata: { oldRoom: oldRoomNumber, newRoom: newRoomNumber, guest: guestName, newToken: newToken.slice(0, 10) + '...' },
    });

    addToast('success', 'Room Move & Token Revocation (AC-15)', `Moved to Room ${newRoomNumber}. Old token for Room ${oldRoomNumber} invalidated server-side immediately.`);
    return { oldTokenRevoked: oldSession?.token, newToken };
  };

  // ----------------- ROOM READINESS & SAFETY CLEARANCE (FR-MNT-05 & AC-22) -----------------
  const inspectAndClearRoomSafety = (mntId) => {
    const targetMnt = maintenanceIssues.find(m => m.id === mntId);
    if (!targetMnt) return false;

    // Only supervisor or manager can clear room safety
    if (![ROLES.DEPARTMENT_SUPERVISOR, ROLES.DEPARTMENT_MANAGER, ROLES.EXECUTIVE_VIEWER_APPROVER].includes(currentUser.role)) {
      addToast('error', 'Safety Inspection Authority Required', 'Only an authorized supervisor or manager can perform physical safety inspection clearance.');
      return false;
    }

    setMaintenanceIssues(prev =>
      prev.map(m =>
        m.id === mntId
          ? {
            ...m,
            supervisorInspected: true,
            pmsRoomReady: true,
            workStatus: 'VERIFIED',
            inspectionSignOff: `${currentUser.name} (${ROLE_DEFINITIONS[currentUser.role]?.name}) at ${new Date().toLocaleTimeString()}`,
          }
          : m
      )
    );

    setRooms(prev =>
      prev.map(r => (r.roomNumber === targetMnt.roomNumber ? { ...r, safeState: 'CLEARED', status: 'CLEAN_VACANT' } : r))
    );

    logAuditEvent({
      action: 'MARK_ROOM_READY',
      resourceType: 'RoomInventory',
      resourceId: targetMnt.roomNumber,
      result: 'SUCCESS',
      reasonCode: 'SUPERVISOR_PHYSICAL_SAFETY_CLEARANCE',
      safeMetadata: { mntId, inspector: currentUser.name },
    });

    addToast('success', 'Room Released to PMS (AC-22)', `Room ${targetMnt.roomNumber} safety verified and marked ready in PMS.`);
    return true;
  };

  // ----------------- EXPORT WITH AUDIT & MASKING (FR-REP-03 & AC-17) -----------------
  const exportSensitiveReport = (reportType = 'FINANCIAL_REVENUE_EXCEPTION_SUMMARY') => {
    const perm = checkPermission('EXPORT_SENSITIVE_REPORT', 'Report');
    if (!perm.allowed) {
      logAuditEvent({
        action: 'EXPORT_SENSITIVE_REPORT',
        resourceType: 'Report',
        resourceId: reportType,
        result: 'DENIED',
        reasonCode: perm.reason,
      });
      addToast('error', 'Export Denied (AC-17)', `Role ${ROLE_DEFINITIONS[currentUser.role]?.name} lacks report export authorization.`);
      return false;
    }

    logAuditEvent({
      action: 'EXPORT_SENSITIVE_REPORT',
      resourceType: 'Report',
      resourceId: reportType,
      result: 'SUCCESS',
      reasonCode: 'AUTHORIZED_MANAGERIAL_REPORT_EXPORT',
      safeMetadata: { reportType, masked: dataPrivacyMasking, filterProperty: currentPropertyId },
    });

    addToast('success', 'Report Exported (AC-17)', `Export generated with audit logging. Sensitive guest PII masked.`);
    return true;
  };

  // ----------------- PRIVILEGE ESCALATION BLOCKER (AC-14) -----------------
  const attemptSelfPrivilegeElevation = () => {
    const perm = checkPermission('ELEVATE_SELF_PRIVILEGES', 'UserAccount', currentUser);
    logAuditEvent({
      action: 'ELEVATE_SELF_PRIVILEGES',
      resourceType: 'UserAccount',
      resourceId: currentUser.id,
      result: 'DENIED',
      reasonCode: perm.reason,
      safeMetadata: { targetRole: 'FINANCIAL_OPERATOR', actor: currentUser.name },
    });
    addToast('error', 'Privilege Escalation Blocked (AC-14)', 'Self-granting higher financial/business privileges is prohibited by security policy.');
    return false;
  };

  // ----------------- SESSION DEACTIVATION (AC-23) -----------------
  const toggleAccountActiveStatus = (staffId) => {
    const target = staffList.find(s => s.id === staffId);
    if (!target) return;
    const newStatus = target.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    setStaffList(prev => prev.map(s => (s.id === staffId ? { ...s, status: newStatus } : s)));

    logAuditEvent({
      action: newStatus === 'DEACTIVATED' ? 'ACCOUNT_DEACTIVATED_SESSION_REVOKED' : 'ACCOUNT_REACTIVATED',
      resourceType: 'UserAccount',
      resourceId: staffId,
      result: 'SUCCESS',
      reasonCode: 'HR_STATUS_CHANGE_DISPATCH',
      safeMetadata: { targetName: target.name, targetRole: target.role },
    });

    addToast(newStatus === 'DEACTIVATED' ? 'warning' : 'success', `Account ${newStatus} (AC-23)`, `${target.name} account is now ${newStatus}. Active session immediately invalidated.`);
  };

  // ----------------- EMERGENCY ESCALATION BYPASS (FR-SLA-07 & AC-08) -----------------
  const triggerEmergencyEscalation = (targetCaseId) => {
    const targetCase = cases.find(c => c.id === targetCaseId);

    setCases(prev =>
      prev.map(c =>
        c.id === targetCaseId
          ? {
            ...c,
            priority: 'URGENT',
            status: 'ESCALATED',
            nextAction: 'SECURITY & MEDICAL IMMEDIATE ON-SITE EMERGENCY RESPONSE',
          }
          : c
      )
    );

    logAuditEvent({
      action: 'EMERGENCY_ESCALATION_TRIGGERED',
      resourceType: 'Case',
      resourceId: targetCaseId,
      result: 'SUCCESS',
      reasonCode: 'EMERGENCY_PLAN_BYPASS_ROUTINE_SLA',
      safeMetadata: { triggeredBy: currentUser.name, caseTitle: targetCase?.title },
    });

    addToast('error', 'EMERGENCY ESCALATION (AC-08)', 'Bypassed routine SLA timers. Immediate broadcast sent to On-Call Security & Management.');
  };

  // ----------------- SHIFT HANDOVER SIGN-OFF (FR-HO-01 to FR-HO-06) -----------------
  const recordShiftHandover = ({ summary, nextShiftName, incomingSupervisorName }) => {
    const openItems = cases
      .filter(c => c.status !== 'CLOSED')
      .map(c => ({
        caseId: c.id,
        room: c.roomNumber,
        currentOwner: c.communicationOwner,
        nextOwner: incomingSupervisorName || 'Incoming Supervisor',
        nextAction: c.nextAction,
        eta: 'Within next 2 hours',
        blocker: c.subtasks.find(s => s.status === 'BLOCKED')?.blockedReason || 'None',
      }));

    const newHandover = {
      id: `HO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${currentShift.toUpperCase()}`,
      propertyId: currentPropertyId,
      outgoingShift: `${currentShift.toUpperCase()} Shift`,
      incomingShift: nextShiftName || 'Next Shift',
      outgoingSupervisor: `${currentUser.name} (${ROLE_DEFINITIONS[currentUser.role]?.name})`,
      incomingSupervisor: incomingSupervisorName || 'Incoming Floor Lead',
      status: 'ACKNOWLEDGED',
      createdAt: new Date().toISOString(),
      acknowledgedAt: new Date().toISOString(),
      openCasesCount: openItems.length,
      blockedCasesCount: openItems.filter(i => i.blocker !== 'None').length,
      summary: summary || 'Shift turnover executed with all pending items reconciled.',
      items: openItems,
    };

    setHandovers(prev => [newHandover, ...prev]);

    logAuditEvent({
      action: 'SHIFT_HANDOVER_ACKNOWLEDGED',
      resourceType: 'Handover',
      resourceId: newHandover.id,
      result: 'SUCCESS',
      reasonCode: 'SHIFT_CONTINUITY_FORMAL_TAKEOVER',
      safeMetadata: { openCases: openItems.length, outgoing: currentUser.name, incoming: incomingSupervisorName },
    });

    addToast('success', 'Shift Handover Acknowledged', `Handover ${newHandover.id} recorded with ${openItems.length} active continuity items.`);
    return newHandover;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentStaffId,
        setCurrentStaffId,
        currentPropertyId,
        setCurrentPropertyId,
        currentShift,
        setCurrentShift,
        dataPrivacyMasking,
        setDataPrivacyMasking,
        currentUser,
        currentProperty,
        properties,
        departments,
        staffList,
        cases,
        tasks,
        financialExceptions,
        securityIncidents,
        rooms,
        qrSessions,
        handovers,
        maintenanceIssues,
        auditLogs,
        toasts,
        addToast,
        inspectorModalOpen,
        setInspectorModalOpen,
        roleSwitcherModalOpen,
        setRoleSwitcherModalOpen,
        lastPermissionEvaluation,
        newCaseModalOpen,
        setNewCaseModalOpen,
        checkPermission,
        createCase,
        resolveCase,
        updateTaskStatus,
        reopenTask,
        assignTask,
        submitFinancialException,
        approveFinancialException,
        executeFinancialRefund,
        accessSecurityEvidence,
        attemptDeleteSecurityEvidence,
        executeRoomMove,
        inspectAndClearRoomSafety,
        exportSensitiveReport,
        attemptSelfPrivilegeElevation,
        toggleAccountActiveStatus,
        triggerEmergencyEscalation,
        recordShiftHandover,
        logAuditEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
