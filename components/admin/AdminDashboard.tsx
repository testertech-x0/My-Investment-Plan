import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Users, Activity, TrendingUp, Wallet, Search, Edit, Eye, Trash2, X, FileText, Briefcase, Plus, Settings, Check, ZoomIn, ZoomOut, Move, Crop, LogIn, Shield, UserCheck, UserX, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { User, InvestmentPlan, ActivityLogEntry, ThemeColor, Transaction, LoginActivity, Investment } from '../../types';
import { TransactionIcon } from '../user/BillDetailsScreen';

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

const ImageCropperModal = ({ imageSrc, onCropComplete, onCancel }: { imageSrc: string, onCropComplete: (croppedImage: string) => void, onCancel: () => void }) => {
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
        setDragInfo({ isDragging: true, startX: e.clientX - crop.x, startY: e.clientY - crop.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragInfo.isDragging) return;
        
        let newX = e.clientX - dragInfo.startX;
        let newY = e.clientY - dragInfo.startY;

        newX = Math.max(renderedImageRect.x, Math.min(newX, renderedImageRect.x + renderedImageRect.width - crop.width));
        newY = Math.max(renderedImageRect.y, Math.min(newY, renderedImageRect.y + renderedImageRect.height - crop.height));

        setCrop(c => ({ ...c, x: newX, y: newY }));
    };

    const handleMouseUp = () => {
        setDragInfo({ isDragging: false, startX: 0, startY: 0 });
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const scaleFactor = 1.1;
        const delta = e.deltaY > 0 ? 1 / scaleFactor : scaleFactor;
        
        const newWidth = Math.max(50, Math.min(crop.width * delta, renderedImageRect.width, renderedImageRect.height));
        const newHeight = newWidth;

        const mouseX = e.clientX - containerRef.current!.getBoundingClientRect().left;
        const mouseY = e.clientY - containerRef.current!.getBoundingClientRect().top;
        
        let newX = mouseX - (mouseX - crop.x) * (newWidth / crop.width);
        let newY = mouseY - (mouseY - crop.y) * (newHeight / crop.height);

        const clampedX = Math.max(renderedImageRect.x, Math.min(newX, renderedImageRect.x + renderedImageRect.width - newWidth));
        const clampedY = Math.max(renderedImageRect.y, Math.min(newY, renderedImageRect.y + renderedImageRect.height - newHeight));

        setCrop({
            x: clampedX,
            y: clampedY,
            width: newWidth,
            height: newHeight,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Crop Your Logo</h3>
                <p className="text-sm text-gray-500 mb-4">Drag to move, scroll to zoom.</p>
                <div 
                    ref={containerRef}
                    className="relative w-full h-80 bg-gray-200 overflow-hidden cursor-move"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <img ref={imageRef} src={imageSrc} className="w-full h-full object-contain pointer-events-none" alt="To crop" onLoad={onImageLoad} />
                    <div className="absolute inset-0 bg-black bg-opacity-50" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${crop.y}px, ${crop.x}px ${crop.y}px, ${crop.x}px ${crop.y + crop.height}px, ${crop.x + crop.width}px ${crop.y + crop.height}px, ${crop.x + crop.width}px ${crop.y}px, 0 ${crop.y}px, 0 0)`}} />
                    <div
                        className="absolute border-2 border-dashed border-white cursor-move pointer-events-auto"
                        style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }}
                        onMouseDown={handleMouseDown}
                    />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3 mt-6">
                    <button onClick={onCancel} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={getCroppedImg} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2">
                        <Crop size={18} /> Crop & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserDetailModal = ({ user, onClose, onEdit, onToggleStatus }: { user: User, onClose: () => void, onEdit: (user: User) => void, onToggleStatus: (user: User) => Promise<void> }) => {
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
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-fade-in-up">
                <header className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                </header>
                <nav className="flex border-b shrink-0">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 font-medium transition-colors ${activeTab === tab.id ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
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


const AdminDashboard: React.FC = () => {
  const { users, investmentPlans, adminLogout, loginAsUserFunc, updateUser, deleteUser, addNotification, showConfirmation, activityLog, addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan, appName, appLogo, updateAppName, updateAppLogo, themeColor, updateThemeColor, changeAdminPassword } = useApp();
  
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

  // Activity Log modal state
  const [selectedLogEntry, setSelectedLogEntry] = useState<ActivityLogEntry | null>(null);

  // Platform settings state
  const [newAppName, setNewAppName] = useState(appName);
  const [logoPreview, setLogoPreview] = useState<string | null>(appLogo);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Admin security state
  const [adminPassData, setAdminPassData] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

  const filteredUsers = users.filter(user =>
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvestments = users.reduce((sum, user) => sum + user.investments.reduce((s, inv) => s + inv.investedAmount, 0), 0);
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const activeUsers = users.filter(u => u.isActive).length;

  // User management functions
  const handleEditUser = (user: User) => {
    setDetailedUser(null);
    setSelectedUser(user);
    setEditUserData({ name: user.name, phone: user.phone, balance: user.balance, email: user.email });
    setShowUserEditModal(true);
  };
  
  const handleViewUser = (user: User) => {
    setDetailedUser(user);
  };

  const saveUserEdit = async () => {
    if (selectedUser) {
      await updateUser(selectedUser.id, editUserData);
      addNotification(`User ${selectedUser.name} updated successfully.`, 'success');
      setShowUserEditModal(false);
      setSelectedUser(null);
      setDetailedUser(prev => prev ? {...prev, ...editUserData} : null); // Update detailed view if open
    }
  };

  const handleDeleteUser = (user: User) => {
    showConfirmation(
      'Delete User',
      <>Are you sure you want to delete <strong>{user.name}</strong> ({user.id})? This action cannot be undone.</>,
      async () => await deleteUser(user.id)
    );
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = !user.isActive;
    await updateUser(user.id, { isActive: newStatus });
    setDetailedUser(prev => prev ? {...prev, isActive: newStatus} : null);
    addNotification(`User ${user.name} has been ${newStatus ? 'activated' : 'blocked'}.`, 'info');
  };

  // Plan management functions
  const handleAddNewPlan = () => {
    setEditingPlan(null);
    setPlanData({ name: '', minInvestment: '', dailyReturn: '', duration: '', category: '' });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setPlanData({
        name: plan.name,
        minInvestment: String(plan.minInvestment),
        dailyReturn: String(plan.dailyReturn),
        duration: String(plan.duration),
        category: plan.category
    });
    setShowPlanModal(true);
  };
  
  const handleDeletePlan = (plan: InvestmentPlan) => {
    showConfirmation(
      'Delete Plan',
      <>Are you sure you want to delete the plan <strong>{plan.name}</strong> ({plan.id})?</>,
      async () => await deleteInvestmentPlan(plan.id)
    );
  };
  
  const handlePlanFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlanData(prev => ({ ...prev, [name]: value }));
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
      addNotification('Please fill all fields correctly.', 'error');
      return;
    }

    let result;
    if (editingPlan) {
        result = await updateInvestmentPlan(editingPlan.id, parsedData);
    } else {
        result = await addInvestmentPlan(parsedData);
    }
    
    if (result.success) {
      setShowPlanModal(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageToCrop(result);
      };
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setLogoPreview(croppedImage);
    await updateAppLogo(croppedImage);
    setImageToCrop(null);
    addNotification('Logo updated successfully!', 'success');
  }

  const handleSaveSettings = async () => {
    await updateAppName(newAppName);
    addNotification('App name saved!', 'success');
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassData.newPassword !== adminPassData.confirmNewPassword) {
        addNotification("New passwords do not match.", 'error');
        return;
    }
    const result = await changeAdminPassword(adminPassData.oldPassword, adminPassData.newPassword);
    if (result.success) {
        setAdminPassData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button onClick={adminLogout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {imageToCrop && (
            <ImageCropperModal 
                imageSrc={imageToCrop}
                onCropComplete={handleCropComplete}
                onCancel={() => setImageToCrop(null)}
            />
        )}
        {detailedUser && <UserDetailModal user={detailedUser} onClose={() => setDetailedUser(null)} onEdit={handleEditUser} onToggleStatus={toggleUserStatus} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: users.length, icon: Users, color: 'blue' },
            { title: 'Active Users', value: activeUsers, icon: Activity, color: 'green' },
            { title: 'Total Investments', value: `₹${totalInvestments.toFixed(2)}`, icon: TrendingUp, color: 'purple' },
            { title: 'Total Platform Balance', value: `₹${totalBalance.toFixed(2)}`, icon: Wallet, color: 'orange' },
          ].map(stat => (
            <div key={stat.title} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-500`} size={32} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Platform Customization */}
            <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b flex items-center gap-3">
                    <Settings className="text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Platform Customization</h2>
                </div>
                <div className="p-6 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                        <div className="flex-shrink-0 mb-6 md:mb-0 text-center md:text-left">
                            <label className="block text-sm font-medium text-gray-700 mb-2">App Logo</label>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleLogoFileChange}
                                id="logo-upload"
                                className="hidden"
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer group relative w-24 h-24 block mx-auto md:mx-0">
                                {logoPreview ? (
                                    <>
                                        <img src={logoPreview} alt="Current Logo" className="w-full h-full rounded-full object-cover border-2 border-gray-200" />
                                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                                            <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-200 transition-colors">
                                        <div className="text-center">
                                            <Camera size={24} className="text-gray-400 mx-auto mb-1" />
                                            <span className="text-xs text-gray-500">Upload</span>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAppName}
                                    onChange={(e) => setNewAppName(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                    placeholder="Enter App Name"
                                />
                                <button
                                    onClick={handleSaveSettings}
                                    className="bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition font-semibold"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                        <div className="flex flex-wrap gap-3">
                            {themeOptions.map(option => (
                                <button key={option.name} onClick={() => updateThemeColor(option.name)}
                                    className={`w-10 h-10 rounded-full ${option.bgClass} flex items-center justify-center transition-all duration-200
                                    ${themeColor === option.name ? 'ring-4 ring-offset-2 ring-gray-800' : 'hover:scale-110'}`}
                                    title={option.name.charAt(0).toUpperCase() + option.name.slice(1)}
                                >
                                    {themeColor === option.name && <Check className="text-white" size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Security */}
            <div className="bg-white rounded-xl shadow">
                <div className="p-6 border-b flex items-center gap-3">
                    <Shield className="text-gray-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Admin Security</h2>
                </div>
                <form className="p-6 space-y-4" onSubmit={handleAdminPasswordChange}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input type="password" value={adminPassData.oldPassword} onChange={e => setAdminPassData({...adminPassData, oldPassword: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input type="password" value={adminPassData.newPassword} onChange={e => setAdminPassData({...adminPassData, newPassword: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input type="password" value={adminPassData.confirmNewPassword} onChange={e => setAdminPassData({...adminPassData, confirmNewPassword: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">Change Password</button>
                    </div>
                </form>
            </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
             <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Search by User ID, phone, or name..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{user.id}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{user.balance.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleUserStatus(user)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => handleViewUser(user)} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition" title="View Details"><Eye size={18} /></button>
                        <button onClick={() => handleEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit"><Edit size={18} /></button>
                        <button onClick={() => loginAsUserFunc(user.id)} className="p-2 text-green-600 hover:bg-green-50 rounded transition" title="Login As User"><LogIn size={18} /></button>
                        <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {filteredUsers.length === 0 && <p className="text-center text-gray-500 py-8">No users found.</p>}
          </div>
        </div>

        {/* Investment Plan Management */}
        <div className="bg-white rounded-xl shadow mt-8">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Investment Plan Management</h2>
                    <p className="text-sm text-gray-500">Add, edit, or remove investment plans.</p>
                </div>
                <button onClick={handleAddNewPlan} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <Plus size={20} /> Add New Plan
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Invest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Return</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {investmentPlans.map(plan => (
                            <tr key={plan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{plan.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{plan.name}</td>
                                <td className="px-6 py-4 text-sm"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{plan.category}</span></td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{plan.minInvestment}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{plan.dailyReturn}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-blue-600">{plan.duration} days</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEditPlan(plan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit Plan"><Edit size={18} /></button>
                                        <button onClick={() => handleDeletePlan(plan)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Delete Plan"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {investmentPlans.length === 0 && <p className="text-center text-gray-500 py-8">No investment plans found.</p>}
            </div>
        </div>
        
        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">User Activity Log</h2>
            <p className="text-sm text-gray-500">Recent significant actions performed by users.</p>
          </div>
          <div>
             {activityLog.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No activity recorded yet.</p>
             ) : (
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {activityLog.map(log => (
                    <li key={log.id} onClick={() => setSelectedLogEntry(log)} className="p-4 flex items-center justify-between hover:bg-gray-100 sm:flex-row flex-col sm:text-left text-center cursor-pointer transition-colors duration-150">
                        <div className="flex items-center gap-4 mb-2 sm:mb-0">
                            <div className="hidden sm:block bg-gray-100 p-2 rounded-full">
                                <FileText size={20} className="text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{log.action}</p>
                                <p className="text-sm text-gray-500">
                                    User: {log.userName} ({log.userId})
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 text-right shrink-0">
                            {log.timestamp.toLocaleString()}
                        </p>
                    </li>
                  ))}
                </ul>
             )}
          </div>
        </div>
      </main>

      {/* User Edit Modal */}
      {showUserEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800">Edit User ({selectedUser.id})</h3><button onClick={() => setShowUserEditModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Name</label><input type="text" value={editUserData.name} onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><input type="tel" value={editUserData.phone} onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Balance</label><input type="number" value={editUserData.balance} onChange={(e) => setEditUserData({ ...editUserData, balance: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUserEditModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={saveUserEdit} className="flex-1 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Plan Edit/Add Modal */}
      {showPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
                      <button onClick={() => setShowPlanModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                  </div>
                  <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label><input type="text" name="name" value={planData.name} onChange={handlePlanFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><input type="text" name="category" placeholder="e.g. EVSE-A" value={planData.category} onChange={handlePlanFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Min Investment (₹)</label><input type="number" name="minInvestment" value={planData.minInvestment} onChange={handlePlanFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Daily Return (₹)</label><input type="number" name="dailyReturn" value={planData.dailyReturn} onChange={handlePlanFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label><input type="number" name="duration" value={planData.duration} onChange={handlePlanFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
                  </div>
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setShowPlanModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                      <button onClick={handleSavePlan} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">Save Plan</button>
                  </div>
              </div>
          </div>
      )}

      {/* Activity Log Detail Modal */}
      {selectedLogEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Activity Detail</h3>
                    </div>
                    <button onClick={() => setSelectedLogEntry(null)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-3 text-gray-700 border-t border-b py-4 mb-6">
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Timestamp:</span>
                        <span className="font-semibold">{selectedLogEntry.timestamp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-500">User ID:</span>
                        <span className="font-semibold">{selectedLogEntry.userId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-500">User Name:</span>
                        <span className="font-semibold">{selectedLogEntry.userName}</span>
                    </div>
                    <div className="flex flex-col text-left mt-2">
                        <span className="font-medium text-gray-500 mb-1">Action Description:</span>
                        <p className="font-semibold bg-gray-50 p-3 rounded-md">{selectedLogEntry.action}</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setSelectedLogEntry(null)} className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition">
                        Close
                    </button>
                </div>
                <style>{`
                @keyframes fade-in-up {
                    0% {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                    }
                    100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
                `}</style>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;