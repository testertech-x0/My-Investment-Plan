import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import type { AppContextType, User, InvestmentPlan, Admin, Investment, Transaction, LoginActivity, Notification, NotificationType, ConfirmationState, ActivityLogEntry, BankAccount, ThemeColor, Prize } from '../types';

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

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
    }
    return defaultValue;
};

// Pre-read authentication state to determine the initial view synchronously.
const initialCurrentUser = getInitialState<User | null>('app_currentUser', null);
const initialAdminState = getInitialState<Admin>('app_admin', initialAdmin);
const initialLoginAsUser = getInitialState<User | null>('app_loginAsUser', null);

const getInitialView = (): string => {
    if (initialAdminState.isLoggedIn) {
        return initialLoginAsUser ? 'home' : 'admin-dashboard';
    }
    if (initialCurrentUser) {
        return 'home';
    }
    return 'login';
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getInitialState<User[]>('app_users', []));
  const [currentUser, setCurrentUser] = useState<User | null>(() => initialCurrentUser);
  const [admin, setAdmin] = useState<Admin>(() => initialAdminState);
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>(() => getInitialState<InvestmentPlan[]>('app_investmentPlans', initialInvestmentPlans));
  const [currentView, setCurrentView] = useState(getInitialView);
  const [loginAsUser, setLoginAsUser] = useState<User | null>(() => initialLoginAsUser);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => {
    try {
        const saved = localStorage.getItem('app_activityLog');
        if (!saved) return [];
        const parsedLog = JSON.parse(saved) as (Omit<ActivityLogEntry, 'timestamp'> & { timestamp: string })[];
        return parsedLog.map(entry => ({ ...entry, timestamp: new Date(entry.timestamp) }));
    } catch (e) { 
        console.error("Failed to parse activity log from localStorage", e);
        return []; 
    }
  });
  const [bankOtps, setBankOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [fundPasswordOtps, setFundPasswordOtps] = useState<Record<string, { otp: string; expires: number }>>({});
  const [appName, setAppName] = useState<string>(() => getInitialState<string>('app_appName', 'Wealth Fund'));
  const [appLogo, setAppLogo] = useState<string | null>(() => getInitialState<string | null>('app_appLogo', null));
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => getInitialState<ThemeColor>('app_themeColor', 'green'));

  // --- Robust State Persistence Wrappers ---
  const createPersistentSetter = <T,>(
    stateSetter: React.Dispatch<React.SetStateAction<T>>,
    key: string,
    isNullable: boolean = false
  ) => {
      return (updater: React.SetStateAction<T>) => {
          stateSetter(prev => {
              const newState = typeof updater === 'function' ? (updater as (prevState: T) => T)(prev) : updater;
              try {
                  if (isNullable && (newState === null || newState === undefined)) {
                      localStorage.removeItem(key);
                  } else {
                      localStorage.setItem(key, JSON.stringify(newState));
                  }
              } catch (error) {
                  console.error(`Failed to save state for key "${key}" to localStorage`, error);
              }
              return newState;
          });
      };
  };

  const setUsersAndPersist = createPersistentSetter(setUsers, 'app_users');
  const setCurrentUserAndPersist = createPersistentSetter(setCurrentUser, 'app_currentUser', true);
  const setAdminAndPersist = createPersistentSetter(setAdmin, 'app_admin');
  const setInvestmentPlansAndPersist = createPersistentSetter(setInvestmentPlans, 'app_investmentPlans');
  const setLoginAsUserAndPersist = createPersistentSetter(setLoginAsUser, 'app_loginAsUser', true);
  const setActivityLogAndPersist = createPersistentSetter(setActivityLog, 'app_activityLog');
  const setAppNameAndPersist = (newName: string) => {
      setAppName(newName);
      localStorage.setItem('app_appName', newName);
  };
  const setAppLogoAndPersist = (newLogo: string | null) => {
      setAppLogo(newLogo);
      if (newLogo) {
          localStorage.setItem('app_appLogo', newLogo);
      } else {
          localStorage.removeItem('app_appLogo');
      }
  };
  const setThemeColorAndPersist = (newColor: ThemeColor) => {
      setThemeColor(newColor);
      localStorage.setItem('app_themeColor', newColor);
  };


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
    setActivityLogAndPersist(prevLog => [newLogEntry, ...prevLog]);
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
      language: 'en',
    };
    setUsersAndPersist(prevUsers => [...prevUsers, newUser]);
    addNotification(`Account created! User ID: ${userId}`, 'success');
    return { success: true, userId };
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const user = users.find(u => (u.phone === identifier || u.id === identifier) && u.password === password);
    if (user && user.isActive) {
      const activity: LoginActivity = { date: new Date().toISOString(), device: 'Web Browser' };
      const updatedUser = { ...user, loginActivity: [...user.loginActivity, activity] };
      setUsersAndPersist(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUserAndPersist(updatedUser);
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
      setAdminAndPersist({ ...admin, isLoggedIn: true });
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
    setCurrentUserAndPersist(null);
    if (wasInAdminMode) {
        returnToAdmin();
    } else {
        setCurrentView('login');
    }
  };

  const adminLogout = () => {
    setAdminAndPersist({ ...admin, isLoggedIn: false });
    setLoginAsUserAndPersist(null);
    setCurrentUserAndPersist(null);
    setCurrentView('login');
    addNotification("Admin logged out.", 'info');
  };

  const loginAsUserFunc = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setLoginAsUserAndPersist(user);
      setCurrentUserAndPersist(user);
      setCurrentView('home');
      addNotification(`Now viewing as ${user.name} (${user.id}).`, 'info');
    }
  };

  const returnToAdmin = () => {
    addNotification('Returned to Admin Dashboard.', 'info');
    setLoginAsUserAndPersist(null);
    setCurrentUserAndPersist(null);
    setCurrentView('admin-dashboard');
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsersAndPersist(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUserAndPersist(prev => prev ? { ...prev, ...updates } : null);
    }
     if (loginAsUser && loginAsUser.id === userId) {
      setLoginAsUserAndPersist(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsersAndPersist(prevUsers => prevUsers.filter(u => u.id !== userId));
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
    setInvestmentPlansAndPersist(prev => [...prev, newPlan]);
    addNotification(`New plan "${planData.name}" added. All users notified.`, 'success');

    const notificationTransaction: Transaction = {
        type: 'system',
        amount: 0,
        description: `New Plan Added: ${planData.name} is now available.`,
        date: new Date().toISOString(),
        read: false,
    };

    const updatedUsers = users.map(user => ({
        ...user,
        transactions: [notificationTransaction, ...user.transactions],
    }));
    setUsersAndPersist(updatedUsers);


    if (currentUser) {
        setCurrentUserAndPersist(prev => prev ? {
            ...prev,
            transactions: [notificationTransaction, ...prev.transactions]
        } : null);
    }

    return { success: true };
  };

  const updateInvestmentPlan = (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>): { success: boolean; message?: string } => {
    let planName = '';
    setInvestmentPlansAndPersist(prev => prev.map(p => {
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

        const updatedUsers = users.map(user => ({
            ...user,
            transactions: [notificationTransaction, ...user.transactions],
        }));
        setUsersAndPersist(updatedUsers);

        if (currentUser) {
            setCurrentUserAndPersist(prev => prev ? {
                ...prev,
                transactions: [notificationTransaction, ...prev.transactions]
            } : null);
        }
    }
    
    addNotification(`Plan ${planId} updated successfully. All users notified.`, 'success');
    return { success: true };
  };

  const deleteInvestmentPlan = (planId: string) => {
    setInvestmentPlansAndPersist(prev => prev.filter(p => p.id !== planId));
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

  const playLuckyDraw = (): { success: boolean; prize?: Prize } => {
    if (!currentUser || currentUser.luckyDrawChances <= 0) {
        addNotification("You don't have any chances left.", 'error');
        return { success: false };
    }

    const prizes: Prize[] = [
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
    }
    
    updateUser(currentUser.id, updatedUser);
    
    return { success: true, prize: wonPrize };
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
    updateUser(currentUser.id, { transactions: updatedTransactions });
  };

  const updateAppName = (newName: string) => {
    setAppNameAndPersist(newName);
  };

  const updateAppLogo = (newLogo: string) => {
    setAppLogoAndPersist(newLogo);
  };

  const updateThemeColor = (color: ThemeColor) => {
    setThemeColorAndPersist(color);
  };

  const changeAdminPassword = (oldPass: string, newPass: string): { success: boolean; message?: string } => {
    if (oldPass !== admin.password) {
        const message = 'Current admin password is incorrect';
        addNotification(message, 'error');
        return { success: false, message };
    }
    if (newPass.length < 6) {
        const message = 'New password must be at least 6 characters';
        addNotification(message, 'error');
        return { success: false, message };
    }
    setAdminAndPersist(prev => ({ ...prev, password: newPass }));
    addNotification('Admin password changed successfully!', 'success');
    return { success: true };
  };

  const value: AppContextType & { notifications: Notification[], confirmation: ConfirmationState, hideConfirmation: () => void, handleConfirm: () => void } = {
    users, currentUser, admin, investmentPlans, currentView, loginAsUser, notifications, confirmation, activityLog, appName, appLogo, themeColor,
    setCurrentView, register, login, adminLogin, logout, adminLogout,
    loginAsUserFunc, returnToAdmin, updateUser, deleteUser, investInPlan, maskPhone,
    addNotification, showConfirmation, hideConfirmation, handleConfirm, makeDeposit, makeWithdrawal, changeUserPassword,
    addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan, requestBankAccountOtp, updateBankAccount,
    playLuckyDraw, requestFundPasswordOtp, updateFundPassword, markNotificationsAsRead, updateAppName, updateAppLogo,
    updateThemeColor, changeAdminPassword,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};