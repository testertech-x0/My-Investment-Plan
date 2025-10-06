import React, { useState, useRef, useEffect, useMemo, FC } from 'react';
import { LogOut, Users, Activity, TrendingUp, Wallet, Search, Edit, Eye, Trash2, X, FileText, Briefcase, Plus, Settings, Check, Crop, LogIn, Shield, UserCheck, UserX, Camera, MessageSquare, Paperclip, Send, Share2, Gift, CreditCard, QrCode, LayoutDashboard, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { User, InvestmentPlan, ActivityLogEntry, ThemeColor, Transaction, LoginActivity, Investment, ChatSession, ChatMessage, SocialLinks, Prize, PaymentMethod, AppContextType } from '../../types';
import { TransactionIcon } from '../user/BillDetailsScreen';

// --- STYLING & THEME ---
const themeOptions: { name: ThemeColor; bgClass: string }[] = [
    { name: 'green', bgClass: 'bg-green-500' },
    { name: 'blue', bgClass: 'bg-blue-500' },
    { name: 'purple', bgClass: 'bg-purple-500' },
    { name: 'orange', bgClass: 'bg-orange-500' },
    { name: 'red', bgClass: 'bg-red-500' },
    { name: 'yellow', bgClass: 'bg-yellow-500' },
    { name: 'teal', bgClass: 'bg-teal-500' },
    { name: 'pink', bgClass: 'bg-pink-500' },
];

const primaryColor = 'indigo';

// --- MODAL COMPONENTS ---
const ImageCropperModal: FC<{ imageSrc: string, onCropComplete: (croppedImage: string) => void, onCancel: () => void }> = ({ imageSrc, onCropComplete, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [dragInfo, setDragInfo] = useState({ isDragging: false, startX: 0, startY: 0 });
    const [renderedImageRect, setRenderedImageRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const image = e.currentTarget;
        const container = containerRef.current;
        if (!container) return;

        const containerAR = container.clientWidth / container.clientHeight;
        const imageAR = image.naturalWidth / image.naturalHeight;
        
        let renderedWidth, renderedHeight, offsetX, offsetY;

        if (containerAR > imageAR) {
            renderedHeight = container.clientHeight;
            renderedWidth = imageAR * renderedHeight;
            offsetX = (container.clientWidth - renderedWidth) / 2;
            offsetY = 0;
        } else {
            renderedWidth = container.clientWidth;
            renderedHeight = renderedWidth / imageAR;
            offsetX = 0;
            offsetY = (container.clientHeight - renderedHeight) / 2;
        }
        
        setRenderedImageRect({ x: offsetX, y: offsetY, width: renderedWidth, height: renderedHeight });
        const size = Math.min(renderedWidth, renderedHeight) * 0.9;
        setCrop({
            x: offsetX + (renderedWidth - size) / 2,
            y: offsetY + (renderedHeight - size) / 2,
            width: size,
            height: size,
        });
    };

    const getCroppedImg = () => {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        if (!image || !canvas || renderedImageRect.width === 0) return;

        const scale = image.naturalWidth / renderedImageRect.width;
        const sx = (crop.x - renderedImageRect.x) * scale;
        const sy = (crop.y - renderedImageRect.y) * scale;
        const sWidth = crop.width * scale;
        const sHeight = crop.height * scale;

        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        onCropComplete(canvas.toDataURL('image/png'));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        setDragInfo({ 
            isDragging: true, 
            startX: mouseX - crop.x, 
            startY: mouseY - crop.y 
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragInfo.isDragging) return;
        
        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        let newX = mouseX - dragInfo.startX;
        let newY = mouseY - dragInfo.startY;

        newX = Math.max(renderedImageRect.x, Math.min(newX, renderedImageRect.x + renderedImageRect.width - crop.width));
        newY = Math.max(renderedImageRect.y, Math.min(newY, renderedImageRect.y + renderedImageRect.height - crop.height));

        setCrop(c => ({ ...c, x: newX, y: newY }));
    };

    const handleMouseUp = () => setDragInfo({ isDragging: false, startX: 0, startY: 0 });

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (renderedImageRect.width === 0) return;

        const scaleFactor = 1.1;
        const delta = e.deltaY < 0 ? scaleFactor : 1 / scaleFactor;
        
        const newWidth = Math.max(50, Math.min(crop.width * delta, renderedImageRect.width, renderedImageRect.height));
        const newHeight = newWidth;

        if (newWidth === crop.width) return;

        const containerRect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;
        
        let newX = mouseX - (mouseX - crop.x) * (newWidth / crop.width);
        let newY = mouseY - (mouseY - crop.y) * (newHeight / crop.height);

        newX = Math.max(renderedImageRect.x, Math.min(newX, renderedImageRect.x + renderedImageRect.width - newWidth));
        newY = Math.max(renderedImageRect.y, Math.min(newY, renderedImageRect.y + renderedImageRect.height - newHeight));

        setCrop({ x: newX, y: newY, width: newWidth, height: newHeight });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Crop Your Logo</h3>
                <p className="text-sm text-gray-500 mb-4">Drag to move, scroll to zoom.</p>
                <div 
                    ref={containerRef}
                    className="relative w-full h-80 bg-gray-200 overflow-hidden cursor-move touch-none select-none"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <img ref={imageRef} src={imageSrc} className="w-full h-full object-contain pointer-events-none" alt="To crop" onLoad={onImageLoad} />
                    <div
                        className="absolute border-2 border-dashed border-white cursor-move"
                        style={{
                            left: crop.x,
                            top: crop.y,
                            width: crop.width,
                            height: crop.height,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        }}
                        onMouseDown={handleMouseDown}
                    />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3 mt-6">
                    <button onClick={onCancel} className={`flex-1 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition`}>Cancel</button>
                    <button onClick={getCroppedImg} className={`flex-1 py-2.5 bg-${primaryColor}-600 text-white rounded-lg font-semibold hover:bg-${primaryColor}-700 transition flex items-center justify-center gap-2`}>
                        <Crop size={18} /> Crop & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserDetailModal: FC<{ user: User, onClose: () => void, onEdit: (user: User) => void, onToggleStatus: (user: User) => Promise<void> }> = ({ user, onClose, onEdit, onToggleStatus }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Users },
        { id: 'investments', label: 'Investments', icon: Briefcase },
        { id: 'transactions', label: 'Transactions', icon: FileText },
        { id: 'activity', label: 'Login Activity', icon: Activity },
    ];
    
    const renderContent = () => {
        const sortedTransactions = [...user.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const sortedLoginActivity = [...user.loginActivity].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        switch(activeTab) {
            case 'investments':
                return user.investments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {user.investments.map((inv: Investment) => (
                            <div key={inv.planId} className="py-3">
                                <p className="font-semibold text-gray-800">{inv.planName} (x{inv.quantity})</p>
                                <div className="grid grid-cols-2 text-sm text-gray-600 mt-1">
                                    <p>Invested: ₹{inv.investedAmount.toFixed(2)}</p>
                                    <p>Total Revenue: ₹{inv.totalRevenue.toFixed(2)}</p>
                                    <p>Daily Earnings: ₹{inv.dailyEarnings.toFixed(2)}</p>
                                    <p>Duration: {inv.revenueDays} days</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 text-center py-8">No investments found.</p>;

            case 'transactions':
                return sortedTransactions.length > 0 ? (
                     <div className="divide-y divide-gray-200">
                        {sortedTransactions.map((tx: Transaction, index: number) => (
                            <div key={index} className="flex items-center justify-between py-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full"><TransactionIcon type={tx.type} /></div>
                                    <div>
                                        <p className="font-medium text-gray-800">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className={`font-semibold text-base ${tx.amount >= 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                    {tx.type === 'system' ? '' : `₹${tx.amount.toFixed(2)}`}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 text-center py-8">No transactions found.</p>;

            case 'activity':
                 return sortedLoginActivity.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {sortedLoginActivity.map((act: LoginActivity, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2.5">
                                <p className="text-gray-700">{act.device}</p>
                                <p className="text-sm text-gray-500">{new Date(act.date).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                 ) : <p className="text-gray-500 text-center py-8">No login activity found.</p>;

            case 'overview':
            default:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-gray-500">User ID</p><p className="font-semibold text-gray-800">{user.id}</p></div>
                            <div><p className="text-gray-500">Phone</p><p className="font-semibold text-gray-800">{user.phone}</p></div>
                             <div><p className="text-gray-500">Email</p><p className="font-semibold text-gray-800">{user.email || 'N/A'}</p></div>
                            <div><p className="text-gray-500">Registered</p><p className="font-semibold text-gray-800">{new Date(user.registrationDate).toLocaleDateString()}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-gray-500 text-sm">Balance</p>
                                <p className="text-2xl font-bold text-green-600">₹{user.balance.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Total Returns</p>
                                <p className="text-2xl font-bold text-blue-600">₹{user.totalReturns.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                             <button onClick={() => onToggleStatus(user)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                                {user.isActive ? <><UserX size={18}/> Block User</> : <><UserCheck size={18}/> Activate User</>}
                            </button>
                            <button onClick={() => onEdit(user)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                                <Edit size={18} /> Edit Info
                            </button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <Users size={24} className="text-gray-500" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.isActive ? 'Active' : 'Blocked'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                </header>
                <nav className="flex border-b shrink-0">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 font-medium transition-colors ${activeTab === tab.id ? `text-${primaryColor}-600 border-b-2 border-${primaryColor}-600` : 'text-gray-500 hover:bg-gray-50'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const ImagePreviewModal: FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
    >
        <button 
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors z-10"
            onClick={onClose}
        ><X size={24} /></button>
        <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <img src={imageUrl} alt="Full screen preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
    </div>
);

const ChatMessageBubble: FC<{ message: ChatMessage; isSender: boolean; onImageClick: (url: string) => void; }> = ({ message, isSender, onImageClick }) => {
    const bubbleClass = isSender
        ? `bg-${primaryColor}-600 text-white self-end rounded-l-lg rounded-tr-lg`
        : 'bg-gray-200 text-gray-800 self-start rounded-r-lg rounded-tl-lg';

    return (
        <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-xs md:max-w-md`}>
            <div className={`p-3 ${bubbleClass}`}>
                {message.text && <p className="text-sm">{message.text}</p>}
                {message.imageUrl && (
                    <button onClick={() => onImageClick(message.imageUrl!)} className="mt-2 rounded-lg max-w-full h-auto block overflow-hidden">
                        <img src={message.imageUrl} alt="chat attachment" className="w-full h-auto object-cover" />
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-400 mt-1 px-1">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    );
};

// --- VIEW COMPONENTS ---
const DashboardView: FC<AppContextType> = (props) => {
    const { users, activityLog } = props;
    const totalInvestments = users.reduce((sum, user) => sum + user.investments.reduce((s, inv) => s + inv.investedAmount, 0), 0);
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    const activeUsers = users.filter(u => u.isActive).length;

    const stats = [
        { title: 'Total Users', value: users.length, icon: Users, color: 'blue' },
        { title: 'Active Users', value: activeUsers, icon: Activity, color: 'green' },
        { title: 'Total Investments', value: `₹${totalInvestments.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, icon: TrendingUp, color: 'purple' },
        { title: 'Platform Balance', value: `₹${totalBalance.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, icon: Wallet, color: 'orange' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.title} className="bg-white rounded-lg shadow p-6 flex items-center gap-6">
                        <div className={`p-4 rounded-full bg-${stat.color}-100`}>
                            <stat.icon className={`text-${stat.color}-500`} size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                    <p className="text-sm text-gray-500">A log of recent significant user actions.</p>
                </div>
                <div>
                    {activityLog.length > 0 ? (
                        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {activityLog.slice(0, 10).map(log => (
                                <li key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">{log.action}</p>
                                        <p className="text-sm text-gray-500">User: {log.userName} ({log.userId})</p>
                                    </div>
                                    <p className="text-sm text-gray-500 shrink-0">{log.timestamp.toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No activity recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserManagementView: FC<AppContextType & { onUserSelect: (user: User, action: 'view' | 'edit' | 'delete' | 'login' | 'toggle') => Promise<void>, searchTerm: string, setSearchTerm: (term: string) => void }> = (props) => {
    const { users, onUserSelect, searchTerm, setSearchTerm } = props;

    const filteredUsers = users.filter(user =>
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
         <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Search by User ID, phone, or name..." />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users size={20} className="text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.id} &middot; {user.phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{user.balance.toFixed(2)}</td>
                            <td className="px-6 py-4">
                            <button onClick={() => onUserSelect(user, 'toggle')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.isActive ? 'Active' : 'Blocked'}
                            </button>
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex gap-1">
                                <button onClick={() => onUserSelect(user, 'view')} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="View"><Eye size={18} /></button>
                                <button onClick={() => onUserSelect(user, 'edit')} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => onUserSelect(user, 'login')} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Login As"><LogIn size={18} /></button>
                                <button onClick={() => onUserSelect(user, 'delete')} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={18} /></button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && <p className="text-center text-gray-500 py-8">No users found.</p>}
            </div>
        </div>
    );
};

const PaymentSettingsView: FC = () => {
    const { paymentSettings, updatePaymentSettings, addNotification, showConfirmation } = useApp();

    const [newMethod, setNewMethod] = useState({ name: '', upiId: '' });
    const [qrFile, setQrFile] = useState<File | null>(null);
    const qrFileInputRef = useRef<HTMLInputElement>(null);

    const [newQuickAmount, setNewQuickAmount] = useState('');

    const handleAddMethod = async () => {
        if (!newMethod.name || (!newMethod.upiId && !qrFile)) {
            addNotification('Please provide a name and at least one payment method (UPI or QR).', 'error');
            return;
        }

        let qrCodeBase64 = '';
        if (qrFile) {
            try {
                qrCodeBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(qrFile);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                });
            } catch (error) {
                addNotification('Failed to read QR image file.', 'error');
                return;
            }
        }

        const finalNewMethod: PaymentMethod = {
            id: `pm-${Date.now()}`,
            name: newMethod.name,
            upiId: newMethod.upiId,
            qrCode: qrCodeBase64,
            isActive: true
        };

        await updatePaymentSettings({ paymentMethods: [...paymentSettings.paymentMethods, finalNewMethod] });
        
        // Reset form state
        setNewMethod({ name: '', upiId: '' });
        setQrFile(null);
        if (qrFileInputRef.current) {
            qrFileInputRef.current.value = '';
        }
        addNotification('Payment method added successfully.', 'success');
    };


    const handleToggleMethodStatus = async (id: string) => {
        const updatedMethods = paymentSettings.paymentMethods.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
        await updatePaymentSettings({ paymentMethods: updatedMethods });
    };

    const handleDeleteMethod = (id: string, name: string) => {
        showConfirmation('Delete Payment Method', <>Are you sure you want to delete <strong>{name}</strong>?</>, async () => {
            const updatedMethods = paymentSettings.paymentMethods.filter(m => m.id !== id);
            await updatePaymentSettings({ paymentMethods: updatedMethods });
            addNotification('Method deleted.', 'success');
        });
    };

    const handleAddQuickAmount = async () => {
        const amount = parseInt(newQuickAmount, 10);
        if (isNaN(amount) || amount <= 0) { addNotification('Please enter a valid positive amount.', 'error'); return; }
        if (paymentSettings.quickAmounts.includes(amount)) { addNotification('This amount already exists.', 'info'); return; }
        const updatedAmounts = [...paymentSettings.quickAmounts, amount].sort((a, b) => a - b);
        await updatePaymentSettings({ quickAmounts: updatedAmounts });
        setNewQuickAmount('');
        addNotification('Quick amount added.', 'success');
    };

    const handleDeleteQuickAmount = (amountToDelete: number) => {
        showConfirmation('Delete Quick Amount', <>Are you sure you want to delete <strong>₹{amountToDelete}</strong>?</>, async () => {
            const updatedAmounts = paymentSettings.quickAmounts.filter(a => a !== amountToDelete);
            await updatePaymentSettings({ quickAmounts: updatedAmounts });
            addNotification('Quick amount deleted.', 'success');
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex items-center gap-3"><CreditCard /><h3 className="text-lg font-semibold">Payment Methods</h3></div>
                <div className="p-6 border-b bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="col-span-full"><h4 className="font-semibold text-gray-700">Add New Method</h4></div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Name Tag</label>
                        <input type="text" value={newMethod.name} onChange={e => setNewMethod(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Main Payment" className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">UPI ID (Optional)</label>
                        <input type="text" value={newMethod.upiId} onChange={e => setNewMethod(p => ({ ...p, upiId: e.target.value }))} placeholder="user@bank" className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">QR Image (Optional)</label>
                        <input type="file" ref={qrFileInputRef} onChange={e => setQrFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="w-full p-1.5 border border-gray-300 rounded-lg text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    <div className="col-span-full">
                        <button onClick={handleAddMethod} className={`w-full md:w-auto flex items-center justify-center gap-2 bg-${primaryColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${primaryColor}-700 transition`}>
                            <Plus size={20} /> Add Method
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name Tag</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UPI ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paymentSettings.paymentMethods.map(method => (
                                <tr key={method.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{method.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono break-all">{method.upiId || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        {method.qrCode ? <img src={method.qrCode} alt="QR Code" className="w-12 h-12 object-contain" /> : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleToggleMethodStatus(method.id)} className={`p-1.5 rounded-full ${method.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                            {method.isActive ? <Check size={16} /> : <X size={16} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDeleteMethod(method.id, method.name)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete Method">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {paymentSettings.paymentMethods.length === 0 && <p className="text-center text-gray-500 py-8">No payment methods configured.</p>}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex items-center gap-3"><Wallet /><h3 className="text-lg font-semibold">Quick Deposit Amounts</h3></div>
                <div className="p-6 border-b bg-gray-50 flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="text-sm font-medium text-gray-700 block mb-1">New Amount (₹)</label>
                        <input type="number" value={newQuickAmount} onChange={e => setNewQuickAmount(e.target.value)} placeholder="e.g., 5000" className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <button onClick={handleAddQuickAmount} className={`flex items-center gap-2 bg-${primaryColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${primaryColor}-700 transition`}>
                        <Plus size={20} /> Add
                    </button>
                </div>
                <div className="p-6">
                    {paymentSettings.quickAmounts.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {paymentSettings.quickAmounts.map(amount => (
                                <div key={amount} className="flex items-center gap-2 bg-gray-100 rounded-full pl-4 pr-2 py-1 font-semibold text-gray-700">
                                    ₹{amount.toLocaleString()}
                                    <button onClick={() => handleDeleteQuickAmount(amount)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500">No quick amounts configured.</p>}
                </div>
            </div>
        </div>
    );
};

const AdminChatView: FC<AppContextType & { setViewingImage: (url: string | null) => void }> = (props) => {
    const { users, chatSessions, sendChatMessage, markChatAsRead, setViewingImage } = props;
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sortedSessions = useMemo(() => {
        return [...chatSessions].sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }, [chatSessions]);

    const selectedSession = useMemo(() => {
        return chatSessions.find(s => s.userId === selectedUserId);
    }, [chatSessions, selectedUserId]);
    
    const selectedUser = useMemo(() => {
        return users.find(u => u.id === selectedUserId);
    }, [users, selectedUserId]);

    useEffect(() => {
        if (selectedUserId) {
            markChatAsRead(selectedUserId);
        }
    }, [selectedUserId, markChatAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedSession?.messages]);

    const handleSelectSession = (userId: string) => {
        setSelectedUserId(userId);
    };

    const handleSendMessage = async () => {
        if (!selectedUserId || (!newMessage.trim() && !newImage)) return;
        
        await sendChatMessage(selectedUserId, { text: newMessage.trim(), imageUrl: newImage || undefined });
        
        setNewMessage('');
        setNewImage(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setNewImage(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = '';
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)] flex">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Conversations</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sortedSessions.length > 0 ? (
                        sortedSessions.map(session => {
                            const user = users.find(u => u.id === session.userId);
                            const lastMessage = session.messages[session.messages.length - 1];
                            const isActive = selectedUserId === session.userId;
                            return (
                                <button key={session.userId} onClick={() => handleSelectSession(session.userId)}
                                    className={`w-full text-left p-4 border-b hover:bg-gray-50 flex items-start gap-3 transition-colors ${isActive ? 'bg-indigo-50' : ''}`}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name.charAt(0)
                                            )}
                                        </div>
                                        {session.adminUnreadCount > 0 && 
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                {session.adminUnreadCount}
                                            </span>
                                        }
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-gray-800 truncate">{user?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-400 shrink-0 ml-2">{formatTimeAgo(session.lastMessageTimestamp)}</p>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {lastMessage?.imageUrl ? 'Sent an image' : lastMessage?.text}
                                        </p>
                                    </div>
                                </button>
                            )
                        })
                    ) : (
                        <p className="text-center text-gray-500 p-8">No active chats.</p>
                    )}
                </div>
            </div>

            <div className="w-2/3 flex flex-col">
                {selectedSession && selectedUser ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                                {selectedUser.avatar ? (
                                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedUser.name.charAt(0)
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{selectedUser.name} <span className="text-sm text-gray-500 font-normal">({selectedUser.id})</span></h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                            {selectedSession.messages.map(msg => (
                                <ChatMessageBubble 
                                    key={msg.id} 
                                    message={msg} 
                                    isSender={msg.senderId === 'admin'} 
                                    onImageClick={setViewingImage}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t bg-white">
                            {newImage && (
                                <div className="relative w-20 h-20 mb-2 p-1 bg-gray-100 rounded-lg">
                                    <img src={newImage} alt="preview" className="w-full h-full object-cover rounded" />
                                    <button onClick={() => setNewImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full shadow"><X size={14}/></button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 rounded-full"><Paperclip size={20}/></button>
                                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-100 border-transparent rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
                                <button onClick={handleSendMessage} disabled={!newMessage.trim() && !newImage} className={`p-3 bg-${primaryColor}-600 text-white rounded-full hover:bg-${primaryColor}-700 transition disabled:bg-gray-300`}>
                                    <Send size={20}/>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-2" />
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC = () => {
  const context = useApp();
  const { adminLogout, appName, appLogo, updateAppName, updateAppLogo, themeColor, updateThemeColor, changeAdminPassword, socialLinks, updateSocialLinks, addNotification, showConfirmation, luckyDrawPrizes, paymentSettings } = context;

  const [activeView, setActiveView] = useState('dashboard');
  
  // User management state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailedUser, setDetailedUser] = useState<User | null>(null);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({ name: '', phone: '', balance: 0, email: '' });

  // Plan management state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [planData, setPlanData] = useState({ name: '', minInvestment: '', dailyReturn: '', duration: '', category: '' });

  // Prize management state
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [prizeData, setPrizeData] = useState<Omit<Prize, 'id'>>({ name: '', type: 'money', amount: 0 });
  
  // Platform settings state
  const [newAppName, setNewAppName] = useState(appName);
  const [logoPreview, setLogoPreview] = useState<string | null>(appLogo);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [socialLinksData, setSocialLinksData] = useState<SocialLinks>({ telegram: '', whatsapp: '' });
  const [viewingImage, setViewingImage] = useState<string | null>(null);


  // Admin security state
  const [adminPassData, setAdminPassData] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

  useEffect(() => { setSocialLinksData(socialLinks); }, [socialLinks]);
  useEffect(() => { if (prizeData.type === 'physical' || prizeData.type === 'nothing') { setPrizeData(prev => ({ ...prev, amount: 0 })); } }, [prizeData.type]);

  const handleUserSelection = async (user: User, action: 'view' | 'edit' | 'delete' | 'login' | 'toggle') => {
      switch(action) {
          case 'view': setDetailedUser(user); break;
          case 'edit':
              setDetailedUser(null);
              setSelectedUser(user);
              setEditUserData({ name: user.name, phone: user.phone, balance: user.balance, email: user.email });
              setShowUserEditModal(true);
              break;
          case 'delete':
              showConfirmation( 'Delete User', <>Are you sure you want to delete <strong>{user.name}</strong> ({user.id})?</>, async () => await context.deleteUser(user.id));
              break;
          case 'login': 
              await context.loginAsUserFunc(user.id);
              break;
          case 'toggle':
              await context.updateUser(user.id, { isActive: !user.isActive });
              setDetailedUser(prev => prev ? {...prev, isActive: !user.isActive} : null);
              addNotification(`User ${user.name} has been ${!user.isActive ? 'activated' : 'blocked'}.`, 'info');
              break;
      }
  };
  
  const saveUserEdit = async () => {
    if (selectedUser) {
      await context.updateUser(selectedUser.id, editUserData);
      addNotification(`User ${selectedUser.name} updated successfully.`, 'success');
      setShowUserEditModal(false);
      setSelectedUser(null);
      setDetailedUser(prev => prev ? {...prev, ...editUserData} : null);
    }
  };

  const handleSavePlan = async () => {
    const parsedData = {
        name: planData.name,
        minInvestment: parseFloat(planData.minInvestment),
        dailyReturn: parseFloat(planData.dailyReturn),
        duration: parseInt(planData.duration, 10),
        category: planData.category.toUpperCase(),
    };
    if (Object.values(parsedData).some(v => !v || (typeof v === 'number' && isNaN(v)))) {
      addNotification('Please fill all fields correctly.', 'error'); return;
    }
    const result = editingPlan ? await context.updateInvestmentPlan(editingPlan.id, parsedData) : await context.addInvestmentPlan(parsedData);
    if (result.success) setShowPlanModal(false);
  };
  
  const handleSavePrize = async () => {
      if (!prizeData.name) { addNotification('Prize name is required.', 'error'); return; }
      const dataToSave = { ...prizeData, amount: parseFloat(String(prizeData.amount)) || 0 };
      const result = editingPrize ? await context.updateLuckyDrawPrize(editingPrize.id, dataToSave) : await context.addLuckyDrawPrize(dataToSave);
      if (result.success) setShowPrizeModal(false);
      else if (result.message) addNotification(result.message, 'error');
  };

  const handleCropComplete = async (croppedImage: string) => {
    setLogoPreview(croppedImage);
    await updateAppLogo(croppedImage);
    setImageToCrop(null);
    addNotification('Logo updated successfully!', 'success');
  }
  
  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassData.newPassword !== adminPassData.confirmNewPassword) { addNotification("New passwords do not match.", 'error'); return; }
    const result = await changeAdminPassword(adminPassData.oldPassword, adminPassData.newPassword);
    if (result.success) setAdminPassData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  };
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'plans', label: 'Plan Management', icon: Briefcase },
    { id: 'lucky_draw', label: 'Lucky Draw', icon: Gift },
    { id: 'payment_settings', label: 'Payment Settings', icon: CreditCard },
    { id: 'chat', label: 'Chat Support', icon: MessageSquare },
    { id: 'activity_log', label: 'Activity Log', icon: Activity },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const activeLabel = navigationItems.find(item => item.id === activeView)?.label || 'Dashboard';
  
  const renderView = () => {
    switch (activeView) {
        case 'dashboard': return <DashboardView {...context} />;
        case 'users': return <UserManagementView {...context} onUserSelect={handleUserSelection} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
        case 'plans': return (
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Investment Plan Management</h2>
                        <p className="text-sm text-gray-500">Add, edit, or remove investment plans.</p>
                    </div>
                    <button onClick={() => { setEditingPlan(null); setPlanData({ name: '', minInvestment: '', dailyReturn: '', duration: '', category: '' }); setShowPlanModal(true); }} className={`flex items-center gap-2 bg-${primaryColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${primaryColor}-700 transition`}>
                        <Plus size={20} /> Add New Plan
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Invest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Return</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {context.investmentPlans.map(plan => (
                                <tr key={plan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{plan.name}</td>
                                    <td className="px-6 py-4 text-sm"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{plan.category}</span></td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{plan.minInvestment}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{plan.dailyReturn}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">{plan.duration} days</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditingPlan(plan); setPlanData({ name: plan.name, minInvestment: String(plan.minInvestment), dailyReturn: String(plan.dailyReturn), duration: String(plan.duration), category: plan.category }); setShowPlanModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit Plan"><Edit size={18} /></button>
                                            <button onClick={() => showConfirmation('Delete Plan', <>Are you sure you want to delete <strong>{plan.name}</strong>?</>, async () => await context.deleteInvestmentPlan(plan.id))} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete Plan"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
        case 'lucky_draw': return (
             <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex justify-between items-center">
                     <div>
                        <h2 className="text-xl font-semibold text-gray-800">Lucky Draw Management</h2>
                        <p className="text-sm text-gray-500">Configure the 8 prizes for the lucky wheel.</p>
                    </div>
                    <button onClick={() => { if (luckyDrawPrizes.length >= 8) { addNotification("Max 8 prizes allowed.", 'error'); return; } setEditingPrize(null); setPrizeData({ name: '', type: 'money', amount: 0 }); setShowPrizeModal(true); }} disabled={luckyDrawPrizes.length >= 8} className={`flex items-center gap-2 bg-${primaryColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${primaryColor}-700 transition disabled:bg-gray-400`}>
                        <Plus size={20} /> Add New Prize
                    </button>
                </div>
                 {luckyDrawPrizes.length !== 8 && (
                    <div className="p-4 bg-yellow-100 text-yellow-800 text-sm text-center">The lucky wheel requires exactly 8 prizes. You currently have {luckyDrawPrizes.length}.</div>
                 )}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {luckyDrawPrizes.map(prize => (
                                <tr key={prize.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{prize.name}</td>
                                    <td className="px-6 py-4 text-sm"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium capitalize">{prize.type}</span></td>
                                    <td className="px-6 py-4 text-sm font-semibold text-green-600">{prize.type === 'money' || prize.type === 'bonus' ? `₹${prize.amount}`: 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditingPrize(prize); setPrizeData({ name: prize.name, type: prize.type, amount: prize.amount }); setShowPrizeModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit Prize"><Edit size={18} /></button>
                                            <button onClick={() => showConfirmation('Delete Prize', <>Are you sure you want to delete <strong>{prize.name}</strong>?</>, async () => await context.deleteLuckyDrawPrize(prize.id))} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete Prize"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
        case 'payment_settings': return <PaymentSettingsView />;
        case 'chat': return <AdminChatView {...context} setViewingImage={setViewingImage} />;
        case 'activity_log': return (
             <div className="bg-white rounded-lg shadow">
                 <div className="p-6 border-b"><h2 className="text-xl font-semibold text-gray-800">Full Activity Log</h2></div>
                 <ul className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
                  {context.activityLog.map(log => (
                    <li key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                            <p className="font-medium text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-500">User: {log.userName} ({log.userId})</p>
                        </div>
                        <p className="text-sm text-gray-500 shrink-0">{log.timestamp.toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
            </div>
        );
        case 'settings': return (
             <div className="space-y-8">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b flex items-center gap-3"><Palette /><h3 className="text-lg font-semibold">Platform Customization</h3></div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">App Logo</label>
                                <input type="file" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) { const reader = new FileReader(); reader.onload = (ev) => setImageToCrop(ev.target?.result as string); reader.readAsDataURL(e.target.files[0]); e.target.value = ''; } }} id="logo-upload" className="hidden" />
                                <label htmlFor="logo-upload" className="cursor-pointer group relative w-24 h-24 block">
                                    <img src={logoPreview || `https://ui-avatars.com/api/?name=${appName}&background=f3f4f6&color=1f2937`} alt="Logo" className="w-full h-full rounded-full object-cover border-2" />
                                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center"><Camera size={24} className="text-white opacity-0 group-hover:opacity-100" /></div>
                                </label>
                            </div>
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
                                <div className="flex gap-2">
                                    <input type="text" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"/>
                                    <button onClick={async () => { await updateAppName(newAppName); addNotification('App name saved!', 'success'); }} className={`bg-${primaryColor}-600 text-white px-5 py-2 rounded-lg hover:bg-${primaryColor}-700 font-semibold`}>Save</button>
                                </div>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                            <div className="flex flex-wrap gap-3">
                                {themeOptions.map(option => (
                                    <button key={option.name} onClick={() => updateThemeColor(option.name)} className={`w-10 h-10 rounded-full ${option.bgClass} flex items-center justify-center ${themeColor === option.name ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b flex items-center gap-3"><Share2 /><h3 className="text-lg font-semibold">Social Links</h3></div>
                     <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Link</label>
                            <input type="text" name="telegram" value={socialLinksData.telegram || ''} onChange={(e) => setSocialLinksData(p => ({...p, telegram: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://t.me/yourchannel"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Link</label>
                            <input type="text" name="whatsapp" value={socialLinksData.whatsapp || ''} onChange={(e) => setSocialLinksData(p => ({...p, whatsapp: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://wa.me/yournumber" />
                        </div>
                        <button onClick={async () => await updateSocialLinks(socialLinksData)} className={`w-full bg-${primaryColor}-600 text-white py-2.5 rounded-lg font-semibold`}>Save Social Links</button>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b flex items-center gap-3"><Shield /><h3 className="text-lg font-semibold">Admin Security</h3></div>
                    <form className="p-6 space-y-4" onSubmit={handleAdminPasswordChange}>
                        <input type="password" value={adminPassData.oldPassword} onChange={e => setAdminPassData({...adminPassData, oldPassword: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" placeholder="Current Password" />
                        <input type="password" value={adminPassData.newPassword} onChange={e => setAdminPassData({...adminPassData, newPassword: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" placeholder="New Password" />
                        <input type="password" value={adminPassData.confirmNewPassword} onChange={e => setAdminPassData({...adminPassData, confirmNewPassword: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" placeholder="Confirm New Password" />
                        <button type="submit" className={`w-full bg-${primaryColor}-600 text-white py-2.5 rounded-lg font-semibold`}>Change Password</button>
                    </form>
                </div>
             </div>
        );
        default: return <DashboardView {...context} />;
    }
  }

  return (
    <div className="h-screen flex bg-gray-100 font-sans">
      {imageToCrop && <ImageCropperModal imageSrc={imageToCrop} onCropComplete={handleCropComplete} onCancel={() => setImageToCrop(null)} />}
      {detailedUser && <UserDetailModal user={detailedUser} onClose={() => setDetailedUser(null)} onEdit={(user) => handleUserSelection(user, 'edit')} onToggleStatus={(user) => handleUserSelection(user, 'toggle')} />}
      {viewingImage && <ImagePreviewModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col shrink-0">
          <div className="h-16 flex items-center justify-center text-white text-xl font-bold border-b border-slate-700">
              {appName}
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map(item => (
                  <button key={item.id} onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeView === item.id ? `bg-slate-700 text-white font-semibold border-l-4 border-${primaryColor}-500` : 'hover:bg-slate-700'}`}
                  >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                  </button>
              ))}
          </nav>
          <div className="p-4 border-t border-slate-700">
               <button onClick={adminLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700">
                  <LogOut size={20} /> Logout
              </button>
          </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shrink-0">
              <h1 className="text-xl font-semibold text-gray-800">{activeLabel}</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
              {renderView()}
          </main>
      </div>

      {/* Modals */}
        {showUserEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Edit User ({selectedUser.id})</h3><button onClick={() => setShowUserEditModal(false)}><X/></button></div>
                    <div className="space-y-4">
                        <input type="text" value={editUserData.name} onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Name" />
                        <input type="tel" value={editUserData.phone} onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Phone"/>
                        <input type="number" value={editUserData.balance} onChange={(e) => setEditUserData({ ...editUserData, balance: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded-lg" placeholder="Balance" />
                        <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Email" />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowUserEditModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button onClick={saveUserEdit} className={`flex-1 py-2 bg-${primaryColor}-600 text-white rounded-lg`}>Save Changes</button>
                    </div>
                </div>
            </div>
        )}
        {showPlanModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3><button onClick={() => setShowPlanModal(false)}><X /></button></div>
                    <div className="space-y-4">
                        <input type="text" name="name" value={planData.name} onChange={(e) => setPlanData(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded-lg" placeholder="Plan Name"/>
                        <input type="text" name="category" value={planData.category} onChange={(e) => setPlanData(p => ({...p, category: e.target.value}))} className="w-full p-2 border rounded-lg" placeholder="Category" />
                        <input type="number" name="minInvestment" value={planData.minInvestment} onChange={(e) => setPlanData(p => ({...p, minInvestment: e.target.value}))} className="w-full p-2 border rounded-lg" placeholder="Min Investment"/>
                        <input type="number" name="dailyReturn" value={planData.dailyReturn} onChange={(e) => setPlanData(p => ({...p, dailyReturn: e.target.value}))} className="w-full p-2 border rounded-lg" placeholder="Daily Return"/>
                        <input type="number" name="duration" value={planData.duration} onChange={(e) => setPlanData(p => ({...p, duration: e.target.value}))} className="w-full p-2 border rounded-lg" placeholder="Duration"/>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowPlanModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button onClick={handleSavePlan} className={`flex-1 py-2 bg-${primaryColor}-600 text-white rounded-lg`}>Save Plan</button>
                    </div>
                </div>
            </div>
        )}
        {showPrizeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{editingPrize ? 'Edit Prize' : 'Add New Prize'}</h3><button onClick={() => setShowPrizeModal(false)}><X/></button></div>
                    <div className="space-y-4">
                        <input type="text" name="name" value={prizeData.name} onChange={(e) => setPrizeData(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded-lg" placeholder="Prize Name"/>
                        <select name="type" value={prizeData.type} onChange={(e) => setPrizeData(p => ({...p, type: e.target.value as Prize['type']}))} className="w-full p-2 border rounded-lg bg-white">
                            <option value="money">Money</option><option value="bonus">Bonus</option><option value="physical">Physical</option><option value="nothing">Nothing</option>
                        </select>
                        <input type="number" name="amount" value={prizeData.amount} onChange={(e) => setPrizeData(p => ({...p, amount: Number(e.target.value)}))} disabled={prizeData.type === 'physical' || prizeData.type === 'nothing'} className="w-full p-2 border rounded-lg disabled:bg-gray-100" placeholder="Amount"/>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowPrizeModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button onClick={handleSavePrize} className={`flex-1 py-2 bg-${primaryColor}-600 text-white rounded-lg`}>Save Prize</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;