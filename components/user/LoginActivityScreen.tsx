import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Check, CircleDollarSign, Gift, X } from 'lucide-react';

const RulesModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white text-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
                <header className="p-4 flex justify-between items-center border-b shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Login Activity Rules</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700">
                    <p>1. Users can check in once every day to receive rewards.</p>
                    <p>2. Cumulative check-ins unlock special milestone rewards on Day 7 and Day 14.</p>
                    <p>3. All rewards are automatically credited to your account balance.</p>
                    <p>4. The check-in cycle resets after 14 days.</p>
                    <p>5. The platform reserves the right to final interpretation of the event rules.</p>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes scale-up { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};


const LoginActivityScreen = () => {
    const { currentUser, setCurrentView, performDailyCheckIn } = useApp();
    const [showRules, setShowRules] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    if (!currentUser) return null;

    const checkIns = currentUser.dailyCheckIns || [];
    const today = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = checkIns.includes(today);
    const checkedInDays = checkIns.length;
    
    // The current day to be checked is the day after the last check-in
    const currentDayForCheckin = hasCheckedInToday ? checkedInDays : checkedInDays + 1;


    const handleCheckIn = async () => {
        if (hasCheckedInToday || isCheckingIn) return;
        setIsCheckingIn(true);
        await performDailyCheckIn();
        setIsCheckingIn(false);
    };

    const days = Array.from({ length: 14 }, (_, i) => {
        const dayNumber = i + 1;
        const isCheckedIn = dayNumber <= checkedInDays;
        const isToday = dayNumber === currentDayForCheckin && !hasCheckedInToday;
        const isMilestone = dayNumber === 7 || dayNumber === 14;

        let rewardText = "+0";
        if (isMilestone) {
            rewardText = "Get an additional ₹10 reward";
        }

        return { dayNumber, isCheckedIn, isToday, isMilestone, rewardText };
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-400 text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="sparkle"></div>
                <div className="sparkle"></div>
                <div className="sparkle"></div>
                <div className="sparkle"></div>
                <div className="sparkle"></div>
             </div>
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
            
            <header className="flex items-center justify-between p-4 relative z-10">
                <button onClick={() => setCurrentView('home')} className="p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Login Activity</h1>
                <button onClick={() => setShowRules(true)} className="bg-white/30 text-white text-sm font-semibold px-4 py-1.5 rounded-full">Rules</button>
            </header>

            <main className="p-4 relative z-10">
                <div className="text-center mb-4">
                    <p className="text-sm opacity-90">Total Balance</p>
                    <p className="text-4xl font-bold">₹{currentUser.balance.toFixed(2)}</p>
                </div>
                
                <p className="text-center font-semibold my-4">Login {checkedInDays} day(s) in a row</p>

                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                    <div className="grid grid-cols-4 gap-3">
                        {days.map(day => {
                            const isClickable = day.isToday && !isCheckingIn;
                            let cardClasses = 'p-2 rounded-lg text-center transition-all duration-300 ';
                            if (day.isCheckedIn) cardClasses += 'bg-green-100 text-green-800';
                            else if (day.isMilestone) cardClasses += 'bg-yellow-200 text-yellow-800';
                            else cardClasses += 'bg-white/80 text-gray-700';
                            
                            if (isClickable) cardClasses += ' cursor-pointer ring-2 ring-offset-2 ring-offset-green-400 ring-white transform hover:scale-105';
                            else if(day.isToday && isCheckingIn) cardClasses += ' animate-pulse';

                            return (
                                <button key={day.dayNumber} onClick={day.isToday ? handleCheckIn : undefined} disabled={!isClickable} className={cardClasses}>
                                    <p className="font-bold text-sm">Day {day.dayNumber}</p>
                                    <div className="my-2 h-8 flex items-center justify-center">
                                    {day.isCheckedIn ? (
                                        <Check className="w-6 h-6 text-green-600" />
                                    ) : day.isMilestone ? (
                                        <Gift className="w-7 h-7 text-yellow-600" />
                                    ) : (
                                        <CircleDollarSign className="w-6 h-6 text-gray-400" />
                                    )}
                                    </div>
                                    <p className={`text-xs ${day.isMilestone ? 'font-semibold' : ''}`}>
                                        {day.isMilestone && !day.isCheckedIn ? `+₹10` : day.isCheckedIn ? `+0` : '+0'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { day: 7, text: "Get an additional ₹10 reward" },
                            { day: 14, text: "Get an additional ₹10 reward" }
                        ].map(milestone => (
                            <div key={milestone.day} className="bg-yellow-200 text-yellow-900 p-3 rounded-lg flex items-center gap-3">
                                <Gift className="w-8 h-8 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-sm">Day {milestone.day}</p>
                                    <p className="text-xs">{milestone.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <style>{`
                @keyframes sparkle-anim {
                    0%, 100% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1); opacity: 1; }
                }
                .sparkle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    animation: sparkle-anim 3s infinite;
                }
                .sparkle:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
                .sparkle:nth-child(2) { top: 25%; left: 80%; animation-delay: 0.5s; width: 6px; height: 6px; }
                .sparkle:nth-child(3) { top: 60%; left: 10%; animation-delay: 1s; }
                .sparkle:nth-child(4) { top: 80%; left: 90%; animation-delay: 1.5s; width: 5px; height: 5px;}
                .sparkle:nth-child(5) { top: 40%; left: 50%; animation-delay: 2s; }
            `}</style>
        </div>
    );
};

export default LoginActivityScreen;