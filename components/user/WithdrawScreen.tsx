import React, { useState } from 'react';
import { ArrowLeft, Landmark } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const WithdrawScreen: React.FC = () => {
    const { currentUser, setCurrentView, makeWithdrawal, addNotification } = useApp();
    const [activeTab, setActiveTab] = useState('CASH');
    const [amount, setAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    if (!currentUser) return null;

    const quickAmounts = [10000, 50000, 100000];

    const handleWithdraw = async () => {
        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            return;
        }
        setIsWithdrawing(true);
        const result = await makeWithdrawal(currentUser.id, withdrawalAmount);
        if(result.success) {
            setAmount('');
        } else if (result.message) {
            addNotification(result.message, 'error');
        }
        setIsWithdrawing(false);
    };

    const isConfirmDisabled = () => {
        const numAmount = parseFloat(amount);
        return isWithdrawing || !currentUser.bankAccount || isNaN(numAmount) || numAmount <= 0 || numAmount > currentUser.balance;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('home')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Withdraw</h1>
            </header>

            <div className="bg-white">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('CASH')}
                        className={`w-1/2 py-3 font-semibold text-center transition-all duration-200 ${activeTab === 'CASH' ? 'text-white bg-green-500' : 'text-gray-500 bg-gray-100'}`}
                    >
                        CASH ACCOUNT
                    </button>
                    <button
                        onClick={() => setActiveTab('USDT')}
                        className={`w-1/2 py-3 font-semibold text-center transition-all duration-200 ${activeTab === 'USDT' ? 'text-white bg-green-500' : 'text-gray-500 bg-gray-100'}`}
                    >
                        USDT ACCOUNT
                    </button>
                </div>
            </div>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'CASH' ? (
                    <>
                        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <p className="text-sm text-green-600">Account balance</p>
                                <p className="text-3xl font-bold text-gray-800">₹{currentUser.balance.toFixed(2)}</p>
                                <p className="text-xs text-gray-400">≈T{(currentUser.balance / 90).toFixed(2)}</p>
                            </div>
                            <img src="https://img.icons8.com/plasticine/100/stack-of-coins.png" alt="Coins" className="w-16 h-16" />
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quick amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-semibold text-gray-400">₹</span>
                                <input 
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  placeholder="Amount"
                                  className="w-full pl-12 pr-4 py-4 border-b border-gray-300 text-4xl font-bold focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div className="flex justify-between mt-4">
                                {quickAmounts.map(qAmount => (
                                  <button 
                                    key={qAmount}
                                    onClick={() => setAmount(String(qAmount))}
                                    className="text-gray-600 text-sm font-medium px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                                  >
                                    ₹{qAmount.toLocaleString()}
                                  </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Withdraw method</label>
                            {currentUser.bankAccount ? (
                                <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                                    <Landmark className="text-green-500" size={24} />
                                    <div>
                                        <p className="font-semibold">{currentUser.bankAccount.accountHolder}</p>
                                        <p className="text-xs text-gray-500">**** **** **** {currentUser.bankAccount.accountNumber.slice(-4)}</p>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setCurrentView('bank-account')} className="w-full text-center py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
                                    + Add Bank Account
                                </button>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleWithdraw}
                            disabled={isConfirmDisabled()}
                            className="w-full py-3 rounded-lg font-semibold transition text-white mt-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {isWithdrawing ? 'Processing...' : 'Confirm'}
                        </button>
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-10 bg-white p-4 rounded-lg shadow">
                        USDT Withdraw is currently unavailable.
                    </div>
                )}
            </main>
            
            <footer className="p-4 shrink-0">
                <div className="text-xs text-gray-500 space-y-2">
                    <p>1. A tax fee of 8% will be deducted from each withdrawal, with a minimum withdrawal application amount of <span className="font-bold text-red-500">₹300.00</span> and a minimum withdrawal amount of USDT being <span className="font-bold text-red-500">₹50.00</span>.</p>
                    <p>2. Withdrawal application hours are from <span className="font-bold text-green-600">7:00 AM to 5:00 PM</span> daily (excluding public holidays).</p>
                    <p>3. Your withdrawal amount will typically be credited within 24 hours, though the exact timing is determined by the bank's system, as banks update periodically after business hours. If you have any questions related to withdrawals, please contact official customer service for assistance.</p>
                </div>
            </footer>
        </div>
    );
};

export default WithdrawScreen;
