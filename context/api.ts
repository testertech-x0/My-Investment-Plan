
import type { User, InvestmentPlan, Admin, ActivityLogEntry, ThemeColor, BankAccount, Prize, Comment, ChatSession, SocialLinks, PaymentSettings, ChatMessage, Transaction, Investment, LoginActivity } from '../types';

// --- MOCK DATABASE ---

const DEFAULT_LOGO_SVG_BASE64 = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>');

const getInitialDBState = () => ({
  users: [
    {
      id: '10001',
      phone: '9876543210',
      password: 'password123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://i.pravatar.cc/150?u=10001',
      balance: 15000.75,
      totalReturns: 5230.50,
      rechargeAmount: 20000,
      withdrawals: 5000,
      registrationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      investments: [
        { planId: 'P001', planName: 'Green Energy Fund', investedAmount: 10000, totalRevenue: 15000, dailyEarnings: 50, revenueDays: 100, quantity: 1, startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), category: 'STABLE' },
      ],
      transactions: [
        { id: 'T001', type: 'deposit', amount: 10000, description: 'Initial Deposit', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), read: true },
        { id: 'T002', type: 'investment', amount: -10000, description: 'Invested in Green Energy Fund', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), read: true },
        { id: 'T003', type: 'reward', amount: 50, description: 'Daily Earning from Green Energy Fund', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: false },
      ],
      loginActivity: [{ date: new Date().toISOString(), device: 'Chrome on Windows' }],
      bankAccount: { accountHolder: 'John Doe', accountNumber: '123456789012', ifscCode: 'HDFC0001234' },
      luckyDrawChances: 3,
      fundPassword: '654321',
      language: 'en',
      dailyCheckIns: [new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
    }
  ] as User[],
  investmentPlans: [
    { id: 'P001', name: 'Green Energy Fund', minInvestment: 10000, dailyReturn: 50, duration: 300, category: 'STABLE' },
    { id: 'P002', name: 'Eco-Friendly Tech', minInvestment: 5000, dailyReturn: 30, duration: 180, category: 'STABLE' },
    { id: 'P003', name: 'Solar Power Startup', minInvestment: 25000, dailyReturn: 150, duration: 365, category: 'HIGH-YIELD' },
    { id: 'P004', name: 'Wind Farm Project', minInvestment: 50000, dailyReturn: 300, duration: 365, category: 'HIGH-YIELD' },
    { id: 'P005', name: 'Limited Offer Flash', minInvestment: 2000, dailyReturn: 200, duration: 5, category: 'LIMITED', expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  ] as InvestmentPlan[],
  admin: { username: 'admin', password: 'password' } as Admin,
  activityLog: [] as ActivityLogEntry[],
  settings: {
    appName: 'Wealth Fund',
    appLogo: DEFAULT_LOGO_SVG_BASE64,
    themeColor: 'green' as ThemeColor,
    socialLinks: { telegram: 'https://t.me/example', whatsapp: 'https://wa.me/1234567890' },
    luckyDrawPrizes: [
        { id: 'prize-1', name: '₹50', type: 'money', amount: 50 },
        { id: 'prize-2', name: 'Thank You', type: 'nothing', amount: 0 },
        { id: 'prize-3', name: 'iPhone 16', type: 'physical', amount: 0 },
        { id: 'prize-4', name: '₹100 Bonus', type: 'bonus', amount: 100 },
        { id: 'prize-5', name: '₹1000', type: 'money', amount: 1000 },
        { id: 'prize-6', name: 'Thank You', type: 'nothing', amount: 0 },
        { id: 'prize-7', name: 'Air Conditioner', type: 'physical', amount: 0 },
        { id: 'prize-8', name: 'Random Bonus', type: 'bonus', amount: 200 },
    ] as Prize[],
    luckyDrawWinningPrizeIds: [] as string[],
    paymentSettings: {
      paymentMethods: [{ id: 'pm-1', name: 'Default UPI', upiId: 'payment@bank', qrCode: '', isActive: true }],
      quickAmounts: [500, 1000, 2000, 5000]
    } as PaymentSettings,
  },
  comments: [] as Comment[],
  chatSessions: [] as ChatSession[],
  mockSms: [] as { to: string, otp: string }[],
});

let MOCK_DB = getInitialDBState();

const loadDb = () => {
    try {
        const dbJson = localStorage.getItem('MOCK_DB');
        if (dbJson) MOCK_DB = JSON.parse(dbJson);
        // Migration for existing DBs
        if (!MOCK_DB.settings.luckyDrawWinningPrizeIds) {
            MOCK_DB.settings.luckyDrawWinningPrizeIds = [];
            if ((MOCK_DB.settings as any).luckyDrawWinningPrizeId) {
                MOCK_DB.settings.luckyDrawWinningPrizeIds.push((MOCK_DB.settings as any).luckyDrawWinningPrizeId);
            }
        }
    } catch (e) {
        console.error("Failed to load mock DB from localStorage", e);
        MOCK_DB = getInitialDBState();
    }
};

const saveDb = () => {
    try {
        localStorage.setItem('MOCK_DB', JSON.stringify(MOCK_DB));
    } catch (e) {
        console.error("Failed to save mock DB to localStorage", e);
    }
};

// Load DB on startup
loadDb();


// --- MOCK API HELPERS ---
const mockApiDelay = (ms = 300) => new Promise(res => setTimeout(res, ms));

const getAuthenticatedUser = () => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    if (!token) return { type: null, user: null };

    if (userType === 'admin' && token === 'admin-token') {
        return { type: 'admin', user: null };
    }
    
    const userId = token.replace('user-token-', '');
    const user = MOCK_DB.users.find(u => u.id === userId);
    return user ? { type: 'user', user } : { type: null, user: null };
};

const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const logActivity = (userId: string, userName: string, action: string) => {
    MOCK_DB.activityLog.unshift({
        id: MOCK_DB.activityLog.length + 1,
        timestamp: new Date(),
        userId,
        userName,
        action,
    });
    saveDb();
};

const sendOtp = (phone: string) => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    MOCK_DB.mockSms.push({ to: phone, otp });
    console.log(`✉️ OTP for ${phone}: ${otp}`);
    saveDb();
    return otp;
};

// --- MOCK API IMPLEMENTATION ---

// --- Auth ---
export const requestRegisterOtp = async (phone: string) => {
    await mockApiDelay();
    if (MOCK_DB.users.some(u => u.phone === phone)) throw new Error('Phone number already registered.');
    sendOtp(phone);
    return { success: true, message: 'OTP sent.' };
};

export const register = async (data: { name: string; phone: string; password: string; otp: string }) => {
    await mockApiDelay();
    const sentOtp = MOCK_DB.mockSms.find(s => s.to === data.phone)?.otp;
    if (!sentOtp || sentOtp !== data.otp) throw new Error('Invalid OTP.');
    if (MOCK_DB.users.some(u => u.phone === data.phone)) throw new Error('Phone number already registered.');

    const newUser: User = {
        id: String(10000 + MOCK_DB.users.length + 1),
        phone: data.phone,
        password: data.password,
        name: data.name,
        email: '',
        avatar: `https://i.pravatar.cc/150?u=${10000 + MOCK_DB.users.length + 1}`,
        balance: 0,
        totalReturns: 0,
        rechargeAmount: 0,
        withdrawals: 0,
        registrationDate: new Date().toISOString(),
        isActive: true,
        investments: [],
        transactions: [],
        loginActivity: [],
        bankAccount: null,
        luckyDrawChances: 1,
        fundPassword: null,
        language: 'en',
        dailyCheckIns: [],
    };
    MOCK_DB.users.push(newUser);
    saveDb();
    return { success: true, user: newUser };
};

export const login = async (identifier: string, password: string) => {
    await mockApiDelay(800);
    const user = MOCK_DB.users.find(u => (u.phone === identifier || u.id === identifier) && u.password === password);
    if (!user) throw new Error('Invalid credentials.');
    if (!user.isActive) throw new Error('Your account has been blocked.');
    const token = `user-token-${user.id}`;
    user.loginActivity.unshift({ date: new Date().toISOString(), device: 'Chrome on Web' });
    saveDb();
    return { success: true, token, user };
};

export const adminLogin = async (username: string, password: string) => {
    await mockApiDelay(800);
    if (username !== MOCK_DB.admin.username || password !== MOCK_DB.admin.password) {
        throw new Error('Invalid admin credentials.');
    }
    return { success: true, token: 'admin-token', admin: { username: MOCK_DB.admin.username } };
};

export const requestPasswordResetOtp = async (phone: string) => {
    await mockApiDelay();
    if (!MOCK_DB.users.some(u => u.phone === phone)) throw new Error('Phone number not found.');
    sendOtp(phone);
    return { success: true, message: 'OTP sent.' };
};

export const resetPasswordWithOtp = async (phone: string, otp: string, newPassword: string) => {
    await mockApiDelay();
    const sentOtp = MOCK_DB.mockSms.find(s => s.to === phone)?.otp;
    if (!sentOtp || sentOtp !== otp) throw new Error('Invalid OTP.');
    const user = MOCK_DB.users.find(u => u.phone === phone);
    if (user) {
        user.password = newPassword;
        saveDb();
    }
    return { success: true, message: 'Password reset successful.' };
};


// --- User Profile ---
export const fetchUserProfile = async () => {
    await mockApiDelay();
    const auth = getAuthenticatedUser();
    if (auth.type !== 'user' || !auth.user) throw new Error('Not authenticated');
    return auth.user;
};
export const updateUserProfile = async (updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    Object.assign(user, updates);
    saveDb();
    return user;
};
export const changeUserPassword = async (oldPassword: string, newPassword: string) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user || user.password !== oldPassword) throw new Error('Incorrect current password.');
    user.password = newPassword;
    saveDb();
    return { success: true, message: 'Password changed successfully.' };
};
export const requestBankAccountOtp = async () => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    sendOtp(user.phone);
    return { success: true, message: 'OTP sent.' };
};
export const updateBankAccount = async (accountDetails: Omit<BankAccount, 'bankName'>, otp: string) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    const sentOtp = MOCK_DB.mockSms.find(s => s.to === user.phone)?.otp;
    if (!sentOtp || sentOtp !== otp) throw new Error('Invalid OTP.');
    user.bankAccount = accountDetails;
    saveDb();
    return { success: true, user };
};
export const requestFundPasswordOtp = async () => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    sendOtp(user.phone);
    return { success: true, message: 'OTP sent.' };
};
export const updateFundPassword = async (newFundPassword: string, otp: string) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    const sentOtp = MOCK_DB.mockSms.find(s => s.to === user.phone)?.otp;
    if (!sentOtp || sentOtp !== otp) throw new Error('Invalid OTP.');
    user.fundPassword = newFundPassword;
    saveDb();
    return { success: true, user };
};
export const performDailyCheckIn = async () => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    const today = new Date().toISOString().split('T')[0];
    if (user.dailyCheckIns?.includes(today)) throw new Error('Already checked in today.');
    
    const reward = 10;
    user.balance += reward;
    user.dailyCheckIns = [...(user.dailyCheckIns || []), today];
    user.transactions.unshift({ id: generateId('T'), type: 'reward', amount: reward, description: 'Daily Check-in Reward', date: new Date().toISOString(), read: false });
    saveDb();
    return { success: true, message: `Checked in! You earned ₹${reward}.`, reward, user };
};
export const playLuckyDraw = async () => {
    await mockApiDelay(1000);
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    if (user.luckyDrawChances <= 0) throw new Error('No lucky draw chances left.');

    user.luckyDrawChances -= 1;

    // --- CONTROLLED LUCKY DRAW LOGIC ---
    let prize: Prize | undefined;
    
    // 1. Check if admin has forced winners (support multiple)
    const forcedIds = MOCK_DB.settings.luckyDrawWinningPrizeIds;
    if (forcedIds && forcedIds.length > 0) {
        // Pick one random ID from the forced list
        const randomForcedId = forcedIds[Math.floor(Math.random() * forcedIds.length)];
        prize = MOCK_DB.settings.luckyDrawPrizes.find(p => p.id === randomForcedId);
    }

    // 2. If no forced winner or prize not found, pick random from all prizes
    if (!prize) {
         prize = MOCK_DB.settings.luckyDrawPrizes[Math.floor(Math.random() * MOCK_DB.settings.luckyDrawPrizes.length)];
    }

    if (prize.type === 'money' || prize.type === 'bonus') {
        user.balance += prize.amount;
        user.transactions.unshift({ id: generateId('T'), type: 'prize', amount: prize.amount, description: `Lucky Draw: ${prize.name}`, date: new Date().toISOString(), read: false });
    }
    saveDb();
    return { success: true, prize, user };
};
export const markNotificationsAsRead = async () => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    user.transactions.forEach(tx => tx.read = true);
    saveDb();
    return { success: true, user };
};


// --- Transactions ---
export const initiateDeposit = async (amount: number) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    
    const transactionId = generateId('TXD');
    const paymentMethod = MOCK_DB.settings.paymentSettings.paymentMethods.find(pm => pm.isActive);

    user.transactions.unshift({ id: transactionId, type: 'deposit', amount, description: 'Pending Deposit', date: new Date().toISOString(), read: false }); // Add as pending
    saveDb();

    return {
        success: true,
        paymentDetails: {
            upiId: paymentMethod?.upiId,
            qrCode: paymentMethod?.qrCode,
            amount,
            transactionId
        }
    };
};
export const confirmDeposit = async (transactionId: string) => {
    await mockApiDelay(2000);
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');

    const transaction = user.transactions.find(t => t.id === transactionId && t.type === 'deposit');
    if (!transaction) throw new Error('Transaction not found.');

    user.balance += transaction.amount;
    transaction.description = `Deposited ₹${transaction.amount.toFixed(2)}`;
    saveDb();
    return { success: true, user };
};
export const makeWithdrawal = async (amount: number, fundPassword: string) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    if (user.fundPassword !== fundPassword) throw new Error('Incorrect fund password.');
    if (user.balance < amount) throw new Error('Insufficient balance.');
    
    const tax = amount * 0.08;
    const netAmount = amount - tax;
    user.balance -= amount;
    
    user.transactions.unshift({ id: generateId('T'), type: 'withdrawal', amount: -amount, description: `Withdrawal of ₹${amount.toFixed(2)} (tax: ₹${tax.toFixed(2)})`, date: new Date().toISOString(), read: false });
    saveDb();
    return { success: true, user };
};


// --- Investments ---
export const fetchInvestmentPlans = async () => {
    await mockApiDelay();
    return MOCK_DB.investmentPlans;
};
export const investInPlan = async (planId: string, quantity: number) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    const plan = MOCK_DB.investmentPlans.find(p => p.id === planId);
    if (!user || !plan) throw new Error('User or Plan not found.');
    
    const totalCost = plan.minInvestment * quantity;
    if (user.balance < totalCost) throw new Error('Insufficient balance.');
    
    if (plan.expirationDate && new Date(plan.expirationDate) < new Date()) {
        throw new Error('This investment plan has expired.');
    }
    
    user.balance -= totalCost;
    
    const newInvestment: Investment = {
        planId: plan.id,
        planName: plan.name,
        investedAmount: totalCost,
        totalRevenue: plan.dailyReturn * plan.duration * quantity,
        dailyEarnings: plan.dailyReturn * quantity,
        revenueDays: plan.duration,
        quantity: quantity,
        startDate: new Date().toISOString(),
        category: plan.category,
    };
    
    user.investments.push(newInvestment);
    user.transactions.unshift({ id: generateId('T'), type: 'investment', amount: -totalCost, description: `Invested in ${plan.name} (x${quantity})`, date: new Date().toISOString(), read: false });
    saveDb();
    return { success: true, user };
};


// --- Community ---
export const fetchComments = async () => { await mockApiDelay(); return MOCK_DB.comments; };
export const addComment = async (commentData: { text: string; images: string[] }) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');

    const newComment: Comment = {
        id: generateId('C'),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '',
        maskedPhone: user.phone.substring(0, 2) + '****' + user.phone.substring(user.phone.length - 4),
        text: commentData.text,
        images: commentData.images,
        timestamp: new Date().toISOString(),
    };
    MOCK_DB.comments.unshift(newComment);
    saveDb();
    return newComment;
};
export const deleteComment = async (commentId: string) => {
    await mockApiDelay();
    MOCK_DB.comments = MOCK_DB.comments.filter(c => c.id !== commentId);
    saveDb();
};
export const updateComment = async (commentId: string, text: string) => {
    await mockApiDelay();
    const comment = MOCK_DB.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found.');
    comment.text = text;
    saveDb();
    return comment;
};

export const fetchChat = async () => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    let session = MOCK_DB.chatSessions.find(s => s.userId === user.id);
    if (!session) {
        session = { userId: user.id, messages: [], lastMessageTimestamp: new Date().toISOString(), userUnreadCount: 0, adminUnreadCount: 0 };
        MOCK_DB.chatSessions.push(session);
        saveDb();
    }
    return session;
};
export const sendChatMessage = async (message: { text?: string; imageUrl?: string }) => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    let session = MOCK_DB.chatSessions.find(s => s.userId === user.id);
    if (!session) {
        session = { userId: user.id, messages: [], lastMessageTimestamp: '', userUnreadCount: 0, adminUnreadCount: 0 };
        MOCK_DB.chatSessions.push(session);
    }
    const newMessage: ChatMessage = { id: generateId('M'), senderId: user.id, ...message, timestamp: new Date().toISOString() };
    session.messages.push(newMessage);
    session.lastMessageTimestamp = newMessage.timestamp;
    session.adminUnreadCount += 1;
    saveDb();
    return newMessage;
};
export const markChatAsRead = async () => {
    await mockApiDelay();
    const { user } = getAuthenticatedUser();
    if (!user) throw new Error('User not found.');
    const session = MOCK_DB.chatSessions.find(s => s.userId === user.id);
    if (session) {
        session.userUnreadCount = 0;
        saveDb();
    }
    return { success: true };
};


// --- Platform ---
export const fetchPlatformSettings = async () => {
    await mockApiDelay();
    const { paymentSettings, ...rest } = MOCK_DB.settings;
    return { ...rest, paymentQuickAmounts: paymentSettings.quickAmounts };
};


// --- Admin ---
export const fetchAdminDashboard = async () => {
    await mockApiDelay();
    return {
        totalUsers: MOCK_DB.users.length,
        activeUsers: MOCK_DB.users.filter(u => u.isActive).length,
        totalInvestments: MOCK_DB.users.reduce((sum, u) => sum + u.investments.reduce((isum, i) => isum + i.investedAmount, 0), 0),
        platformBalance: MOCK_DB.users.reduce((sum, u) => sum + u.balance, 0),
    };
};
export const fetchAdminUsers = async () => { await mockApiDelay(); return MOCK_DB.users; };
export const updateAdminUser = async (userId: string, updates: Partial<User>) => {
    await mockApiDelay();
    const user = MOCK_DB.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    Object.assign(user, updates);
    saveDb();
    return user;
};
export const deleteAdminUser = async (userId: string) => {
    await mockApiDelay();
    MOCK_DB.users = MOCK_DB.users.filter(u => u.id !== userId);
    saveDb();
};
export const addInvestmentPlan = async (planData: Omit<InvestmentPlan, 'id'>) => {
    await mockApiDelay();
    const newPlan = { id: generateId('P'), ...planData };
    MOCK_DB.investmentPlans.push(newPlan);
    saveDb();
    return newPlan;
};
export const updateInvestmentPlan = async (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>) => {
    await mockApiDelay();
    const plan = MOCK_DB.investmentPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found.');
    Object.assign(plan, updates);
    saveDb();
    return plan;
};
export const deleteInvestmentPlan = async (planId: string) => {
    await mockApiDelay();
    MOCK_DB.investmentPlans = MOCK_DB.investmentPlans.filter(p => p.id !== planId);
    saveDb();
};
export const updateAdminPlatformSettings = async (settings: Partial<{ appName: string, appLogo: string, socialLinks: SocialLinks, themeColor: ThemeColor, luckyDrawWinningPrizeIds: string[] }>) => {
    await mockApiDelay();
    Object.assign(MOCK_DB.settings, settings);
    saveDb();
    return { success: true };
};
export const changeAdminPassword = async (oldPassword: string, newPassword: string) => {
    await mockApiDelay();
    if (MOCK_DB.admin.password !== oldPassword) throw new Error('Incorrect current password.');
    MOCK_DB.admin.password = newPassword;
    saveDb();
    return { success: true, message: 'Admin password changed.' };
};
export const fetchActivityLog = async () => { await mockApiDelay(); return MOCK_DB.activityLog; };
export const fetchChatSessions = async () => { await mockApiDelay(); return MOCK_DB.chatSessions; };
export const sendAdminChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }) => {
    await mockApiDelay();
    let session = MOCK_DB.chatSessions.find(s => s.userId === userId);
    if (!session) throw new Error("Session not found");
    const newMessage: ChatMessage = { id: generateId('M'), senderId: 'admin', ...message, timestamp: new Date().toISOString() };
    session.messages.push(newMessage);
    session.lastMessageTimestamp = newMessage.timestamp;
    session.userUnreadCount += 1;
    saveDb();
    return newMessage;
};
export const markAdminChatAsRead = async (userId: string) => {
    await mockApiDelay();
    const session = MOCK_DB.chatSessions.find(s => s.userId === userId);
    if (session) {
        session.adminUnreadCount = 0;
        saveDb();
    }
    return { success: true };
};
export const addLuckyDrawPrize = async (prizeData: Omit<Prize, 'id'>) => {
    await mockApiDelay();
    const newPrize = { id: generateId('PR'), ...prizeData };
    MOCK_DB.settings.luckyDrawPrizes.push(newPrize);
    saveDb();
    return newPrize;
};
export const updateLuckyDrawPrize = async (prizeId: string, updates: Partial<Omit<Prize, 'id'>>) => {
    await mockApiDelay();
    const prize = MOCK_DB.settings.luckyDrawPrizes.find(p => p.id === prizeId);
    if (!prize) throw new Error('Prize not found.');
    Object.assign(prize, updates);
    saveDb();
    return prize;
};
export const deleteLuckyDrawPrize = async (prizeId: string) => {
    await mockApiDelay();
    MOCK_DB.settings.luckyDrawPrizes = MOCK_DB.settings.luckyDrawPrizes.filter(p => p.id !== prizeId);
    saveDb();
};
export const updateAdminPaymentSettings = async (settings: Partial<PaymentSettings>) => {
    await mockApiDelay();
    Object.assign(MOCK_DB.settings.paymentSettings, settings);
    saveDb();
    return MOCK_DB.settings.paymentSettings;
};
