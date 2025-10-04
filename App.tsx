import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { ThemeColor } from './types';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLogin from './components/auth/AdminLogin';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminDashboard from './components/admin/AdminDashboard';
import HomeDashboard from './components/user/HomeDashboard';
import InvestmentScreen from './components/user/InvestmentScreen';
import ProfileScreen from './components/user/ProfileScreen';
import ChangePassword from './components/user/ChangePassword';
import DepositScreen from './components/user/DepositScreen';
import WithdrawScreen from './components/user/WithdrawScreen';
import MyInformationScreen from './components/user/MyInformationScreen';
import BankAccountScreen from './components/user/BankAccountScreen';
import BillDetailsScreen from './components/user/BillDetailsScreen';
import FundPasswordScreen from './components/user/FundPasswordScreen';
import MyOrdersScreen from './components/user/MyOrdersScreen';
import Notifications from './components/ui/Notifications';
import ConfirmationModal from './components/ui/ConfirmationModal';

const themeHexMap: Record<ThemeColor, Record<number, string>> = {
  green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  purple: { 50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
  orange: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  yellow: { 50: '#fefce8', 100: '#fef9c3', 500: '#eab308', 600: '#ca8a04', 700: '#a16207' },
  teal: { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  pink: { 50: '#fdf2f8', 100: '#fce7f3', 500: '#ec4899', 600: '#db2777', 700: '#be185d' },
};


function AppContent() {
  const { currentView, currentUser, admin, appName, themeColor } = useApp();

  useEffect(() => {
    document.title = `${appName} Investment Platform`;
  }, [appName]);
  
  useEffect(() => {
    const selected = themeHexMap[themeColor];
    const css = `
      .bg-green-50 { background-color: ${selected[50]} !important; }
      .hover\\:bg-green-50:hover { background-color: ${selected[50]} !important; }
      .from-green-50 { --tw-gradient-from: ${selected[50]} var(--tw-gradient-from-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .bg-green-100 { background-color: ${selected[100]} !important; }
      .hover\\:bg-green-100:hover { background-color: ${selected[100]} !important; }
      .to-green-100 { --tw-gradient-to: ${selected[100]} var(--tw-gradient-to-position) !important; }
      .text-green-500 { color: ${selected[500]} !important; }
      .bg-green-500 { background-color: ${selected[500]} !important; }
      .border-green-500 { border-color: ${selected[500]} !important; }
      .focus\\:border-green-500:focus { border-color: ${selected[500]} !important; }
      .focus\\:ring-green-500:focus { --tw-ring-color: ${selected[500]} !important; }
      .ring-green-500 { --tw-ring-color: ${selected[500]} !important; }
      .from-green-500 { --tw-gradient-from: ${selected[500]} var(--tw-gradient-from-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .text-green-600 { color: ${selected[600]} !important; }
      .bg-green-600 { background-color: ${selected[600]} !important; }
      .hover\\:bg-green-600:hover { background-color: ${selected[600]} !important; }
      .to-green-600 { --tw-gradient-to: ${selected[600]} var(--tw-gradient-to-position) !important; }
      .border-green-600, .border-b-2.border-green-600 { border-color: ${selected[600]} !important; }
      .text-green-700 { color: ${selected[700]} !important; }
      .bg-green-700 { background-color: ${selected[700]} !important; }
      .hover\\:bg-green-700:hover { background-color: ${selected[700]} !important; }
    `;
    
    let styleEl = document.getElementById('theme-override-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'theme-override-style';
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = css;

  }, [themeColor]);

  let viewComponent;

  if (admin.isLoggedIn && currentView === 'admin-dashboard') {
    viewComponent = <AdminDashboard />;
  } else if (currentUser) {
    switch (currentView) {
      case 'home':
        viewComponent = <HomeDashboard />;
        break;
      case 'invest':
        viewComponent = <InvestmentScreen />;
        break;
      case 'profile':
        viewComponent = <ProfileScreen />;
        break;
      case 'change-password':
        viewComponent = <ChangePassword />;
        break;
      case 'deposit':
        viewComponent = <DepositScreen />;
        break;
      case 'withdraw':
        viewComponent = <WithdrawScreen />;
        break;
      case 'my-information':
        viewComponent = <MyInformationScreen />;
        break;
      case 'bank-account':
        viewComponent = <BankAccountScreen />;
        break;
      case 'bill-details':
        viewComponent = <BillDetailsScreen />;
        break;
      case 'fund-password':
        viewComponent = <FundPasswordScreen />;
        break;
      case 'my-orders':
        viewComponent = <MyOrdersScreen />;
        break;
      default:
        viewComponent = <HomeDashboard />;
    }
  } else {
    switch (currentView) {
      case 'register':
        viewComponent = <Register />;
        break;
      case 'admin-login':
        viewComponent = <AdminLogin />;
        break;
      case 'forgot-password':
        viewComponent = <ForgotPassword />;
        break;
      case 'login':
      default:
        viewComponent = <Login />;
    }
  }

  return (
    <>
      <Notifications />
      <ConfirmationModal />
      {viewComponent}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}