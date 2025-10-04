import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

type Strength = {
  strength: 'weak' | 'medium' | 'strong';
  color: 'red' | 'yellow' | 'green';
  width: '33%' | '66%' | '100%';
};

const Register: React.FC = () => {
  const { register, setCurrentView, addNotification } = useApp();
  const [formData, setFormData] = useState({ phone: '', password: '', confirmPassword: '', name: '', email: '' });

  const getPasswordStrength = (password: string): Strength | null => {
    if (!password) return null;
    if (password.length < 6) return { strength: 'weak', color: 'red', width: '33%' };
    if (password.length < 10) return { strength: 'medium', color: 'yellow', width: '66%' };
    return { strength: 'strong', color: 'green', width: '100%' };
  };

  const getStrengthColorClass = (color?: 'red' | 'yellow' | 'green') => {
    switch (color) {
      case 'red': return { bg: 'bg-red-500', text: 'text-red-600' };
      case 'yellow': return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
      case 'green': return { bg: 'bg-green-500', text: 'text-green-600' };
      default: return { bg: '', text: '' };
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      addNotification('Passwords do not match', 'error');
      return;
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      addNotification('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const result = register(formData);
    if (result.success) {
      setTimeout(() => setCurrentView('login'), 2000);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColorClasses = getStrengthColorClass(passwordStrength?.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-1">Join Fortunin today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">+91</span>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10-digit number" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Minimum 6 characters" required />
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${strengthColorClasses.bg}`} style={{ width: passwordStrength.width }} />
                  </div>
                  <span className={`text-xs capitalize ${strengthColorClasses.text}`}>{passwordStrength.strength}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Re-enter password" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name (Optional)</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your@email.com" />
          </div>

          <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600 text-sm">Already have an account? </span>
          <button onClick={() => setCurrentView('login')} className="text-green-600 font-semibold hover:underline">Login</button>
        </div>
      </div>
    </div>
  );
};

export default Register;