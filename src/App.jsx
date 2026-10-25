import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import PermissionInspectorModal from './components/PermissionInspectorModal';
import CaseModal from './components/CaseModal';
import RoleSwitcherModal from './components/RoleSwitcherModal';

// Views
import DashboardView from './components/views/DashboardView';
import CasesView from './components/views/CasesView';
import DispatchBoardView from './components/views/DispatchBoardView';
import MyTasksView from './components/views/MyTasksView';
import SlaEscalationView from './components/views/SlaEscalationView';
import HandoverView from './components/views/HandoverView';
import FrontDeskView from './components/views/FrontDeskView';
import FinanceView from './components/views/FinanceView';
import SecurityView from './components/views/SecurityView';
import MaintenanceView from './components/views/MaintenanceView';
import ReportsView from './components/views/ReportsView';
import AdminView from './components/views/AdminView';
import AuditTrailView from './components/views/AuditTrailView';
import TestRunnerView from './components/views/TestRunnerView';

function MainAppShell() {
  const { currentView } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'my_tasks':
        return <MyTasksView />;
      case 'dispatch_board':
        return <DispatchBoardView />;
      case 'cases':
        return <CasesView />;
      case 'sla_escalation':
        return <SlaEscalationView />;
      case 'handover':
        return <HandoverView />;
      case 'front_desk':
        return <FrontDeskView />;
      case 'finance':
        return <FinanceView />;
      case 'security':
        return <SecurityView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'reports':
        return <ReportsView />;
      case 'admin':
        return <AdminView />;
      case 'audit_trail':
        return <AuditTrailView />;
      case 'test_runner':
        return <TestRunnerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Header />
        {renderActiveView()}
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <PermissionInspectorModal />
      <CaseModal />
      <RoleSwitcherModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
