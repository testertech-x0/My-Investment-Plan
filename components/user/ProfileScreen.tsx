
import React from 'react';
import { User, Award, CreditCard, FileText, Lock, Globe, Settings, ChevronRight, HelpCircle, MessageSquare, LogOut, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BottomNav from './BottomNav';

const ProfileScreen: React.FC = () => {
  const { currentUser, logout, setCurrentView, loginAsUser, returnToAdmin, chatSessions, t } = useApp();

  if (!currentUser) return null;

  const userChatSession = chatSessions.find(s => s.userId === currentUser.id);
  const hasUnreadMessages = !!userChatSession && userChatSession.userUnreadCount > 0;

  const menuItems = [
    { icon: User, label: t('profile'), section: 'account', action: 'my-information' },
    { icon: CreditCard, label: t('my_card'), section: 'account', action: 'bank-account' },
    { icon: FileText, label: t('transaction_history'), section: 'account', action: 'bill-details' },
    { icon: FileText, label: t('my_orders'), section: 'account', action: 'my-orders' },
    { icon: Lock, label: t('login_password'), section: 'security', action: 'change-password' },
    { icon: Lock, label: t('fund_password'), section: 'security', action: 'fund-password' },
    { icon: MessageSquare, label: t('customer_service'), section: 'settings', action: 'chat', hasBadge: hasUnreadMessages },
    { icon: Globe, label: t('language'), section: 'settings', action: 'language' },
    { icon: Download, label: 'Download App', section: 'settings', action: 'download-app' },
    { icon: HelpCircle, label: t('help_center'), section: 'settings', action: 'help' },
    { icon: LogOut, label: t('logout'), section: 'settings', action: 'logout' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {loginAsUser && (
        <div className="bg-yellow-400 text-black px-4 py-2 text-center text-sm font-semibold sticky top-0 z-20">
          Admin Mode: Viewing as {currentUser.id}
          <button onClick={returnToAdmin} className="ml-4 underline">Return to Admin</button>
        </div>
      )}

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 pb-16">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
            {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
                <User size={32} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{currentUser.name}</h2>
            <p className="text-sm opacity-90">{currentUser.id}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('available_balance')}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">{t('available')}</p>
              <p className="text-2xl font-bold text-green-600">₹{currentUser.balance.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">{t('total_returns')}</p>
              <p className="text-2xl font-bold text-blue-600">₹{currentUser.totalReturns.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCurrentView('deposit')} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">{t('recharge')}</button>
            <button onClick={() => setCurrentView('withdraw')} className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">{t('withdraw')}</button>
          </div>
        </div>

        {['account', 'security', 'settings'].map(section => (
          <div key={section} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t(section)}</h3>
            {menuItems.filter(item => item.section === section).map((item, idx) => (
              <button key={idx} 
                onClick={() => {
                    if (item.action === 'logout') {
                        logout();
                    } else if (item.action) {
                        setCurrentView(item.action);
                    }
                }}
                className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition -mx-6 px-6">
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={item.action === 'logout' ? "text-red-500" : "text-gray-600"} />
                  <span className={item.action === 'logout' ? "text-red-600 font-medium" : "text-gray-700"}>{item.label}</span>
                  {(item as any).hasBadge && (
                    <span className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ))}
          </div>
        ))}
      </div>

      <BottomNav active="profile" />
    </div>
  );
};

export default ProfileScreen;
