import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import type { AppContextType, User, InvestmentPlan, Admin, Investment, Transaction, LoginActivity, Notification, NotificationType, ConfirmationState, ActivityLogEntry, BankAccount, ThemeColor, Prize, Comment, ChatSession, ChatMessage, SocialLinks, MockSms, PaymentSettings } from '../types';
import * as api from './api';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const generateTxId = () => `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin>({ username: 'admin', password: 'admin', isLoggedIn: false });
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [currentView, setCurrentView] = useState('login');
  const [loginAsUser, setLoginAsUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [bankOtps, setBankOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [fundPasswordOtps, setFundPasswordOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [passwordResetOtps, setPasswordResetOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [registerOtps, setRegisterOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [appName, setAppName] = useState<string>('Wealth Fund');
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState<ThemeColor>('green');
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ telegram: '', whatsapp: '' });
  const [mockSms, setMockSms] = useState<MockSms[]>([]);
  const [luckyDrawPrizes, setLuckyDrawPrizes] = useState<Prize[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ upiIds: [], qrCode: null });
  const [pendingDeposit, setPendingDeposit] = useState<{ amount: number; userId: string } | null>(null);


 useEffect(() => {
    const loadInitialData = async () => {
        const data = await api.getInitialData();
        setUsers(data.users);
        setCurrentUser(data.currentUser);
        setAdmin(data.admin);
        setInvestmentPlans(data.investmentPlans);
        setLoginAsUser(data.loginAsUser);
        setActivityLog(data.activityLog);
        setAppName(data.appName);
        setAppLogo(data.appLogo);
        setThemeColor(data.themeColor);
        setComments(data.comments);
        setChatSessions(data.chatSessions);
        setSocialLinks(data.socialLinks);
        setLuckyDrawPrizes(data.luckyDrawPrizes);
        setPaymentSettings(data.paymentSettings);
        setPendingDeposit(data.pendingDeposit);

        // Determine initial view after loading data
        if (data.admin.isLoggedIn) {
            setCurrentView(data.loginAsUser ? 'home' : 'admin-dashboard');
        } else if (data.currentUser) {
            setCurrentView('home');
        } else {
            setCurrentView('login');
        }

        setIsLoading(false);
    };
    loadInitialData();
 }, []);


  // --- Activity Log System ---
  const logActivity = async (userId: string, action: string) => {
    const user = users.find(u => u.id === userId) || currentUser;
    const newLogEntry: ActivityLogEntry = {
        id: Date.now(),
        timestamp: new Date(),
        userId,
        userName: user ? user.name : 'Unknown User',
        action,
    };
    const newLog = [newLogEntry, ...activityLog];
    setActivityLog(newLog);
    await api.saveActivityLog(newLog);
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

  const dismissSms = (id: number) => {
    setMockSms(prev => prev.filter(sms => sms.id !== id));
  };

  const sendOtpSms = async (phone: string, otp: string, purpose: string) => {
    // In a real application, this would integrate with an SMS gateway API.
    // For this simulation, we create a mock SMS notification.
    console.log(`Simulating SMS to ${phone} for ${purpose}. OTP: ${otp}`);
    
    const newSms: MockSms = {
        id: Date.now(),
        to: phone,
        body: `Your verification code for ${appName} ${purpose} is: ${otp}. Do not share this code.`
    };
    setMockSms(prev => [newSms, ...prev.slice(0, 2)]); // Keep max 3 sms notifications

    // Auto-dismiss after some time
    setTimeout(() => dismissSms(newSms.id), 15000);

    addNotification(`An SMS with the OTP has been sent to ${maskPhone(phone)}.`, 'success');
  };

  const requestRegisterOtp = async (phone: string): Promise<{ success: boolean; message?: string }> => {
    if (users.some(u => u.phone === phone)) {
      return { success: false, message: "This phone number is already registered." };
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    setRegisterOtps(prev => ({ ...prev, [phone]: { otp, expires } }));

    await sendOtpSms(phone, otp, 'registration');
    return { success: true, message: 'OTP sent successfully.' };
  };

  const register = async (userData: Pick<User, 'phone' | 'password' | 'name'> & { otp: string }): Promise<{ success: boolean; userId?: string }> => {
    const storedOtp = registerOtps[userData.phone];
    if (!storedOtp || storedOtp.otp !== userData.otp || Date.now() > storedOtp.expires) {
      const message = !storedOtp ? "Invalid OTP" : "OTP has expired. Please request a new one.";
      addNotification(message, 'error');
      if (Date.now() > storedOtp?.expires) setRegisterOtps(prev => { const next = { ...prev }; delete next[userData.phone]; return next; });
      return { success: false };
    }
    
    const userId = generateUserId();
    const newMemberReward: Transaction = { id: generateTxId(), type: 'reward', amount: 30, description: 'New member reward', date: new Date().toISOString(), read: false };
    const signInReward: Transaction = { id: generateTxId(), type: 'reward', amount: 0, description: 'Sign in reward', date: new Date(Date.now() + 1000).toISOString(), read: false };
    const newUser: User = {
      id: userId,
      phone: userData.phone,
      password: userData.password,
      name: userData.name,
      email: '',
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
      language: 'en',
      dailyCheckIns: [],
    };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    await api.saveUsers(newUsers);

    setRegisterOtps(prev => { const next = { ...prev }; delete next[userData.phone]; return next; });

    addNotification(`Account created! User ID: ${userId}`, 'success');
    return { success: true, userId };
  };

  const login = async (identifier: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => (u.phone === identifier || u.id === identifier) && u.password === password);
    if (user && user.isActive) {
      const activity: LoginActivity = { date: new Date().toISOString(), device: 'Web Browser' };
      const updatedUser = { ...user, loginActivity: [...user.loginActivity, activity] };
      const newUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(newUsers);
      setCurrentUser(updatedUser);
      await api.saveUsers(newUsers);
      await api.saveCurrentUser(updatedUser);
      setCurrentView('home');
      addNotification(`Welcome back, ${user.name}!`, 'success');
      await logActivity(user.id, 'Logged in');
      return { success: true };
    }
    const message = 'Invalid credentials or account blocked';
    addNotification(message, 'error');
    return { success: false, message };
  };

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (username === admin.username && password === admin.password) {
      const newAdminState = { ...admin, isLoggedIn: true };
      setAdmin(newAdminState);
      await api.saveAdmin(newAdminState);
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
    const wasInAdminMode = !!loginAsUser;
    
    setCurrentUser(null);
    api.saveCurrentUser(null);

    if (wasInAdminMode) {
        returnToAdmin();
    } else {
        setCurrentView('login');
    }
  };

  const adminLogout = async () => {
    const newAdminState = { ...admin, isLoggedIn: false };
    setAdmin(newAdminState);
    setLoginAsUser(null);
    setCurrentUser(null);
    await api.saveAdmin(newAdminState);
    await api.saveLoginAsUser(null);
    await api.saveCurrentUser(null);
    setCurrentView('login');
    addNotification("Admin logged out.", 'info');
  };

  const loginAsUserFunc = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setLoginAsUser(user);
      setCurrentUser(user);
      await api.saveLoginAsUser(user);
      await api.saveCurrentUser(user);
      setCurrentView('home');
      addNotification(`Now viewing as ${user.name} (${user.id}).`, 'info');
    }
  };

  const returnToAdmin = async () => {
    addNotification('Returned to Admin Dashboard.', 'info');
    setLoginAsUser(null);
    setCurrentUser(null);
    await api.saveLoginAsUser(null);
    await api.saveCurrentUser(null);
    setCurrentView('admin-dashboard');
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    let updatedUser: User | null = null;
    const newUsers = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });

    setUsers(newUsers);
    await api.saveUsers(newUsers);

    if (currentUser && currentUser.id === userId && updatedUser) {
      setCurrentUser(updatedUser);
      await api.saveCurrentUser(updatedUser);
    }
     if (loginAsUser && loginAsUser.id === userId && updatedUser) {
      setLoginAsUser(updatedUser);
      await api.saveLoginAsUser(updatedUser);
    }
  };

  const deleteUser = async (userId: string) => {
    const newUsers = users.filter(u => u.id !== userId);
    setUsers(newUsers);
    await api.saveUsers(newUsers);
    addNotification(`User ${userId} has been deleted.`, 'success');
  };

  const investInPlan = async (planId: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    const plan = investmentPlans.find(p => p.id === planId);
    if (!plan || !currentUser) {
        const message = 'Invalid plan or user';
        addNotification(message, 'error');
        return { success: false, message };
    }
    
    if (currentUser.balance < plan.minInvestment * quantity) {
      const message = 'Insufficient balance';
      addNotification(message, 'error');
      return { success: false, message };
    }
    
    // Create a new object for mutation
    let updatedUser = { ...currentUser, investments: [...currentUser.investments], transactions: [...currentUser.transactions] };
    const totalInvestmentCost = plan.minInvestment * quantity;
    const totalRevenueForNewInvestment = plan.dailyReturn * plan.duration * quantity;
    updatedUser.balance -= totalInvestmentCost;

    const existingInvestmentIndex = updatedUser.investments.findIndex(inv => inv.planId === planId);
    if (existingInvestmentIndex > -1) {
        const existingInvestment = updatedUser.investments[existingInvestmentIndex];
        updatedUser.investments[existingInvestmentIndex] = {
            ...existingInvestment,
            quantity: existingInvestment.quantity + quantity,
            investedAmount: existingInvestment.investedAmount + totalInvestmentCost,
            totalRevenue: existingInvestment.totalRevenue + totalRevenueForNewInvestment,
            dailyEarnings: existingInvestment.dailyEarnings + (plan.dailyReturn * quantity),
        };
    } else {
        const newInvestment: Investment = {
            planId: plan.id, planName: plan.name, investedAmount: totalInvestmentCost,
            totalRevenue: totalRevenueForNewInvestment, dailyEarnings: plan.dailyReturn * quantity,
            revenueDays: plan.duration, quantity, startDate: new Date().toISOString().split('T')[0], category: plan.category
        };
        updatedUser.investments.push(newInvestment);
    }
    const newTransaction: Transaction = {
      id: generateTxId(),
      type: 'investment', amount: -totalInvestmentCost, description: `Invest in ${plan.name} (x${quantity})`,
      date: new Date().toISOString(), read: false,
    };
    updatedUser.transactions.unshift(newTransaction);

    await updateUser(currentUser.id, updatedUser);
    
    const message = 'Investment successful!';
    addNotification(message, 'success');
    await logActivity(currentUser.id, `Invested ₹${totalInvestmentCost.toFixed(2)} in ${plan.name} (x${quantity})`);
    return { success: true, message };
  };

  const initiateDeposit = async (amount: number) => {
    if (currentUser) {
      const depositData = { amount, userId: currentUser.id };
      setPendingDeposit(depositData);
      await api.savePendingDeposit(depositData);
    }
  };

  const processDeposit = async (userId: string, amount: number): Promise<{ success: boolean }> => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        addNotification('User not found.', 'error');
        return { success: false };
    }
    const newTransaction: Transaction = { id: generateTxId(), type: 'deposit', amount, description: `Deposit via Gateway`, date: new Date().toISOString(), read: false };
    const updatedUser: Partial<User> = {
        balance: user.balance + amount,
        rechargeAmount: user.rechargeAmount + amount,
        transactions: [newTransaction, ...user.transactions],
    };

    await updateUser(userId, updatedUser);
    await logActivity(userId, `Deposited ₹${amount.toFixed(2)}`);
    addNotification(`Successfully deposited ₹${amount.toFixed(2)}.`, 'success');
    setPendingDeposit(null);
    await api.savePendingDeposit(null);
    return { success: true };
  };

  const makeWithdrawal = async (userId: string, amount: number): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.id === userId);
    if (!user) { return { success: false, message: "User not found" }; }
    if (!user.bankAccount) { return { success: false, message: "Please add a bank account first." }; }
    if (amount < 300) { return { success: false, message: "Minimum withdrawal amount is ₹300." }; }
    if (amount > user.balance) { return { success: false, message: "Insufficient balance." }; }
    
    const tax = amount * 0.08;
    const newTransaction: Transaction = { id: generateTxId(), type: 'withdrawal', amount: -amount, description: 'Withdrawal', date: new Date().toISOString(), read: false };
    const updatedUser: Partial<User> = {
        balance: user.balance - amount,
        withdrawals: user.withdrawals + amount,
        transactions: [newTransaction, ...user.transactions],
    };
    
    await updateUser(userId, updatedUser);
    await logActivity(userId, `Withdrew ₹${amount.toFixed(2)}`);
    addNotification(`Withdrawal of ₹${amount.toFixed(2)} successful. Tax of ₹${tax.toFixed(2)} applied.`, 'success');
    return { success: true };
  };

  const changeUserPassword = async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.id === userId);
    if (!user) { return { success: false, message: 'User not found.' }; }
    if (oldPass !== user.password) { return { success: false, message: 'Current password is incorrect' }; }
    if (newPass.length < 6) { return { success: false, message: 'New password must be at least 6 characters' }; }
    
    await updateUser(userId, { password: newPass });
    await logActivity(userId, 'Changed password');
    addNotification('Password changed successfully!', 'success');
    return { success: true };
  };
  
  const addInvestmentPlan = async (planData: Omit<InvestmentPlan, 'id'>): Promise<{ success: boolean; message?: string }> => {
    if (!planData.name || !planData.category || !planData.minInvestment || !planData.dailyReturn || !planData.duration) {
      return { success: false, message: "All plan fields are required." };
    }
    const newId = `${planData.category}-${Math.random().toString(36).substr(2, 5)}`;
    const newPlan: InvestmentPlan = { id: newId, ...planData };
    const newPlans = [...investmentPlans, newPlan];
    setInvestmentPlans(newPlans);
    await api.saveInvestmentPlans(newPlans);
    addNotification(`New plan "${planData.name}" added. All users notified.`, 'success');

    const notificationTransaction: Transaction = {
        id: generateTxId(),
        type: 'system', amount: 0, description: `New Plan Added: ${planData.name} is now available.`,
        date: new Date().toISOString(), read: false,
    };

    const updatedUsers = users.map(user => ({...user, transactions: [notificationTransaction, ...user.transactions]}));
    setUsers(updatedUsers);
    await api.saveUsers(updatedUsers);

    if (currentUser) {
        setCurrentUser(prev => prev ? {...prev, transactions: [notificationTransaction, ...prev.transactions]} : null);
    }

    return { success: true };
  };

  const updateInvestmentPlan = async (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>): Promise<{ success: boolean; message?: string }> => {
    let planName = '';
    const newPlans = investmentPlans.map(p => {
        if (p.id === planId) {
            planName = updates.name || p.name;
            return { ...p, ...updates };
        }
        return p;
    });
    setInvestmentPlans(newPlans);
    await api.saveInvestmentPlans(newPlans);

    if (planName) {
        const notificationTransaction: Transaction = { id: generateTxId(), type: 'system', amount: 0, description: `Plan Updated: Details for '${planName}' have changed.`, date: new Date().toISOString(), read: false };
        const updatedUsers = users.map(user => ({ ...user, transactions: [notificationTransaction, ...user.transactions] }));
        setUsers(updatedUsers);
        await api.saveUsers(updatedUsers);

        if (currentUser) {
            setCurrentUser(prev => prev ? { ...prev, transactions: [notificationTransaction, ...prev.transactions] } : null);
        }
    }
    addNotification(`Plan ${planId} updated successfully. All users notified.`, 'success');
    return { success: true };
  };

  const deleteInvestmentPlan = async (planId: string) => {
    const newPlans = investmentPlans.filter(p => p.id !== planId);
    setInvestmentPlans(newPlans);
    await api.saveInvestmentPlans(newPlans);
    addNotification(`Plan ${planId} has been deleted.`, 'success');
  };
  
  const requestBankAccountOtp = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "User not found" };
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;
    setBankOtps(prev => ({ ...prev, [userId]: { otp, expires } }));

    await sendOtpSms(user.phone, otp, 'Bank Account update');
    return { success: true, message: 'OTP sent successfully.' };
  };

  const updateBankAccount = async (userId: string, accountDetails: BankAccount, otp: string): Promise<{ success: boolean; message?: string }> => {
    const storedOtp = bankOtps[userId];
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      const message = !storedOtp ? "Invalid OTP" : "OTP has expired";
      addNotification(message, 'error');
      if (Date.now() > storedOtp?.expires) setBankOtps(prev => { const next = { ...prev }; delete next[userId]; return next; });
      return { success: false, message };
    }

    await updateUser(userId, { bankAccount: accountDetails });
    setBankOtps(prev => { const next = { ...prev }; delete next[userId]; return next; });
    const message = "Bank account updated successfully!";
    addNotification(message, 'success');
    await logActivity(userId, "Updated bank account information");
    return { success: true, message };
  };

  const playLuckyDraw = async (): Promise<{ success: boolean; prize?: Prize }> => {
    if (!currentUser) return { success: false };
    const result = await api.playLuckyDrawApi(currentUser);
    if (result.success) {
      await updateUser(currentUser.id, result.updatedUser);
    } else {
      addNotification("You don't have any chances left.", 'error');
    }
    return { success: result.success, prize: result.prize };
  };

  const requestFundPasswordOtp = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        addNotification("User not found to send OTP.", "error");
        return { success: false, message: "User not found" };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;
    setFundPasswordOtps(prev => ({ ...prev, [userId]: { otp, expires } }));
    await sendOtpSms(user.phone, otp, 'Fund Password setup');
    return { success: true, message: 'OTP sent successfully.' };
  };

  const updateFundPassword = async (userId: string, newFundPassword: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    const storedOtp = fundPasswordOtps[userId];
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      const message = !storedOtp ? "Invalid OTP" : "OTP has expired";
      addNotification(message, 'error');
      if (Date.now() > storedOtp?.expires) setFundPasswordOtps(prev => { const next = { ...prev }; delete next[userId]; return next; });
      return { success: false, message };
    }
    await updateUser(userId, { fundPassword: newFundPassword });
    setFundPasswordOtps(prev => { const next = { ...prev }; delete next[userId]; return next; });
    addNotification("Fund password updated successfully!", 'success');
    await logActivity(userId, "Updated fund password");
    return { success: true };
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser || !currentUser.transactions.some(t => !t.read)) return;
    const updatedTransactions = currentUser.transactions.map(t => ({ ...t, read: true }));
    await updateUser(currentUser.id, { transactions: updatedTransactions });
  };

  const updateAppName = async (newName: string) => {
    setAppName(newName);
    await api.saveAppName(newName);
  };

  const updateAppLogo = async (newLogo: string) => {
    setAppLogo(newLogo);
    await api.saveAppLogo(newLogo);
  };

  const updateThemeColor = async (color: ThemeColor) => {
    setThemeColor(color);
    await api.saveThemeColor(color);
  };

  const changeAdminPassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
    if (oldPass !== admin.password) return { success: false, message: 'Current admin password is incorrect' };
    if (newPass.length < 6) return { success: false, message: 'New password must be at least 6 characters' };
    
    const newAdmin = { ...admin, password: newPass };
    setAdmin(newAdmin);
    await api.saveAdmin(newAdmin);
    addNotification('Admin password changed successfully!', 'success');
    return { success: true };
  };

  const performDailyCheckIn = async (): Promise<{ success: boolean; message: string; reward: number }> => {
    if (!currentUser) return { success: false, message: 'User not found', reward: 0 };

    const today = new Date().toISOString().split('T')[0];
    const checkIns = currentUser.dailyCheckIns || [];

    if (checkIns.includes(today)) {
      addNotification('Already checked in today.', 'info');
      return { success: false, message: 'Already checked in today.', reward: 0 };
    }

    const newCheckIns = [...checkIns, today];
    const newDayCount = newCheckIns.length;
    let reward = 0;
    let description = `Daily Check-in: Day ${newDayCount}`;
    let newTransaction: Transaction | null = null;
    
    if (newDayCount === 7 || newDayCount === 14) {
      reward = 10;
      description = `Get an additional ₹10 reward`;
    }

    const updatedData: Partial<User> = { dailyCheckIns: newCheckIns };

    if (reward > 0) {
      updatedData.balance = currentUser.balance + reward;
      newTransaction = {
        id: generateTxId(),
        type: 'reward',
        amount: reward,
        description: `Login Reward: Day ${newDayCount}`,
        date: new Date().toISOString(),
        read: false
      };
      updatedData.transactions = [newTransaction, ...currentUser.transactions];
    } else {
        newTransaction = {
        id: generateTxId(),
        type: 'reward',
        amount: 0,
        description: `Login Reward: Day ${newDayCount}`,
        date: new Date().toISOString(),
        read: false
      };
      updatedData.transactions = [newTransaction, ...currentUser.transactions];
    }
    
    await updateUser(currentUser.id, updatedData);
    
    const message = reward > 0 ? `Checked in! You received a ₹${reward} reward!` : 'Check-in successful!';
    addNotification(message, 'success');
    await logActivity(currentUser.id, `Completed Daily Check-in Day ${newDayCount}`);
    return { success: true, message, reward };
  };
  
  const addComment = async (commentData: { text: string; images: string[] }): Promise<void> => {
    if (!currentUser) {
        addNotification('You must be logged in to comment.', 'error');
        return;
    }
    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: `https://i.pravatar.cc/150?u=${currentUser.id}`, // Generate a consistent avatar
        maskedPhone: maskPhone(currentUser.phone),
        text: commentData.text,
        images: commentData.images,
        timestamp: new Date().toISOString(),
    };
    const newComments = [newComment, ...comments];
    setComments(newComments);
    await api.saveComments(newComments);
    addNotification('Comment posted successfully!', 'success');
  };

  const sendChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }): Promise<void> => {
    const senderId = (admin.isLoggedIn && !loginAsUser) ? 'admin' : currentUser!.id;
    
    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId,
        timestamp: new Date().toISOString(),
        ...message
    };

    let session = chatSessions.find(s => s.userId === userId);
    let newSessions = [...chatSessions];

    if (session) {
        session.messages.push(newMessage);
        session.lastMessageTimestamp = newMessage.timestamp;
        if (senderId === 'admin') {
            session.userUnreadCount += 1;
        } else {
            session.adminUnreadCount += 1;
        }
        newSessions = newSessions.map(s => s.userId === userId ? session! : s);
    } else {
        session = {
            userId,
            messages: [newMessage],
            lastMessageTimestamp: newMessage.timestamp,
            userUnreadCount: senderId === 'admin' ? 1 : 0,
            adminUnreadCount: senderId !== 'admin' ? 1 : 0,
        };
        newSessions.push(session);
    }
    
    setChatSessions(newSessions);
    await api.saveChatSessions(newSessions);
  };
  
  const markChatAsRead = async (userId: string): Promise<void> => {
    const isUserReading = !!currentUser; // True if a user is logged in
    
    let session = chatSessions.find(s => s.userId === userId);
    if (!session) return;

    if (isUserReading && session.userUnreadCount > 0) {
        session.userUnreadCount = 0;
    } else if (!isUserReading && session.adminUnreadCount > 0) { // Admin is reading
        session.adminUnreadCount = 0;
    } else {
        return; // No changes needed
    }
    
    const newSessions = chatSessions.map(s => s.userId === userId ? session! : s);
    setChatSessions(newSessions);
    await api.saveChatSessions(newSessions);
  };

  const updateSocialLinks = async (links: Partial<SocialLinks>) => {
    const newLinks = { ...socialLinks, ...links };
    setSocialLinks(newLinks);
    await api.saveSocialLinks(newLinks);
    addNotification('Social links updated successfully!', 'success');
  };
  
  const updatePaymentSettings = async (settings: Partial<PaymentSettings>) => {
      const newSettings = { ...paymentSettings, ...settings };
      setPaymentSettings(newSettings);
      await api.savePaymentSettings(newSettings);
      addNotification('Payment settings updated!', 'success');
  };

  const requestPasswordResetOtp = async (phone: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.phone === phone);
    if (!user) return { success: false, message: "Phone number not found." };
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;
    setPasswordResetOtps(prev => ({ ...prev, [phone]: { otp, expires } }));

    await sendOtpSms(phone, otp, 'password reset');
    return { success: true, message: 'OTP sent successfully.' };
  };
  
  const resetPasswordWithOtp = async (phone: string, otp: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.phone === phone);
    if (!user) return { success: false, message: "User not found." };

    const storedOtp = passwordResetOtps[phone];
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      const message = !storedOtp ? "Invalid OTP" : "OTP has expired";
      addNotification(message, 'error');
      if (Date.now() > storedOtp?.expires) setPasswordResetOtps(prev => { const next = { ...prev }; delete next[phone]; return next; });
      return { success: false, message };
    }

    await updateUser(user.id, { password: newPassword });
    setPasswordResetOtps(prev => { const next = { ...prev }; delete next[phone]; return next; });
    addNotification("Password reset successfully!", 'success');
    await logActivity(user.id, "Reset password using OTP");
    return { success: true };
  };

  const addLuckyDrawPrize = async (prizeData: Omit<Prize, 'id'>): Promise<{ success: boolean; message?: string }> => {
      if (luckyDrawPrizes.length >= 8) {
          return { success: false, message: "Maximum of 8 prizes allowed." };
      }
      const newId = `prize-${Date.now()}`;
      const newPrize: Prize = { id: newId, ...prizeData };
      const newPrizes = [...luckyDrawPrizes, newPrize];
      setLuckyDrawPrizes(newPrizes);
      await api.saveLuckyDrawPrizes(newPrizes);
      addNotification(`New prize "${prizeData.name}" added.`, 'success');
      return { success: true };
  };

  const updateLuckyDrawPrize = async (prizeId: string, updates: Partial<Omit<Prize, 'id'>>): Promise<{ success: boolean; message?: string }> => {
      const newPrizes = luckyDrawPrizes.map(p => p.id === prizeId ? { ...p, ...updates } : p);
      setLuckyDrawPrizes(newPrizes);
      await api.saveLuckyDrawPrizes(newPrizes);
      addNotification(`Prize updated successfully.`, 'success');
      return { success: true };
  };

  const deleteLuckyDrawPrize = async (prizeId: string) => {
      const newPrizes = luckyDrawPrizes.filter(p => p.id !== prizeId);
      setLuckyDrawPrizes(newPrizes);
      await api.saveLuckyDrawPrizes(newPrizes);
      addNotification(`Prize has been deleted.`, 'success');
  };


  const value: AppContextType & { notifications: Notification[], confirmation: ConfirmationState, hideConfirmation: () => void, handleConfirm: () => void } = {
    users, currentUser, admin, investmentPlans, currentView, loginAsUser, notifications, confirmation, activityLog, appName, appLogo, themeColor, isLoading, comments, chatSessions, socialLinks, mockSms, luckyDrawPrizes, paymentSettings, pendingDeposit,
    setCurrentView, register, login, adminLogin, logout, adminLogout,
    loginAsUserFunc, returnToAdmin, updateUser, deleteUser, investInPlan, maskPhone,
    addNotification, showConfirmation, hideConfirmation, handleConfirm, processDeposit, makeWithdrawal, changeUserPassword,
    addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan, requestBankAccountOtp, updateBankAccount,
    playLuckyDraw, requestFundPasswordOtp, updateFundPassword, markNotificationsAsRead, updateAppName, updateAppLogo,
    updateThemeColor, changeAdminPassword, performDailyCheckIn, addComment, sendChatMessage, markChatAsRead, updateSocialLinks, updatePaymentSettings,
    requestPasswordResetOtp, resetPasswordWithOtp, requestRegisterOtp, dismissSms,
    addLuckyDrawPrize, updateLuckyDrawPrize, deleteLuckyDrawPrize, initiateDeposit
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};