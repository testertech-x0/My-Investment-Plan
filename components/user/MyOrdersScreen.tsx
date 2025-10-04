import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MyOrdersScreen: React.FC = () => {
    const { currentUser, setCurrentView } = useApp();
    const [activeTab, setActiveTab] = useState('valid');

    if (!currentUser) return null;

    const validOrders = currentUser.investments || [];
    // For now, expired orders will be an empty array
    const expiredOrders: typeof validOrders = [];

    const ordersToShow = activeTab === 'valid' ? validOrders : expiredOrders;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">My Orders</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                <div className="bg-white rounded-full p-1 flex mb-4 shadow-sm">
                    <button
                        onClick={() => setActiveTab('valid')}
                        className={`w-1/2 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTab === 'valid' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
                    >
                        Valid Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('expired')}
                        className={`w-1/2 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTab === 'expired' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
                    >
                        Expired Orders
                    </button>
                </div>

                <div className="space-y-4">
                    {ordersToShow.length > 0 ? (
                        ordersToShow.map((order, index) => (
                            <div key={`${order.planId}-${index}`} className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{order.planName}</h3>
                                        <p className="text-xs text-gray-400">Start Date: {order.startDate}</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {order.category}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Invested</p>
                                        <p className="text-lg font-bold text-gray-800">₹{order.investedAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Revenue</p>
                                        <p className="text-lg font-bold text-green-600">₹{order.totalRevenue.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Daily Earnings</p>
                                        <p className="text-lg font-bold text-blue-600">₹{order.dailyEarnings.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Days Left</p>
                                        <p className="text-lg font-bold text-purple-600">{order.revenueDays} Days</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-20 bg-white rounded-lg shadow">
                            <p>No {activeTab} orders found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyOrdersScreen;
