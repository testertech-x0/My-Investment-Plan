
import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Login: React.FC = () => {
  const { login, setCurrentView, appName, appLogo } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await login(identifier, password);
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 mx-4">
        <div className="text-center mb-8">
          {appLogo ? (
            <img src={appLogo} alt="App Logo" className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
          ) : (
            <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-white" size={32} />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">{appName}</h1>
          <p className="text-gray-500 mt-2">Investment Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number or User ID</label>
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter phone or ID" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter password" required />
          </div>

          <button type="submit" disabled={isLoggingIn} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-green-300">
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button onClick={() => setCurrentView('forgot-password')} className="text-green-600 text-sm hover:underline">
            Forgot Password?
          </button>
          <div className="text-gray-600 text-sm">
            Don't have an account? <button onClick={() => setCurrentView('register')} className="text-green-600 font-semibold hover:underline">Register</button>
          </div>
          <div className="pt-4">
            <button onClick={() => setCurrentView('admin-login')} className="text-gray-500 text-xs hover:text-gray-700">Admin Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
