
import React, { useState, useEffect, useRef } from 'react';
import { User, ArrowDownCircle, ArrowUpCircle, FileText, Gift, Activity, ChevronRight, Bell, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BottomNav from './BottomNav';
import { TransactionIcon } from './BillDetailsScreen'; // Assuming TransactionIcon is exported

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const HomeDashboard: React.FC = () => {
  const { currentUser, maskPhone, loginAsUser, returnToAdmin, setCurrentView, markNotificationsAsRead } = useApp();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (!currentUser) return null;

  const hasUnreadNotifications = currentUser.transactions.some(t => !t.read);

  const toggleNotifications = () => {
    setIsNotificationOpen(prev => !prev);
    if (!isNotificationOpen && hasUnreadNotifications) {
      markNotificationsAsRead();
    }
  };
  
  const recentNotifications = currentUser.transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {loginAsUser && (
        <div className="bg-yellow-400 text-black px-4 py-2 text-center text-sm font-semibold sticky top-0 z-20">
          Admin Mode: Viewing as {currentUser.id}
          <button onClick={returnToAdmin} className="ml-4 underline">Return to Admin</button>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm opacity-90">User ID: {currentUser.id}</p>
            <p className="text-xs opacity-75">+91 {maskPhone(currentUser.phone)}</p>
          </div>
          <div ref={notificationRef} className="relative flex items-center gap-2">
            <button onClick={toggleNotifications} className="relative bg-white bg-opacity-20 p-2 rounded-full">
              <Bell size={24} />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-green-500"></span>
              )}
            </button>
            <button onClick={() => setCurrentView('profile')} className="bg-white bg-opacity-20 p-2 rounded-full">
              <User size={24} />
            </button>

             {isNotificationOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white rounded-xl shadow-2xl border text-gray-800 z-30 animate-fade-in-down">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((tx, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border-b last:border-0 hover:bg-gray-50">
                            <div className="bg-gray-100 p-2 rounded-full mt-1">
                                <TransactionIcon type={tx.type} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm leading-snug">{tx.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatDate(tx.date)}</p>
                            </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-10">No notifications yet.</p>
                    )}
                </div>
                <div className="p-2 bg-gray-50 rounded-b-xl">
                    <button onClick={() => { setCurrentView('bill-details'); setIsNotificationOpen(false); }} className="w-full flex justify-center items-center gap-2 text-sm font-semibold text-green-600 hover:bg-green-50 p-2 rounded-md transition">
                        View All
                        <ArrowRight size={16} />
                    </button>
                </div>
                <style>{`
                  @keyframes fade-in-down {
                      0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
                      100% { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  .animate-fade-in-down { animation: fade-in-down 0.2s ease-out; }
                `}</style>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm opacity-90 mb-2">Total Balance</p>
          <h2 className="text-5xl font-bold">₹{currentUser.balance.toFixed(2)}</h2>
        </div>
      </div>

      <div className="px-6 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-gray-700 font-semibold mb-4">Financial Services</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setCurrentView('deposit')} className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition">
              <ArrowDownCircle className="text-green-600 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-700">Deposit</span>
            </button>
            <button onClick={() => setCurrentView('withdraw')} className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
              <ArrowUpCircle className="text-blue-600 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-700">Withdraw</span>
            </button>
            <button onClick={() => setCurrentView('my-orders')} className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
              <FileText className="text-purple-600 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-700">Order</span>
            </button>
            <button onClick={() => setCurrentView('lucky-wheel')} className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition">
              <Gift className="text-orange-600 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-700">Lucky Draw</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-gray-700 font-semibold mb-4">Find More</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Activity className="text-gray-600" size={24} />
                <span className="font-medium text-gray-700">Login Activity</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
};

export default HomeDashboard;