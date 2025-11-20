
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const FundPasswordScreen: React.FC = () => {
    const { currentUser, setCurrentView, updateFundPassword, addNotification } = useApp();
    const [fundPassword, setFundPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!currentUser) return null;

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 6) {
            setFundPassword(value);
            if (value.length === 6) {
                setError('');
            }
        }
    };

    const handlePasswordBlur = () => {
        if (fundPassword.length > 0 && fundPassword.length < 6) {
            setError('Fund password must be 6 digits');
        } else {
            setError('');
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (fundPassword.length !== 6) {
            setError('Fund password must be 6 digits');
            addNotification('Please enter a valid 6-digit fund password.', 'error');
            return;
        }

        setIsSubmitting(true);
        const result = await updateFundPassword(currentUser.id, fundPassword);
        if (result.success) {
            setTimeout(() => setCurrentView('profile'), 1500);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 bg-white border-b sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">FundPWD</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Mobile number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600">+91</span>
                                <input type="text" value={currentUser.phone} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md bg-gray-100 text-gray-500" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Fund password</label>
                            <input
                                type="password"
                                value={fundPassword}
                                onChange={handlePasswordChange}
                                onBlur={handlePasswordBlur}
                                placeholder="Fund password must be 6 digits"
                                maxLength={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                            />
                            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm disabled:bg-green-300"
                            >
                                {isSubmitting ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-xs text-gray-500 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <p>
                        In order to ensure the safety of your funds, users who are in the process of withdrawing funds or have successfully withdrawn funds cannot change their fund passwords. If you need to change your fund password, please contact online customer service
                    </p>
                </div>
            </main>
        </div>
    );
};

export default FundPasswordScreen;
