import React, { useState, createContext, useContext, ReactNode } from 'react';
import type { AppContextType, User, InvestmentPlan, Admin, Investment, Transaction, LoginActivity, Notification, NotificationType, ConfirmationState, ActivityLogEntry, BankAccount } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const initialAdmin: Admin = {
  username: 'admin',
  password: 'admin',
  isLoggedIn: false,
};

const initialInvestmentPlans: InvestmentPlan[] = [
  { id: 'EVSE-1', name: 'Home EVSE-1', minInvestment: 415, dailyReturn: 166, duration: 59, category: 'EVSE-A' },
  { id: 'EVSE-2', name: 'Home EVSE-2', minInvestment: 1315, dailyReturn: 539, duration: 59, category: 'EVSE-A' },
  { id: 'EVSE-3', name: 'Home EVSE-3', minInvestment: 2500, dailyReturn: 1000, duration: 59, category: 'EVSE-B' },
  { id: 'EVSE-4', name: 'Premium EVSE-1', minInvestment: 5000, dailyReturn: 2100, duration: 90, category: 'EVSE-C' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin>(initialAdmin);
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>(initialInvestmentPlans);
  const [currentView, setCurrentView] = useState('login');
  const [loginAsUser, setLoginAsUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [bankOtps, setBankOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [fundPasswordOtps, setFundPasswordOtps] = useState<Record<string, { otp: string; expires: number }>>({});


  // --- Activity Log System ---
  const logActivity = (userId: string, action: string) => {
    const user = users.find(u => u.id === userId) || currentUser; // Fallback for current user actions
    const newLogEntry: ActivityLogEntry = {
        id: Date.now(),
        timestamp: new Date(),
        userId,
        userName: user ? user.name : 'Unknown User',
        action,
    };
    setActivityLog(prevLog => [newLogEntry, ...prevLog]);
  };

  // --- Notification System ---
  const addNotification = (message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // --- Confirmation Modal System ---
  const showConfirmation = (title: string, message: string | ReactNode, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, title, message, onConfirm });
  };
  
  const hideConfirmation = () => {
    setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };
  
  const handleConfirm = () => {
    confirmation.onConfirm();
    hideConfirmation();
  };

  const generateUserId = (): string => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ID:${randomNum}`;
  };

  const maskPhone = (phone: string): string => {
    if (phone.length < 10) return phone;
    return phone.substring(0, 2) + '****' + phone.substring(phone.length - 4);
  };

  const register = (userData: Pick<User, 'phone' | 'password' | 'name' | 'email'>): { success: boolean; userId?: string } => {
    const userId = generateUserId();
    const newMemberReward: Transaction = {
      type: 'reward',
      amount: 30,
      description: 'New member reward',
      date: new Date().toISOString(),
      read: false,
    };
    const signInReward: Transaction = {
        type: 'reward',
        amount: 0,
        description: 'Sign in reward',
        date: new Date(Date.now() + 1000).toISOString(),
        read: false,
    };
    const newUser: User = {
      id: userId,
      phone: userData.phone,
      password: userData.password,
      name: userData.name || `User ${userId.split(':')[1]}`,
      email: userData.email || '',
      balance: 30,
      totalReturns: 0,
      rechargeAmount: 0,
      withdrawals: 0,
      registrationDate: new Date().toISOString().split('T')[0],
      isActive: true,
      investments: [],
      transactions: [newMemberReward, signInReward],
      loginActivity: [],
      bankAccount: null,
      luckyDrawChances: 1,
      fundPassword: null,
      // FIX: Initialize language for new users.
      language: 'en',
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    addNotification(`Account created! User ID: ${userId}`, 'success');
    return { success: true, userId };
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const user = users.find(u => (u.phone === identifier || u.id === identifier) && u.password === password);
    if (user && user.isActive) {
      const activity: LoginActivity = { date: new Date().toISOString(), device: 'Web Browser' };
      const updatedUser = { ...user, loginActivity: [...user.loginActivity, activity] };
      setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      setCurrentView('home');
      addNotification(`Welcome back, ${user.name}!`, 'success');
      logActivity(user.id, 'Logged in');
      return { success: true };
    }
    const message = 'Invalid credentials or account blocked';
    addNotification(message, 'error');
    return { success: false, message };
  };

  const adminLogin = (username: string, password: string): { success: boolean; message?: string } => {
    if (username === admin.username && password === admin.password) {
      setAdmin({ ...admin, isLoggedIn: true });
      setCurrentView('admin-dashboard');
      addNotification('Admin login successful.', 'success');
      return { success: true };
    }
    const message = 'Invalid admin credentials';
    addNotification(message, 'error');
    return { success: false, message };
  };

  const logout = () => {
    addNotification("You have been logged out.", 'info');
    setCurrentUser(null);
    if (!loginAsUser) {
        setCurrentView('login');
    } else {
        returnToAdmin();
    }
  };

  const adminLogout = () => {
    setAdmin({ ...admin, isLoggedIn: false });
    setLoginAsUser(null);
    setCurrentView('login');
    addNotification("Admin logged out.", 'info');
  };

  const loginAsUserFunc = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setLoginAsUser(user);
      setCurrentUser(user);
      setCurrentView('home');
      addNotification(`Now viewing as ${user.name} (${user.id}).`, 'info');
    }
  };

  const returnToAdmin = () => {
    addNotification('Returned to Admin Dashboard.', 'info');
    setLoginAsUser(null);
    setCurrentUser(null);
    setCurrentView('admin-dashboard');
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
     if (loginAsUser && loginAsUser.id === userId) {
      setLoginAsUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    addNotification(`User ${userId} has been deleted.`, 'success');
  };

  const investInPlan = (planId: string, quantity: number): { success: boolean; message: string } => {
    const plan = investmentPlans.find(p => p.id === planId);
    if (!plan || !currentUser) {
        const message = 'Invalid plan or user';
        addNotification(message, 'error');
        return { success: false, message };
    }
    
    const totalInvestmentCost = plan.minInvestment * quantity;
    if (currentUser.balance < totalInvestmentCost) {
      const message = 'Insufficient balance';
      addNotification(message, 'error');
      return { success: false, message };
    }

    const totalRevenueForNewInvestment = plan.dailyReturn * plan.duration * quantity;
    
    let updatedUser = { ...currentUser };
    updatedUser.balance -= totalInvestmentCost;

    const existingInvestment = currentUser.investments.find(inv => inv.planId === planId);
    if (existingInvestment) {
      updatedUser.investments = updatedUser.investments.map(inv => 
        inv.planId === planId ? {
          ...inv,
          quantity: inv.quantity + quantity,
          investedAmount: inv.investedAmount + totalInvestmentCost,
          totalRevenue: inv.totalRevenue + totalRevenueForNewInvestment,
          dailyEarnings: inv.dailyEarnings + (plan.dailyReturn * quantity),
        } : inv
      );
    } else {
      const newInvestment: Investment = {
        planId: plan.id,
        planName: plan.name,
        investedAmount: totalInvestmentCost,
        totalRevenue: totalRevenueForNewInvestment,
        dailyEarnings: plan.dailyReturn * quantity,
        revenueDays: plan.duration,
        quantity: quantity,
        startDate: new Date().toISOString().split('T')[0],
        category: plan.category
      };
      updatedUser.investments = [...updatedUser.investments, newInvestment];
    }

    const newTransaction: Transaction = {
      type: 'investment',
      amount: -totalInvestmentCost,
      description: `Invest in ${plan.name} (x${quantity})`,
      date: new Date().toISOString(),
      read: false,
    };
    updatedUser.transactions = [newTransaction, ...updatedUser.transactions];

    updateUser(currentUser.id, updatedUser);
    
    const message = 'Investment successful!';
    addNotification(message, 'success');
    logActivity(currentUser.id, `Invested ₹${totalInvestmentCost.toFixed(2)} in ${plan.name} (x${quantity})`);
    return { success: true, message };
  };

  const makeDeposit = (userId: string, amount: number): { success: boolean } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        addNotification('User not found.', 'error');
        return { success: false };
    }
   
    const updatedBalance = user.balance + amount;
    const newTransaction: Transaction = {
        type: 'deposit',
        amount: amount,
        description: 'Deposit',
        date: new Date().toISOString(),
        read: false,
    };
    
    const updatedUser: Partial<User> = {
        balance: updatedBalance,
        rechargeAmount: user.rechargeAmount + amount,
        transactions: [newTransaction, ...user.transactions],
    };

    updateUser(userId, updatedUser);
    logActivity(userId, `Deposited ₹${amount.toFixed(2)}`);
    addNotification(`Successfully deposited ₹${amount.toFixed(2)}.`, 'success');
    return { success: true };
  };

  const makeWithdrawal = (userId: string, amount: number): { success: boolean; message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const message = "User not found";
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (!user.bankAccount) {
        const message = "Please add a bank account first.";
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (amount < 300) {
        const message = "Minimum withdrawal amount is ₹300.";
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (amount > user.balance) {
        const message = "Insufficient balance.";
        addNotification(message, 'error');
        return { success: false, message };
    }
    
    const tax = amount * 0.08;
    const totalDeduction = amount; // Tax is mentioned but not deducted from requested amount in most systems, it's a fee. Let's assume the user gets the amount requested.
    
    const updatedBalance = user.balance - totalDeduction;
    
    const newTransaction: Transaction = {
        type: 'withdrawal',
        amount: -amount,
        description: 'Withdrawal',
        date: new Date().toISOString(),
        read: false,
    };
    
    const updatedUser: Partial<User> = {
        balance: updatedBalance,
        withdrawals: user.withdrawals + amount,
        transactions: [newTransaction, ...user.transactions],
    };
    
    updateUser(userId, updatedUser);
    logActivity(userId, `Withdrew ₹${amount.toFixed(2)}`);
    addNotification(`Withdrawal of ₹${amount.toFixed(2)} successful. Tax of ₹${tax.toFixed(2)} applied.`, 'success');
    return { success: true };
  };

  const changeUserPassword = (userId: string, oldPass: string, newPass: string): { success: boolean; message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const message = 'User not found.';
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (oldPass !== user.password) {
        const message = 'Current password is incorrect';
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (newPass.length < 6) {
        const message = 'New password must be at least 6 characters';
        addNotification(message, 'error');
        return { success: false, message };
    }
    
    updateUser(userId, { password: newPass });
    logActivity(userId, 'Changed password');
    addNotification('Password changed successfully!', 'success');
    return { success: true };
  };
  
  // --- Investment Plan Management ---
  const addInvestmentPlan = (planData: Omit<InvestmentPlan, 'id'>): { success: boolean; message?: string } => {
    if (!planData.name || !planData.category || !planData.minInvestment || !planData.dailyReturn || !planData.duration) {
      const message = "All plan fields are required.";
      addNotification(message, 'error');
      return { success: false, message };
    }
    const newId = `${planData.category}-${Math.random().toString(36).substr(2, 5)}`;
    const newPlan: InvestmentPlan = { id: newId, ...planData };
    setInvestmentPlans(prev => [...prev, newPlan]);
    addNotification(`New plan "${planData.name}" added. All users notified.`, 'success');

    const notificationTransaction: Transaction = {
        type: 'system',
        amount: 0,
        description: `New Plan Added: ${planData.name} is now available.`,
        date: new Date().toISOString(),
        read: false,
    };

    setUsers(prevUsers => 
        prevUsers.map(user => ({
            ...user,
            transactions: [notificationTransaction, ...user.transactions],
        }))
    );

    if (currentUser) {
        setCurrentUser(prev => prev ? {
            ...prev,
            transactions: [notificationTransaction, ...prev.transactions]
        } : null);
    }

    return { success: true };
  };

  const updateInvestmentPlan = (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>): { success: boolean; message?: string } => {
    let planName = '';
    setInvestmentPlans(prev => prev.map(p => {
        if (p.id === planId) {
            planName = updates.name || p.name;
            return { ...p, ...updates };
        }
        return p;
    }));

    if (planName) {
        const notificationTransaction: Transaction = {
            type: 'system',
            amount: 0,
            description: `Plan Updated: Details for '${planName}' have changed.`,
            date: new Date().toISOString(),
            read: false,
        };

        setUsers(prevUsers => 
            prevUsers.map(user => ({
                ...user,
                transactions: [notificationTransaction, ...user.transactions],
            }))
        );

        if (currentUser) {
            setCurrentUser(prev => prev ? {
                ...prev,
                transactions: [notificationTransaction, ...prev.transactions]
            } : null);
        }
    }
    
    addNotification(`Plan ${planId} updated successfully. All users notified.`, 'success');
    return { success: true };
  };

  const deleteInvestmentPlan = (planId: string) => {
    setInvestmentPlans(prev => prev.filter(p => p.id !== planId));
    addNotification(`Plan ${planId} has been deleted.`, 'success');
  };
  
  const requestBankAccountOtp = (userId: string): { success: boolean; message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const message = "User not found";
        addNotification(message, 'error');
        return { success: false, message };
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    setBankOtps(prev => ({ ...prev, [userId]: { otp, expires } }));

    // For simulation, we show the OTP in a notification
    addNotification(`Your OTP is: ${otp}`, 'success');
    return { success: true, message: 'OTP sent successfully.' };
  };

  const updateBankAccount = (userId: string, accountDetails: BankAccount, otp: string): { success: boolean; message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const message = "User not found";
        addNotification(message, 'error');
        return { success: false, message };
    }

    const storedOtp = bankOtps[userId];
    if (!storedOtp || storedOtp.otp !== otp) {
        const message = "Invalid OTP";
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (Date.now() > storedOtp.expires) {
        const message = "OTP has expired";
        addNotification(message, 'error');
        // Clear expired OTP
        setBankOtps(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
        return { success: false, message };
    }

    updateUser(userId, { bankAccount: accountDetails });
    
    // Clear used OTP
    setBankOtps(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
    });

    const message = "Bank account updated successfully!";
    addNotification(message, 'success');
    logActivity(userId, "Updated bank account information");
    return { success: true, message };
  };

  const playLuckyDraw = (): { success: boolean; prize?: string } => {
    if (!currentUser || currentUser.luckyDrawChances <= 0) {
        addNotification("You don't have any chances left.", 'error');
        return { success: false };
    }

    const prizes = [
        { name: 'Random Bonus', type: 'bonus', amount: 10 },
        { name: '₹50', type: 'money', amount: 50 },
        { name: '₹500', type: 'money', amount: 500 },
        { name: 'Thank you', type: 'nothing', amount: 0 },
        { name: 'iPhone 16', type: 'physical', amount: 0 },
        { name: '₹10000', type: 'money', amount: 10000 },
        { name: 'Air condition', type: 'physical', amount: 0 },
        { name: 'Refrigerator', type: 'physical', amount: 0 },
    ];
    
    const wonPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    const updatedUser: Partial<User> = { 
        luckyDrawChances: currentUser.luckyDrawChances - 1,
    };

    if (wonPrize.type === 'money' || wonPrize.type === 'bonus') {
        updatedUser.balance = currentUser.balance + wonPrize.amount;
        const newTransaction: Transaction = {
            type: 'prize',
            amount: wonPrize.amount,
            description: `Lucky Draw: ${wonPrize.name}`,
            date: new Date().toISOString(),
            read: false,
        };
        updatedUser.transactions = [newTransaction, ...currentUser.transactions];
        addNotification(`You won ${wonPrize.name}!`, 'success');
    } else if (wonPrize.type === 'physical') {
        addNotification(`Congratulations! You won a ${wonPrize.name}. Please contact support.`, 'success');
    } else {
        addNotification('Thank you for participating!', 'info');
    }
    
    updateUser(currentUser.id, updatedUser);
    
    return { success: true, prize: wonPrize.name };
  };

  const requestFundPasswordOtp = (userId: string): { success: boolean; message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const message = "User not found";
        addNotification(message, 'error');
        return { success: false, message };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    setFundPasswordOtps(prev => ({ ...prev, [userId]: { otp, expires } }));
    addNotification(`Your OTP is: ${otp}`, 'success');
    return { success: true, message: 'OTP sent successfully.' };
  };

  const updateFundPassword = (userId: string, newFundPassword: string, otp: string): { success: boolean; message?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        const message = "User not found";
        addNotification(message, 'error');
        return { success: false, message };
    }
    const storedOtp = fundPasswordOtps[userId];
    if (!storedOtp || storedOtp.otp !== otp) {
        const message = "Invalid OTP";
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (Date.now() > storedOtp.expires) {
        const message = "OTP has expired";
        addNotification(message, 'error');
        setFundPasswordOtps(prev => { const next = { ...prev }; delete next[userId]; return next; });
        return { success: false, message };
    }
    updateUser(userId, { fundPassword: newFundPassword });
    setFundPasswordOtps(prev => { const next = { ...prev }; delete next[userId]; return next; });
    const message = "Fund password updated successfully!";
    addNotification(message, 'success');
    logActivity(userId, "Updated fund password");
    return { success: true, message };
  };

  const markNotificationsAsRead = () => {
    if (!currentUser || !currentUser.transactions.some(t => !t.read)) {
        return;
    }
    const updatedTransactions = currentUser.transactions.map(t => ({ ...t, read: true }));
    const updatedUser = { ...currentUser, transactions: updatedTransactions };
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const value: AppContextType & { notifications: Notification[], confirmation: ConfirmationState, hideConfirmation: () => void, handleConfirm: () => void } = {
    users, currentUser, admin, investmentPlans, currentView, loginAsUser, notifications, confirmation, activityLog,
    setCurrentView, register, login, adminLogin, logout, adminLogout,
    loginAsUserFunc, returnToAdmin, updateUser, deleteUser, investInPlan, maskPhone,
    addNotification, showConfirmation, hideConfirmation, handleConfirm, makeDeposit, makeWithdrawal, changeUserPassword,
    addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan, requestBankAccountOtp, updateBankAccount,
    playLuckyDraw, requestFundPasswordOtp, updateFundPassword, markNotificationsAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};