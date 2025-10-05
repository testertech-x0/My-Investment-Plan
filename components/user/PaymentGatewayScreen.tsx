import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, TrendingUp, CheckCircle, CreditCard, Wifi } from 'lucide-react';

const PaymentGatewayScreen: React.FC = () => {
  const { pendingDeposit, processDeposit, setCurrentView, appName, appLogo } = useApp();
  const [status, setStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [selectedMethod, setSelectedMethod] = useState('upi');

  useEffect(() => {
    if (!pendingDeposit) {
      // If the user lands here without a pending deposit (e.g., page refresh), send them back.
      setCurrentView('deposit');
    }
  }, [pendingDeposit, setCurrentView]);

  if (!pendingDeposit) {
    return null; // or a loading/redirecting indicator
  }

  const handlePay = async () => {
    setStatus('processing');
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await processDeposit(pendingDeposit.userId, pendingDeposit.amount);
    
    if (result.success) {
      setStatus('success');
      // Wait a bit on the success screen before redirecting
      setTimeout(() => {
        setCurrentView('home');
      }, 2500);
    } else {
      // In a real app, you'd handle failure more gracefully
      setStatus('pending'); 
    }
  };

  const handleCancel = () => {
    // In a real app, you might want to call a function to clear the pending deposit state.
    setCurrentView('deposit');
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI / QR Code', icon: Wifi },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  ];
  
  const renderContent = () => {
    switch(status) {
      case 'processing':
        return (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-xl font-semibold text-gray-700 mt-6">Processing Payment...</p>
            <p className="text-gray-500">Please do not close or refresh the page.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-20">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
            <p className="text-2xl font-bold text-gray-800 mt-6">Payment Successful!</p>
            <p className="text-gray-600 mt-2">Amount of ₹{pendingDeposit.amount.toFixed(2)} has been added to your account.</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting you to the dashboard...</p>
          </div>
        );
      case 'pending':
      default:
        return (
          <>
            <div className="text-center mb-6">
                <p className="text-sm text-gray-500">You are paying</p>
                <p className="text-5xl font-bold text-gray-800 tracking-tight">₹{pendingDeposit.amount.toFixed(2)}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Select Payment Method</h3>
                <div className="space-y-3">
                    {paymentMethods.map(method => (
                        <div key={method.id} 
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${selectedMethod === method.id ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                            onClick={() => setSelectedMethod(method.id)}
                        >
                            <div className="flex items-center gap-3">
                                <method.icon className="text-gray-600" size={24} />
                                <p className="font-semibold text-gray-800">{method.name}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-green-500' : 'border-gray-400'}`}>
                                {selectedMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={handlePay}
                    className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm"
                >
                    Pay Now
                </button>
                <button
                    onClick={handleCancel}
                    className="w-full text-center text-gray-600 py-2 text-sm font-medium hover:text-red-500 transition"
                >
                    Cancel Payment
                </button>
            </div>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="flex items-center justify-center gap-3 mb-8">
            {appLogo ? (
                <img src={appLogo} alt="App Logo" className="w-10 h-10 rounded-full object-cover" />
            ) : (
                <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={20} />
                </div>
            )}
            <h1 className="text-xl font-bold text-gray-700">{appName}</h1>
        </header>

        <main className="bg-white rounded-2xl shadow-lg p-6">
            {renderContent()}
        </main>

        <footer className="text-center mt-6 text-gray-500 text-sm">
            <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={16} />
                <span>100% Secure Payments</span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default PaymentGatewayScreen;