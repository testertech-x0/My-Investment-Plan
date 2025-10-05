import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DepositScreen: React.FC = () => {
  const { currentUser, setCurrentView, addNotification, initiateDeposit, paymentSettings } = useApp();
  const [activeTab, setActiveTab] = useState('CASH');
  const [amount, setAmount] = useState('');

  if (!currentUser) return null;

  const { quickAmounts } = paymentSettings;
  
  const depositAmount = parseFloat(amount);
  const isValid = !isNaN(depositAmount) && depositAmount >= 200;

  const handleDeposit = async () => {
    if (!isValid) {
      addNotification('Minimum deposit amount is ₹200.', 'error');
      return;
    }
    
    initiateDeposit(depositAmount);
    setCurrentView('payment-gateway');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
        <button onClick={() => setCurrentView('home')}>
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Deposit</h1>
      </header>

      <div className="bg-white">
        <div className="flex justify-around border-b">
          <button 
            onClick={() => setActiveTab('CASH')}
            className={`w-1/2 py-3 font-semibold transition-all duration-200 ${activeTab === 'CASH' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          >
            CASH ACCOUNT
          </button>
          <button 
            onClick={() => setActiveTab('USDT')}
            className={`w-1/2 py-3 font-semibold transition-all duration-200 ${activeTab === 'USDT' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          >
            USDT ACCOUNT
          </button>
        </div>
      </div>

      <main className="p-4">
        {activeTab === 'CASH' ? (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="mb-6">
              <p className="text-sm text-green-600">Account balance</p>
              <p className="text-4xl font-bold text-gray-800">₹{currentUser.balance.toFixed(2)}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Send amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-500">₹</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg text-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-between mt-3 px-2">
                {quickAmounts.map(qAmount => (
                  <button 
                    key={qAmount}
                    onClick={() => setAmount(String(qAmount))}
                    className="text-gray-600 text-sm font-medium px-2 py-1 rounded hover:bg-gray-100"
                  >
                    ₹{qAmount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleDeposit}
              disabled={!isValid}
              className={`w-full py-3 rounded-lg font-semibold transition text-white mt-4 ${isValid ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Proceed to Pay
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 bg-white p-4 rounded-lg shadow">
            USDT Deposit is currently unavailable.
          </div>
        )}
      </main>
      
      <footer className="px-4 pb-4">
        <div className="text-xs text-gray-500 mt-6 space-y-2 p-4 bg-white rounded-lg shadow">
            <p>1. The minimum recharge amount is <span className="font-bold text-red-500">₹200</span>, and the minimum recharge amount for TRC-20 cryptocurrency is <span className="font-bold text-red-500">10 USDT</span>.</p>
            <p>2. Please ensure that the payment amount matches the amount you entered. To ensure a smooth recharge, you must fill out and submit the recharge order according to the process each time. Do not make a direct payment to the receiving account without submitting an order.</p>
            <p>3. If the funds do not arrive within 5 minutes after payment, please contact the platform's customer service for assistance.</p>
        </div>
      </footer>
    </div>
  );
};

export default DepositScreen;