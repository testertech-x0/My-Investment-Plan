
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Copy, Award, TrendingUp, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TeamStats } from '../../types';

const TeamScreen: React.FC = () => {
    const { currentUser, setCurrentView, addNotification, fetchTeamStats } = useApp();
    const [stats, setStats] = useState<TeamStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchTeamStats();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [fetchTeamStats]);

    if (!currentUser) return null;

    const referralLink = `https://wealthfund.app/register?code=${currentUser.referralCode || ''}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addNotification('Copied to clipboard!', 'success');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex items-center p-4 border-b bg-white sticky top-0 z-10 shrink-0">
                <button onClick={() => setCurrentView('home')} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 pr-6">My Team</h1>
            </header>

            <main className="flex-1 p-4 overflow-y-auto">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                    <h2 className="text-lg font-semibold opacity-90 mb-1">Total Team Income</h2>
                    <p className="text-4xl font-bold">₹{stats?.totalIncome.toFixed(2) || '0.00'}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm opacity-80">
                        <Award size={16} />
                        <span>Earn 10% commission on Level 1 investments</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-indigo-500" />
                        Referral Link
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mb-3 border">
                        <span className="font-mono text-gray-600 truncate text-sm">{referralLink}</span>
                        <button onClick={() => copyToClipboard(referralLink)} className="text-indigo-600 p-1 hover:bg-indigo-50 rounded">
                            <Copy size={18} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                        <span className="text-sm text-gray-500">Invitation Code</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 tracking-widest">{currentUser.referralCode || 'Loading...'}</span>
                            <button onClick={() => copyToClipboard(currentUser.referralCode || '')} className="text-indigo-600">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Team Members</h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">{stats?.totalMembers || 0}</span>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading team data...</div>
                    ) : stats?.members && stats.members.length > 0 ? (
                        <div className="divide-y">
                            {stats.members.map((member, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{member.name}</p>
                                            <p className="text-xs text-gray-400">{member.phone.substring(0, 2)}****{member.phone.slice(-4)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Joined</p>
                                        <p className="text-xs font-medium text-gray-700">{new Date(member.joinDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Users size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No team members yet.</p>
                            <p className="text-sm mt-1">Share your link to start earning!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeamScreen;
