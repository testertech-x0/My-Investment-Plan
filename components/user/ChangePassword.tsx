import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const ChangePassword = () => {
  const { currentUser, setCurrentView, addNotification, changeUserPassword } = useApp();
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChanging, setIsChanging] = useState(false);
  
  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      addNotification('New passwords do not match', 'error');
      return;
    }

    setIsChanging(true);
    const result = await changeUserPassword(currentUser.id, formData.oldPassword, formData.newPassword);
    
    if (result.success) {
      setTimeout(() => setCurrentView('profile'), 1500);
    }
    setIsChanging(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => setCurrentView('profile')}
          className="mb-6 text-green-600 font-semibold flex items-center gap-2">
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input type="password" value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input type="password" value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            
            <button type="submit"
              disabled={isChanging}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition mt-6 disabled:bg-green-300">
              {isChanging ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
