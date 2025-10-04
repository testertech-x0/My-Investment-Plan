import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Eye, ChevronDown, Gift as RewardIcon, ArrowDownCircle, ArrowUpCircle, TrendingUp, Bell, X, Clock, Hash, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Transaction } from '../../types';

export const TransactionIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'deposit': return <ArrowDownCircle className="text-green-500" />;
        case 'withdrawal': return <ArrowUpCircle className="text-red-500" />;
        case 'investment': return <TrendingUp className="text-blue-500" />;
        case 'system': return <Bell className="text-purple-500" />;
        case 'reward':
        case 'prize':
        default: return <RewardIcon className="text-orange-500" />;
    }
}

const TransactionDetailModal: React.FC<{ transaction: Transaction; onClose: () => void }> = ({ transaction, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-bold text-gray-800">Transaction Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </header>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="inline-block bg-gray-100 p-4 rounded-full mb-3">
                            <TransactionIcon type={transaction.type} />
                        </div>
                        <p className={`text-3xl font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-gray-800'}`}>
                           {transaction.type === 'system' ? '' : `₹${transaction.amount.toFixed(2)}`}
                        </p>
                        <p className="text-gray-600 font-medium">{transaction.description}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm border-t pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-2"><CheckCircle size={16} /> Status</span>
                            <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">Completed</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-2"><Clock size={16} /> Time</span>
                            <span className="font-semibold text-gray-800">{new Date(transaction.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-2"><Info size={16} /> Type</span>
                            <span className="font-semibold text-gray-800 capitalize">{transaction.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-2"><Hash size={16} /> Transaction ID</span>
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{transaction.id || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes scale-up { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}

const BillDetailsScreen: React.FC = () => {
    const { currentUser, setCurrentView, markNotificationsAsRead } = useApp();
    const [activeTab, setActiveTab] = useState('account');
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    
    useEffect(() => {
        markNotificationsAsRead();
    }, [markNotificationsAsRead]);

    if (!currentUser) return null;

    const transactions = currentUser.transactions || [];

    const filteredTransactions = useMemo(() => {
        let sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        switch (activeTab) {
            case 'deposit':
                return sorted.filter(t => t.type === 'deposit');
            case 'withdraw': // Note: 'withdrawal' is the type in data
                return sorted.filter(t => t.type === 'withdrawal');
            case 'account':
            default:
                return sorted;
        }
    }, [transactions, activeTab]);

    const todayProfit = 0; // Mocked for now
    const totalProfit = currentUser.transactions
        .filter(t => t.type !== 'investment' && t.type !== 'deposit')
        .reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Transaction History</h1>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="p-4 bg-white">
                    <p className="text-sm text-gray-500">Today profit</p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-gray-800">₹{todayProfit.toFixed(0)}</p>
                        <Eye size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Total profit : ₹{totalProfit.toFixed(0)}</p>
                </div>

                <div className="bg-white mt-2">
                    <div className="flex justify-around items-center px-2">
                        <button onClick={() => setActiveTab('account')} className={`py-2 px-4 flex-1 font-semibold text-center transition-all duration-300 ${activeTab === 'account' ? 'text-white bg-green-500 rounded-lg shadow' : 'text-gray-600'}`}>Account</button>
                        <button onClick={() => setActiveTab('deposit')} className={`py-2 px-4 flex-1 font-semibold text-center transition-all duration-300 ${activeTab === 'deposit' ? 'text-white bg-green-500 rounded-lg shadow' : 'text-gray-600'}`}>Deposit</button>
                        <button onClick={() => setActiveTab('withdraw')} className={`py-2 px-4 flex-1 font-semibold text-center transition-all duration-300 ${activeTab === 'withdraw' ? 'text-white bg-green-500 rounded-lg shadow' : 'text-gray-600'}`}>Withdraw</button>
                    </div>
                </div>

                <div className="p-4 bg-white mt-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-1">All <ChevronDown size={16} /> to All <ChevronDown size={16} /></div>
                        <div className="relative">
                            <select className="appearance-none bg-transparent pr-6 border rounded-md py-1 px-2">
                                <option>Please select</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <span className="absolute left-0 -top-2 -translate-y-1/2 scale-75 bg-white px-1">Select type:</span>
                        </div>
                    </div>
                </div>

                <div className="mt-2 bg-white">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx, index) => (
                            <div
                                key={tx.id || index}
                                onClick={() => setSelectedTx(tx)}
                                className={`flex items-center justify-between p-4 border-b last:border-0 transition-colors cursor-pointer hover:bg-gray-50 ${!tx.read ? 'bg-green-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-3 rounded-full">
                                        <TransactionIcon type={tx.type} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                                    </div>
                                </div>
                                <p className={`font-bold text-lg ${tx.amount >= 0 ? 'text-green-500' : 'text-gray-800'}`}>
                                    {tx.type === 'system' ? '' : (tx.description === 'Sign in reward' && tx.amount === 0 ? '-₹0' : `₹${tx.amount.toFixed(0)}`)}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-16">No transactions found.</p>
                    )}
                </div>
            </main>
            {selectedTx && <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />}
        </div>
    );
};

export default BillDetailsScreen;