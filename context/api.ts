
import { supabase } from '../supabase';
import type { User, InvestmentPlan, Investment, Transaction, TeamStats, Comment, ChatMessage, Prize, ActivityLogEntry } from '../types';

// --- HELPERS ---

const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  phone: profile.phone,
  name: profile.name,
  email: profile.email,
  balance: Number(profile.balance),
  totalReturns: Number(profile.total_returns),
  rechargeAmount: 0,
  withdrawals: 0,
  registrationDate: profile.created_at,
  isActive: profile.is_active,
  investments: [],
  transactions: [],
  loginActivity: [],
  bankAccount: profile.bank_account,
  luckyDrawChances: profile.lucky_draw_chances || 0,
  language: profile.language || 'en',
  referralCode: profile.referral_code,
  referrerId: profile.referrer_id,
  teamIncome: Number(profile.team_income),
  fundPassword: profile.fund_password,
  dailyCheckIns: profile.daily_check_ins || []
});

// Helper to generate consistent fake emails from phone numbers
// We use @example.com because it is RFC-reserved and guaranteed to pass Supabase email validation.
const generateEmailFromPhone = (input: string) => {
    // 1. Remove ALL non-numeric characters (spaces, dashes, plus signs, parentheses)
    const digits = input.replace(/\D/g, '');
    // 2. Append @example.com
    return `u${digits}@example.com`;
};

// --- AUTHENTICATION ---

export const register = async (data: { name: string; phone: string; password: string; inviteCode?: string }) => {
    const email = generateEmailFromPhone(data.phone);

    // 1. Sign up in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
            data: {
                phone: data.phone, // Store raw phone in metadata
                name: data.name
            }
        }
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Registration failed");

    // 2. Handle Referral
    let referrerId = null;
    if (data.inviteCode) {
        const { data: refUser } = await supabase.from('profiles').select('id').eq('referral_code', data.inviteCode).single();
        if (refUser) referrerId = refUser.id;
    }

    // 3. Generate Referral Code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 4. Create Profile
    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        phone: data.phone,
        name: data.name,
        email: email,
        referral_code: referralCode,
        referrer_id: referrerId,
        lucky_draw_chances: 1
    });

    if (profileError) {
        // If profile creation fails, the auth user exists but profile doesn't. 
        // In a real app, you might want to clean up the auth user here.
        throw new Error(profileError.message);
    }

    // 5. Log Initial Transaction
    await supabase.from('transactions').insert({
        user_id: authData.user.id,
        type: 'system',
        amount: 0,
        description: 'Welcome to Wealth Fund!',
        status: 'success'
    });
    
    await logActivity(authData.user.id, data.name, 'Registered');

    const user = await fetchUserProfile(authData.user.id);
    return { success: true, userId: authData.user.id, user };
};

export const login = async (identifier: string, password: string) => {
    let email = identifier;
    
    // If input DOES NOT contain '@', assume it is a phone number and format it
    // This handles the case where a user just types "9876543210"
    if (!identifier.includes('@')) {
        email = generateEmailFromPhone(identifier);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error("Invalid Phone Number or Password");

    const user = await fetchUserProfile(data.user.id);
    await logActivity(user.id, user.name, 'Logged In');
    return { success: true, token: data.session.access_token, user };
};

export const adminLogin = async (username: string, password: string) => {
    try {
        // Admin also logs in via phone number mapping
        const { user } = await login(username, password);
        
        // Check Role
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data?.role !== 'admin') throw new Error("Access Denied: Not an Admin");
        
        return { success: true, token: 'admin_token' };
    } catch (e: any) {
        throw new Error(e.message);
    }
};

// --- USER DATA ---

export const fetchUserProfile = async (userId?: string) => {
    const uid = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) throw new Error("No active session");

    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (error) throw new Error(error ? error.message : "Profile not found");

    const user = mapProfileToUser(data);

    // Fetch Investments
    const { data: invData } = await supabase.from('investments').select('*').eq('user_id', uid);
    if (invData) {
        user.investments = invData.map((i: any) => ({
            planId: i.plan_id,
            planName: i.plan_name,
            investedAmount: i.invested_amount,
            totalRevenue: i.total_revenue,
            dailyEarnings: i.daily_earnings,
            revenueDays: i.revenue_days,
            quantity: i.quantity,
            startDate: i.start_date,
            category: i.category,
            lastDistributedDate: i.last_distributed_date
        }));
    }

    // Fetch Transactions
    const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (txData) {
        user.transactions = txData.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            description: t.description,
            date: t.created_at,
            status: t.status,
            read: t.read,
            proofImg: t.proof_img
        }));
    }

    return user;
};

export const fetchAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (!data) return [];
    return data.map(mapProfileToUser);
};

export const updateAdminUser = async (userId: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.language) dbUpdates.language = updates.language;
    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) throw new Error(error.message);
    return fetchUserProfile(userId);
};

export const deleteAdminUser = async (userId: string) => {
    // Soft delete
    await supabase.from('profiles').update({ is_active: false }).eq('id', userId);
};

// --- PLANS ---

export const fetchInvestmentPlans = async () => {
    const { data } = await supabase.from('plans').select('*').order('min_investment', { ascending: true });
    if (!data) return [];
    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        minInvestment: Number(p.min_investment),
        dailyReturn: Number(p.daily_return),
        duration: p.duration,
        category: p.category,
        expirationDate: p.expiration_date
    }));
};

export const addInvestmentPlan = async (plan: any) => {
    const { data, error } = await supabase.from('plans').insert({
        name: plan.name,
        min_investment: plan.minInvestment,
        daily_return: plan.dailyReturn,
        duration: plan.duration,
        category: plan.category,
        expiration_date: plan.expirationDate
    }).select().single();
    if (error) throw new Error(error.message);
    return {
        id: data.id,
        name: data.name,
        minInvestment: Number(data.min_investment),
        dailyReturn: Number(data.daily_return),
        duration: data.duration,
        category: data.category,
        expirationDate: data.expiration_date
    };
};

export const updateInvestmentPlan = async (id: string, updates: any) => {
     const dbUpdates: any = {};
     if(updates.name) dbUpdates.name = updates.name;
     if(updates.minInvestment) dbUpdates.min_investment = updates.minInvestment;
     if(updates.dailyReturn) dbUpdates.daily_return = updates.dailyReturn;
     if(updates.duration) dbUpdates.duration = updates.duration;
     if(updates.category) dbUpdates.category = updates.category;
     if(updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;

     const { error } = await supabase.from('plans').update(dbUpdates).eq('id', id);
     if (error) throw new Error(error.message);
     
     const { data } = await supabase.from('plans').select('*').eq('id', id).single();
     return {
        id: data.id,
        name: data.name,
        minInvestment: Number(data.min_investment),
        dailyReturn: Number(data.daily_return),
        duration: data.duration,
        category: data.category,
        expirationDate: data.expiration_date
    };
};

export const deleteInvestmentPlan = async (id: string) => {
    await supabase.from('plans').delete().eq('id', id);
};

// --- INVESTING ---

export const investInPlan = async (planId: string, quantity: number) => {
    const user = await fetchUserProfile();
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single();
    
    const cost = plan.min_investment * quantity;
    
    if (user.balance < cost) throw new Error("Insufficient Balance");

    // Deduct Balance & Add Coins
    await supabase.from('profiles')
        .update({ 
            balance: user.balance - cost,
            lucky_draw_chances: user.luckyDrawChances + quantity 
        })
        .eq('id', user.id);

    // Create Investment
    await supabase.from('investments').insert({
        user_id: user.id,
        plan_id: planId,
        plan_name: plan.name,
        invested_amount: cost,
        daily_earnings: plan.daily_return * quantity,
        revenue_days: plan.duration,
        quantity: quantity,
        category: plan.category
    });

    // Log Transaction
    await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'investment',
        amount: -cost,
        description: `Invested in ${plan.name}`,
        status: 'success'
    });

    // Commission Logic (10% to referrer)
    if (user.referrerId) {
        const commission = cost * 0.10;
        // Fetch referrer
        const { data: referrer } = await supabase.from('profiles').select('balance, team_income').eq('id', user.referrerId).single();
        if (referrer) {
             await supabase.from('profiles').update({
                 balance: referrer.balance + commission,
                 team_income: referrer.team_income + commission
             }).eq('id', user.referrerId);

             await supabase.from('transactions').insert({
                user_id: user.referrerId,
                type: 'commission',
                amount: commission,
                description: `Commission from ${user.name}`,
                status: 'success'
            });
        }
    }

    await logActivity(user.id, user.name, `Invested ${cost} in ${plan.name}`);
    return { success: true, user: await fetchUserProfile() };
};

// --- FINANCIALS ---

export const initiateDeposit = async (amount: number) => {
    // Fetch settings for QR/UPI
    const settings = await fetchPlatformSettings();
    const activeMethod = settings.paymentSettings.paymentMethods.find((m: any) => m.isActive);
    
    return {
        paymentDetails: {
            upiId: activeMethod?.upiId || '',
            qrCode: activeMethod?.qrCode || '',
            amount,
            transactionId: 'TXN' + Date.now()
        }
    };
};

export const submitDepositRequest = async (transactionId: string, proofImgBase64: string, amount: number) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    
    // Upload Image
    const fileName = `${uid}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage.from('proofs').upload(fileName, base64ToBlob(proofImgBase64));
    
    const { data: publicUrlData } = supabase.storage.from('proofs').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    await supabase.from('transactions').insert({
        user_id: uid,
        type: 'deposit',
        amount: amount,
        description: 'Deposit Request',
        status: 'pending',
        proof_img: publicUrl
    });

    return { success: true };
};

export const makeWithdrawal = async (userId: string, amount: number, fundPassword: string) => {
    const { data: profile } = await supabase.from('profiles').select('fund_password, balance, name').eq('id', userId).single();
    
    if (profile.fund_password !== fundPassword) throw new Error("Incorrect Fund Password");
    if (profile.balance < amount) throw new Error("Insufficient Funds");

    const gross = amount;
    const fee = amount * 0.05;
    const net = gross - fee;

    // Deduct immediately
    await supabase.from('profiles').update({ balance: profile.balance - gross }).eq('id', userId);

    await supabase.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: -gross,
        description: `Withdrawal ₹${gross} (Fee: ₹${fee.toFixed(2)}, Net: ₹${net.toFixed(2)})`,
        status: 'pending'
    });
    
    await logActivity(userId, profile.name, `Requested withdrawal of ${gross}`);

    return { success: true, user: await fetchUserProfile(userId) };
};

export const fetchFinancialRequests = async () => {
    const { data } = await supabase.from('transactions').select('*, profiles(name, phone)').eq('status', 'pending').order('created_at', { ascending: false });
    return data?.map(mapTxWithProfile) || [];
};

export const fetchAllFinancialRecords = async () => {
     const { data } = await supabase.from('transactions').select('*, profiles(name, phone)').neq('status', 'pending').order('created_at', { ascending: false });
     return data?.map(mapTxWithProfile) || [];
};

const mapTxWithProfile = (t: any) => ({
    ...t,
    userName: t.profiles?.name,
    userPhone: t.profiles?.phone,
    userId: t.user_id,
    date: t.created_at
});

export const approveFinancialRequest = async (tx: Transaction) => {
    await supabase.from('transactions').update({ status: 'success' }).eq('id', tx.id);

    if (tx.type === 'deposit') {
        // Add money safely
        // Need to get current recharge_amount first
        const { data: user } = await supabase.from('profiles').select('balance, recharge_amount').eq('id', (tx as any).userId).single();
        
        await supabase.from('profiles').update({ 
            balance: user.balance + tx.amount,
            recharge_amount: (user.recharge_amount || 0) + tx.amount
        }).eq('id', (tx as any).userId);
    }
    return { success: true };
};

export const rejectFinancialRequest = async (tx: Transaction) => {
    await supabase.from('transactions').update({ status: 'failed' }).eq('id', tx.id);
    
    if (tx.type === 'withdrawal') {
         // Refund money
         const { data: user } = await supabase.from('profiles').select('balance').eq('id', (tx as any).userId).single();
         // tx.amount is negative, subtract negative = add
         await supabase.from('profiles').update({ balance: user.balance - tx.amount }).eq('id', (tx as any).userId);
    }
    return { success: true };
};

// --- DAILY EARNINGS ---

export const distributeDailyEarnings = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all active investments
    const { data: investments } = await supabase.from('investments').select('*');
    
    if (!investments) return { success: true, message: "No investments found" };

    let count = 0;

    for (const inv of investments) {
        // Check if already paid today or expired
        const startDate = new Date(inv.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + inv.revenue_days);
        const isExpired = new Date() > endDate;

        if (inv.last_distributed_date !== today && !isExpired) {
            // Pay User
            const { data: user } = await supabase.from('profiles').select('balance, total_returns').eq('id', inv.user_id).single();
            if (user) {
                const amount = inv.daily_earnings;
                await supabase.from('profiles').update({
                    balance: user.balance + amount,
                    total_returns: user.total_returns + amount
                }).eq('id', inv.user_id);

                await supabase.from('investments').update({
                    total_revenue: inv.total_revenue + amount,
                    last_distributed_date: today
                }).eq('id', inv.id);

                await supabase.from('transactions').insert({
                    user_id: inv.user_id,
                    type: 'reward',
                    amount: amount,
                    description: `Daily Return: ${inv.plan_name}`,
                    status: 'success'
                });
                count++;
            }
        }
    }

    return { success: true, message: `Distributed earnings to ${count} investments.` };
};

// --- CHAT & COMMENTS ---

export const fetchChatSessions = async () => {
    // Get all messages, group by user
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (!data) return [];
    
    const sessionsMap: Record<string, any> = {};
    data.forEach((msg: any) => {
        if (!sessionsMap[msg.user_id]) {
            sessionsMap[msg.user_id] = {
                userId: msg.user_id,
                messages: [],
                lastMessageTimestamp: msg.created_at,
                userUnreadCount: 0,
                adminUnreadCount: 0
            };
        }
        sessionsMap[msg.user_id].messages.push({
            id: msg.id,
            senderId: msg.sender, 
            text: msg.text,
            imageUrl: msg.image_url,
            timestamp: msg.created_at
        });
        
        if (msg.sender === 'user' && !msg.read) sessionsMap[msg.user_id].adminUnreadCount++;
        if (msg.sender === 'admin' && !msg.read) sessionsMap[msg.user_id].userUnreadCount++;
        sessionsMap[msg.user_id].lastMessageTimestamp = msg.created_at;
    });

    // Fix senderId logic for UI
    Object.values(sessionsMap).forEach((session: any) => {
        session.messages.forEach((m: any) => {
            m.senderId = m.senderId === 'admin' ? 'admin' : session.userId;
        });
    });

    return Object.values(sessionsMap);
};

export const sendChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }) => {
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    // Check real role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser?.id).single();
    const sender = profile?.role === 'admin' ? 'admin' : 'user';

    // If upload needed
    let finalUrl = message.imageUrl;
    if (message.imageUrl && message.imageUrl.startsWith('data:')) {
         const fileName = `chat/${Date.now()}.png`;
         await supabase.storage.from('chat').upload(fileName, base64ToBlob(message.imageUrl));
         const { data } = supabase.storage.from('chat').getPublicUrl(fileName);
         finalUrl = data.publicUrl;
    }

    const { data } = await supabase.from('messages').insert({
        user_id: userId,
        sender: sender,
        text: message.text,
        image_url: finalUrl,
        read: false
    }).select().single();

    return {
        id: data.id,
        senderId: sender === 'admin' ? 'admin' : userId,
        text: data.text,
        imageUrl: data.image_url,
        timestamp: data.created_at
    };
};

export const markChatAsRead = async (userId: string) => {
    await supabase.from('messages').update({ read: true }).eq('user_id', userId);
};

export const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*, profiles(name, phone, avatar_url)').order('created_at', { ascending: false });
    return data?.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.profiles?.name || 'User',
        userAvatar: c.profiles?.avatar_url || '',
        maskedPhone: c.profiles?.phone ? c.profiles.phone.substring(0,2)+'****'+c.profiles.phone.slice(-4) : '****',
        text: c.text,
        images: c.images || [],
        timestamp: c.created_at
    })) || [];
};

export const addComment = async (data: { text: string; images: string[] }) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    
    // Upload images
    const imageUrls = [];
    for (const img of data.images) {
        if (img.startsWith('data:')) {
             const fileName = `comments/${Date.now()}_${Math.random()}.png`;
             await supabase.storage.from('comments').upload(fileName, base64ToBlob(img));
             const { data: url } = supabase.storage.from('comments').getPublicUrl(fileName);
             imageUrls.push(url.publicUrl);
        } else {
            imageUrls.push(img);
        }
    }

    const { data: comment } = await supabase.from('comments').insert({
        user_id: uid,
        text: data.text,
        images: imageUrls
    }).select('*, profiles(*)').single();

    return {
        id: comment.id,
        userId: comment.user_id,
        userName: comment.profiles?.name,
        userAvatar: comment.profiles?.avatar_url,
        maskedPhone: '****', 
        text: comment.text,
        images: comment.images,
        timestamp: comment.created_at
    };
};

export const deleteComment = async (id: string) => {
    await supabase.from('comments').delete().eq('id', id);
};

export const updateComment = async (id: string, text: string) => {
    const { data: comment, error } = await supabase.from('comments').update({ text }).eq('id', id).select('*, profiles(name, phone, avatar_url)').single();
    
    if (error) throw new Error(error.message);

    return {
        id: comment.id,
        userId: comment.user_id,
        userName: comment.profiles?.name || 'User',
        userAvatar: comment.profiles?.avatar_url || '',
        maskedPhone: comment.profiles?.phone ? comment.profiles.phone.substring(0,2)+'****'+comment.profiles.phone.slice(-4) : '****',
        text: comment.text,
        images: comment.images || [],
        timestamp: comment.created_at
    };
};

// --- SETTINGS & LOGS ---

export const fetchPlatformSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*').single();
    if(!data) return { appName: 'Wealth Fund', appLogo: null, paymentSettings: { quickAmounts: [], paymentMethods: [] }, socialLinks: {}, luckyDrawPrizes: [], luckyDrawWinningPrizeIds: [], systemNotice: '' };
    
    return {
        appName: data.app_name,
        appLogo: data.app_logo,
        themeColor: data.theme_color,
        paymentSettings: data.payment_settings || { paymentMethods: [], quickAmounts: [] },
        socialLinks: data.social_links || { telegram: '', whatsapp: '', others: [] },
        luckyDrawPrizes: data.lucky_draw_prizes || [],
        luckyDrawWinningPrizeIds: data.lucky_draw_winning_ids || [],
        systemNotice: data.system_notice || ''
    };
};

export const updateAdminPlatformSettings = async (settings: any) => {
    const dbSettings: any = {};
    if (settings.appName) dbSettings.app_name = settings.appName;
    if (settings.appLogo) {
        if (settings.appLogo.startsWith('data:')) {
            const fileName = `settings/logo_${Date.now()}.png`;
            await supabase.storage.from('uploads').upload(fileName, base64ToBlob(settings.appLogo));
            const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
            dbSettings.app_logo = data.publicUrl;
        } else {
            dbSettings.app_logo = settings.appLogo;
        }
    }
    if (settings.themeColor) dbSettings.theme_color = settings.themeColor;
    if (settings.socialLinks) dbSettings.social_links = settings.socialLinks;
    if (settings.systemNotice !== undefined) dbSettings.system_notice = settings.systemNotice;
    
    await supabase.from('app_settings').update(dbSettings).eq('id', 1);
    return { success: true };
};

export const updateAdminPaymentSettings = async (settings: any) => {
    // Upload QR codes if present
    const methods = settings.paymentMethods || [];
    for (const m of methods) {
        if (m.qrCode && m.qrCode.startsWith('data:')) {
             const fileName = `settings/qr_${m.id}.png`;
             await supabase.storage.from('uploads').upload(fileName, base64ToBlob(m.qrCode));
             const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
             m.qrCode = data.publicUrl;
        }
    }
    
    await supabase.from('app_settings').update({ payment_settings: { paymentMethods: methods, quickAmounts: settings.quickAmounts } }).eq('id', 1);
    return { paymentMethods: methods, quickAmounts: settings.quickAmounts };
};

// --- LUCKY DRAW & EXTRAS ---

export const playLuckyDraw = async () => {
    const user = await fetchUserProfile();
    if (user.luckyDrawChances <= 0) throw new Error("No chances left");

    const { luckyDrawPrizes, luckyDrawWinningPrizeIds } = await fetchPlatformSettings();
    
    let prize: Prize;
    const forcedPrizes = luckyDrawPrizes.filter((p: Prize) => luckyDrawWinningPrizeIds.includes(p.id));
    
    if (forcedPrizes.length > 0) {
        prize = forcedPrizes[Math.floor(Math.random() * forcedPrizes.length)];
    } else {
        prize = luckyDrawPrizes[Math.floor(Math.random() * luckyDrawPrizes.length)];
    }

    // Deduct Chance
    await supabase.from('profiles').update({ lucky_draw_chances: user.luckyDrawChances - 1 }).eq('id', user.id);

    // Give Reward
    if (prize.type === 'money' || prize.type === 'bonus') {
         await supabase.from('profiles').update({ balance: user.balance + prize.amount }).eq('id', user.id);
         await supabase.from('transactions').insert({
             user_id: user.id,
             type: 'prize',
             amount: prize.amount,
             description: `Won ${prize.name} in Lucky Draw`,
             status: 'success'
         });
    }

    return { success: true, prize, user: await fetchUserProfile(user.id) };
};

export const performDailyCheckIn = async () => {
    const user = await fetchUserProfile();
    const today = new Date().toISOString().split('T')[0];
    
    if (user.dailyCheckIns?.includes(today)) throw new Error("Already checked in today");
    
    const newCheckIns = [...(user.dailyCheckIns || []), today];
    const reward = 0; // Base reward
    
    await supabase.from('profiles').update({ daily_check_ins: newCheckIns }).eq('id', user.id);
    
    return { success: true, message: "Checked In!", reward, user: await fetchUserProfile(user.id) };
};

export const updateBankAccount = async (userId: string, details: any) => {
    await supabase.from('profiles').update({ bank_account: details }).eq('id', userId);
    return { success: true, user: await fetchUserProfile(userId) };
};

export const updateFundPassword = async (userId: string, pass: string) => {
    await supabase.from('profiles').update({ fund_password: pass }).eq('id', userId);
    return { success: true, user: await fetchUserProfile(userId) };
};

// --- ADMIN HELPERS ---

export const logActivity = async (userId: string, userName: string, action: string) => {
    await supabase.from('activity_logs').insert({ user_id: userId, user_name: userName, action });
};

export const fetchActivityLog = async () => {
    const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
    return data?.map((l: any) => ({
        id: l.id,
        timestamp: new Date(l.created_at),
        userId: l.user_id,
        userName: l.user_name,
        action: l.action
    })) || [];
};

export const addLuckyDrawPrize = async (prize: any) => {
    const { luckyDrawPrizes } = await fetchPlatformSettings();
    const newPrize = { id: Date.now().toString(), ...prize };
    const newPrizes = [...luckyDrawPrizes, newPrize];
    await supabase.from('app_settings').update({ lucky_draw_prizes: newPrizes }).eq('id', 1);
    return newPrize;
};

export const updateLuckyDrawPrize = async (id: string, updates: any) => {
    const { luckyDrawPrizes } = await fetchPlatformSettings();
    const newPrizes = luckyDrawPrizes.map((p: any) => p.id === id ? { ...p, ...updates } : p);
    await supabase.from('app_settings').update({ lucky_draw_prizes: newPrizes }).eq('id', 1);
    return { id, ...updates };
};

export const deleteLuckyDrawPrize = async (id: string) => {
    const { luckyDrawPrizes } = await fetchPlatformSettings();
    const newPrizes = luckyDrawPrizes.filter((p: any) => p.id !== id);
    await supabase.from('app_settings').update({ lucky_draw_prizes: newPrizes }).eq('id', 1);
};

export const setLuckyDrawWinningPrizes = async (ids: string[]) => {
    await supabase.from('app_settings').update({ lucky_draw_winning_ids: ids }).eq('id', 1);
};

export const fetchTeamStats = async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    const { data: profile } = await supabase.from('profiles').select('team_income').eq('id', uid).single();
    
    const { data: members } = await supabase.from('profiles').select('name, phone, created_at').eq('referrer_id', uid);
    
    return {
        totalMembers: members?.length || 0,
        totalIncome: profile?.team_income || 0,
        members: members?.map((m: any) => ({
            name: m.name,
            phone: m.phone,
            joinDate: m.created_at
        })) || []
    };
};

// --- UTILS ---

function base64ToBlob(base64: string) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: 'image/png' });
}

// Stubs for password reset (requires SMTP setup in Supabase)
export const resetPassword = async (phone: string, newPass: string) => {
    return { success: true }; 
};

export const changeUserPassword = async (id: string, old: string, newP: string) => {
    const { error } = await supabase.auth.updateUser({ password: newP });
    if (error) throw new Error(error.message);
    return { success: true };
};

export const changeAdminPassword = async (old: string, newP: string) => {
    return changeUserPassword('', old, newP);
};

export const markNotificationsAsRead = async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return { success: false };
    await supabase.from('transactions').update({ read: true }).eq('user_id', uid);
    return { success: true, user: await fetchUserProfile(uid) };
};

export const fetchAdminDashboard = async () => {
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact' });
    const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('is_active', true);
    
    const { data: investments } = await supabase.from('investments').select('invested_amount');
    const totalInvestments = investments?.reduce((sum, i) => sum + i.invested_amount, 0) || 0;

    const { data: profiles } = await supabase.from('profiles').select('balance');
    const platformBalance = profiles?.reduce((sum, p) => sum + p.balance, 0) || 0;

    return { totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, totalInvestments, platformBalance };
};
