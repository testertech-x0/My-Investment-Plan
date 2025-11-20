
import type { User, InvestmentPlan, Admin, ActivityLogEntry, ThemeColor, BankAccount, Prize, Comment, ChatSession, SocialLinks, PaymentSettings, ChatMessage, Transaction, Investment, LoginActivity, TeamStats } from '../types';

// --- MOCK DATABASE ---

const STORAGE_KEYS = {
    USERS: 'wf_users',
    PLANS: 'wf_plans',
    SETTINGS: 'wf_settings',
    ACTIVITY: 'wf_activity',
    COMMENTS: 'wf_comments',
    CHATS: 'wf_chats',
    TRANSACTIONS: 'wf_transactions'
};

// Initial Data
const INITIAL_PLANS: InvestmentPlan[] = [
    { id: '1', name: 'Starter Plan', minInvestment: 500, dailyReturn: 35, duration: 20, category: 'VIP 1' }, // Updated example plan
    { id: '2', name: 'Growth Plan', minInvestment: 2000, dailyReturn: 100, duration: 45, category: 'VIP 2' },
    { id: '3', name: 'Premium Plan', minInvestment: 5000, dailyReturn: 300, duration: 60, category: 'VIP 3' },
    { id: '4', name: 'Short Term', minInvestment: 1000, dailyReturn: 40, duration: 7, category: 'Welfare', expirationDate: new Date(Date.now() + 86400000 * 7).toISOString() }
];

const INITIAL_PRIZES: Prize[] = [
    { id: '1', name: '₹50 Bonus', type: 'money', amount: 50 },
    { id: '2', name: 'iPhone 15', type: 'physical', amount: 0 },
    { id: '3', name: 'Better Luck Next Time', type: 'nothing', amount: 0 },
    { id: '4', name: '₹1000 Cash', type: 'money', amount: 1000 },
    { id: '5', name: 'Mystery Box', type: 'bonus', amount: 100 },
];

// Helper to get/set storage
const getStorage = <T>(key: string, defaultVal: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultVal;
    try { return JSON.parse(stored); } catch { return defaultVal; }
};
const setStorage = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTH ---

export const register = async (data: { name: string; phone: string; password: string; inviteCode?: string }) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    
    if (users.find(u => u.phone === data.phone)) {
        throw new Error("Phone number already registered");
    }

    const newUser: User = {
        id: Date.now().toString(),
        phone: data.phone,
        password: data.password, // In real app, hash this!
        name: data.name,
        email: `u${data.phone}@wealthapp.com`,
        balance: 0,
        totalReturns: 0,
        rechargeAmount: 0,
        withdrawals: 0,
        registrationDate: new Date().toISOString(),
        isActive: true,
        investments: [],
        transactions: [{
            id: Date.now().toString(),
            type: 'system',
            amount: 0,
            description: 'Welcome to Wealth Fund!',
            date: new Date().toISOString(),
            read: false,
            status: 'success'
        }],
        loginActivity: [],
        bankAccount: null,
        luckyDrawChances: 1, // NEW REGISTER USERS GET 1 COIN
        language: 'en',
        dailyCheckIns: [],
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referrerId: data.inviteCode ? 'mock_referrer' : undefined, // Simplified
        teamIncome: 0
    };

    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    await logActivity(newUser.id, newUser.name, 'User Registered');
    return { success: true, user: newUser };
};

export const login = async (identifier: string, password: string) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    // Support login by phone or ID
    const user = users.find(u => u.phone === identifier || u.id === identifier);

    if (!user || user.password !== password) {
        // Create a default user if list is empty for testing convenience
        if (users.length === 0 && identifier === '9876543210' && password === 'password') {
             const defaultUser = await register({ name: 'Test User', phone: '9876543210', password: 'password' });
             return { success: true, token: 'mock_token_' + defaultUser.user.id, user: defaultUser.user };
        }
        throw new Error("Invalid credentials");
    }

    if (!user.isActive) throw new Error("Account is blocked");

    user.loginActivity.push({ date: new Date().toISOString(), device: 'Web Browser' });
    setStorage(STORAGE_KEYS.USERS, users);
    await logActivity(user.id, user.name, 'User Logged In');
    
    return { success: true, token: 'mock_token_' + user.id, user };
};

export const adminLogin = async (username: string, password: string) => {
    await delay();
    if (username === 'admin' && password === 'password') {
        return { success: true, token: 'admin_token' };
    }
    throw new Error("Invalid Admin credentials");
};

// --- USER DATA ---

export const fetchUserProfile = async () => {
    await delay(200);
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const activeId = localStorage.getItem('mock_active_user_id');
    if (activeId) {
        const user = users.find(u => u.id === activeId);
        if (user) return user;
    }
    return users[0]; // Fallback
};

export const fetchAllUsers = async () => {
    await delay(200);
    return getStorage<User[]>(STORAGE_KEYS.USERS, []);
};

export const updateUserProfile = async (updates: Partial<User>) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const activeId = localStorage.getItem('mock_active_user_id');
    const index = users.findIndex(u => u.id === activeId);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        setStorage(STORAGE_KEYS.USERS, users);
        return users[index];
    }
    throw new Error("User not found");
};

export const updateAdminUser = async (userId: string, updates: Partial<User>) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        setStorage(STORAGE_KEYS.USERS, users);
        return users[index];
    }
    throw new Error("User not found");
};

export const deleteAdminUser = async (userId: string) => {
    await delay();
    let users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    users = users.filter(u => u.id !== userId);
    setStorage(STORAGE_KEYS.USERS, users);
};

// --- INVESTMENTS ---

export const investInPlan = async (planId: string, quantity: number) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const activeUserId = localStorage.getItem('mock_active_user_id'); 
    const userIndex = users.findIndex(u => u.id === activeUserId);
    
    if (userIndex === -1) throw new Error("User not found");
    const user = users[userIndex];

    const plans = getStorage<InvestmentPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    const plan = plans.find(p => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    const totalCost = plan.minInvestment * quantity;
    if (user.balance < totalCost) throw new Error("Insufficient balance");

    user.balance -= totalCost;
    // ADD COINS FOR SPINNING WHEEL
    // Grant 1 coin per quantity purchased
    user.luckyDrawChances = (user.luckyDrawChances || 0) + quantity;
    
    const newInvestment: Investment = {
        planId: plan.id,
        planName: plan.name,
        investedAmount: totalCost,
        totalRevenue: 0,
        dailyEarnings: plan.dailyReturn * quantity,
        revenueDays: plan.duration,
        quantity: quantity,
        startDate: new Date().toISOString(),
        category: plan.category,
        lastDistributedDate: '' // Init empty
    };
    
    user.investments.push(newInvestment);
    user.transactions.unshift({
        id: Date.now().toString(),
        type: 'investment',
        amount: -totalCost,
        description: `Invested in ${plan.name}`,
        date: new Date().toISOString(),
        read: false,
        status: 'success'
    });
    
    // Log the bonus coin transaction
    user.transactions.unshift({
        id: 'BONUS' + Date.now(),
        type: 'system',
        amount: 0,
        description: `Received ${quantity} Lucky Spin Coin(s) for investment`,
        date: new Date().toISOString(),
        read: false,
        status: 'success'
    });

    // Referral Logic (Mock)
    if (user.referrerId) {
        const referrerIndex = users.findIndex(u => u.id === user.referrerId);
        if (referrerIndex !== -1) {
            const comm = totalCost * 0.10;
            users[referrerIndex].balance += comm;
            users[referrerIndex].teamIncome = (users[referrerIndex].teamIncome || 0) + comm;
            users[referrerIndex].transactions.unshift({
                id: Date.now().toString(),
                type: 'commission',
                amount: comm,
                description: `Commission from ${user.name}`,
                date: new Date().toISOString(),
                status: 'success'
            });
        }
    }

    setStorage(STORAGE_KEYS.USERS, users);
    await logActivity(user.id, user.name, `Invested in ${plan.name}`);
    return { success: true, user };
};

// --- FINANCIALS ---

export const initiateDeposit = async (amount: number) => {
    await delay();
    const settings = await fetchPlatformSettings();
    const method = settings.paymentSettings.paymentMethods.find((m: any) => m.isActive);
    return {
        paymentDetails: {
            upiId: method?.upiId || 'pay@mockupi',
            qrCode: method?.qrCode || '',
            amount,
            transactionId: 'TXN' + Date.now()
        }
    };
};

export const submitDepositRequest = async (transactionId: string, proofImgBase64: string, amount: number) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const activeUserId = localStorage.getItem('mock_active_user_id'); 
    const userIndex = users.findIndex(u => u.id === activeUserId);
    
    if (userIndex === -1) throw new Error("User not found");
    const user = users[userIndex];

    const allTx = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    
    const newTx: Transaction = {
        id: transactionId,
        type: 'deposit',
        amount: amount,
        description: 'Deposit Request',
        date: new Date().toISOString(),
        status: 'pending',
        proofImg: proofImgBase64,
    };
    (newTx as any).userId = user.id;
    (newTx as any).userName = user.name;
    (newTx as any).userPhone = user.phone;

    allTx.push(newTx);
    setStorage(STORAGE_KEYS.TRANSACTIONS, allTx);
    
    user.transactions.unshift(newTx);
    setStorage(STORAGE_KEYS.USERS, users);

    return { success: true };
};

export const makeWithdrawal = async (userId: string, amount: number, fundPassword: string) => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    if (user.fundPassword && user.fundPassword !== fundPassword) throw new Error("Incorrect Fund Password");
    if (user.balance < amount) throw new Error("Insufficient balance");

    user.balance -= amount;
    
    const tx: Transaction = {
        id: 'WIT' + Date.now(),
        type: 'withdrawal',
        amount: -amount,
        description: 'Withdrawal Request',
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    user.transactions.unshift(tx);
    
    const allTx = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const adminTx = { ...tx, userId: user.id, userName: user.name, userPhone: user.phone };
    allTx.push(adminTx);
    setStorage(STORAGE_KEYS.TRANSACTIONS, allTx);
    
    setStorage(STORAGE_KEYS.USERS, users);
    await logActivity(user.id, user.name, `Requested Withdrawal ${amount}`);
    return { success: true, user };
};

export const fetchFinancialRequests = async () => {
    await delay();
    return getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []).filter(t => t.status === 'pending');
};

export const fetchAllFinancialRecords = async () => {
    await delay();
    return getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const approveFinancialRequest = async (transaction: Transaction) => {
    await delay();
    const allTx = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const txIndex = allTx.findIndex(t => t.id === transaction.id);
    if (txIndex === -1) return { success: false };
    
    // 1. Update Global Transaction List
    allTx[txIndex].status = 'success';
    setStorage(STORAGE_KEYS.TRANSACTIONS, allTx);

    // 2. Update User's Data
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const userId = (allTx[txIndex] as any).userId;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        const user = users[userIndex];
        
        // If deposit, add balance. Withdrawal was already deducted.
        if (allTx[txIndex].type === 'deposit') {
             const amount = Math.abs(allTx[txIndex].amount); 
             user.balance += amount;
             user.rechargeAmount += amount;
        } else if (allTx[txIndex].type === 'withdrawal') {
             user.withdrawals += Math.abs(allTx[txIndex].amount);
        }
        
        // Update user's local transaction history
        const userTx = user.transactions.find(t => t.id === transaction.id);
        if (userTx) { 
            userTx.status = 'success'; 
        } else {
             user.transactions.unshift({ ...allTx[txIndex], status: 'success' });
        }
        
        setStorage(STORAGE_KEYS.USERS, users);
    }
    
    return { success: true };
};

export const rejectFinancialRequest = async (transaction: Transaction) => {
    await delay();
    const allTx = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const txIndex = allTx.findIndex(t => t.id === transaction.id);
    if (txIndex === -1) return { success: false };
    
    // 1. Update Global List
    allTx[txIndex].status = 'failed';
    setStorage(STORAGE_KEYS.TRANSACTIONS, allTx);

    // 2. Update User Data
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const userId = (allTx[txIndex] as any).userId;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        const user = users[userIndex];

        // If withdrawal was rejected, refund the money
        if (allTx[txIndex].type === 'withdrawal') {
            user.balance += Math.abs(allTx[txIndex].amount);
        }
        
        const userTx = user.transactions.find(t => t.id === transaction.id);
        if (userTx) userTx.status = 'failed';
        
        setStorage(STORAGE_KEYS.USERS, users);
    }
    return { success: true };
};

export const distributeDailyEarnings = async () => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    let count = 0;
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    users.forEach(user => {
        user.investments.forEach(inv => {
            // CRITICAL LOGIC:
            // Check if already paid today to prevent double payment
            if (inv.lastDistributedDate === todayStr) return;

            // Calculate Revenue Days check (if needed, can check creation date + duration)
            const startDate = new Date(inv.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + inv.revenueDays);
            
            // Stop paying if plan expired
            if (new Date() > endDate) return;

            // Payout Logic
            const dailyPayout = inv.dailyEarnings; // This is already Unit Daily Return * Quantity
            
            // Update User Wallet
            user.balance += dailyPayout;
            user.totalReturns += dailyPayout;
            
            // Update Investment Record
            inv.totalRevenue += dailyPayout;
            inv.lastDistributedDate = todayStr;
            
            // Log Transaction for User
            user.transactions.unshift({
                 id: 'REV' + Date.now() + Math.random().toString().slice(2,6),
                 type: 'reward',
                 amount: dailyPayout,
                 description: `Daily Return: ${inv.planName}`,
                 date: new Date().toISOString(),
                 status: 'success',
                 read: false
            });
            count++;
        });
    });
    
    setStorage(STORAGE_KEYS.USERS, users);
    return { success: true, message: `Distributed earnings to ${count} investments successfully.` };
};

// --- SETTINGS & OTHERS ---

export const fetchPlatformSettings = async () => {
    await delay(100);
    return getStorage(STORAGE_KEYS.SETTINGS, {
        appName: 'Wealth Fund',
        appLogo: null,
        themeColor: 'green',
        socialLinks: { telegram: '', whatsapp: '', others: [] },
        paymentSettings: { paymentMethods: [], quickAmounts: [500, 1000, 5000] },
        luckyDrawPrizes: INITIAL_PRIZES,
        luckyDrawWinningPrizeIds: [],
        systemNotice: 'Welcome to the Mock Version!'
    });
};

export const updateAdminPlatformSettings = async (settings: any) => {
    const current = await fetchPlatformSettings();
    setStorage(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
    return { success: true };
};

export const updateAdminPaymentSettings = async (settings: Partial<PaymentSettings>) => {
     const current = await fetchPlatformSettings();
     const newSettings = { ...current.paymentSettings, ...settings };
     setStorage(STORAGE_KEYS.SETTINGS, { ...current, paymentSettings: newSettings });
     return newSettings;
};

// --- PLANS CRUD ---
export const fetchInvestmentPlans = async () => getStorage(STORAGE_KEYS.PLANS, INITIAL_PLANS);
export const addInvestmentPlan = async (plan: any) => {
    const plans = await fetchInvestmentPlans();
    const newPlan = { ...plan, id: Date.now().toString() };
    plans.push(newPlan);
    setStorage(STORAGE_KEYS.PLANS, plans);
    return newPlan;
};
export const updateInvestmentPlan = async (id: string, updates: any) => {
    let plans = await fetchInvestmentPlans();
    const idx = plans.findIndex(p => p.id === id);
    if (idx !== -1) { plans[idx] = { ...plans[idx], ...updates }; setStorage(STORAGE_KEYS.PLANS, plans); return plans[idx]; }
    throw new Error("Plan not found");
};
export const deleteInvestmentPlan = async (id: string) => {
    let plans = await fetchInvestmentPlans();
    setStorage(STORAGE_KEYS.PLANS, plans.filter(p => p.id !== id));
};

// --- COMMENTS ---
export const fetchComments = async () => getStorage(STORAGE_KEYS.COMMENTS, []);
export const addComment = async (comment: { text: string; images: string[] }) => {
    const comments = await fetchComments();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    // find active user
    const activeId = localStorage.getItem('mock_active_user_id');
    const user = users.find(u => u.id === activeId) || users[0];

    const newComment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '',
        maskedPhone: user.phone,
        text: comment.text,
        images: comment.images,
        timestamp: new Date().toISOString()
    };
    comments.unshift(newComment);
    setStorage(STORAGE_KEYS.COMMENTS, comments);
    return newComment;
};
export const deleteComment = async (id: string) => {
    const comments = await fetchComments();
    setStorage(STORAGE_KEYS.COMMENTS, comments.filter((c: any) => c.id !== id));
};
export const updateComment = async (id: string, text: string) => {
    const comments = await fetchComments();
    const c = comments.find((x:any) => x.id === id);
    if(c) { c.text = text; setStorage(STORAGE_KEYS.COMMENTS, comments); return c; }
    throw new Error("Not found");
};

// --- CHAT ---
export const fetchChatSessions = async () => getStorage(STORAGE_KEYS.CHATS, []);
export const sendChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }) => {
    const sessions = await fetchChatSessions();
    let session = sessions.find((s: any) => s.userId === userId);
    if (!session) {
        session = { userId, messages: [], lastMessageTimestamp: new Date().toISOString(), userUnreadCount: 0, adminUnreadCount: 0 };
        sessions.push(session);
    }
    const msg = { id: Date.now().toString(), senderId: userId, text: message.text, imageUrl: message.imageUrl, timestamp: new Date().toISOString() };
    session.messages.push(msg);
    session.adminUnreadCount++;
    setStorage(STORAGE_KEYS.CHATS, sessions);
    return msg;
};
export const sendAdminChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }) => {
    return { id: Date.now().toString(), senderId: 'admin', ...message, timestamp: new Date().toISOString() } as ChatMessage;
};
export const markChatAsRead = async (userId: string) => {
    const sessions = await fetchChatSessions();
    const s = sessions.find((x:any) => x.userId === userId);
    if (s) { s.userUnreadCount = 0; setStorage(STORAGE_KEYS.CHATS, sessions); }
};

// --- EXTRAS ---
export const fetchActivityLog = async () => getStorage(STORAGE_KEYS.ACTIVITY, []);
const logActivity = async (userId: string, userName: string, action: string) => {
    const logs = await fetchActivityLog();
    logs.unshift({ id: Date.now(), userId, userName, action, timestamp: new Date() });
    setStorage(STORAGE_KEYS.ACTIVITY, logs.slice(0, 50));
};
export const fetchTeamStats = async () => ({ totalMembers: 0, totalIncome: 0, members: [] });
export const requestPasswordResetOtp = async (phone: string) => ({ success: true, otp: '123456' });
export const resetPasswordWithOtp = async (phone: string, otp: string, newPass: string) => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.phone === phone);
    if(user) {
        user.password = newPass;
        setStorage(STORAGE_KEYS.USERS, users);
        return { success: true };
    }
    throw new Error("User not found");
};
export const changeUserPassword = async (userId: string, oldPass: string, newPass: string) => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    if(user) {
        user.password = newPass;
        setStorage(STORAGE_KEYS.USERS, users);
        return { success: true };
    }
    throw new Error("User not found");
};
export const requestBankAccountOtp = async (userId: string) => ({ success: true, otp: '123456' });
export const updateBankAccount = async (userId: string, d: any, o: string) => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if(idx !== -1) {
        users[idx].bankAccount = d; 
        setStorage(STORAGE_KEYS.USERS, users);
        return { success: true, user: users[idx] };
    }
    throw new Error("User not found");
};
export const requestFundPasswordOtp = async (userId: string) => ({ success: true, otp: '123456' });
export const updateFundPassword = async (userId: string, newPass: string, otp: string) => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if(idx !== -1) {
        users[idx].fundPassword = newPass; 
        setStorage(STORAGE_KEYS.USERS, users);
        return { success: true, user: users[idx] };
    }
    throw new Error("User not found");
};
export const markNotificationsAsRead = async () => { 
    // In mock, this just returns active user with no change, or clears flags if we implemented them
    return { success: true, user: await fetchUserProfile() }; 
};
export const changeAdminPassword = async (oldPass: string, newPass: string) => ({ success: true });
export const performDailyCheckIn = async () => {
     const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
     const activeId = localStorage.getItem('mock_active_user_id');
     const idx = users.findIndex(u => u.id === activeId);
     if(idx !== -1) {
         const today = new Date().toISOString().split('T')[0];
         if(!users[idx].dailyCheckIns) users[idx].dailyCheckIns = [];
         
         if(!users[idx].dailyCheckIns?.includes(today)) {
             users[idx].dailyCheckIns?.push(today);
             users[idx].balance += 10;
             users[idx].transactions.unshift({
                 id: 'CHK'+Date.now(),
                 type: 'reward',
                 amount: 10,
                 description: 'Daily Check-in Reward',
                 date: new Date().toISOString(),
                 status: 'success'
             });
             setStorage(STORAGE_KEYS.USERS, users);
             return { success: true, message: 'Checked in!', reward: 10, user: users[idx] };
         }
         return { success: false, message: 'Already checked in', reward: 0, user: users[idx] };
     }
     throw new Error("User not found");
};

// LUCKY DRAW LOGIC
export const playLuckyDraw = async () => {
    await delay();

    // 1. Get Active User
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const activeId = localStorage.getItem('mock_active_user_id');
    const userIndex = users.findIndex(u => u.id === activeId);
    
    if (userIndex === -1) throw new Error("User not found");
    const user = users[userIndex];

    // 2. Validate Chances
    if (user.luckyDrawChances <= 0) {
        throw new Error("Insufficient chances");
    }

    // 3. Deduct Chance
    user.luckyDrawChances -= 1;

    // 4. Get Prizes & Settings
    const settings = await fetchPlatformSettings();
    const allPrizes = settings.luckyDrawPrizes || INITIAL_PRIZES;
    const winningIds = settings.luckyDrawWinningPrizeIds || [];
    
    let selectedPrize: Prize | undefined;

    // 5. Logic: Force Win vs Random
    if (winningIds.length > 0) {
        // Filter prizes to only those that are "Forced Wins"
        const forcedPrizes = allPrizes.filter(p => winningIds.includes(p.id));
        
        if (forcedPrizes.length > 0) {
            // Pick a random prize from the forced list
            selectedPrize = forcedPrizes[Math.floor(Math.random() * forcedPrizes.length)];
        }
    }

    // Fallback: If no forced wins configured, or forced prize ID invalid, pick pure random
    if (!selectedPrize) {
        selectedPrize = allPrizes[Math.floor(Math.random() * allPrizes.length)];
    }

    // 6. Apply Rewards (Money/Bonus)
    if (selectedPrize.type === 'money' || selectedPrize.type === 'bonus') {
        if (selectedPrize.amount > 0) {
            user.balance += selectedPrize.amount;
            user.transactions.unshift({
                id: 'WIN' + Date.now(),
                type: 'prize',
                amount: selectedPrize.amount,
                description: `Won ${selectedPrize.name} in Lucky Draw`,
                date: new Date().toISOString(),
                status: 'success',
                read: false
            });
        }
    }

    // 7. Save Changes
    setStorage(STORAGE_KEYS.USERS, users);
    await logActivity(user.id, user.name, `Played Lucky Draw - Won ${selectedPrize.name}`);

    return { success: true, prize: selectedPrize, user };
};

export const addLuckyDrawPrize = async (p: any) => {
    const settings = await fetchPlatformSettings();
    const prizes = settings.luckyDrawPrizes || INITIAL_PRIZES;
    const newPrize = { id: Date.now().toString(), ...p };
    prizes.push(newPrize);
    await updateAdminPlatformSettings({ luckyDrawPrizes: prizes });
    return newPrize;
};

export const updateLuckyDrawPrize = async (id: string, updates: any) => {
    const settings = await fetchPlatformSettings();
    let prizes = settings.luckyDrawPrizes || INITIAL_PRIZES;
    const idx = prizes.findIndex(p => p.id === id);
    if (idx !== -1) {
        prizes[idx] = { ...prizes[idx], ...updates };
        await updateAdminPlatformSettings({ luckyDrawPrizes: prizes });
        return prizes[idx];
    }
    throw new Error("Prize not found");
};

export const deleteLuckyDrawPrize = async (id: string) => {
    const settings = await fetchPlatformSettings();
    let prizes = settings.luckyDrawPrizes || INITIAL_PRIZES;
    prizes = prizes.filter(p => p.id !== id);
    await updateAdminPlatformSettings({ luckyDrawPrizes: prizes });
};

export const setLuckyDrawWinningPrizes = async (ids: string[]) => {
    await updateAdminPlatformSettings({ luckyDrawWinningPrizeIds: ids });
};

// *** REAL STATS FETCHING ***
export const fetchAdminDashboard = async () => {
    await delay();
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, []);
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    
    let totalInvestments = 0;
    let platformBalance = 0;

    users.forEach(u => {
        platformBalance += u.balance; // Liability
        if (u.investments) {
            u.investments.forEach(inv => totalInvestments += inv.investedAmount);
        }
    });

    return { 
        totalUsers, 
        activeUsers, 
        totalInvestments, 
        platformBalance 
    };
};
