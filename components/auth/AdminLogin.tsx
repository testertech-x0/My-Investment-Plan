import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AdminLogin: React.FC = () => {
  const { adminLogin, setCurrentView } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await adminLogin(username, password);
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-2">Secure Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              placeholder="Admin username" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              placeholder="Admin password" required />
          </div>

          <button type="submit" disabled={isLoggingIn} className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:bg-gray-600">
            {isLoggingIn ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setCurrentView('login')} className="text-gray-600 text-sm hover:underline">← Back to User Login</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
