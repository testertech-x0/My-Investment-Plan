
import { supabase } from '../supabase';
import type { User, InvestmentPlan, Admin, ActivityLogEntry, ThemeColor, BankAccount, Prize, Comment, ChatSession, SocialLinks, PaymentSettings, ChatMessage, Transaction, Investment, LoginActivity, TeamStats } from '../types';

// --- HELPER: STORAGE UPLOAD ---
const uploadBase64Image = async (base64Data: string | undefined, folder: string): Promise<string | undefined> => {
    if (!base64Data || !base64Data.startsWith('data:image')) return base64Data;

    try {
        const res = await fetch(base64Data);
        const blob = await res.blob();
        const fileExt = blob.type.split('/')[1] || 'png';
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, blob);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return publicUrl;
    } catch (e) {
        console.error("Image upload failed", e);
        return base64Data; 
    }
}

// --- HELPER: LOG ACTIVITY ---
const logActivity = async (userId: string, userName: string, action: string) => {
    try {
        await supabase.from('activity_logs').insert({ user_id: userId, user_name: userName, action: action });
    } catch (e) { console.error("Failed to log activity", e); }
};

// --- API IMPLEMENTATION ---

const mapProfileToUser = (profile: any, investments: any[] = [], transactions: any[] = []): User => ({
    id: profile.id,
    phone: profile.phone || '',
    name: profile.name || 'User',
    email: profile.email || '',
    avatar: profile.avatar_url || null,
    balance: parseFloat(profile.balance) || 0,
    totalReturns: parseFloat(profile.total_returns) || 0,
    rechargeAmount: 0, 
    withdrawals: 0,    
    registrationDate: profile.created_at,
    isActive: profile.is_active,
    investments: investments,
    transactions: transactions.map(t => ({ 
        ...t, 
        date: t.created_at, 
        amount: parseFloat(t.amount),
        proofImg: t.proof_img 
    })),
    loginActivity: [], 
    bankAccount: profile.bank_account || null,
    luckyDrawChances: profile.lucky_draw_chances || 0,
    fundPassword: profile.fund_password,
    language: profile.language || 'en',
    dailyCheckIns: profile.daily_check_ins || [],
    referralCode: profile.referral_code,
    referrerId: profile.referrer_id,
    teamIncome: parseFloat(profile.team_income) || 0,
});

// --- Auth ---

export const requestRegisterOtp = async (phone: string) => { 
    // SIMULATION: Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return { success: true, message: 'OTP sent.', otp }; 
};

export const register = async (data: { name: string; phone: string; password: string; otp: string; inviteCode?: string }) => {
    // Sanitize phone: Remove spaces, dashes, etc.
    const cleanPhone = data.phone.replace(/\D/g, '').trim();
    const email = `${cleanPhone}@wealthapp.com`; 
    
    // 1. Check if invite code exists (if provided)
    let referrerId = null;
    if (data.inviteCode) {
        const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', data.inviteCode).single();
        if (referrer) referrerId = referrer.id;
    }

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: email, password: data.password });
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Registration failed");

    // 3. Generate own referral code (Simple logic: Random 6 chars)
    const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 4. Create Profile
    const { error: profileError } = await supabase.from('profiles').insert([
        {
            id: authData.user.id,
            phone: cleanPhone,
            name: data.name,
            email: email,
            balance: 0,
            referral_code: myReferralCode,
            referrer_id: referrerId
        }
    ]);

    if (profileError) throw new Error(profileError.message);
    await logActivity(authData.user.id, data.name, 'User Registered');
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
    return { success: true, user: mapProfileToUser(profile) };
};

export const login = async (identifier: string, password: string) => {
    // Check if identifier is an email or a phone number
    // If it doesn't have @, assume it's a phone number and sanitize it
    let email = identifier.trim();
    if (!email.includes('@')) {
        const cleanPhone = email.replace(/\D/g, '');
        email = `${cleanPhone}@wealthapp.com`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    
    const user = await fetchUserProfile();
    if (!user.isActive) { await supabase.auth.signOut(); throw new Error("Account is blocked"); }
    await logActivity(user.id, user.name, 'User Logged In');
    return { success: true, token: data.session.access_token, user };
};

export const adminLogin = async (username: string, password: string) => {
    let email = username.trim();
    if (!email.includes('@')) {
        const cleanPhone = email.replace(/\D/g, '');
        email = `${cleanPhone}@wealthapp.com`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Invalid credentials");
    
    const { data: profile } = await supabase.from('profiles').select('role, name').eq('id', data.user.id).single();
    if (profile?.role !== 'admin') { await supabase.auth.signOut(); throw new Error("Access Denied"); }
    
    await logActivity(data.user.id, profile.name, 'Admin Logged In');
    return { success: true, token: data.session.access_token };
};

// --- User Profile ---

export const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const { data: investments } = await supabase.from('investments').select('*, plans(*)').eq('user_id', user.id);
    
    const mappedInvestments = investments?.map((inv: any) => ({
        planId: inv.plan_id,
        planName: inv.plans?.name || 'Plan',
        investedAmount: inv.amount,
        totalRevenue: inv.total_revenue || 0,
        dailyEarnings: inv.plans?.daily_return || 0,
        revenueDays: inv.plans?.duration || 0,
        quantity: inv.quantity,
        startDate: inv.created_at,
        category: inv.plans?.category || 'General'
    })) || [];

    return mapProfileToUser(profile, mappedInvestments, transactions || []);
};

export const updateUserProfile = async (updates: Partial<User>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    let avatarUrl = updates.avatar;
    if (avatarUrl && avatarUrl.startsWith('data:')) avatarUrl = await uploadBase64Image(avatarUrl, 'avatars');

    const { error } = await supabase.from('profiles').update({
        name: updates.name, email: updates.email, avatar_url: avatarUrl, language: updates.language
    }).eq('id', user.id);

    if (error) throw new Error(error.message);
    return fetchUserProfile();
};

// --- Teams & Referral ---

export const fetchTeamStats = async (): Promise<TeamStats> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    // Get profile for income
    const { data: profile } = await supabase.from('profiles').select('team_income').eq('id', user.id).single();
    
    // Get members
    const { data: members, count } = await supabase.from('profiles')
        .select('name, phone, created_at', { count: 'exact' })
        .eq('referrer_id', user.id);

    return {
        totalMembers: count || 0,
        totalIncome: profile?.team_income || 0,
        members: members?.map((m: any) => ({
            name: m.name,
            phone: m.phone,
            joinDate: m.created_at
        })) || []
    };
};

// --- Investments & Commissions ---

export const investInPlan = async (planId: string, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single();
    if (!plan) throw new Error("Plan not found");

    const { data: profile } = await supabase.from('profiles').select('balance, name, referrer_id').eq('id', user.id).single();
    
    const totalCost = plan.min_investment * quantity;
    if (profile.balance < totalCost) throw new Error("Insufficient balance");

    // 1. Deduct Balance
    await supabase.from('profiles').update({ balance: parseFloat(profile.balance) - totalCost }).eq('id', user.id);

    // 2. Create Investment
    await supabase.from('investments').insert({ user_id: user.id, plan_id: planId, amount: totalCost, quantity: quantity });

    // 3. Log Transaction
    await supabase.from('transactions').insert({ user_id: user.id, type: 'investment', amount: -totalCost, description: `Invested in ${plan.name}`, status: 'success' });
    await logActivity(user.id, profile.name, `Invested in ${plan.name} (x${quantity})`);

    // 4. Handle Referral Commission (Level 1 - 10%)
    if (profile.referrer_id) {
        const commissionRate = 0.10;
        const commissionAmount = totalCost * commissionRate;
        
        const { data: referrer } = await supabase.from('profiles').select('balance, team_income').eq('id', profile.referrer_id).single();
        if (referrer) {
            await supabase.from('profiles').update({
                balance: parseFloat(referrer.balance) + commissionAmount,
                team_income: parseFloat(referrer.team_income) + commissionAmount
            }).eq('id', profile.referrer_id);

            await supabase.from('transactions').insert({
                user_id: profile.referrer_id,
                type: 'commission',
                amount: commissionAmount,
                description: `Commission from ${profile.name}`,
                status: 'success'
            });
        }
    }

    const updatedUser = await fetchUserProfile();
    return { success: true, user: updatedUser };
};

// --- Passwords & Others ---

export const requestPasswordResetOtp = async (phone: string) => { 
    // SIMULATION
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return { success: true, message: 'OTP sent.', otp }; 
};
export const resetPasswordWithOtp = async (phone: string, otp: string, newPassword: string) => { return { success: true, message: 'Password reset successful.' }; };
export const changeUserPassword = async (oldPassword: string, newPassword: string) => { 
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return { success: true, message: 'Password changed successfully.' };
};
export const requestBankAccountOtp = async (userId?: string) => { 
    // SIMULATION
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return { success: true, message: 'OTP sent.', otp }; 
};
export const updateBankAccount = async (accountDetails: any, otp: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ bank_account: accountDetails }).eq('id', user!.id);
    await logActivity(user!.id, 'User', 'Updated Bank Account');
    return { success: true, user: await fetchUserProfile() };
};
export const requestFundPasswordOtp = async (userId?: string) => { 
    // SIMULATION
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return { success: true, message: 'OTP sent.', otp }; 
};
export const updateFundPassword = async (newFundPassword: string, otp: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ fund_password: newFundPassword }).eq('id', user!.id);
    return { success: true, user: await fetchUserProfile() };
};

// --- Daily Check In ---
export const performDailyCheckIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const reward = 10;
    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase.from('profiles').select('balance, daily_check_ins').eq('id', user!.id).single();
    if (profile.daily_check_ins?.includes(today)) throw new Error("Already checked in");
    await supabase.from('profiles').update({
        balance: parseFloat(profile.balance) + reward,
        daily_check_ins: [...(profile.daily_check_ins || []), today]
    }).eq('id', user!.id);
    await supabase.from('transactions').insert({ user_id: user!.id, type: 'reward', amount: reward, description: 'Daily Check-in Reward', status: 'success' });
    return { success: true, message: `Checked in! You earned ₹${reward}.`, reward, user: await fetchUserProfile() };
};

// --- Lucky Draw ---
export const playLuckyDraw = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const settings = await fetchPlatformSettings();
    const prizes = settings.luckyDrawPrizes;
    const forcedWinners = settings.luckyDrawWinningPrizeIds || [];
    if (prizes.length === 0) throw new Error("No prizes configured");

    let selectedPrize: Prize;
    if (forcedWinners.length > 0) {
        const validWinners = prizes.filter(p => forcedWinners.includes(p.id));
        selectedPrize = validWinners[Math.floor(Math.random() * validWinners.length)] || prizes[Math.floor(Math.random() * prizes.length)];
    } else {
        selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];
    }

    await supabase.from('transactions').insert({ user_id: user!.id, type: 'prize', amount: selectedPrize.type === 'money' ? selectedPrize.amount : 0, description: `Lucky Draw: ${selectedPrize.name}`, status: 'success' });
    if (selectedPrize.type === 'money' || selectedPrize.type === 'bonus') {
         const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user!.id).single();
         await supabase.from('profiles').update({ balance: parseFloat(profile.balance) + selectedPrize.amount }).eq('id', user!.id);
    }
    const { data: profile } = await supabase.from('profiles').select('lucky_draw_chances').eq('id', user!.id).single();
    await supabase.from('profiles').update({ lucky_draw_chances: Math.max(0, profile.lucky_draw_chances - 1) }).eq('id', user!.id);
    return { success: true, prize: selectedPrize, user: await fetchUserProfile() };
};

export const markNotificationsAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('transactions').update({ read: true }).eq('user_id', user!.id);
    return { success: true, user: await fetchUserProfile() };
};

// --- Deposits/Withdrawals (FINANCIAL MANAGEMENT) ---

export const initiateDeposit = async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    // Create pending transaction
    const { data, error } = await supabase.from('transactions').insert({ 
        user_id: user!.id, 
        type: 'deposit', 
        amount, 
        description: 'Deposit Pending', 
        read: false, 
        status: 'pending' 
    }).select().single();
    
    if (error) throw new Error(error.message);
    
    const settings = await fetchPlatformSettings();
    const activeMethod = settings.paymentSettings?.paymentMethods?.find((m: any) => m.isActive);
    
    return { success: true, paymentDetails: { upiId: activeMethod?.upiId || '', qrCode: activeMethod?.qrCode || '', amount, transactionId: data.id } };
};

export const submitDepositRequest = async (transactionId: string, proofImgBase64: string) => {
    const proofUrl = await uploadBase64Image(proofImgBase64, 'proofs');
    const { error } = await supabase.from('transactions').update({ proof_img: proofUrl, description: 'Deposit Review Pending' }).eq('id', transactionId);
    if (error) throw new Error(error.message);
    return { success: true };
};

export const makeWithdrawal = async (amount: number, fundPassword: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    
    if (profile.fund_password !== fundPassword) throw new Error("Incorrect fund password");
    if (parseFloat(profile.balance) < amount) throw new Error("Insufficient balance");
    
    // Deduct balance immediately for withdrawal to prevent double-spend
    await supabase.from('profiles').update({ balance: parseFloat(profile.balance) - amount }).eq('id', user!.id);
    
    await supabase.from('transactions').insert({ 
        user_id: user!.id, 
        type: 'withdrawal', 
        amount: -amount, 
        description: `Withdrawal Pending`,
        status: 'pending'
    });
    
    await logActivity(user!.id, profile.name, `Requested Withdrawal ${amount}`);
    return { success: true, user: await fetchUserProfile() };
};

// --- Admin Financial Functions ---

export const fetchFinancialRequests = async () => {
    const { data } = await supabase.from('transactions')
        .select('*, profiles(name, phone)')
        .in('status', ['pending'])
        .order('created_at', { ascending: false });
    
    return data?.map((t: any) => ({
        ...t,
        date: t.created_at,
        amount: parseFloat(t.amount),
        proofImg: t.proof_img,
        userName: t.profiles?.name, // Augmenting transaction for admin view
        userPhone: t.profiles?.phone
    })) || [];
};

export const approveFinancialRequest = async (transaction: Transaction) => {
    const { data: { user } } = await supabase.auth.getUser(); // Admin user
    
    // 1. Update Transaction Status
    await supabase.from('transactions').update({ status: 'success', description: transaction.type === 'deposit' ? 'Deposit Confirmed' : 'Withdrawal Confirmed' }).eq('id', transaction.id);
    
    // 2. If Deposit, Add Balance
    if (transaction.type === 'deposit') {
        // We need to fetch current balance first to ensure atomicity, or use rpc. 
        // For simplicity, fetch-update.
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', (transaction as any).user_id).single();
        if (profile) {
            await supabase.from('profiles').update({ balance: parseFloat(profile.balance) + transaction.amount }).eq('id', (transaction as any).user_id);
        }
    }
    
    // If Withdrawal, balance was already deducted, so just mark success (done above).
    
    await logActivity(user!.id, 'Admin', `Approved ${transaction.type} ${transaction.amount}`);
    return { success: true };
};

export const rejectFinancialRequest = async (transaction: Transaction) => {
    const { data: { user } } = await supabase.auth.getUser(); // Admin user
    
    // 1. Update Transaction Status
    await supabase.from('transactions').update({ status: 'failed', description: transaction.type === 'deposit' ? 'Deposit Rejected' : 'Withdrawal Rejected' }).eq('id', transaction.id);
    
    // 2. If Withdrawal, REFUND Balance
    if (transaction.type === 'withdrawal') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', (transaction as any).user_id).single();
        if (profile) {
            // transaction.amount is negative for withdrawal, so we subtract a negative (add)
            await supabase.from('profiles').update({ balance: parseFloat(profile.balance) - transaction.amount }).eq('id', (transaction as any).user_id);
        }
    }
    
    await logActivity(user!.id, 'Admin', `Rejected ${transaction.type} ${transaction.amount}`);
    return { success: true };
};

export const distributeDailyEarnings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: investments } = await supabase.from('investments').select('*, plans(*), profiles(balance)');
    
    let count = 0;
    const today = new Date().toDateString();
    
    for (const inv of investments || []) {
        // Check for double payment
        if (inv.last_distributed_at && new Date(inv.last_distributed_at).toDateString() === today) {
            continue;
        }

        const dailyAmount = (inv.plans.daily_return) * inv.quantity;
        // Check if plan expired? (created_at + duration days)
        const startDate = new Date(inv.created_at);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + inv.plans.duration);
        
        if (new Date() < endDate) {
            // Pay
            const newBalance = parseFloat(inv.profiles.balance) + dailyAmount;
            await supabase.from('profiles').update({ balance: newBalance }).eq('id', inv.user_id);
            
            await supabase.from('investments').update({ 
                total_revenue: parseFloat(inv.total_revenue) + dailyAmount,
                last_distributed_at: new Date().toISOString()
            }).eq('id', inv.id);
            
            await supabase.from('transactions').insert({
                user_id: inv.user_id,
                type: 'reward',
                amount: dailyAmount,
                description: `Daily return: ${inv.plans.name}`,
                status: 'success'
            });
            count++;
        }
    }
    
    await logActivity(user!.id, 'Admin', `Distributed Earnings to ${count} investments`);
    return { success: true, message: `Distributed to ${count} eligible active investments.` };
};

// --- Plans ---
export const fetchInvestmentPlans = async () => {
    const { data } = await supabase.from('plans').select('*');
    return data?.map((p: any) => ({ id: p.id, name: p.name, minInvestment: parseFloat(p.min_investment), dailyReturn: parseFloat(p.daily_return), duration: p.duration, category: p.category, expirationDate: p.expiration_date })) || [];
};
export const addInvestmentPlan = async (plan: any) => {
    const { data, error } = await supabase.from('plans').insert({ name: plan.name, min_investment: plan.minInvestment, daily_return: plan.dailyReturn, duration: plan.duration, category: plan.category, expiration_date: plan.expirationDate }).select().single();
    if (error) throw new Error(error.message);
    return { id: data.id, name: data.name, minInvestment: parseFloat(data.min_investment), dailyReturn: parseFloat(data.daily_return), duration: data.duration, category: data.category, expirationDate: data.expiration_date } as InvestmentPlan;
};
export const updateInvestmentPlan = async (planId: string, updates: any) => {
     const dbUpdates: any = {};
     if(updates.name) dbUpdates.name = updates.name;
     if(updates.minInvestment) dbUpdates.min_investment = updates.minInvestment;
     if(updates.dailyReturn) dbUpdates.daily_return = updates.dailyReturn;
     if(updates.duration) dbUpdates.duration = updates.duration;
     if(updates.category) dbUpdates.category = updates.category;
     if(updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;
     const { data, error } = await supabase.from('plans').update(dbUpdates).eq('id', planId).select().single();
     if (error) throw new Error(error.message);
     return { id: data.id, name: data.name, minInvestment: parseFloat(data.min_investment), dailyReturn: parseFloat(data.daily_return), duration: data.duration, category: data.category, expirationDate: data.expiration_date } as InvestmentPlan;
};
export const deleteInvestmentPlan = async (planId: string) => { await supabase.from('plans').delete().eq('id', planId); };

// --- Comments ---
export const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*, profiles(name, avatar_url, phone)').order('created_at', { ascending: false });
    return data?.map((c: any) => ({ id: c.id, userId: c.user_id, userName: c.profiles?.name || 'Unknown', userAvatar: c.profiles?.avatar_url || '', maskedPhone: c.profiles?.phone ? c.profiles.phone.substring(0,2) + '****' + c.profiles.phone.slice(-4) : '', text: c.text, images: c.images || [], timestamp: c.created_at })) || [];
};
export const addComment = async (comment: { text: string; images: string[] }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const uploadedImages = await Promise.all(comment.images.map(img => uploadBase64Image(img, 'comments')));
    const { data, error } = await supabase.from('comments').insert({ user_id: user!.id, text: comment.text, images: uploadedImages.filter(i=>i) }).select('*, profiles(name, avatar_url, phone)').single();
    if (error) throw new Error(error.message);
    return { id: data.id, userId: data.user_id, userName: data.profiles?.name, userAvatar: data.profiles?.avatar_url, maskedPhone: data.profiles?.phone, text: data.text, images: data.images || [], timestamp: data.created_at } as Comment;
};
export const deleteComment = async (commentId: string) => { await supabase.from('comments').delete().eq('id', commentId); };
export const updateComment = async (commentId: string, text: string) => { 
    const { data } = await supabase.from('comments').update({ text }).eq('id', commentId).select('*, profiles(name, avatar_url, phone)').single();
    return { id: data.id, userId: data.user_id, userName: data.profiles?.name, userAvatar: data.profiles?.avatar_url, maskedPhone: data.profiles?.phone, text: data.text, images: data.images || [], timestamp: data.created_at } as Comment;
};

// --- Chat ---
export const fetchChatSessions = async () => {
    const { data: messages } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (!messages) return [];
    const sessionsMap = new Map<string, ChatSession>();
    messages.forEach((msg: any) => {
        if (!sessionsMap.has(msg.user_id)) { sessionsMap.set(msg.user_id, { userId: msg.user_id, messages: [], lastMessageTimestamp: msg.created_at, userUnreadCount: 0, adminUnreadCount: 0 }); }
        const session = sessionsMap.get(msg.user_id)!;
        session.messages.push({ id: msg.id, senderId: msg.sender === 'admin' ? 'admin' : msg.user_id, text: msg.text, imageUrl: msg.image_url, timestamp: msg.created_at });
        session.lastMessageTimestamp = msg.created_at;
        if (!msg.read) { if (msg.sender === 'user') session.adminUnreadCount++; if (msg.sender === 'admin') session.userUnreadCount++; }
    });
    return Array.from(sessionsMap.values());
};
export const sendChatMessage = async (message: { text?: string; imageUrl?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    let imageUrl = message.imageUrl;
    if (imageUrl) imageUrl = await uploadBase64Image(imageUrl, 'chat');
    const { data } = await supabase.from('messages').insert({ user_id: user!.id, sender: 'user', text: message.text, image_url: imageUrl, read: false }).select().single();
    return { id: data.id, senderId: user!.id, text: data.text, imageUrl: data.image_url, timestamp: data.created_at } as ChatMessage;
};
export const sendAdminChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }) => {
    let imageUrl = message.imageUrl;
    if (imageUrl) imageUrl = await uploadBase64Image(imageUrl, 'chat');
    const { data } = await supabase.from('messages').insert({ user_id: userId, sender: 'admin', text: message.text, image_url: imageUrl, read: false }).select().single();
    return { id: data.id, senderId: 'admin', text: data.text, imageUrl: data.image_url, timestamp: data.created_at } as ChatMessage;
};
export const markChatAsRead = async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) await supabase.from('messages').update({ read: true }).eq('user_id', user.id).eq('sender', 'admin'); return { success: true }; };
export const markAdminChatAsRead = async (userId: string) => { await supabase.from('messages').update({ read: true }).eq('user_id', userId).eq('sender', 'user'); return { success: true }; };

// --- Platform Settings ---
export const fetchPlatformSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (!data) return { appName: 'Wealth Fund', appLogo: null, themeColor: 'green' as ThemeColor, socialLinks: { telegram: '', whatsapp: '', others: [] }, paymentSettings: { paymentMethods: [], quickAmounts: [500, 1000] }, luckyDrawPrizes: [], luckyDrawWinningPrizeIds: [], systemNotice: '' };
    return { 
        appName: data.app_name, 
        appLogo: data.app_logo, 
        themeColor: data.theme_color as ThemeColor, 
        socialLinks: data.social_links || {}, 
        paymentSettings: data.payment_settings || { paymentMethods: [], quickAmounts: [] }, 
        paymentQuickAmounts: data.payment_settings?.quickAmounts || [], 
        luckyDrawPrizes: data.lucky_draw_prizes || [], 
        luckyDrawWinningPrizeIds: data.lucky_draw_winning_ids || [],
        systemNotice: data.system_notice || ''
    };
};
export const updateAdminPlatformSettings = async (settings: any) => {
    const updates: any = {};
    if (settings.appName) updates.app_name = settings.appName;
    if (settings.appLogo) updates.app_logo = await uploadBase64Image(settings.appLogo, 'logos');
    if (settings.themeColor) updates.theme_color = settings.themeColor;
    if (settings.socialLinks) updates.social_links = settings.socialLinks;
    if (settings.luckyDrawWinningPrizeIds) updates.lucky_draw_winning_ids = settings.luckyDrawWinningPrizeIds;
    if (settings.systemNotice !== undefined) updates.system_notice = settings.systemNotice;
    await supabase.from('app_settings').update(updates).eq('id', 1);
    return { success: true };
};
export const fetchActivityLog = async () => {
    const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
    return data?.map((log: any) => ({ id: log.id, timestamp: new Date(log.created_at), userId: log.user_id, userName: log.user_name || 'Unknown', action: log.action })) || [];
};
export const fetchAdminUsers = async () => { const { data } = await supabase.from('profiles').select('*'); return data?.map((profile: any) => mapProfileToUser(profile)) || []; };
export const updateAdminUser = async (userId: string, updates: Partial<User>) => {
    await supabase.from('profiles').update({ name: updates.name, phone: updates.phone, email: updates.email, is_active: updates.isActive, balance: updates.balance }).eq('id', userId);
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return mapProfileToUser(data);
};
export const deleteAdminUser = async (userId: string) => { await supabase.from('investments').delete().eq('user_id', userId); await supabase.from('transactions').delete().eq('user_id', userId); await supabase.from('profiles').delete().eq('id', userId); };
export const addLuckyDrawPrize = async (prize: any) => { const settings = await fetchPlatformSettings(); const newPrizes = [...settings.luckyDrawPrizes, { id: crypto.randomUUID(), ...prize }]; await supabase.from('app_settings').update({ lucky_draw_prizes: newPrizes }).eq('id', 1); return newPrizes[newPrizes.length - 1]; };
export const updateLuckyDrawPrize = async (prizeId: string, updates: any) => { const settings = await fetchPlatformSettings(); const newPrizes = settings.luckyDrawPrizes.map((p: any) => p.id === prizeId ? { ...p, ...updates } : p); await supabase.from('app_settings').update({ lucky_draw_prizes: newPrizes }).eq('id', 1); return newPrizes.find((p: any) => p.id === prizeId); };
export const deleteLuckyDrawPrize = async (prizeId: string) => { const settings = await fetchPlatformSettings(); const newPrizes = settings.luckyDrawPrizes.filter((p: any) => p.id !== prizeId); await supabase.from('app_settings').update({ lucky_draw_prizes: newPrizes }).eq('id', 1); };
export const setLuckyDrawWinningPrizes = async (ids: string[]) => { await supabase.from('app_settings').update({ lucky_draw_winning_ids: ids }).eq('id', 1); return { success: true }; };
export const updateAdminPaymentSettings = async (settings: Partial<PaymentSettings>) => {
    const current = await fetchPlatformSettings();
    let newPaymentMethods = current.paymentSettings.paymentMethods;
    if (settings.paymentMethods) { newPaymentMethods = await Promise.all(settings.paymentMethods.map(async (method: any) => { if (method.qrCode && method.qrCode.startsWith('data:')) { const publicUrl = await uploadBase64Image(method.qrCode, 'payment-qr'); return { ...method, qrCode: publicUrl }; } return method; })); }
    const merged = { ...current.paymentSettings, ...settings, paymentMethods: newPaymentMethods };
    await supabase.from('app_settings').update({ payment_settings: merged }).eq('id', 1);
    return merged;
};
export const changeAdminPassword = async (oldPass: string, newPass: string) => { const { error } = await supabase.auth.updateUser({ password: newPass }); if (error) throw new Error(error.message); return { success: true }; };
export const fetchAdminDashboard = async () => {
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { data: investments } = await supabase.from('investments').select('amount');
    const totalInvestments = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
    const { data: balances } = await supabase.from('profiles').select('balance');
    const platformBalance = balances?.reduce((sum, usr) => sum + parseFloat(usr.balance), 0) || 0;
    return { totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, totalInvestments, platformBalance };
};
