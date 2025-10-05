import React, { useState, useRef } from 'react';
import { ArrowLeft, Gift, CircleDollarSign, Smile, Smartphone, AirVent, Refrigerator, X, Star } from 'lucide-react';
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
        </div>
    );
};

const getPrizeIcon = (prize: Prize, size: string = 'w-8 h-8') => {
    const className = `${size} mx-auto mb-1 drop-shadow-lg`;
    const lowerCaseName = prize.name.toLowerCase();

    if (lowerCaseName.includes('bonus')) return <Gift className={`${className} text-orange-400`} />;
    if (lowerCaseName.includes('iphone')) return <Smartphone className={`${className} text-gray-600`} />;
    if (lowerCaseName.includes('refrigerator')) return <Refrigerator className={`${className} text-slate-400`} />;
    if (lowerCaseName.includes('air condition')) return <AirVent className={`${className} text-sky-400`} />;
    if (prize.type === 'nothing') return <Smile className={`${className} text-indigo-400`} />;
    if (prize.type === 'money') return <CircleDollarSign className={`${className} text-yellow-400`} />;

    return <Star className={`${className} text-amber-300`} />;
};

const PrizeModal = ({ prize, onClose }: { prize: Prize; onClose: () => void }) => {
    const isSuccess = prize.type !== 'nothing';
    const title = isSuccess ? 'Congratulations!' : 'Better Luck Next Time!';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="relative bg-white text-gray-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-scale-up overflow-hidden">
                {isSuccess && Array.from({ length: 30 }).map((_, i) => <div key={i} className="confetti"></div>)}
                <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full border-4 border-yellow-300">
                    {getPrizeIcon(prize, 'w-16 h-16')}
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
    const { currentUser, setCurrentView, playLuckyDraw, addNotification, luckyDrawPrizes } = useApp();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showRules, setShowRules] = useState(false);
    const [wonPrize, setWonPrize] = useState<Prize | null>(null);
    const prizeRef = useRef<Prize | null>(null);

    const wheelPrizes = luckyDrawPrizes.slice(0, 8);
    while(wheelPrizes.length < 8) {
        wheelPrizes.push({ id: `filler-${wheelPrizes.length}`, name: 'Thank you', type: 'nothing', amount: 0 });
    }

    const handleDraw = async () => {
        if (isSpinning || !currentUser || currentUser.luckyDrawChances <= 0) {
            addNotification("You don't have any chances left.", 'error');
            return;
        }

        setIsSpinning(true);
        const result = await playLuckyDraw();

        if (result.success && result.prize) {
            prizeRef.current = result.prize;
            const prizeIndex = wheelPrizes.findIndex(p => p.id === result.prize!.id);
            
            if (prizeIndex === -1) {
                setIsSpinning(false);
                addNotification('An error occurred, please try again.', 'error');
                return;
            }

            const totalSpins = 5;
            const degreesPerPrize = 360 / wheelPrizes.length;
            const randomOffset = Math.random() * (degreesPerPrize - 10) - ((degreesPerPrize - 10) / 2);
            const targetRotation = (360 * totalSpins) - (prizeIndex * degreesPerPrize) - randomOffset;
            
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
      { user: '75****3726', prize: 'Got an Thank you as a prize' },
      { user: '75****3726', prize: 'Got an ₹50 as a prize' },
      { user: '93****7583', prize: 'Got an Random Bonus as a prize' },
      { user: '88****1234', prize: 'Won an iPhone 16!' },
      { user: '91****5678', prize: 'Received ₹500' },
    ];

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-gray-900 text-white font-sans p-4 pb-8 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => <div key={i} className="sparkle"></div>)}
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
            {wonPrize && <PrizeModal prize={wonPrize} onClose={() => setWonPrize(null)} />}
            
            <header className="flex items-center justify-between mb-4 relative z-10">
                <button onClick={() => setCurrentView('home')} className="p-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold tracking-wider">Lucky Wheel</h1>
                <button onClick={() => setShowRules(true)} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-white/30 transition">Rules</button>
            </header>

            <main className="flex flex-col items-center">
                <div className="bg-white/20 backdrop-blur-sm text-center py-2 px-6 rounded-full my-4 shadow-lg relative z-10">
                    You have <span className="font-bold text-yellow-300 text-lg">{currentUser.luckyDrawChances}</span> chances left
                </div>

                <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 my-8">
                     <div className="absolute top-[-24px] z-20 drop-shadow-lg">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full border-4 border-yellow-200 flex items-end justify-center">
                            <div style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} className="w-4 h-4 bg-yellow-400"></div>
                        </div>
                    </div>

                    <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl flex items-center justify-center"
                        style={{ padding: '12px' }}
                    >
                         <div className="relative w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                             {Array.from({ length: 8 }).map((_, i) => (
                                 <div key={i} className="absolute w-1 h-full" style={{transform: `rotate(${i * 45}deg)`}}>
                                    <div className="w-1 h-full bg-yellow-400/50 rounded-full"></div>
                                 </div>
                             ))}
                         </div>
                    </div>
                   
                    <div 
                        className="w-[calc(100%-24px)] h-[calc(100%-24px)] rounded-full relative"
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 6000ms cubic-bezier(0.25, 1, 0.5, 1)',
                            background: `conic-gradient(from -22.5deg, ${wheelPrizes.map((_, i) => `${i % 2 === 0 ? '#FEF9C3' : '#FDF4FF'} ${i * 45}deg ${(i + 1) * 45}deg`).join(', ')})`
                        }}
                        onTransitionEnd={handleSpinEnd}
                    >
                        {wheelPrizes.map((item, index) => {
                            const angle = (360 / wheelPrizes.length) * index;
                            return (
                                <div key={index}
                                    className="absolute w-full h-full flex items-start justify-center"
                                    style={{ transform: `rotate(${angle}deg)` }}>
                                    <div className="flex flex-col items-center text-center text-gray-800 pt-3">
                                        {getPrizeIcon(item, 'w-6 h-6 sm:w-8 sm:h-8')}
                                        <span className="text-[10px] sm:text-xs font-bold">{item.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <button onClick={handleDraw} disabled={isSpinning}
                        className="absolute w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex flex-col items-center justify-center border-4 border-white shadow-lg transform active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed z-10">
                        <h2 className="text-3xl font-extrabold tracking-tighter">SPIN</h2>
                    </button>
                </div>


                <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-4 mt-8">
                    <h3 className="text-lg font-bold mb-3 text-center tracking-wide text-yellow-300">🎉 Recent Winners 🎉</h3>
                    <div className="h-24 overflow-hidden relative">
                        <div className="absolute top-0 animate-marquee space-y-2">
                             {[...raffleRecords, ...raffleRecords].map((record, index) => (
                                <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-2.5 text-sm">
                                    <span className="font-semibold text-white/90">User {record.user}</span>
                                    <span className="text-white/70">{record.prize}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes scale-up { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.3s ease-out; }

                @keyframes sparkle-anim {
                    0%, 100% { transform: scale(0) rotate(0deg); opacity: 0.2; }
                    50% { transform: scale(1) rotate(180deg); opacity: 1; }
                }
                .sparkle {
                    position: absolute;
                    width: 3px; height: 3px; background: white; border-radius: 50%;
                    animation: sparkle-anim 5s infinite; box-shadow: 0 0 5px white, 0 0 10px white;
                }
                .sparkle:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
                .sparkle:nth-child(2) { top: 25%; left: 80%; animation-delay: 0.5s; width: 4px; height: 4px; }
                .sparkle:nth-child(3) { top: 60%; left: 10%; animation-delay: 1s; }
                .sparkle:nth-child(4) { top: 80%; left: 90%; animation-delay: 1.5s; width: 2px; height: 2px; }
                .sparkle:nth-child(5) { top: 40%; left: 50%; animation-delay: 2s; }
                .sparkle:nth-child(6) { top: 5%; left: 50%; animation-delay: 2.5s; }
                .sparkle:nth-child(7) { top: 95%; left: 50%; animation-delay: 3s; width: 4px; height: 4px; }
                .sparkle:nth-child(8) { top: 50%; left: 5%; animation-delay: 3.5s; }
                .sparkle:nth-child(9) { top: 50%; left: 95%; animation-delay: 4s; }
                .sparkle:nth-child(10) { top: 20%; left: 30%; animation-delay: 4.5s; }

                @keyframes marquee {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-marquee {
                    animation: marquee 15s linear infinite;
                }

                @keyframes confetti-fall {
                    0% { transform: translateY(-100%) rotateZ(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotateZ(360deg); opacity: 0; }
                }
                .confetti {
                    position: absolute; width: 8px; height: 15px;
                    opacity: 0; animation: confetti-fall 3s ease-out infinite;
                }
                .confetti:nth-child(odd) { background-color: #f9a825; }
                .confetti:nth-child(even) { background-color: #43a047; }
                .confetti:nth-child(3n) { background-color: #1e88e5; }
                .confetti:nth-child(4n) { background-color: #e53935; }
                .confetti:nth-child(5n) { border-radius: 50%; }
                .confetti:nth-child(1) { left: 10%; animation-delay: 0s; }
                .confetti:nth-child(2) { left: 20%; animation-delay: -0.2s; }
                .confetti:nth-child(3) { left: 30%; animation-delay: -0.4s; }
                .confetti:nth-child(4) { left: 40%; animation-delay: -0.6s; }
                .confetti:nth-child(5) { left: 50%; animation-delay: -0.8s; }
                .confetti:nth-child(6) { left: 60%; animation-delay: -1s; }
                .confetti:nth-child(7) { left: 70%; animation-delay: -1.2s; }
                .confetti:nth-child(8) { left: 80%; animation-delay: -1.4s; }
                .confetti:nth-child(9) { left: 90%; animation-delay: -1.6s; }
                .confetti:nth-child(10) { left: 15%; animation-delay: -1.8s; }
            `}</style>
        </div>
    );
};

export default LuckyWheelScreen;
