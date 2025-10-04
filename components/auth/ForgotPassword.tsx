import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const ForgotPassword = () => {
  const { users, updateUser, setCurrentView, addNotification } = useApp();
  const [formData, setFormData] = useState({ phone: '', newPassword: '', confirmPassword: '' });
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    const user = users.find(u => u.phone === formData.phone);
    if (!user) {
      addNotification('Phone number not found', 'error');
      setIsResetting(false);
      return;
    }
    if (formData.newPassword.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      setIsResetting(false);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      addNotification('Passwords do not match', 'error');
      setIsResetting(false);
      return;
    }

    await updateUser(user.id, { password: formData.newPassword });
    addNotification('Password reset successful! Redirecting to login...', 'success');
    setTimeout(() => setCurrentView('login'), 2000);
    setIsResetting(false);
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
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10-digit number" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input type="password" value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Minimum 6 characters" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input type="password" value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Re-enter password" required />
          </div>
          
          <button type="submit"
            disabled={isResetting}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-green-300">
            {isResetting ? 'Resetting...' : 'Reset Password'}
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
