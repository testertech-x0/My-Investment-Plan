import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Landmark, PiggyBank, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { BankAccount } from '../../types';

const AddBankAccountForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { currentUser, updateBankAccount, addNotification, requestBankAccountOtp } = useApp();
    const [formData, setFormData] = useState({
        holderName: '',
        accountNumber: '',
        ifscCode: '',
        fundPassword: '',
        otp: '',
    });
    const [errors, setErrors] = useState({ ifscCode: '', fundPassword: '' });
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(30);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isOtpSent && otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        } else if (otpCountdown === 0) {
            setIsOtpSent(false);
        }
        return () => clearTimeout(timer);
    }, [isOtpSent, otpCountdown]);

    const handleSendOtp = () => {
        if (!currentUser) return;
        const result = requestBankAccountOtp(currentUser.id);
        if (result.success) {
            setIsOtpSent(true);
            setOtpCountdown(30);
        }
    };

    const validate = () => {
        const newErrors = { ifscCode: '', fundPassword: '' };
        let isValid = true;
        
        if (formData.ifscCode && (formData.ifscCode.length !== 11 || formData.ifscCode[4] !== '0')) {
            newErrors.ifscCode = 'IFSC is 11 digits, the 5th digit is the number 0';
            isValid = false;
        }
        if (formData.fundPassword && formData.fundPassword.length !== 6) {
            newErrors.fundPassword = 'Fund pwd must be 6 digits';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleBlur = () => {
        validate();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            addNotification('Please correct the errors in the form.', 'error');
            return;
        }
        if (!formData.holderName || !formData.accountNumber || !formData.ifscCode || !formData.fundPassword || !formData.otp) {
            addNotification('Please fill all the fields.', 'error');
            return;
        }
        if (currentUser) {
            const result = updateBankAccount(
                currentUser.id, 
                {
                    accountHolder: formData.holderName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                },
                formData.otp
            );
            if (result.success) {
                onSave();
            }
        }
    };
    
    if (!currentUser) return null;

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mobile number</label>
                <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600">+91</span>
                    <input type="text" value={currentUser.phone} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md bg-gray-100 text-gray-500" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Holder Name</label>
                <input type="text" name="holderName" value={formData.holderName} onChange={handleChange} placeholder="Please enter holder name" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
             <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Bank Account</label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Please enter bank account number" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} onBlur={handleBlur} placeholder="Please enter IFSC code" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <p className="text-xs text-red-500 h-4">{errors.ifscCode || (formData.ifscCode ? '' : 'IFSC is 11 digits, the 5th digit is the number 0')}</p>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Fund password</label>
                <input type="password" name="fundPassword" value={formData.fundPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Fund pwd must be 6 digits" maxLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <p className="text-xs text-red-500 h-4">{errors.fundPassword || (formData.fundPassword ? '' : 'Fund pwd must be 6 digits')}</p>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Verification code (OTP)</label>
                <div className="flex gap-2">
                    <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Please enter verification code" className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
                    <button type="button" onClick={handleSendOtp} disabled={isOtpSent} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        {isOtpSent ? `${otpCountdown}s` : 'send'}
                    </button>
                </div>
            </div>
            <button type="submit" className="w-full mt-4 bg-white text-gray-500 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                Confirm
            </button>
        </form>
    );
};

const DisplayCard = ({ account }: { account: BankAccount }) => {
    const maskedAccountNumber = `**** **** **** ${account.accountNumber.slice(-4)}`;
    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex items-center gap-3">
                <Landmark className="text-green-600" size={32} />
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Bank Account Details</h3>
                    <p className="text-sm text-gray-500">Linked Account</p>
                </div>
            </div>
            <p className="text-2xl font-mono tracking-wider text-gray-700">{maskedAccountNumber}</p>
            <div className="flex justify-between items-end border-t pt-4">
                <div>
                    <p className="text-xs text-gray-500">Account Holder</p>
                    <p className="font-semibold text-gray-800">{account.accountHolder}</p>
                </div>
                <button className="text-sm text-blue-600 font-semibold hover:underline">Modify</button>
            </div>
        </div>
    );
};

const BankAccountScreen: React.FC = () => {
    const { currentUser, setCurrentView } = useApp();
    const [viewMode, setViewMode] = useState<'display' | 'add'>('display');
    
    if (!currentUser) return null;

    useEffect(() => {
        // If user already has a bank account, show display mode. Otherwise, show add form.
        if (currentUser.bankAccount) {
            setViewMode('display');
        } else {
            setViewMode('add');
        }
    }, [currentUser.bankAccount]);

    const handleBack = () => {
        // If in add mode and they have an account, go back to display.
        // Otherwise, go back to profile.
        if (viewMode === 'add' && currentUser.bankAccount) {
            setViewMode('display');
        } else {
            setCurrentView('profile');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={handleBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Bank Account</h1>
            </header>
            
            <main className="flex-1 overflow-y-auto">
                {viewMode === 'display' && currentUser.bankAccount ? (
                  <div className="p-4">
                    <DisplayCard account={currentUser.bankAccount} />
                  </div>
                ) : viewMode === 'display' && !currentUser.bankAccount ? (
                  <div className="p-4">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <PiggyBank size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600 font-medium mb-6">No bank account</p>
                        <button 
                            onClick={() => setViewMode('add')}
                            className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm flex items-center justify-center gap-2"
                        >
                            <CreditCard size={20} />
                            Add New Card
                            <Plus size={20} className="ml-auto" />
                        </button>
                    </div>
                  </div>
                ) : ( // viewMode === 'add'
                  <AddBankAccountForm onSave={() => setViewMode('display')} />
                )}
            </main>
            
            <footer className="p-4 shrink-0">
                <div className="text-sm text-gray-600 space-y-3">
                    <h4 className="font-semibold">Explain</h4>
                    <p>Bank account is an important information for you to withdraw funds on the platform, please do not modify it arbitrarily.</p>
                    <p>To modify a bank account, a mobile OTP verification code is required.</p>
                    <p>Unable to receive mobile OTP verification code, please contact online customer service for assistance.</p>
                </div>
            </footer>
        </div>
    );
};

export default BankAccountScreen;