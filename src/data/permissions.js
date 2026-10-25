// Role definitions and permission matrix per PRD Section 4 & Section 10

export const ROLES = {
  TASK_FULFILLER: 'task_fulfiller',
  DEPARTMENT_DISPATCHER: 'department_dispatcher',
  DEPARTMENT_SUPERVISOR: 'department_supervisor',
  DEPARTMENT_MANAGER: 'department_manager',
  FRONT_DESK_COORDINATOR: 'front_desk_coordinator',
  FINANCIAL_OPERATOR: 'financial_operator',
  SECURITY_RESPONDER: 'security_responder',
  EXECUTIVE_VIEWER_APPROVER: 'executive_viewer_approver',
  PLATFORM_ADMINISTRATOR: 'platform_administrator',
};

export const ROLE_DEFINITIONS = {
  [ROLES.TASK_FULFILLER]: {
    id: ROLES.TASK_FULFILLER,
    name: 'Task Fulfiller',
    typicalUsers: 'Attendants, runners, bell staff, servers',
    badgeColor: '#0284c7', // Sky blue
    description: 'Executes assigned work, records progress, delivery confirmation, and reports blockers.',
    financialLimit: 0,
    dashboardTitle: 'Attendant & Runner Workstation',
    primaryServices: [
      { id: 'dashboard', label: 'Shift Workspace', icon: 'LayoutDashboard' },
      { id: 'my_tasks', label: 'My Assigned Work', icon: 'CheckSquare' },
    ],
    boundaries: [
      'No access to full guest folios',
      'No refund or compensation execution',
      'Cannot reassign colleagues',
      'Cannot override entry, safety, or PMS room clearance restrictions',
    ],
  },
  [ROLES.DEPARTMENT_DISPATCHER]: {
    id: ROLES.DEPARTMENT_DISPATCHER,
    name: 'Department Dispatcher',
    typicalUsers: 'Housekeeping coordinators, bell captains, IRD order takers',
    badgeColor: '#0d9488', // Teal
    description: 'Monitors scoped queue, staff availability, assigns tasks, creates subtasks, links duplicates.',
    financialLimit: 0,
    dashboardTitle: 'Department Dispatch Command',
    primaryServices: [
      { id: 'dashboard', label: 'Dispatch Overview', icon: 'LayoutDashboard' },
      { id: 'dispatch_board', label: 'Queue & Staff Load', icon: 'GitFork' },
      { id: 'cases', label: 'Guest Cases & Tasks', icon: 'Layers' },
      { id: 'sla_escalation', label: 'SLA Escalations', icon: 'Clock' },
    ],
    boundaries: [
      'Cannot approve compensation or refunds',
      'Cannot override prices',
      'Cannot reset original ticket creation time to conceal delay',
    ],
  },
  [ROLES.DEPARTMENT_SUPERVISOR]: {
    id: ROLES.DEPARTMENT_SUPERVISOR,
    name: 'Department Supervisor',
    typicalUsers: 'Floor supervisors, restaurant captains, laundry supervisors',
    badgeColor: '#ca8a04', // Amber/Gold
    description: 'Reassigns tasks, arranges backup, inspects work, reopens incomplete tasks, documents handover.',
    financialLimit: 0,
    dashboardTitle: 'Supervisor Operations & Quality Desk',
    primaryServices: [
      { id: 'dashboard', label: 'Supervisor Command', icon: 'LayoutDashboard' },
      { id: 'dispatch_board', label: 'Team Workload & Reassign', icon: 'GitFork' },
      { id: 'handover', label: 'Shift Handover Desk', icon: 'ArrowRightLeft' },
      { id: 'maintenance', label: 'Room Safety Clearances', icon: 'Wrench' },
      { id: 'cases', label: 'Department Cases', icon: 'Layers' },
    ],
    boundaries: [
      'Cannot issue unrestricted refunds',
      'Cannot release unsafe or out-of-order rooms without mandatory inspection clearance',
    ],
  },
  [ROLES.DEPARTMENT_MANAGER]: {
    id: ROLES.DEPARTMENT_MANAGER,
    name: 'Department Manager',
    typicalUsers: 'Executive Housekeeper, F&B Manager, Front Office Manager',
    badgeColor: '#d97706', // Warm Gold/Orange
    description: 'Oversees department throughput, SLA attainment, staffing schedules, approves recovery up to $150.',
    financialLimit: 150,
    dashboardTitle: 'Department Manager Performance & Approvals',
    primaryServices: [
      { id: 'dashboard', label: 'Department Analytics', icon: 'LayoutDashboard' },
      { id: 'finance', label: 'Recovery Approvals (≤ $150)', icon: 'Receipt' },
      { id: 'reports', label: 'Throughput & SLA Reports', icon: 'BarChart3' },
      { id: 'cases', label: 'Guest Complaints & Cases', icon: 'Layers' },
      { id: 'handover', label: 'Shift Turnovers', icon: 'ArrowRightLeft' },
    ],
    boundaries: [
      'No automatic platform administration',
      'Cannot approve financial exceptions exceeding $150 threshold',
      'No unrestricted sensitive security incident access',
    ],
  },
  [ROLES.FRONT_DESK_COORDINATOR]: {
    id: ROLES.FRONT_DESK_COORDINATOR,
    name: 'Front Desk Coordinator',
    typicalUsers: 'Front Desk Associates, Guest Service Centre Agents',
    badgeColor: '#4f46e5', // Indigo
    description: 'Manages bookings, check-in/out, room moves, guest requests, revokes/rebinds QR sessions.',
    financialLimit: 0,
    dashboardTitle: 'Front Desk & Guest Services Hub',
    primaryServices: [
      { id: 'dashboard', label: 'Front Desk Hub', icon: 'LayoutDashboard' },
      { id: 'front_desk', label: 'Room Moves & QR Sessions', icon: 'Key' },
      { id: 'cases', label: 'Master Guest Requests', icon: 'Layers' },
      { id: 'finance', label: 'Disputes & Claims', icon: 'Receipt' },
      { id: 'handover', label: 'Shift Handover Desk', icon: 'ArrowRightLeft' },
    ],
    boundaries: [
      'Cannot bypass guest identity verification',
      'Cannot execute arbitrary refunds (requires financial operator entitlement)',
      'Cannot access restricted security evidence',
    ],
  },
  [ROLES.FINANCIAL_OPERATOR]: {
    id: ROLES.FINANCIAL_OPERATOR,
    name: 'Financial Operator',
    typicalUsers: 'Night Auditors, Finance Staff, Authorized Front Desk Cashiers',
    badgeColor: '#059669', // Emerald
    description: 'Views folios, collects payments, executes approved refunds/adjustments, reconciles settlements.',
    financialLimit: 1000,
    dashboardTitle: 'Financial Operations & Settlement Hub',
    primaryServices: [
      { id: 'dashboard', label: 'Finance Command', icon: 'LayoutDashboard' },
      { id: 'finance', label: 'Maker-Checker Execution', icon: 'Receipt' },
      { id: 'reports', label: 'Settlement Reconciliation', icon: 'BarChart3' },
      { id: 'audit_trail', label: 'Transaction Audit Trail', icon: 'History' },
    ],
    boundaries: [
      'Strict Maker-Checker: CANNOT self-approve own sensitive exceptions',
      'No raw card credentials storage (tokenized references only)',
      'Execution strictly bounded by approved reason and threshold',
    ],
  },
  [ROLES.SECURITY_RESPONDER]: {
    id: ROLES.SECURITY_RESPONDER,
    name: 'Security Responder',
    typicalUsers: 'Security Officers, Supervisors, Control Room Staff',
    badgeColor: '#dc2626', // Crimson Red
    description: 'Receives emergency & incident alerts, logs response actions, secures evidence vault.',
    financialLimit: 0,
    dashboardTitle: 'Security Command & Incident Radar',
    primaryServices: [
      { id: 'dashboard', label: 'Incident Radar', icon: 'LayoutDashboard' },
      { id: 'security', label: 'Restricted Evidence Vault', icon: 'ShieldAlert' },
      { id: 'sla_escalation', label: 'Emergency Broadcast', icon: 'Clock' },
      { id: 'audit_trail', label: 'Security Access Logs', icon: 'History' },
    ],
    boundaries: [
      'No access to unrelated guest profiles or billing folios',
      'No compensation approval authority',
      'Cannot delete or tamper with preserved security evidence',
    ],
  },
  [ROLES.EXECUTIVE_VIEWER_APPROVER]: {
    id: ROLES.EXECUTIVE_VIEWER_APPROVER,
    name: 'Executive Viewer / Approver',
    typicalUsers: 'Hotel Manager, General Manager',
    badgeColor: '#7c3aed', // Purple/Violet
    description: 'Reviews hotel-wide SLA, revenue summaries, approves high-value exceptions, coordinates major cases.',
    financialLimit: 2000,
    dashboardTitle: 'Executive Leadership Command Center',
    primaryServices: [
      { id: 'dashboard', label: 'Hotel-Wide Executive Pulse', icon: 'LayoutDashboard' },
      { id: 'finance', label: 'High-Value Approvals (≤ $2,000)', icon: 'Receipt' },
      { id: 'cases', label: 'Serious & Cross-Dept Cases', icon: 'Layers' },
      { id: 'reports', label: 'Operational Performance', icon: 'BarChart3' },
      { id: 'security', label: 'Major Incident Briefings', icon: 'ShieldAlert' },
    ],
    boundaries: [
      'Executive title does not grant raw payment card details',
      'Cannot bypass room safety controls or delete audit trails',
    ],
  },
  [ROLES.PLATFORM_ADMINISTRATOR]: {
    id: ROLES.PLATFORM_ADMINISTRATOR,
    name: 'Platform Administrator',
    typicalUsers: 'Authorized IT & Application Systems Administrators',
    badgeColor: '#475569', // Slate
    description: 'Manages accounts, roles, MFA, room/table QR configurations, integration queues.',
    financialLimit: 0,
    dashboardTitle: 'Platform IT & Governance Console',
    primaryServices: [
      { id: 'dashboard', label: 'Platform Console', icon: 'LayoutDashboard' },
      { id: 'admin', label: 'Accounts, MFA & Sessions', icon: 'Users' },
      { id: 'audit_trail', label: 'Immutable Audit Trail', icon: 'History' },
      { id: 'test_runner', label: '24 Acceptance Tests', icon: 'PlayCircle' },
    ],
    boundaries: [
      'Technical access confers NO financial refund or pricing authority',
      'No self-approved privilege elevation (AC-14)',
      'No silent guest impersonation or deletion of protected logs',
    ],
  },
};

/**
 * High-Risk Permission Action Rules
 * Checks whether an actor can execute an action against a resource in a given scope.
 */
export function evaluatePermission({
  user,
  action,
  resourceType,
  resource = null,
  targetScope = null,
  amount = 0,
}) {
  const steps = [];
  const logStep = (checkName, passed, detail) => {
    steps.push({ check: checkName, passed, detail });
  };

  // 1. Authenticated identity & active session
  if (!user || user.status !== 'ACTIVE') {
    logStep('Active Account & Session', false, 'User account is missing or inactive/deactivated.');
    return { allowed: false, reason: 'ACCOUNT_INACTIVE_OR_REVOKED', steps };
  }
  logStep('Active Account & Session', true, `User ${user.name} (${user.id}) is active with valid session.`);

  // 2. Active role assignment
  const role = user.role;
  const roleDef = ROLE_DEFINITIONS[role];
  if (!roleDef) {
    logStep('Valid Role Profile', false, `Role ${role} is not recognized.`);
    return { allowed: false, reason: 'INVALID_ROLE', steps };
  }
  logStep('Valid Role Profile', true, `Assigned Profile: ${roleDef.name}.`);

  // 3. Property Scope Check
  if (targetScope?.propertyId && user.propertyScope && !user.propertyScope.includes('*')) {
    if (!user.propertyScope.includes(targetScope.propertyId)) {
      logStep('Property Scope Isolation', false, `User property scope [${user.propertyScope.join(', ')}] does not include ${targetScope.propertyId}. Cross-property access denied (SEC-04).`);
      return { allowed: false, reason: 'CROSS_PROPERTY_VIOLATION', steps };
    }
  }
  logStep('Property Scope Isolation', true, 'Property isolation verified.');

  // 4. Action-specific RBAC & separation of duties
  switch (action) {
    // ---------------- TASK & CASE ACTIONS ----------------
    case 'VIEW_TASK': {
      if (role === ROLES.TASK_FULFILLER) {
        // Fulfiller can only view assigned tasks or tasks in their scoped department
        if (resource && resource.assigneeId !== user.id && resource.departmentId !== user.department) {
          logStep('Task Assignment Scope', false, `Fulfiller cannot view task assigned to another department/person.`);
          return { allowed: false, reason: 'OUT_OF_SCOPE_TASK', steps };
        }
      }
      logStep('View Task Permission', true, 'Access granted to task.');
      return { allowed: true, steps };
    }

    case 'ASSIGN_TASK': {
      if (![ROLES.DEPARTMENT_DISPATCHER, ROLES.DEPARTMENT_SUPERVISOR, ROLES.DEPARTMENT_MANAGER, ROLES.EXECUTIVE_VIEWER_APPROVER].includes(role)) {
        logStep('Dispatch/Assign Authority', false, `${roleDef.name} lacks task assignment permissions.`);
        return { allowed: false, reason: 'DISPATCH_PERMISSION_REQUIRED', steps };
      }
      logStep('Dispatch/Assign Authority', true, 'Role is authorized to assign work.');
      return { allowed: true, steps };
    }

    case 'UPDATE_TASK':
    case 'COMPLETE_TASK': {
      if (role === ROLES.TASK_FULFILLER) {
        if (resource && resource.assigneeId !== user.id) {
          logStep('Task Fulfiller Ownership', false, 'Fulfiller can only update or complete tasks explicitly assigned to them.');
          return { allowed: false, reason: 'NOT_TASK_ASSIGNEE', steps };
        }
      }
      logStep('Task Execution Authority', true, 'Authorized to execute task update.');
      return { allowed: true, steps };
    }

    case 'REOPEN_TASK': {
      if (![ROLES.DEPARTMENT_SUPERVISOR, ROLES.DEPARTMENT_MANAGER, ROLES.EXECUTIVE_VIEWER_APPROVER].includes(role)) {
        logStep('Reopen / Inspection Authority', false, 'Only Supervisors, Managers, or Executives can reopen incomplete tasks (FR-TASK-09).');
        return { allowed: false, reason: 'SUPERVISOR_REQUIRED_TO_REOPEN', steps };
      }
      logStep('Reopen / Inspection Authority', true, 'Authorized to reopen task with corrective action.');
      return { allowed: true, steps };
    }

    case 'RESOLVE_CASE': {
      // Closing master case requires subtasks to be finished
      if (resource?.subtasks && resource.subtasks.some(st => st.status !== 'COMPLETED' && st.status !== 'CANCELLED')) {
        logStep('Subtask Completion Gate', false, 'Master case cannot be resolved while linked subtasks remain incomplete (FR-CASE-08).');
        return { allowed: false, reason: 'UNFINISHED_SUBTASKS_BLOCK_CLOSURE', steps };
      }
      logStep('Subtask Completion Gate', true, 'All linked subtasks resolved or waived.');
      return { allowed: true, steps };
    }

    // ---------------- FINANCIAL CONTROLS ----------------
    case 'SUBMIT_FINANCIAL_EXCEPTION': {
      if (![ROLES.FRONT_DESK_COORDINATOR, ROLES.DEPARTMENT_MANAGER, ROLES.FINANCIAL_OPERATOR, ROLES.EXECUTIVE_VIEWER_APPROVER].includes(role)) {
        logStep('Submit Financial Exception', false, 'Role not authorized to submit financial exceptions.');
        return { allowed: false, reason: 'FINANCIAL_SUBMIT_DENIED', steps };
      }
      logStep('Submit Financial Exception', true, 'Authorized to submit financial exception request.');
      return { allowed: true, steps };
    }

    case 'APPROVE_FINANCIAL_EXCEPTION': {
      // Maker-Checker Separation of Duties: Submitter CANNOT approve their own sensitive exception (FR-FIN-04, AC-11)
      if (resource?.requesterId === user.id) {
        logStep('Separation of Duties (Maker-Checker)', false, 'Dual-control violation: Submitter cannot approve their own financial exception (AC-11).');
        return { allowed: false, reason: 'MAKER_CHECKER_SELF_APPROVAL_PROHIBITED', steps };
      }

      // Check role limit
      if (role === ROLES.DEPARTMENT_MANAGER && amount > 150) {
        logStep('Financial Delegation Threshold', false, `Amount $${amount} exceeds Department Manager limit of $150. Requires Executive approval.`);
        return { allowed: false, reason: 'AMOUNT_EXCEEDS_MANAGER_LIMIT', steps };
      }
      if (role === ROLES.EXECUTIVE_VIEWER_APPROVER && amount > 2000) {
        logStep('Financial Delegation Threshold', false, `Amount $${amount} exceeds Hotel Manager limit of $2,000. Requires General Manager / Board review.`);
        return { allowed: false, reason: 'AMOUNT_EXCEEDS_HOTEL_MANAGER_LIMIT', steps };
      }
      if (![ROLES.DEPARTMENT_MANAGER, ROLES.EXECUTIVE_VIEWER_APPROVER].includes(role)) {
        logStep('Financial Approval Entitlement', false, `${roleDef.name} does not hold financial approval delegation.`);
        return { allowed: false, reason: 'APPROVAL_ENTITLEMENT_REQUIRED', steps };
      }
      logStep('Financial Approval Entitlement', true, 'Authorized approver with sufficient financial delegation.');
      return { allowed: true, steps };
    }

    case 'EXECUTE_FINANCIAL_REFUND': {
      // Execution is distinct from approval (FR-FIN-05, AC-10)
      if (role !== ROLES.FINANCIAL_OPERATOR) {
        logStep('Financial Execution Entitlement', false, `Only entitled Financial Operators can execute approved refunds. ${roleDef.name} is denied (AC-10).`);
        return { allowed: false, reason: 'FINANCIAL_OPERATOR_REQUIRED_FOR_EXECUTION', steps };
      }
      if (resource?.status !== 'APPROVED') {
        logStep('Execution Prerequisite Status', false, 'Financial exception must be in APPROVED state before execution.');
        return { allowed: false, reason: 'EXCEPTION_NOT_APPROVED', steps };
      }
      logStep('Financial Execution Entitlement', true, 'Financial Operator authorized to execute transaction.');
      return { allowed: true, steps };
    }

    // ---------------- SECURITY INCIDENTS & EVIDENCE ----------------
    case 'VIEW_SECURITY_INCIDENT':
    case 'ACCESS_SECURITY_EVIDENCE': {
      // Strict Need-to-know: Only Security Responders and Executive Approvers have access (FR-SEC-01, FR-SEC-04, AC-16)
      if (![ROLES.SECURITY_RESPONDER, ROLES.EXECUTIVE_VIEWER_APPROVER].includes(role)) {
        logStep('Security Need-to-Know Isolation', false, `Need-to-know violation: Role ${roleDef.name} is barred from restricted security incident records (AC-16).`);
        return { allowed: false, reason: 'RESTRICTED_SECURITY_CLASSIFICATION', steps };
      }
      logStep('Security Need-to-Know Isolation', true, 'Security clearance confirmed.');
      return { allowed: true, steps };
    }

    case 'DELETE_SECURITY_EVIDENCE': {
      // No normal user can delete preserved evidence (FR-SEC-05)
      logStep('Evidence Immutability Rule', false, 'Security evidence is immutable and protected from deletion by operational users (FR-SEC-05).');
      return { allowed: false, reason: 'EVIDENCE_DELETION_PROHIBITED', steps };
    }

    // ---------------- ROOM READINESS & SAFETY CLEARANCE ----------------
    case 'MARK_ROOM_READY': {
      // Unsafe room maintenance completion must NOT automatically mark room ready in PMS without inspection clearance (FR-MNT-05, AC-22)
      if (resource?.safetyRestricted && !resource?.supervisorInspected) {
        logStep('Safety Clearance Inspection', false, 'Room cannot be released to PMS inventory until supervisor physical clearance inspection is recorded (AC-22).');
        return { allowed: false, reason: 'ROOM_SAFETY_CLEARANCE_REQUIRED', steps };
      }
      logStep('Safety Clearance Inspection', true, 'Room passed inspection and is cleared for release.');
      return { allowed: true, steps };
    }

    // ---------------- PLATFORM & ACCESS ADMINISTRATION ----------------
    case 'ELEVATE_SELF_PRIVILEGES': {
      // Platform admin trying to grant themselves financial or executive business powers is blocked (AC-14)
      logStep('Privilege Escalation Guard', false, 'Platform administrators cannot self-grant business or financial authority (AC-14). Requires independent change request.');
      return { allowed: false, reason: 'SELF_ELEVATION_PROHIBITED', steps };
    }

    case 'EXPORT_SENSITIVE_REPORT': {
      // Sensitive report exports require explicit export permission (FR-REP-03, AC-17)
      if (![ROLES.DEPARTMENT_MANAGER, ROLES.FINANCIAL_OPERATOR, ROLES.EXECUTIVE_VIEWER_APPROVER, ROLES.PLATFORM_ADMINISTRATOR].includes(role)) {
        logStep('Export Entitlement', false, `${roleDef.name} lacks sensitive report export permissions.`);
        return { allowed: false, reason: 'EXPORT_PERMISSION_DENIED', steps };
      }
      logStep('Export Entitlement', true, 'Authorized to export with audit logging and masking.');
      return { allowed: true, steps };
    }

    default:
      logStep('General Action Check', true, 'Action permitted under default role policy.');
      return { allowed: true, steps };
  }
}
