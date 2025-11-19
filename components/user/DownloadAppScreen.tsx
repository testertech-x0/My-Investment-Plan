
import React from 'react';
import { ArrowLeft, Download, Shield, Smartphone, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DownloadAppScreen: React.FC = () => {
    const { setCurrentView, appName, appLogo } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">Download App</h1>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center">
                <div className="mt-8 mb-6 text-center">
                    {appLogo ? (
                        <img src={appLogo} alt="App Logo" className="w-24 h-24 rounded-2xl shadow-xl mx-auto mb-4 object-cover" />
                    ) : (
                        <div className="w-24 h-24 bg-green-500 rounded-2xl shadow-xl mx-auto mb-4 flex items-center justify-center">
                            <Smartphone className="text-white" size={48} />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800">{appName}</h2>
                    <p className="text-gray-500 text-sm mt-1">Version 2.0.1 • 4.8 <Star size={12} className="inline text-yellow-400 fill-yellow-400" /></p>
                </div>

                <div className="w-full max-w-xs space-y-4 mb-10">
                    <button onClick={() => window.alert('Download started! (Simulation)')} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-transform transform active:scale-95">
                        <Download size={20} />
                        Download for Android
                    </button>
                    <button disabled className="w-full bg-gray-200 text-gray-400 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        <Smartphone size={20} />
                        iOS Coming Soon
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                    <div className="bg-white p-4 rounded-xl shadow-sm flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full"><Shield className="text-blue-600" size={20} /></div>
                        <div>
                            <h3 className="font-semibold text-gray-800">100% Secure</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Verified by Play Protect. No malware or viruses.</p>
                        </div>
                    </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-full"><Smartphone className="text-purple-600" size={20} /></div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Better Experience</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Smoother animations and faster loading times on the app.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DownloadAppScreen;
