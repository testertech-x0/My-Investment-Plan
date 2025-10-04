import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MyInformationScreen: React.FC = () => {
    const { currentUser, setCurrentView, updateUser, addNotification } = useApp();

    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    if (!currentUser) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUser(currentUser.id, { name, email });
        addNotification('Information updated successfully!', 'success');
        setCurrentView('profile');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">My Information</h1>
            </header>

            <main className="p-6">
                <div className="max-w-md mx-auto">
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                <User size={48} className="text-green-500" />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                                <Camera size={16} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                            <div className="relative">
                                <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Please enter username..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Please enter email..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default MyInformationScreen;
