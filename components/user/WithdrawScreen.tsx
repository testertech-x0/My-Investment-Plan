
import React, { useState } from 'react';
import { ArrowLeft, Landmark, Lock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const WithdrawScreen: React.FC = () => {
    const { currentUser, setCurrentView, makeWithdrawal, addNotification } = useApp();
    const [activeTab, setActiveTab] = useState('CASH');
    const [amount, setAmount] = useState('');
    const [fundPassword, setFundPassword] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    if (!currentUser) return null;

    // Updated Quick Amounts relevant to low balance
    const quickAmounts = [200, 500, 1000, 5000];
    const FEE_PERCENT = 0.05; // 5%
    const MIN_WITHDRAWAL = 200;

    // Calculations
    const withdrawAmount = parseFloat(amount) || 0;
    const fee = withdrawAmount * FEE_PERCENT;
    const finalAmount = withdrawAmount - fee;

    const handleWithdraw = async () => {
        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount < MIN_WITHDRAWAL) {
            addNotification(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`, 'error');
            return;
        }
        if (!fundPassword) {
            addNotification('Please enter your fund password.', 'error');
            return;
        }
        setIsWithdrawing(true);
        const result = await makeWithdrawal(currentUser.id, withdrawalAmount, fundPassword);
        if(result.success) {
            setAmount('');
            setFundPassword('');
        } else if (result.message) {
            addNotification(result.message, 'error');
        }
        setIsWithdrawing(false);
    };

    const isConfirmDisabled = () => {
        const numAmount = parseFloat(amount);
        return isWithdrawing || 
               !currentUser.bankAccount || 
               isNaN(numAmount) || 
               numAmount < MIN_WITHDRAWAL || 
               numAmount > currentUser.balance || 
               fundPassword.length === 0;
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
                                <p className="text-sm text-green-600 font-medium">Withdrawable Balance</p>
                                <p className="text-3xl font-bold text-gray-800">₹{currentUser.balance.toFixed(2)}</p>
                                <p className="text-xs text-gray-400 mt-1">Includes Earnings & Deposits</p>
                            </div>
                            <img src="https://img.icons8.com/plasticine/100/stack-of-coins.png" alt="Coins" className="w-16 h-16" />
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Withdraw amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-semibold text-gray-400">₹</span>
                                <input 
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  placeholder={`${MIN_WITHDRAWAL}+`}
                                  className="w-full pl-12 pr-4 py-4 border-b border-gray-300 text-4xl font-bold focus:outline-none focus:border-green-500"
                                />
                            </div>
                            
                            {/* Fee Calculation Display */}
                            {withdrawAmount > 0 && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Withdrawal:</span>
                                        <span>₹{withdrawAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-500">
                                        <span>Processing Fee (5%):</span>
                                        <span>-₹{fee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-1 mt-1 flex justify-between font-bold text-green-700">
                                        <span>You Receive:</span>
                                        <span>₹{finalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between mt-4 gap-2">
                                {quickAmounts.map(qAmount => (
                                  <button 
                                    key={qAmount}
                                    onClick={() => setAmount(String(qAmount))}
                                    className="flex-1 text-gray-600 text-xs font-medium px-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:text-green-700 transition"
                                  >
                                    ₹{qAmount}
                                  </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Withdraw method</label>
                                {currentUser.bankAccount ? (
                                    <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-green-50 border-green-200">
                                        <Landmark className="text-green-600" size={24} />
                                        <div>
                                            <p className="font-semibold text-gray-800">{currentUser.bankAccount.accountHolder}</p>
                                            <p className="text-xs text-gray-600">**** **** **** {currentUser.bankAccount.accountNumber.slice(-4)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setCurrentView('bank-account')} className="w-full text-center py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
                                        + Add Bank Account
                                    </button>
                                )}
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fund Password</label>
                                 <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={fundPassword}
                                        onChange={(e) => setFundPassword(e.target.value)}
                                        placeholder="Enter 6-digit fund password"
                                        maxLength={6}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                {!currentUser.fundPassword && (
                                    <button onClick={() => setCurrentView('fund-password')} className="text-xs text-blue-600 hover:underline mt-1">
                                        No fund password? Set one up.
                                    </button>
                                )}
                             </div>
                        </div>
                        
                        <button 
                            onClick={handleWithdraw}
                            disabled={isConfirmDisabled()}
                            className="w-full py-3 rounded-lg font-semibold transition text-white mt-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-green-200">
                            {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                        </button>
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-10 bg-white p-4 rounded-lg shadow">
                        USDT Withdraw is currently unavailable.
                    </div>
                )}
            </main>
            
            <footer className="p-4 shrink-0">
                <div className="text-xs text-gray-500 space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2 text-yellow-700 font-bold mb-1">
                         <AlertCircle size={14} />
                         <span>Important Instructions</span>
                    </div>
                    <p>1. A processing fee of <span className="font-bold text-red-500">5%</span> will be deducted from each withdrawal amount.</p>
                    <p>2. Minimum withdrawal amount is <span className="font-bold text-green-600">₹{MIN_WITHDRAWAL}.00</span>.</p>
                    <p>3. Withdrawal hours: <span className="font-bold text-gray-700">7:00 AM - 5:00 PM</span> daily.</p>
                    <p>4. Amount is usually credited within 24 hours. If failed, the balance is refunded automatically.</p>
                </div>
            </footer>
        </div>
    );
};

export default WithdrawScreen;
