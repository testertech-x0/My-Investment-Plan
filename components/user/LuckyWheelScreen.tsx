import React, { useState, useRef } from 'react';
import { ArrowLeft, Gift, CircleDollarSign, Smile, Smartphone, AirVent, Refrigerator, UserCircle, X, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Prize } from '../../types';

const RulesModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white text-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
                <header className="p-4 flex justify-between items-center border-b shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Rules</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700">
                    <div>
                        <h3 className="text-base font-bold text-green-700 mb-2">Participation qualifications:</h3>
                        <ol className="list-decimal list-inside space-y-1 pl-2">
                            <li>This event is open to all users.</li>
                            <li>Users can participate in the lottery multiple times a day. Completing designated tasks or sharing activities can increase the probability of winning.</li>
                        </ol>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-green-700 mb-2">Lottery method:</h3>
                        <ol className="list-decimal list-inside space-y-1 pl-2">
                            <li>After the user clicks the "Start Lottery" button, the system will automatically run the lottery program and randomly determine the winning prize.</li>
                            <li>The lottery wheel contains multiple prize areas, and the prize settings include but are not limited to: ₹50, ₹100, ₹1000, iPhone16, refrigerator, air conditioner, etc.</li>
                            <li>The final winning result is subject to the system prompt, and the prize cannot be replaced.</li>
                        </ol>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-green-700 mb-2">Prize distribution:</h3>
                        <ol className="list-decimal list-inside space-y-1 pl-2">
                            <li>Physical prizes will be distributed within 10 working days after the user wins the prize. Please contact the official customer service in time and provide the accurate delivery address.</li>
                            <li>The prize will be directly distributed to the user's account after the user wins the prize.</li>
                            <li>All prizes cannot be transferred, exchanged for cash or replaced with other items.</li>
                        </ol>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-green-700 mb-2">Other matters:</h3>
                        <ol className="list-decimal list-inside space-y-1 pl-2">
                            <li>During the event, if any cheating behavior is found (including but not limited to batch registration of accounts, use of plug-in programs, etc.), the company has the right to cancel the winning qualification.</li>
                            <li>In the event of force majeure such as insufficient prize inventory, system failure, etc., the company has the right to adjust or terminate the event and reserves the right of final interpretation.</li>
                        </ol>
                    </div>
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

const PrizeModal = ({ prize, onClose }: { prize: Prize; onClose: () => void }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        'Random Bonus': <Gift className="w-16 h-16 text-orange-500" />,
        '₹50': <CircleDollarSign className="w-16 h-16 text-yellow-500" />,
        '₹500': <CircleDollarSign className="w-16 h-16 text-yellow-500" />,
        'Thank you': <Smile className="w-16 h-16 text-blue-500" />,
        'iPhone 16': <Smartphone className="w-16 h-16 text-gray-700" />,
        '₹10000': <CircleDollarSign className="w-16 h-16 text-yellow-500" />,
        'Air condition': <AirVent className="w-16 h-16 text-cyan-500" />,
        'Refrigerator': <Refrigerator className="w-16 h-16 text-gray-500" />,
    };

    const isSuccess = prize.type !== 'nothing';
    const title = isSuccess ? 'Congratulations!' : 'Better Luck Next Time!';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white text-gray-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-scale-up">
                <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full">
                    {iconMap[prize.name] || <Star className="w-16 h-16 text-yellow-400" />}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">You have won <span className="font-bold text-green-600">{prize.name}</span>!</p>
                <button 
                    onClick={onClose}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                    Great!
                </button>
            </div>
        </div>
    );
};


const LuckyWheelScreen: React.FC = () => {
    const { currentUser, setCurrentView, playLuckyDraw, addNotification } = useApp();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showRules, setShowRules] = useState(false);
    const [wonPrize, setWonPrize] = useState<Prize | null>(null);
    const prizeRef = useRef<Prize | null>(null);

    const wheelPrizes = [
        { name: 'Random Bonus', icon: <Gift className="w-8 h-8 mx-auto mb-1 text-orange-500" /> },
        { name: '₹50', icon: <CircleDollarSign className="w-8 h-8 mx-auto mb-1 text-yellow-500" /> },
        { name: '₹500', icon: <CircleDollarSign className="w-8 h-8 mx-auto mb-1 text-yellow-500" /> },
        { name: 'iPhone 16', icon: <Smartphone className="w-8 h-8 mx-auto mb-1 text-gray-700" /> },
        { name: 'Refrigerator', icon: <Refrigerator className="w-8 h-8 mx-auto mb-1 text-gray-500" /> },
        { name: 'Air condition', icon: <AirVent className="w-8 h-8 mx-auto mb-1 text-cyan-500" /> },
        { name: '₹10000', icon: <CircleDollarSign className="w-8 h-8 mx-auto mb-1 text-yellow-500" /> },
        { name: 'Thank you', icon: <Smile className="w-8 h-8 mx-auto mb-1 text-blue-500" /> },
    ];

    const handleDraw = () => {
        if (isSpinning || !currentUser || currentUser.luckyDrawChances <= 0) {
            addNotification("You don't have any chances left.", 'error');
            return;
        }

        setIsSpinning(true);
        const result = playLuckyDraw();

        if (result.success && result.prize) {
            prizeRef.current = result.prize;
            const prizeIndex = wheelPrizes.findIndex(p => p.name === result.prize!.name);
            
            if (prizeIndex === -1) {
                // Fallback if prize not on wheel
                setIsSpinning(false);
                addNotification('An error occurred, please try again.', 'error');
                return;
            }

            const totalSpins = 5;
            const degreesPerPrize = 360 / wheelPrizes.length;
            const randomOffset = Math.random() * degreesPerPrize * 0.8 - (degreesPerPrize * 0.4);
            const targetRotation = (360 * totalSpins) - (prizeIndex * degreesPerPrize) + randomOffset;
            
            setRotation(prev => prev + targetRotation);
        } else {
            setIsSpinning(false);
        }
    };
    
    const handleSpinEnd = () => {
        setIsSpinning(false);
        if (prizeRef.current) {
            setWonPrize(prizeRef.current);
            if (prizeRef.current.type === 'physical') {
                addNotification(`Please contact support to claim your ${prizeRef.current.name}.`, 'info');
            }
        }
    };
    
    const raffleRecords = [
      { id: 1, user: '75****3726', date: 'Oct 04 2025', prize: 'Got an Thank you as a prize' },
      { id: 2, user: '75****3726', date: 'Oct 04 2025', prize: 'Got an ₹50 as a prize' },
      { id: 3, user: '93****7583', date: 'Oct 04 2025', prize: 'Got an Random Bonus as a prize' },
    ];

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-[#61b866] text-white font-sans p-4 pb-20 overflow-hidden">
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
            {wonPrize && <PrizeModal prize={wonPrize} onClose={() => setWonPrize(null)} />}
            
            <header className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentView('home')} className="p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Lucky draw</h1>
                <button onClick={() => setShowRules(true)} className="bg-white/30 text-white text-sm font-semibold px-4 py-1.5 rounded-full">Rules</button>
            </header>

            <div className="bg-white/80 text-[#3c8c40] text-center py-2 rounded-full mb-6 shadow-inner">
                You have {currentUser.luckyDrawChances} chances to participate in the lottery
            </div>

            <div className="relative flex flex-col items-center justify-center mb-6">
                <div className="absolute -top-2 z-10">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-yellow-400" style={{borderWidth: '12px 8px 0 8px'}}></div>
                </div>

                <div className="w-80 h-80 relative">
                    <div 
                        className="w-full h-full rounded-full border-8 border-yellow-300 bg-gradient-to-br from-[#d4f7d5] to-[#a8e6aa] shadow-2xl"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 5000ms cubic-bezier(0.1, 0.7, 0.3, 1)' 
                        }}
                        onTransitionEnd={handleSpinEnd}
                    >
                        {wheelPrizes.map((item, index) => {
                            const angle = (360 / wheelPrizes.length) * index;
                            return (
                                <div key={index}
                                    className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left flex items-center justify-center"
                                    style={{ transform: `rotate(${angle}deg)` }}>
                                    <div className="flex flex-col items-center text-center text-gray-800" style={{ transform: `rotate(${45/2}deg) translateY(-30%)` }}>
                                        {item.icon}
                                        <span className="text-xs font-semibold">{item.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <button onClick={handleDraw} disabled={isSpinning}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-400 text-green-800 rounded-full flex flex-col items-center justify-center border-4 border-yellow-300 shadow-lg transform active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed z-10">
                        <h2 className="text-2xl font-bold">Draw</h2>
                    </button>
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