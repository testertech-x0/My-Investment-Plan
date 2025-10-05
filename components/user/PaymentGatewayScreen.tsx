import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, TrendingUp, CheckCircle, ClipboardCopy, QrCode } from 'lucide-react';

const PaymentGatewayScreen: React.FC = () => {
  const { pendingDeposit, processDeposit, setCurrentView, appName, appLogo, paymentSettings, addNotification } = useApp();
  const [status, setStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'qr'>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');

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

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          addNotification("Copied to clipboard!", "success");
      }, (err) => {
          addNotification("Failed to copy.", "error");
      });
  };

  const isQrDisabled = pendingDeposit.amount > 2000;
  const activeUpiIds = paymentSettings.upiIds.filter(u => u.isActive);
  const upiToShow = activeUpiIds.length > 0 ? activeUpiIds[Math.floor(Math.random() * activeUpiIds.length)] : null;

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

            <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-100 mb-4">
                <button onClick={() => setSelectedMethod('upi')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${selectedMethod === 'upi' ? 'bg-white shadow' : ''}`}>UPI Payment</button>
                <button onClick={() => setSelectedMethod('qr')} disabled={isQrDisabled} className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${selectedMethod === 'qr' ? 'bg-white shadow' : 'disabled:text-gray-400'}`}>QR Code</button>
            </div>
            
            {selectedMethod === 'upi' && (
                <div>
                    {upiToShow ? (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Please pay to the UPI ID below:</p>
                            <div className="bg-green-50 p-3 rounded-lg flex items-center justify-center gap-2">
                                <p className="font-mono text-lg text-green-800">{upiToShow.upi}</p>
                                <button onClick={() => copyToClipboard(upiToShow.upi)} className="p-1 text-gray-500 hover:text-green-700"><ClipboardCopy size={18}/></button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">UPI payment is currently unavailable.</p>
                    )}
                </div>
            )}
            
            {selectedMethod === 'qr' && (
                <div>
                    {isQrDisabled ? (
                        <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">QR Code payment is only available for amounts up to ₹2000.</p>
                    ) : paymentSettings.qrCode ? (
                        <div className="flex flex-col items-center">
                           <p className="text-sm text-gray-600 mb-2">Scan the QR code to pay</p>
                           <img src={paymentSettings.qrCode} alt="Payment QR Code" className="w-48 h-48 object-contain border rounded-lg"/>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">QR Code payment is currently unavailable.</p>
                    )}
                </div>
            )}
            
            {(upiToShow || (selectedMethod === 'qr' && !isQrDisabled && paymentSettings.qrCode)) && (
              <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Transaction ID / UTR</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter 12-digit reference number"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
              </div>
            )}

            <div className="space-y-3 mt-6">
                <button
                    onClick={handlePay}
                    disabled={!referenceNumber.trim()}
                    className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm disabled:bg-gray-300"
                >
                    I have paid, Confirm
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