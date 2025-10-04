
import React from 'react';
import { User, ArrowDownCircle, ArrowUpCircle, FileText, Gift, Activity, ChevronRight, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BottomNav from './BottomNav';

const HomeDashboard: React.FC = () => {
  const { currentUser, maskPhone, loginAsUser, returnToAdmin, setCurrentView } = useApp();

  if (!currentUser) return null;

  const hasUnreadNotifications = currentUser.transactions.some(t => !t.read);

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
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentView('bill-details')} className="relative bg-white bg-opacity-20 p-2 rounded-full">
              <Bell size={24} />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-green-500"></span>
              )}
            </button>
            <button className="bg-white bg-opacity-20 p-2 rounded-full">
              <User size={24} />
            </button>
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
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition">
              <Gift className="text-orange-600 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-700">Task Hall</span>
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