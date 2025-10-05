import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, TrendingUp, CheckCircle, ClipboardCopy } from 'lucide-react';
import type { PaymentMethod } from '../../types';

// Helper to get last used ID from localStorage
const getLastUsedId = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

// Helper to set last used ID in localStorage
const setLastUsedId = (key: string, id: string): void => {
    try {
        localStorage.setItem(key, id);
    } catch {
        // ignore errors
    }
};

const PaymentGatewayScreen: React.FC = () => {
  const { pendingDeposit, processDeposit, setCurrentView, appName, appLogo, paymentSettings, addNotification } = useApp();
  const [status, setStatus] = useState<'pending' | 'processing' | 'success'>('pending');

  useEffect(() => {
    if (!pendingDeposit) {
      setCurrentView('deposit');
    }
  }, [pendingDeposit, setCurrentView]);

  const selectedQr = useMemo(() => {
    if (!pendingDeposit || pendingDeposit.amount > 2000) return null;

    const availableQrMethods = paymentSettings.paymentMethods.filter(m => m.isActive && m.type === 'qr');
    if (availableQrMethods.length === 0) return null;
    
    if (availableQrMethods.length === 1) {
        const method = availableQrMethods[0];
        setLastUsedId('last_qr_method_id', method.id);
        return method;
    }

    const lastQrId = getLastUsedId('last_qr_method_id');
    let selectableMethods = availableQrMethods.filter(m => m.id !== lastQrId);
    
    if (selectableMethods.length === 0) {
        selectableMethods = availableQrMethods;
    }
    
    const randomMethod = selectableMethods[Math.floor(Math.random() * selectableMethods.length)];
    setLastUsedId('last_qr_method_id', randomMethod.id);
    
    return randomMethod;
  }, [paymentSettings, pendingDeposit]);

  const selectedUpi = useMemo(() => {
    const availableUpiMethods = paymentSettings.paymentMethods.filter(m => m.isActive && m.type === 'upi');
    if (availableUpiMethods.length === 0) return null;

    if (availableUpiMethods.length === 1) {
        const method = availableUpiMethods[0];
        setLastUsedId('last_upi_method_id', method.id);
        return method;
    }

    const lastUpiId = getLastUsedId('last_upi_method_id');
    let selectableMethods = availableUpiMethods.filter(m => m.id !== lastUpiId);
    
    if (selectableMethods.length === 0) {
        selectableMethods = availableUpiMethods;
    }
    
    const randomMethod = selectableMethods[Math.floor(Math.random() * selectableMethods.length)];
    setLastUsedId('last_upi_method_id', randomMethod.id);
    
    return randomMethod;
  }, [paymentSettings]);


  if (!pendingDeposit) {
    return null; // or a loading/redirecting indicator
  }

  const handlePay = async () => {
    setStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await processDeposit(pendingDeposit.userId, pendingDeposit.amount);
    
    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        setCurrentView('home');
      }, 2500);
    } else {
      setStatus('pending'); 
    }
  };

  const handleCancel = () => {
    setCurrentView('deposit');
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          addNotification("Copied to clipboard!", "success");
      }, () => {
          addNotification("Failed to copy.", "error");
      });
  };

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

            {!selectedQr && !selectedUpi ? (
                <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
                    No payment methods are currently available. Please contact support.
                </div>
            ) : (
                <div className="space-y-4">
                    {selectedQr && (
                        <div className="text-center">
                            <h3 className="font-semibold text-gray-800 mb-2">Pay via QR Code</h3>
                            <div className="flex justify-center">
                                <img src={selectedQr.value} alt="Payment QR Code" className="w-48 h-48 object-contain border rounded-lg p-1 bg-white"/>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Scan the QR code with your payment app.</p>
                            <p className="text-xs font-semibold text-blue-600 mt-1">For payments up to ₹2000</p>
                        </div>
                    )}
                    
                    {selectedQr && selectedUpi && (
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 font-semibold text-sm">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                    )}

                    {selectedUpi && (
                         <div className="text-center">
                            <h3 className="font-semibold text-gray-800 mb-2">Pay via UPI ID</h3>
                            <div className="bg-green-50 p-3 rounded-lg flex items-center justify-center gap-2">
                                <p className="font-mono text-lg text-green-800 break-all">{selectedUpi.value}</p>
                                <button onClick={() => copyToClipboard(selectedUpi.value)} className="p-1 text-gray-500 hover:text-green-700 flex-shrink-0"><ClipboardCopy size={18}/></button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Copy the UPI ID and pay using your app.</p>
                         </div>
                    )}
                </div>
            )}

            <div className="space-y-3 mt-8">
                <button
                    onClick={handlePay}
                    disabled={!selectedQr && !selectedUpi}
                    className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm disabled:bg-gray-300"
                >
                    I Have Paid
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