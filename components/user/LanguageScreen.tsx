import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LanguageScreen: React.FC = () => {
    const { currentUser, setCurrentView, updateUser, addNotification } = useApp();
    const [selectedLanguage, setSelectedLanguage] = useState(currentUser?.language || 'en');

    if (!currentUser) return null;

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी (भारत)' },
        { code: 'ta', name: 'தமிழ் (இந்தியா)' },
        { code: 'te', name: 'తెలుగు (భారతదేశం)' }
    ];

    const handleSave = () => {
        updateUser(currentUser.id, { language: selectedLanguage });
        addNotification('Language saved successfully!', 'success');
        setCurrentView('profile');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Language</h1>
            </header>

            <main className="flex-1 p-4">
                <div className="bg-white rounded-lg shadow-sm">
                    {languages.map(lang => (
                        <label
                            key={lang.code}
                            className="flex items-center justify-between p-4 border-b last:border-0 cursor-pointer"
                            htmlFor={`lang-${lang.code}`}
                        >
                            <span className="text-gray-800">{lang.name}</span>
                            <div className="relative">
                                <input
                                    type="radio"
                                    id={`lang-${lang.code}`}
                                    name="language"
                                    value={lang.code}
                                    checked={selectedLanguage === lang.code}
                                    onChange={() => setSelectedLanguage(lang.code)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 ${selectedLanguage === lang.code ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}>
                                    {selectedLanguage === lang.code && <div className="w-full h-full rounded-full border-2 border-white"></div>}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </main>
            
            <footer className="p-4 sticky bottom-0 bg-gray-50 shrink-0">
                 <button
                    onClick={handleSave}
                    className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm"
                >
                    Save
                </button>
            </footer>
        </div>
    );
};

export default LanguageScreen;
