
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const ForgotPassword = () => {
  const { setCurrentView, addNotification, resetPassword } = useApp();
  
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.match(/^\d{10}$/)) {
      addNotification('Please enter a valid 10-digit phone number', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addNotification('Passwords do not match', 'error');
      return;
    }

    setIsProcessing(true);
    const result = await resetPassword(phone, newPassword);
    if (result.success) {
      addNotification('Password reset successful! Please log in with your new password.', 'success');
      setTimeout(() => setCurrentView('login'), 2000);
    } else {
      // Error message is handled in context, but we stop processing here
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">+91</span>
              <input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10-digit number" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Minimum 6 characters" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Re-enter password" required />
          </div>
          
          <button type="submit"
            disabled={isProcessing}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-green-300">
            {isProcessing ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setCurrentView('login')} className="text-green-600 text-sm hover:underline">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
