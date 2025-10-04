import React, { useState } from 'react';
import { ArrowLeft, Gift, CircleDollarSign, Smile, Smartphone, AirVent, Refrigerator, UserCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LuckyWheelScreen: React.FC = () => {
    const { currentUser, setCurrentView, playLuckyDraw } = useApp();
    const [isSpinning, setIsSpinning] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const gridItems = [
        { name: 'Random Bonus', icon: <Gift className="w-8 h-8 mx-auto mb-1 text-orange-500" /> },
        { name: '₹50', icon: <CircleDollarSign className="w-8 h-8 mx-auto mb-1 text-yellow-500" /> },
        { name: '₹500', icon: <CircleDollarSign className="w-8 h-8 mx-auto mb-1 text-yellow-500" /> },
        { name: 'Thank you', icon: <Smile className="w-8 h-8 mx-auto mb-1 text-blue-500" /> },
        null, // Center
        { name: 'iPhone 16', icon: <Smartphone className="w-8 h-8 mx-auto mb-1 text-gray-700" /> },
        { name: '₹10000', icon: <CircleDollarSign className="w-8 h-8 mx-auto mb-1 text-yellow-500" /> },
        { name: 'Air condition', icon: <AirVent className="w-8 h-8 mx-auto mb-1 text-cyan-500" /> },
        { name: 'Refrigerator', icon: <Refrigerator className="w-8 h-8 mx-auto mb-1 text-gray-500" /> },
    ];
    
    // Animation path around the center
    const animationPath = [0, 1, 2, 5, 8, 7, 6, 3];

    const handleDraw = () => {
        if (isSpinning || !currentUser || currentUser.luckyDrawChances <= 0) {
            return;
        }

        setIsSpinning(true);
        const result = playLuckyDraw();

        if (result.success && result.prize) {
            const prizeName = result.prize;
            const finalGridIndex = gridItems.findIndex(item => item?.name === prizeName);
            
            if (finalGridIndex === -1) {
                // Should not happen if prizes are synced
                setIsSpinning(false);
                return;
            }

            const animationPrizeIndex = animationPath.indexOf(finalGridIndex);
            
            const totalSpins = 3;
            const totalDuration = 4000; // 4 seconds total animation
            const totalSteps = totalSpins * animationPath.length + animationPrizeIndex;
            let currentStep = 0;

            // Using an easing function for a smooth slow-down effect
            const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

            const spin = () => {
                const currentAnimationIndex = currentStep % animationPath.length;
                setActiveIndex(animationPath[currentAnimationIndex]);

                if (currentStep >= totalSteps) {
                    setActiveIndex(finalGridIndex);
                    setIsSpinning(false);
                    return;
                }

                const progress = currentStep / totalSteps;
                const nextProgress = (currentStep + 1) / totalSteps;
                
                const easedTime = easeOutQuint(progress) * totalDuration;
                const nextEasedTime = easeOutQuint(nextProgress) * totalDuration;

                const delay = nextEasedTime - easedTime;
                
                currentStep++;
                setTimeout(spin, delay);
            };
            spin();
        } else {
            setIsSpinning(false);
        }
    };
    
    const raffleRecords = [
      { id: 1, user: '75****3726', date: 'Oct 04 2025', prize: 'Got an Thank you as a prize' },
      { id: 2, user: '75****3726', date: 'Oct 04 2025', prize: 'Got an ₹50 as a prize' },
      { id: 3, user: '93****7583', date: 'Oct 04 2025', prize: 'Got an Random Bonus as a prize' },
    ];

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-[#61b866] text-white font-sans p-4 pb-20">
            <header className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentView('home')} className="p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Lucky draw</h1>
                <button className="bg-white/30 text-white text-sm font-semibold px-4 py-1.5 rounded-full">Rules</button>
            </header>

            <div className="bg-white/80 text-[#3c8c40] text-center py-2 rounded-full mb-6 shadow-inner">
                You have {currentUser.luckyDrawChances} chances to participate in the lottery
            </div>

            <div className="p-2 bg-gradient-to-br from-[#d4f7d5] to-[#a8e6aa] rounded-2xl shadow-lg mb-6">
                <div className="grid grid-cols-3 gap-2">
                    {gridItems.map((item, index) => {
                        if (!item) {
                            return (
                                <button key="draw-button" onClick={handleDraw} disabled={isSpinning}
                                    className="bg-yellow-400 text-green-800 rounded-lg flex flex-col items-center justify-center aspect-square shadow-md transform active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed">
                                    <h2 className="text-2xl font-bold">Draw Now</h2>
                                    {isSpinning && <p className="text-xs">Spinning...</p>}
                                </button>
                            );
                        }
                        return (
                            <div key={index}
                                className={`bg-white text-gray-800 rounded-lg flex flex-col items-center justify-center text-center p-2 aspect-square transition-all duration-100
                                ${activeIndex === index ? 'ring-4 ring-yellow-400 scale-105 shadow-2xl' : 'shadow-sm'}`}>
                                {item.icon}
                                <span className="text-xs font-semibold">{item.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-4 mb-8">
                <button className="flex-1 bg-gradient-to-r from-[#4caf50] to-[#8bc34a] py-3 rounded-full shadow-lg font-semibold">
                    My balance: ₹{currentUser.balance.toFixed(2)}
                </button>
                 <button className="flex-1 bg-gradient-to-r from-[#4caf50] to-[#8bc34a] py-3 rounded-full shadow-lg font-semibold">
                    My prizes
                </button>
            </div>

            <div className="bg-white text-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-4 text-[#3c8c40]">Raffle Records</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                    {raffleRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <UserCircle size={36} className="text-gray-300"/>
                                <div>
                                    <p className="font-semibold text-sm">{record.user}</p>
                                    <p className="text-xs text-gray-500">{record.date}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 text-right">{record.prize}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LuckyWheelScreen;