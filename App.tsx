import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';

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

function AppContent() {
  const { currentView, currentUser, admin, appName } = useApp();

  useEffect(() => {
    document.title = `${appName} Investment Platform`;
  }, [appName]);

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