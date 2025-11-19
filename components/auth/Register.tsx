
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

type Strength = {
  strength: 'weak' | 'medium' | 'strong';
  color: 'red' | 'yellow' | 'green';
  width: '33%' | '66%' | '100%';
};

const Register: React.FC = () => {
  const { register, setCurrentView, addNotification, appName, requestRegisterOtp } = useApp();
  const [formData, setFormData] = useState({ phone: '', password: '', confirmPassword: '', name: '', inviteCode: '' });
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOtpSent && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    } else if (otpCountdown === 0) {
      setIsOtpSent(false);
    }
    return () => clearTimeout(timer);
  }, [isOtpSent, otpCountdown]);

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

  const validateStep1 = () => {
    if (formData.password.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      addNotification('Passwords do not match', 'error');
      return false;
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      addNotification('Please enter a valid 10-digit phone number', 'error');
      return false;
    }
    if (!formData.name.trim()) {
      addNotification('Please enter your name', 'error');
      return false;
    }
    return true;
  };

  const handleSendOtp = async (isResend = false) => {
    if (!isResend && !validateStep1()) return;
    setIsProcessing(true);
    const result = await requestRegisterOtp(formData.phone);
    if (result.success) {
      setStep(2);
      setIsOtpSent(true);
      setOtpCountdown(60);
    }
    setIsProcessing(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { addNotification('OTP must be 6 digits', 'error'); return; }
    setIsProcessing(true);
    const result = await register({ ...formData, otp });
    if (result.success) {
      setTimeout(() => setCurrentView('login'), 2000);
    }
    setIsProcessing(false);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColorClasses = getStrengthColorClass(passwordStrength?.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-1">Join {appName} today</p>
        </div>

        <form onSubmit={step === 2 ? handleRegister : (e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">+91</span>
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                disabled={step === 2} 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100" 
                placeholder="10-digit number" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={step === 2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100" placeholder="Minimum 6 characters" required />
            {passwordStrength && (
              <div className="mt-2"><div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${strengthColorClasses.bg}`} style={{ width: passwordStrength.width }} /></div><span className={`text-xs capitalize ${strengthColorClasses.text}`}>{passwordStrength.strength}</span></div></div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              disabled={step === 2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100" placeholder="Re-enter password" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={step === 2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100" placeholder="Your name" required />
          </div>
          
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invitation Code (Optional)</label>
            <input type="text" value={formData.inviteCode} onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
              disabled={step === 2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100" placeholder="Enter code if you have one" />
          </div>

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code (OTP)</label>
              <div className="flex gap-2">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required />
                <button type="button" onClick={() => handleSendOtp(true)} disabled={isOtpSent || isProcessing} className="px-4 py-2 border rounded-lg text-sm font-medium transition disabled:bg-gray-100 disabled:cursor-not-allowed">
                  {isOtpSent ? `Resend in ${otpCountdown}s` : 'Resend'}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={isProcessing} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-green-300">
            {step === 1 ? (isProcessing ? 'Sending OTP...' : 'Send OTP') : (isProcessing ? 'Registering...' : 'Register')}
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
