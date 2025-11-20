
import React, { useState, useRef, useEffect, FC } from 'react';
import { LogOut, Users, Activity, TrendingUp, Wallet, Search, Edit, Eye, Trash2, X, FileText, Briefcase, Plus, Settings, Check, Crop, LogIn, Shield, UserCheck, UserX, Camera, MessageSquare, Paperclip, Send, Share2, Gift, CreditCard, QrCode, LayoutDashboard, Palette, Target, Menu, Link, Globe, DollarSign, Calendar, Download, Smartphone, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { User, InvestmentPlan, ThemeColor, Transaction, LoginActivity, Investment, ChatMessage, SocialLinks, Prize, Comment, SocialLinkItem, ChatSession, ActivityLogEntry } from '../../types';
import { TransactionIcon } from '../user/BillDetailsScreen';
import * as api from '../../context/api';

// --- TYPES & HELPERS ---
const themeOptions: { name: ThemeColor; bgClass: string }[] = [
    { name: 'green', bgClass: 'bg-green-500' }, { name: 'blue', bgClass: 'bg-blue-500' }, { name: 'purple', bgClass: 'bg-purple-500' },
    { name: 'orange', bgClass: 'bg-orange-500' }, { name: 'red', bgClass: 'bg-red-500' }, { name: 'yellow', bgClass: 'bg-yellow-500' },
    { name: 'teal', bgClass: 'bg-teal-500' }, { name: 'pink', bgClass: 'bg-pink-500' },
];
const primaryColor = 'slate'; // Admin theme color

const ImagePreviewModal: FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60]" onClick={onClose}>
        <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors z-10" onClick={onClose}><X size={24} /></button>
        <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <img src={imageUrl} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
    </div>
);

// --- SUB-COMPONENTS ---

const DashboardView: FC = () => {
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalInvestments: 0, platformBalance: 0 });
    
    useEffect(() => {
        const loadStats = async () => {
             try {
                 const data = await api.fetchAdminDashboard();
                 setStats(data);
             } catch (e) {
                 console.error("Failed to load stats", e);
             }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p className="text-sm text-gray-500 font-medium">Total Users</p><p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p></div>
                    <div className="bg-blue-50 p-3 rounded-lg"><Users className="text-blue-600" size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p className="text-sm text-gray-500 font-medium">Active Users</p><p className="text-3xl font-bold text-green-600 mt-1">{stats.activeUsers}</p></div>
                    <div className="bg-green-50 p-3 rounded-lg"><UserCheck className="text-green-600" size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p className="text-sm text-gray-500 font-medium">Total Investment</p><p className="text-3xl font-bold text-purple-600 mt-1">₹{stats.totalInvestments.toLocaleString()}</p></div>
                    <div className="bg-purple-50 p-3 rounded-lg"><Briefcase className="text-purple-600" size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div><p className="text-sm text-gray-500 font-medium">User Liabilities</p><p className="text-3xl font-bold text-orange-600 mt-1">₹{stats.platformBalance.toLocaleString()}</p></div>
                    <div className="bg-orange-50 p-3 rounded-lg"><Wallet className="text-orange-600" size={24} /></div>
                </div>
            </div>
        </div>
    );
};

const FinancialManagementView: FC<{ requests: Transaction[], history: Transaction[], onApprove: (tx: Transaction) => void, onReject: (tx: Transaction) => void, onViewProof: (url: string) => void, onDistribute: () => void }> = ({ requests, history, onApprove, onReject, onViewProof, onDistribute }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Requests</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Pending Requests</button>
                        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>History Log</button>
                    </div>
                </div>
                <button onClick={onDistribute} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm text-sm font-medium">
                    <TrendingUp size={18} /> Distribute Daily Earnings
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proof</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{activeTab === 'pending' ? 'Actions' : 'Status'}</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {(activeTab === 'pending' ? requests : history).map(req => (
                            <tr key={req.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${req.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.type}</span></td>
                                <td className="px-6 py-4"><div><p className="text-sm font-medium text-gray-900">{(req as any).userName || 'Unknown'}</p><p className="text-xs text-gray-500">{(req as any).userPhone}</p></div></td>
                                <td className="px-6 py-4 font-bold text-gray-800">₹{Math.abs(req.amount).toFixed(2)}</td>
                                <td className="px-6 py-4">{req.proofImg ? <button onClick={() => onViewProof(req.proofImg!)} className="text-blue-600 text-xs hover:underline flex items-center gap-1"><Eye size={14} /> View</button> : <span className="text-gray-400 text-xs">N/A</span>}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.date).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    {activeTab === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => onApprove(req)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Approve"><Check size={18} /></button>
                                            <button onClick={() => onReject(req)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject / Delete"><X size={18} /></button>
                                        </div>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(activeTab === 'pending' ? requests : history).length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserInvestmentsModal: FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Investment History</h3>
                        <p className="text-sm text-gray-500">User: {user.name} ({user.phone})</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-gray-800" /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {user.investments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Plan Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Daily / Total Rev</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Start Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {user.investments.map((inv, idx) => {
                                        // Calculate if expired roughly
                                        const start = new Date(inv.startDate).getTime();
                                        const end = start + (inv.revenueDays * 24 * 60 * 60 * 1000);
                                        const isExpired = Date.now() > end;
                                        
                                        return (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 text-sm font-medium">{inv.planName}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{inv.category}</td>
                                                <td className="px-4 py-2 text-sm font-bold text-green-600">₹{inv.investedAmount}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-500">Daily: ₹{inv.dailyEarnings}</span>
                                                        <span className="text-xs font-semibold">Total: ₹{inv.totalRevenue}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{new Date(inv.startDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isExpired ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                                                        {isExpired ? 'Finished' : 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-10">No investment records found for this user.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const UserManagementView: FC<{ users: User[], onEdit: (u: User) => void, onToggle: (u: User) => void, onDelete: (id: string) => void, onLoginAs: (id: string) => void, onViewInvestments: (u: User) => void }> = ({ users, onEdit, onToggle, onDelete, onLoginAs, onViewInvestments }) => {
    const [term, setTerm] = useState('');
    const filtered = users.filter(u => u.name.toLowerCase().includes(term.toLowerCase()) || u.phone.includes(term) || u.id.includes(term));
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search users..." value={term} onChange={e => setTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Balance</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">{filtered.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{user.name[0]}</div><div><p className="text-sm font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-500">{user.phone}</p></div></div></td>
                            <td className="px-6 py-4 text-sm text-gray-800 font-mono">₹{user.balance.toFixed(2)}</td>
                            <td className="px-6 py-4"><button onClick={() => onToggle(user)} className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.isActive ? 'Active' : 'Blocked'}</button></td>
                            <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2">
                                <button onClick={() => onViewInvestments(user)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="View Investments"><Briefcase size={16} /></button>
                                <button onClick={() => onLoginAs(user.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Login As"><LogIn size={16} /></button>
                                <button onClick={() => onEdit(user)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Edit"><Edit size={16} /></button>
                                <button onClick={() => onDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                            </div></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

const PlanManagementView: FC<{ plans: InvestmentPlan[], onAdd: () => void, onEdit: (p: InvestmentPlan) => void, onDelete: (id: string) => void }> = ({ plans, onAdd, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-800">Investment Plans</h2><button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"><Plus size={18} /> Add Plan</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {plans.map(plan => (
                <div key={plan.id} className="border rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div><h3 className="font-bold text-lg text-gray-800">{plan.name}</h3><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{plan.category}</span></div>
                        <div className="flex gap-1"><button onClick={() => onEdit(plan)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button><button onClick={() => onDelete(plan.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button></div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between"><span>Min Invest:</span><span className="font-semibold">₹{plan.minInvestment}</span></div>
                        <div className="flex justify-between"><span>Daily Return:</span><span className="font-semibold">₹{plan.dailyReturn}</span></div>
                        <div className="flex justify-between"><span>Duration:</span><span className="font-semibold">{plan.duration} Days</span></div>
                        <div className="flex justify-between"><span>Total ROI:</span><span className="font-semibold text-green-600">₹{plan.dailyReturn * plan.duration}</span></div>
                        {plan.expirationDate && <div className="flex justify-between text-orange-600"><span>Expires:</span><span>{new Date(plan.expirationDate).toLocaleDateString()}</span></div>}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LuckyDrawView: FC<{ prizes: Prize[], winningIds: string[], onAdd: () => void, onEdit: (p: Prize) => void, onDelete: (id: string) => void, onToggleWin: (id: string) => void }> = ({ prizes, winningIds, onAdd, onEdit, onDelete, onToggleWin }) => (
    <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-800">Lucky Draw Prizes</h2><button onClick={onAdd} className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600"><Plus size={18} /> Add Prize</button></div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Prize Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount/Value</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Force Win</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">{prizes.map(prize => (
                    <tr key={prize.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{prize.name}</td>
                        <td className="px-6 py-4 capitalize text-sm text-gray-600">{prize.type}</td>
                        <td className="px-6 py-4 text-sm">{prize.type === 'money' || prize.type === 'bonus' ? `₹${prize.amount}` : '-'}</td>
                        <td className="px-6 py-4 text-center"><input type="checkbox" checked={winningIds.includes(prize.id)} onChange={() => onToggleWin(prize.id)} className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer" /></td>
                        <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => onEdit(prize)} className="text-blue-600 p-1"><Edit size={16} /></button><button onClick={() => onDelete(prize.id)} className="text-red-600 p-1"><Trash2 size={16} /></button></div></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    </div>
);

const AdminChatView: FC<{ sessions: ChatSession[], onSelect: (uid: string) => void, activeId: string | null, messages: ChatMessage[], onSend: (text: string, img?: string) => void }> = ({ sessions, onSelect, activeId, messages, onSend }) => {
    const [text, setText] = useState('');
    const [img, setImg] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
    return (
        <div className="bg-white rounded-lg shadow flex h-[600px] overflow-hidden">
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b font-semibold bg-gray-50">Conversations</div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map(s => (
                        <div key={s.userId} onClick={() => onSelect(s.userId)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeId === s.userId ? 'bg-blue-50' : ''}`}>
                            <div className="flex justify-between"><span className="font-medium text-sm text-gray-900 truncate w-24">{s.userId}</span>{s.adminUnreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{s.adminUnreadCount}</span>}</div>
                            <p className="text-xs text-gray-500 truncate mt-1">{s.messages[s.messages.length - 1]?.text || 'Image'}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                {activeId ? <>
                    <div className="p-4 border-b font-semibold flex justify-between"><span>User: {activeId}</span></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg ${m.senderId === 'admin' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none'}`}>
                                    {m.text && <p className="text-sm">{m.text}</p>}
                                    {m.imageUrl && <img src={m.imageUrl} className="mt-2 rounded max-h-40" alt="attachment" />}
                                    <p className={`text-[10px] mt-1 text-right ${m.senderId === 'admin' ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(m.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    <div className="p-4 border-t bg-white">
                        {img && <div className="mb-2 flex items-center gap-2 bg-gray-100 p-2 rounded w-fit"><span className="text-xs">Image attached</span><button onClick={() => setImg(null)}><X size={14}/></button></div>}
                        <div className="flex gap-2">
                            <button onClick={() => fileRef.current?.click()} className="p-2 text-gray-500 hover:bg-gray-100 rounded"><Paperclip size={20} /></button>
                            <input type="file" ref={fileRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImg(ev.target?.result as string); r.readAsDataURL(f); } }} />
                            <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (text || img) && (onSend(text, img || undefined), setText(''), setImg(null))} className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." />
                            <button onClick={() => (text || img) && (onSend(text, img || undefined), setText(''), setImg(null))} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"><Send size={20} /></button>
                        </div>
                    </div>
                </> : <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>}
            </div>
        </div>
    );
};

const CommentsManagementView: FC<{ comments: Comment[], onDelete: (id: string) => void, onEdit: (comment: Comment) => void, setViewingImage: (url: string) => void }> = ({ comments, onDelete, onEdit, setViewingImage }) => (
    <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b"><h2 className="text-xl font-semibold text-gray-800">User Comments</h2></div>
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Comment</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Images</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">{comments.length > 0 ? comments.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">{c.userAvatar && <img src={c.userAvatar} className="w-full h-full object-cover"/>}</div><div><p className="text-sm font-medium">{c.userName}</p><p className="text-xs text-gray-500">{c.maskedPhone}</p></div></div></td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{c.text}</td>
                        <td className="px-6 py-4 flex gap-1">{c.images.map((img, i) => <button key={i} onClick={() => setViewingImage(img)}><img src={img} className="w-8 h-8 rounded object-cover border"/></button>)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.timestamp).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => onEdit(c)} className="text-blue-600 p-1"><Edit size={16} /></button><button onClick={() => onDelete(c.id)} className="text-red-600 p-1"><Trash2 size={16} /></button></div></td>
                    </tr>
                )) : <tr><td colSpan={5} className="p-8 text-center text-gray-500">No comments.</td></tr>}</tbody>
            </table>
        </div>
    </div>
);

const SystemLogsView: FC<{ logs: ActivityLogEntry[] }> = ({ logs }) => (
    <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b"><h2 className="text-xl font-semibold text-gray-800">System Activity Logs</h2></div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Action</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                    {logs.length > 0 ? logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp.toLocaleString()}</td>
                            <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="font-medium text-gray-900">{log.userName}</span><span className="text-xs text-gray-400">({log.userId.substring(0, 6)})</span></div></td>
                            <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                        </tr>
                    )) : <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const AdminDashboard: React.FC = () => {
    const { 
        users, adminLogout, appName, updateAppName, appLogo, updateAppLogo, themeColor, updateThemeColor,
        socialLinks, updateSocialLinks, addNotification, showConfirmation,
        investmentPlans, addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan,
        luckyDrawPrizes, luckyDrawWinningPrizeIds, addLuckyDrawPrize, updateLuckyDrawPrize, deleteLuckyDrawPrize, setLuckyDrawWinningPrizes,
        paymentSettings, updatePaymentSettings,
        chatSessions, sendChatMessage, markChatAsRead,
        comments, deleteComment, updateComment,
        financialRequests, financialHistory, fetchFinancialRequests, fetchFinancialHistory, approveFinancialRequest, rejectFinancialRequest, distributeDailyEarnings,
        updateUser, deleteUser, loginAsUserFunc, changeAdminPassword, activityLog, setActivityLog, systemNotice, updateSystemNotice,
        fetchAllUsers // Added fetchAllUsers
    } = useApp() as any;

    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    
    // Modals State
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState({ name: '', phone: '', email: '', balance: 0 });

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
    const [planForm, setPlanForm] = useState({ name: '', minInvestment: '', dailyReturn: '', duration: '', category: '', expirationDate: '' });

    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
    const [prizeForm, setPrizeForm] = useState({ name: '', type: 'money', amount: 0 });

    const [showCommentModal, setShowCommentModal] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [commentText, setCommentText] = useState('');

    const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
    const [noticeText, setNoticeText] = useState(systemNotice || '');

    // New State for User Investment Modal
    const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
    const [selectedUserInvestments, setSelectedUserInvestments] = useState<User | null>(null);

    // Data Fetching
    useEffect(() => {
        if (activeView === 'financial') {
            fetchFinancialRequests();
            fetchFinancialHistory();
        }
        if (activeView === 'logs') api.fetchActivityLog().then(setActivityLog);
        if (activeView === 'users') fetchAllUsers(); // Fetch users when user management view is active
    }, [activeView]);

    useEffect(() => {
        setNoticeText(systemNotice || '');
    }, [systemNotice]);

    // Handlers
    const handleUserSave = async () => {
        if (editingUser) await updateUser(editingUser.id, userForm);
        setShowUserModal(false);
    };
    const handlePlanSave = async () => {
        const p = { ...planForm, minInvestment: Number(planForm.minInvestment), dailyReturn: Number(planForm.dailyReturn), duration: Number(planForm.duration), expirationDate: planForm.expirationDate || undefined };
        if (editingPlan) await updateInvestmentPlan(editingPlan.id, p);
        else await addInvestmentPlan(p);
        setShowPlanModal(false);
    };
    const handlePrizeSave = async () => {
        const p = { ...prizeForm, amount: Number(prizeForm.amount) };
        if (editingPrize) await updateLuckyDrawPrize(editingPrize.id, p);
        else await addLuckyDrawPrize(p);
        setShowPrizeModal(false);
    };
    const handleCommentSave = async () => {
        if (editingComment) await updateComment(editingComment.id, commentText);
        setShowCommentModal(false);
    };
    const handleWinToggle = async (id: string) => {
        const current = luckyDrawWinningPrizeIds || [];
        const newIds = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
        await setLuckyDrawWinningPrizes(newIds);
    };
    const handleSocialLinkAdd = async (platform: string, url: string) => {
        if (!platform || !url) return;
        const newLinks = { ...socialLinks, others: [...(socialLinks.others || []), { id: Date.now().toString(), platform, url }] };
        await updateSocialLinks(newLinks);
    };
    const handleSocialLinkRemove = async (id: string) => {
        const newLinks = { ...socialLinks, others: socialLinks.others.filter((l: SocialLinkItem) => l.id !== id) };
        await updateSocialLinks(newLinks);
    };
    const handleDistribute = () => {
        showConfirmation('Distribute Daily Earnings?', 'This will credit returns to all active investments. This action checks for payments made today to prevent double-paying.', async () => {
             const result = await distributeDailyEarnings();
             if(result.success) {
                 // addNotification already handled in context
             }
        });
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'financial', label: 'Financial Requests', icon: DollarSign },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'plans', label: 'Plan Management', icon: Briefcase },
        { id: 'lucky_draw', label: 'Lucky Draw', icon: Gift },
        { id: 'comments', label: 'User Comments', icon: MessageSquare },
        { id: 'chat', label: 'Customer Support', icon: MessageSquare },
        { id: 'logs', label: 'System Logs', icon: Activity },
        { id: 'settings', label: 'Platform Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'financial': return <FinancialManagementView requests={financialRequests} history={financialHistory} onApprove={tx => showConfirmation('Approve Transaction?', 'This will credit/debit the user balance.', async () => { await approveFinancialRequest(tx); fetchFinancialRequests(); fetchFinancialHistory(); })} onReject={tx => showConfirmation('Reject/Delete Request?', 'This will reject the transaction and refund if withdrawal. It will then remove the request.', async () => { await rejectFinancialRequest(tx); fetchFinancialRequests(); fetchFinancialHistory(); })} onViewProof={setViewingImage} onDistribute={handleDistribute} />;
            case 'users': return <UserManagementView users={users} onEdit={u => { setEditingUser(u); setUserForm({ name: u.name, phone: u.phone, email: u.email, balance: u.balance }); setShowUserModal(true); }} onToggle={u => updateUser(u.id, { isActive: !u.isActive })} onDelete={id => showConfirmation('Delete?', 'Irreversible action.', () => deleteUser(id))} onLoginAs={loginAsUserFunc} onViewInvestments={(u) => { setSelectedUserInvestments(u); setShowInvestmentsModal(true); }} />;
            case 'plans': return <PlanManagementView plans={investmentPlans} onAdd={() => { setEditingPlan(null); setPlanForm({ name: '', minInvestment: '', dailyReturn: '', duration: '', category: '', expirationDate: '' }); setShowPlanModal(true); }} onEdit={p => { setEditingPlan(p); setPlanForm({ name: p.name, minInvestment: String(p.minInvestment), dailyReturn: String(p.dailyReturn), duration: String(p.duration), category: p.category, expirationDate: p.expirationDate || '' }); setShowPlanModal(true); }} onDelete={id => showConfirmation('Delete Plan?', 'Are you sure?', () => deleteInvestmentPlan(id))} />;
            case 'lucky_draw': return <LuckyDrawView prizes={luckyDrawPrizes} winningIds={luckyDrawWinningPrizeIds} onAdd={() => { setEditingPrize(null); setPrizeForm({ name: '', type: 'money', amount: 0 }); setShowPrizeModal(true); }} onEdit={p => { setEditingPrize(p); setPrizeForm({ name: p.name, type: p.type, amount: p.amount }); setShowPrizeModal(true); }} onDelete={id => deleteLuckyDrawPrize(id)} onToggleWin={handleWinToggle} />;
            case 'comments': return <CommentsManagementView comments={comments} onDelete={id => deleteComment(id)} onEdit={c => { setEditingComment(c); setCommentText(c.text); setShowCommentModal(true); }} setViewingImage={setViewingImage} />;
            case 'chat': return <AdminChatView sessions={chatSessions} activeId={activeChatUser} messages={chatSessions.find((s: ChatSession) => s.userId === activeChatUser)?.messages || []} onSelect={uid => { setActiveChatUser(uid); markChatAsRead(uid); }} onSend={(txt, img) => activeChatUser && sendChatMessage(activeChatUser, { text: txt, imageUrl: img })} />;
            case 'logs': return <SystemLogsView logs={activityLog} />;
            case 'settings': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <h3 className="font-semibold text-lg">General Settings</h3>
                        <div><label className="text-sm font-medium">App Name</label><div className="flex gap-2 mt-1"><input type="text" value={appName} onChange={e => updateAppName(e.target.value)} className="flex-1 border rounded px-3 py-2" /><button className="bg-blue-600 text-white px-4 rounded">Save</button></div></div>
                        <div><label className="text-sm font-medium">App Logo</label><div className="flex items-center gap-4 mt-1">{appLogo && <img src={appLogo} className="w-12 h-12 rounded" />}<input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => updateAppLogo(ev.target?.result as string); r.readAsDataURL(f); } }} className="text-sm" /></div></div>
                        <div><label className="text-sm font-medium">Theme Color</label><div className="flex gap-2 mt-2">{themeOptions.map(t => <button key={t.name} onClick={() => updateThemeColor(t.name)} className={`w-8 h-8 rounded-full ${t.bgClass} ${themeColor === t.name ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`} />)}</div></div>
                        <div><label className="text-sm font-medium">System Announcement</label><div className="flex gap-2 mt-1 items-start"><textarea value={noticeText} onChange={e => setNoticeText(e.target.value)} className="flex-1 border rounded px-3 py-2 h-24 resize-none" placeholder="Enter notice for users..." /><button onClick={() => updateSystemNotice(noticeText)} className="bg-blue-600 text-white px-4 py-2 h-fit rounded">Save</button></div><p className="text-xs text-gray-500 mt-1">This will appear as a popup to all users upon opening the app.</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <h3 className="font-semibold text-lg">Social Links</h3>
                        <div><label className="text-sm font-medium">Telegram</label><input type="text" value={socialLinks.telegram || ''} onChange={e => updateSocialLinks({ ...socialLinks, telegram: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" /></div>
                        <div><label className="text-sm font-medium">WhatsApp</label><input type="text" value={socialLinks.whatsapp || ''} onChange={e => updateSocialLinks({ ...socialLinks, whatsapp: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" /></div>
                        <div className="border-t pt-4"><label className="text-sm font-medium">Custom Links</label>
                            {socialLinks.others?.map((l: SocialLinkItem) => <div key={l.id} className="flex justify-between items-center bg-gray-50 p-2 rounded mt-2 text-sm"><span>{l.platform}</span><button onClick={() => handleSocialLinkRemove(l.id)} className="text-red-500"><X size={16}/></button></div>)}
                            <form onSubmit={e => { e.preventDefault(); const t = e.target as any; handleSocialLinkAdd(t.p.value, t.u.value); t.reset(); }} className="flex gap-2 mt-2"><input name="p" placeholder="Name" className="flex-1 border rounded px-2 py-1" required /><input name="u" placeholder="URL" className="flex-1 border rounded px-2 py-1" required /><button className="bg-green-600 text-white px-3 rounded"><Plus size={18}/></button></form>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow space-y-4 lg:col-span-2">
                        <h3 className="font-semibold text-lg">Payment Settings</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentSettings.paymentMethods.map((method: any, idx: number) => (
                                <div key={idx} className="border p-4 rounded-lg relative">
                                    <div className="flex justify-between mb-2"><h4 className="font-bold">{method.name}</h4><input type="checkbox" checked={method.isActive} onChange={() => { const newMethods = [...paymentSettings.paymentMethods]; newMethods[idx].isActive = !newMethods[idx].isActive; updatePaymentSettings({ paymentMethods: newMethods }); }} /></div>
                                    <input placeholder="UPI ID" value={method.upiId} onChange={e => { const newMethods = [...paymentSettings.paymentMethods]; newMethods[idx].upiId = e.target.value; updatePaymentSettings({ paymentMethods: newMethods }); }} className="w-full border rounded px-2 py-1 mb-2 text-sm" />
                                    <div className="flex items-center gap-2">{method.qrCode && <img src={method.qrCode} className="w-10 h-10" />}<input type="file" className="text-xs" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => { const newMethods = [...paymentSettings.paymentMethods]; newMethods[idx].qrCode = ev.target?.result; updatePaymentSettings({ paymentMethods: newMethods }); }; r.readAsDataURL(f); } }} /></div>
                                </div>
                            ))}
                            <button onClick={() => updatePaymentSettings({ paymentMethods: [...paymentSettings.paymentMethods, { id: Date.now().toString(), name: 'New Method', upiId: '', qrCode: '', isActive: false }] })} className="border-2 border-dashed p-4 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">+ Add Method</button>
                        </div>
                    </div>
                </div>
            );
            default: return <div>Select a View</div>;
        }
    };

    return (
        <div className="h-[100dvh] flex bg-gray-100 font-sans overflow-hidden text-gray-800">
            {viewingImage && <ImagePreviewModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
            
            {/* Modals */}
            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg w-96"><h3 className="font-bold mb-4">Edit User</h3><input className="w-full border p-2 rounded mb-2" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Name" /><input className="w-full border p-2 rounded mb-2" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} placeholder="Phone" /><input className="w-full border p-2 rounded mb-2" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="Email" /><input className="w-full border p-2 rounded mb-4" type="number" value={userForm.balance} onChange={e => setUserForm({...userForm, balance: parseFloat(e.target.value)})} placeholder="Balance" /><div className="flex justify-end gap-2"><button onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button onClick={handleUserSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></div></div>}
            {showPlanModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg w-96"><h3 className="font-bold mb-4">{editingPlan ? 'Edit' : 'Add'} Plan</h3><input className="w-full border p-2 rounded mb-2" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} placeholder="Plan Name" /><input className="w-full border p-2 rounded mb-2" type="number" value={planForm.minInvestment} onChange={e => setPlanForm({...planForm, minInvestment: e.target.value})} placeholder="Min Investment" /><input className="w-full border p-2 rounded mb-2" type="number" value={planForm.dailyReturn} onChange={e => setPlanForm({...planForm, dailyReturn: e.target.value})} placeholder="Daily Return" /><input className="w-full border p-2 rounded mb-2" type="number" value={planForm.duration} onChange={e => setPlanForm({...planForm, duration: e.target.value})} placeholder="Duration (Days)" /><input className="w-full border p-2 rounded mb-2" value={planForm.category} onChange={e => setPlanForm({...planForm, category: e.target.value})} placeholder="Category (e.g. VIP)" /><div className="mb-4"><label className="text-xs text-gray-500">Expiration (Optional)</label><input className="w-full border p-2 rounded" type="datetime-local" value={planForm.expirationDate} onChange={e => setPlanForm({...planForm, expirationDate: e.target.value})} /></div><div className="flex justify-end gap-2"><button onClick={() => setShowPlanModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button onClick={handlePlanSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></div></div>}
            {showPrizeModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg w-96"><h3 className="font-bold mb-4">{editingPrize ? 'Edit' : 'Add'} Prize</h3><input className="w-full border p-2 rounded mb-2" value={prizeForm.name} onChange={e => setPrizeForm({...prizeForm, name: e.target.value})} placeholder="Prize Name" /><select className="w-full border p-2 rounded mb-2" value={prizeForm.type} onChange={e => setPrizeForm({...prizeForm, type: e.target.value as any})}><option value="money">Money</option><option value="bonus">Bonus</option><option value="physical">Physical</option><option value="nothing">Nothing</option></select><input className="w-full border p-2 rounded mb-4" type="number" value={prizeForm.amount} onChange={e => setPrizeForm({...prizeForm, amount: parseFloat(e.target.value)})} placeholder="Amount/Value" /><div className="flex justify-end gap-2"><button onClick={() => setShowPrizeModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button onClick={handlePrizeSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></div></div>}
            {showCommentModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg w-96"><h3 className="font-bold mb-4">Edit Comment</h3><textarea className="w-full border p-2 rounded mb-4 h-32" value={commentText} onChange={e => setCommentText(e.target.value)} /><div className="flex justify-end gap-2"><button onClick={() => setShowCommentModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button onClick={handleCommentSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div></div></div>}
            {showInvestmentsModal && selectedUserInvestments && <UserInvestmentsModal user={selectedUserInvestments} onClose={() => setShowInvestmentsModal(false)} />}

            <aside className={`fixed md:relative z-40 w-64 h-full bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-16 flex items-center justify-center text-white text-xl font-bold border-b border-slate-800 tracking-wider">{appName}</div>
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === item.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
                            <item.icon size={20} /><span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800"><button onClick={adminLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><LogOut size={20} /> Logout</button></div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
                        <h1 className="text-xl font-semibold text-gray-800">{navItems.find(i => i.id === activeView)?.label}</h1>
                    </div>
                    <div className="flex items-center gap-2"><span className="text-sm text-gray-500">Admin</span><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">A</div></div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">{renderContent()}</main>
            </div>
        </div>
    );
};

export default AdminDashboard;
