
import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import type { AppContextType, User, InvestmentPlan, Admin, Investment, Transaction, LoginActivity, Notification, NotificationType, ConfirmationState, ActivityLogEntry, BankAccount, ThemeColor, Prize, Comment, ChatSession, ChatMessage, SocialLinks, MockSms, PaymentSettings, TeamStats } from '../types';
import * as api from './api';
import { supabase } from '../supabase';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const translations: Record<string, Record<string, string>> = {
    en: {
        home: 'Home',
        invest: 'Invest',
        comment: 'Comment',
        logout: 'Logout',
        profile: 'Profile',
        my_card: 'My Card',
        transaction_history: 'Transaction History',
        my_orders: 'My Orders',
        login_password: 'Login Password',
        fund_password: 'Fund Password',
        customer_service: 'Customer Service',
        language: 'Language',
        help_center: 'Help Center',
        deposit: 'Deposit',
        withdraw: 'Withdraw',
        recharge: 'Recharge',
        order: 'Order',
        lucky_draw: 'Lucky Draw',
        login_activity: 'Login Activity',
        join_telegram: 'Join Telegram',
        join_whatsapp: 'Join WhatsApp Group',
        financial_services: 'Financial Services',
        find_more: 'Find More',
        total_balance: 'Total Balance',
        available: 'Available',
        total_returns: 'Total Returns',
        account: 'Account',
        security: 'Security',
        settings: 'Settings',
        user_id: 'User ID',
        notifications: 'Notifications',
        view_all: 'View All',
        available_balance: 'Available Balance',
        my_team: 'My Team',
        invite_friends: 'Invite Friends',
    },
    hi: {
        home: 'होम',
        invest: 'निवेश',
        comment: 'टिप्पणी',
        logout: 'लॉग आउट',
        profile: 'प्रोफ़ाइल',
        my_card: 'मेरा कार्ड',
        transaction_history: 'लेनदेन इतिहास',
        my_orders: 'मेरे आदेश',
        login_password: 'लॉगिन पासवर्ड',
        fund_password: 'फंड पासवर्ड',
        customer_service: 'ग्राहक सेवा',
        language: 'भाषा',
        help_center: 'सहायता केंद्र',
        deposit: 'जमा',
        withdraw: 'निकासी',
        recharge: 'रिचार्ज',
        order: 'आदेश',
        lucky_draw: 'लकी ड्रा',
        login_activity: 'लॉगिन गतिविधि',
        join_telegram: 'टेलीग्राम से जुड़ें',
        join_whatsapp: 'व्हाट्सएप ग्रुप से जुड़ें',
        financial_services: 'वित्तीय सेवाएं',
        find_more: 'और खोजें',
        total_balance: 'कुल शेष',
        available: 'उपलब्ध',
        total_returns: 'कुल लाभ',
        account: 'खाता',
        security: 'सुरक्षा',
        settings: 'सेटिंग्स',
        user_id: 'उपयोगकर्ता आईडी',
        notifications: 'सूचनाएं',
        view_all: 'सभी देखें',
        available_balance: 'उपलब्ध शेष',
        my_team: 'मेरी टीम',
        invite_friends: 'दोस्तों को आमंत्रित करें',
    },
    ta: {
        home: 'முகப்பு',
        invest: 'முதலீடு',
        comment: 'கருத்து',
        logout: 'வெளியேறு',
        profile: 'சுயவிவரம்',
        my_card: 'என் அட்டை',
        transaction_history: 'பரிவர்த்தனை வரலாறு',
        my_orders: 'என் ஆர்டர்கள்',
        login_password: 'உள்நுழைவு கடவுச்சொல்',
        fund_password: 'நிதி கடவுச்சொல்',
        customer_service: 'வாடிக்கையாளர் சேவை',
        language: 'மொழி',
        help_center: 'உதவி மையம்',
        deposit: 'டெபாசிட்',
        withdraw: 'திரும்பப் பெறு',
        recharge: 'ரீசார்ஜ்',
        order: 'ஆர்டர்',
        lucky_draw: 'லக்கி டிராவ்',
        login_activity: 'உள்நுழைவு செயல்பாடு',
        join_telegram: 'டெலிகிராமில் இணையுங்கள்',
        join_whatsapp: 'வாட்ஸ்அப் குழுவில் இணையுங்கள்',
        financial_services: 'நிதி சேவைகள்',
        find_more: 'மேலும் தேட',
        total_balance: 'மொத்த இருப்பு',
        available: 'கிடைக்கும்',
        total_returns: 'மொத்த வருமானம்',
        account: 'கணக்கு',
        security: 'பாதுகாப்பு',
        settings: 'அமைப்புகள்',
        user_id: 'பயனர் ஐடி',
        notifications: 'அறிவிப்புகள்',
        view_all: 'அனைத்தையும் காண்க',
        available_balance: 'கிடைக்கும் இருப்பு',
        my_team: 'என் குழு',
        invite_friends: 'நண்பர்களை அழைக்கவும்',
    },
    te: {
        home: 'హోమ్',
        invest: 'పెట్టుబడి',
        comment: 'కామెంట్',
        logout: 'లాగ్ అవుట్',
        profile: 'ప్రొఫైల్',
        my_card: 'నా కార్డ్',
        transaction_history: 'లావాదేవీ చరిత్ర',
        my_orders: 'నా ఆర్డర్లు',
        login_password: 'లాగిన్ పాస్‌వర్డ్',
        fund_password: 'ఫండ్ పాస్‌వర్డ్',
        customer_service: 'కస్టమర్ సర్వీస్',
        language: 'భాష',
        help_center: 'సహాయ కేంద్రం',
        deposit: 'డిపాజిట్',
        withdraw: 'విత్‌డ్రా',
        recharge: 'రీచార్జ్',
        order: 'ఆర్డర్',
        lucky_draw: 'లక్కీ డ్రా',
        login_activity: 'లాగిన్ యాక్టివిటీ',
        join_telegram: 'టెలిగ్రామ్‌లో చేరండి',
        join_whatsapp: 'వాట్సాప్ గ్రూప్‌లో చేరండి',
        financial_services: 'ఆర్థిక సేవలు',
        find_more: 'మరిన్ని కనుగొనండి',
        total_balance: 'మొత్తం బ్యాలెన్స్',
        available: 'అందుబాటులో',
        total_returns: 'మొత్తం రాబడి',
        account: 'ఖాతా',
        security: 'భద్రత',
        settings: 'సెట్టింగ్‌లు',
        user_id: 'యూజర్ ఐడి',
        notifications: 'నోటిఫికేషన్‌లు',
        view_all: 'అన్నీ చూడండి',
        available_balance: 'అందుబాటులో ఉన్న బ్యాలెన్స్',
        my_team: 'నా టీమ్',
        invite_friends: 'స్నేహితులను ఆహ్వానించండి',
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin>({ username: 'admin', password: '', isLoggedIn: false });
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [currentView, setCurrentView] = useState('login');
  const [loginAsUser, setLoginAsUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [appName, setAppName] = useState<string>('Wealth Fund');
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState<ThemeColor>('green');
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ telegram: '', whatsapp: '', others: [] });
  const [luckyDrawPrizes, setLuckyDrawPrizes] = useState<Prize[]>([]);
  const [luckyDrawWinningPrizeIds, setLuckyDrawWinningPrizeIds] = useState<string[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ paymentMethods: [], quickAmounts: [] });
  const [pendingPaymentDetails, setPendingPaymentDetails] = useState<{ upiId?: string; qrCode?: string; amount: number; transactionId: string; } | null>(null);
  const [financialRequests, setFinancialRequests] = useState<Transaction[]>([]); // Admin view
  const [systemNotice, setSystemNotice] = useState<string>('');

 useEffect(() => {
    const initializeApp = async () => {
        setIsLoading(true);
        try {
            const settings = await api.fetchPlatformSettings();
            setAppName(settings.appName);
            setAppLogo(settings.appLogo);
            setThemeColor(settings.themeColor);
            setLuckyDrawPrizes(settings.luckyDrawPrizes);
            setLuckyDrawWinningPrizeIds(settings.luckyDrawWinningPrizeIds || []);
            setPaymentSettings(prev => ({ ...prev, quickAmounts: settings.paymentQuickAmounts }));
            setSocialLinks(settings.socialLinks);
            setSystemNotice(settings.systemNotice);
            const initialComments = await api.fetchComments();
            setComments(initialComments);
            
            const token = localStorage.getItem('authToken');
            const userType = localStorage.getItem('userType');
            if (token) {
                 if (userType === 'admin') {
                    setAdmin({ username: 'admin', password: '', isLoggedIn: true });
                    const storedLoginAsUser = localStorage.getItem('loginAsUser');
                    if (storedLoginAsUser) {
                        const user = JSON.parse(storedLoginAsUser);
                        setLoginAsUser(user);
                        setCurrentUser(user);
                        setCurrentView('home');
                    } else {
                        setCurrentView('admin-dashboard');
                    }
                } else {
                    const userProfile = await api.fetchUserProfile();
                    setCurrentUser(userProfile);
                    setCurrentView('home');
                }
            } else {
                setCurrentView('login');
            }
        } catch (error) {
            console.error("Initialization failed:", error);
            setCurrentView('login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
        } finally {
            setIsLoading(false);
        }
    };
    initializeApp();
 }, []);

 useEffect(() => {
    if (!currentUser && !admin.isLoggedIn) return;
    const globalChannel = supabase.channel('global-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, async () => { setComments(await api.fetchComments()); }).subscribe();
    let userChannel: any;
    let adminChannel: any;
    if (currentUser && !loginAsUser) {
         userChannel = supabase.channel(`user-${currentUser.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${currentUser.id}` }, async (payload) => {
                const newTx = payload.new as Transaction;
                setCurrentUser(await api.fetchUserProfile());
                if (newTx.type === 'deposit' && newTx.status === 'success') {
                    setPendingPaymentDetails(null);
                    addNotification(`Deposit of ₹${newTx.amount} approved!`, 'success');
                } else if (newTx.type === 'commission') {
                    addNotification(`You earned a referral commission of ₹${newTx.amount}!`, 'success');
                }
            })
             // Listen for updates to transactions (e.g., approval/rejection)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `user_id=eq.${currentUser.id}` }, async (payload) => {
                const updatedTx = payload.new as Transaction;
                setCurrentUser(await api.fetchUserProfile());
                if (updatedTx.status === 'success' && updatedTx.type === 'deposit') {
                     addNotification(`Deposit of ₹${updatedTx.amount} Approved!`, 'success');
                } else if (updatedTx.status === 'failed') {
                     addNotification(`Transaction of ₹${Math.abs(updatedTx.amount)} Rejected`, 'error');
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${currentUser.id}` }, async (payload) => {
                 const newMsg = payload.new;
                 if (newMsg.sender === 'admin') {
                     setChatSessions(prev => {
                         const updatedSessions = [...prev];
                         const mySessionIdx = updatedSessions.findIndex(s => s.userId === currentUser.id);
                         const msgObj: ChatMessage = { id: newMsg.id, senderId: 'admin', text: newMsg.text, imageUrl: newMsg.image_url, timestamp: newMsg.created_at };
                         if (mySessionIdx > -1) { updatedSessions[mySessionIdx].messages.push(msgObj); updatedSessions[mySessionIdx].userUnreadCount += 1; } 
                         else { updatedSessions.push({ userId: currentUser.id, messages: [msgObj], lastMessageTimestamp: newMsg.created_at, userUnreadCount: 1, adminUnreadCount: 0 }); }
                         return updatedSessions;
                     });
                     addNotification('New message from support', 'info');
                 }
            })
            .subscribe();
    }
    if (admin.isLoggedIn) {
         adminChannel = supabase.channel('admin-dashboard')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'sender=eq.user' }, async (payload) => {
                const newMsg = payload.new;
                const msgObj: ChatMessage = { id: newMsg.id, senderId: newMsg.user_id, text: newMsg.text, imageUrl: newMsg.image_url, timestamp: newMsg.created_at };
                setChatSessions(prev => {
                    const updatedSessions = [...prev];
                    const sessionIdx = updatedSessions.findIndex(s => s.userId === newMsg.user_id);
                    if (sessionIdx > -1) { updatedSessions[sessionIdx].messages.push(msgObj); updatedSessions[sessionIdx].lastMessageTimestamp = newMsg.created_at; updatedSessions[sessionIdx].adminUnreadCount += 1; } 
                    else { updatedSessions.push({ userId: newMsg.user_id, messages: [msgObj], lastMessageTimestamp: newMsg.created_at, userUnreadCount: 0, adminUnreadCount: 1 }); }
                    return updatedSessions;
                });
                addNotification(`New message from User ${newMsg.user_id.substring(0,6)}...`, 'info');
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
                // Refresh financial requests on any transaction change
                setFinancialRequests(await api.fetchFinancialRequests() as any);
            })
            .subscribe();
    }
    return () => { supabase.removeChannel(globalChannel); if (userChannel) supabase.removeChannel(userChannel); if (adminChannel) supabase.removeChannel(adminChannel); };
 }, [currentUser?.id, admin.isLoggedIn, loginAsUser?.id]);

  const addNotification = (message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setNotifications(prev => prev.filter(n => n.id !== id)); }, 3000);
  };
  const showConfirmation = (title: string, message: string | ReactNode, onConfirm: () => void) => { setConfirmation({ isOpen: true, title, message, onConfirm }); };
  const hideConfirmation = () => { setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} }); };
  const handleConfirm = () => { confirmation.onConfirm(); hideConfirmation(); };
  const maskPhone = (phone: string): string => { if (phone.length < 10) return phone; return phone.substring(0, 2) + '****' + phone.substring(phone.length - 4); };
  
  // UPDATED OTP HANDLERS TO SHOW SIMULATED OTP
  const requestRegisterOtp = async (phone: string) => { 
      try { 
          const res = await api.requestRegisterOtp(phone); 
          addNotification(`OTP Sent: ${res.otp}`, 'success'); // Display OTP
          return { success: true }; 
      } catch (error: any) { 
          addNotification(error.message, 'error'); 
          return { success: false, message: error.message }; 
      } 
  };

  const register = async (userData: any) => { try { const { user } = await api.register(userData); addNotification(`Account created!`, 'success'); return { success: true, userId: user.id }; } catch (error: any) { addNotification(error.message, 'error'); return { success: false }; } };
  const login = async (identifier: string, password: string) => { try { const { token, user } = await api.login(identifier, password); localStorage.setItem('authToken', token); localStorage.setItem('userType', 'user'); setCurrentUser(user); setCurrentView('home'); addNotification(`Welcome back, ${user.name}!`, 'success'); return { success: true }; } catch (error: any) { addNotification(error.message, 'error'); return { success: false, message: error.message }; } };
  const adminLogin = async (username: string, password: string) => { try { const { token } = await api.adminLogin(username, password); localStorage.setItem('authToken', token); localStorage.setItem('userType', 'admin'); setAdmin({ username, password: '', isLoggedIn: true }); setCurrentView('admin-dashboard'); addNotification('Admin login successful.', 'success'); return { success: true }; } catch (error: any) { addNotification(error.message, 'error'); return { success: false, message: error.message }; } };
  const handleLogout = () => { localStorage.removeItem('authToken'); localStorage.removeItem('userType'); localStorage.removeItem('loginAsUser'); setCurrentUser(null); setLoginAsUser(null); setAdmin(prev => ({ ...prev, isLoggedIn: false })); };
  const logout = () => { addNotification("You have been logged out.", 'info'); if (loginAsUser) { returnToAdmin(); } else { handleLogout(); setCurrentView('login'); } };
  const adminLogout = async () => { handleLogout(); setCurrentView('login'); addNotification("Admin logged out.", 'info'); };
  const loginAsUserFunc = async (userId: string) => { const user = users.find(u => u.id === userId); if (user) { setLoginAsUser(user); setCurrentUser(user); localStorage.setItem('loginAsUser', JSON.stringify(user)); setCurrentView('home'); addNotification(`Now viewing as ${user.name} (${user.id}).`, 'info'); } };
  const returnToAdmin = async () => { addNotification('Returned to Admin Dashboard.', 'info'); setLoginAsUser(null); setCurrentUser(null); localStorage.removeItem('loginAsUser'); setCurrentView('admin-dashboard'); };
  const updateUser = async (userId: string, updates: Partial<User>) => { try { if (currentUser && currentUser.id === userId && !admin.isLoggedIn) { const updatedUser = await api.updateUserProfile(updates); setCurrentUser(updatedUser); } else { const updatedUser = await api.updateAdminUser(userId, updates); setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u)); if (currentUser?.id === userId) setCurrentUser(updatedUser); if (loginAsUser?.id === userId) setLoginAsUser(updatedUser); } } catch (error: any) { addNotification(error.message, 'error'); } };
  const deleteUser = async (userId: string) => { try { await api.deleteAdminUser(userId); setUsers(prev => prev.filter(u => u.id !== userId)); addNotification(`User ${userId} deleted.`, 'success'); } catch (error: any) { addNotification(error.message, 'error'); } };
  const investInPlan = async (planId: string, quantity: number) => { if (!currentUser) return { success: false, message: 'Not logged in' }; try { const { user: updatedUser } = await api.investInPlan(planId, quantity); setCurrentUser(updatedUser); addNotification('Investment successful!', 'success'); return { success: true, message: 'Investment successful!' }; } catch (error: any) { addNotification(error.message, 'error'); return { success: false, message: error.message }; } };
  
  const initiateDeposit = async (amount: number) => { try { const { paymentDetails } = await api.initiateDeposit(amount); setPendingPaymentDetails(paymentDetails); } catch (error: any) { addNotification(error.message, 'error'); } };
  const submitDepositRequest = async (transactionId: string, proofImg: string) => { try { await api.submitDepositRequest(transactionId, proofImg); setPendingPaymentDetails(null); addNotification('Deposit submitted for review', 'success'); return { success: true }; } catch (error: any) { addNotification(error.message, 'error'); return { success: false }; } };
  
  const makeWithdrawal = async (userId: string, amount: number, fundPassword: string) => { try { const { user: updatedUser } = await api.makeWithdrawal(amount, fundPassword); setCurrentUser(updatedUser); addNotification(`Withdrawal request submitted.`, 'success'); return { success: true }; } catch (error: any) { addNotification(error.message, 'error'); return { success: false, message: error.message }; } };
  
  // Admin Financials
  const fetchFinancialRequests = async () => { try { const txs = await api.fetchFinancialRequests(); setFinancialRequests(txs as any); } catch(e) { console.error(e); } };
  const approveFinancialRequest = async (tx: Transaction) => { try { await api.approveFinancialRequest(tx); setFinancialRequests(prev => prev.filter(t => t.id !== tx.id)); addNotification('Request approved', 'success'); return { success: true }; } catch(e: any) { addNotification(e.message, 'error'); return { success: false }; } };
  const rejectFinancialRequest = async (tx: Transaction) => { try { await api.rejectFinancialRequest(tx); setFinancialRequests(prev => prev.filter(t => t.id !== tx.id)); addNotification('Request rejected', 'success'); return { success: true }; } catch(e: any) { addNotification(e.message, 'error'); return { success: false }; } };
  const distributeDailyEarnings = async () => { try { const r = await api.distributeDailyEarnings(); addNotification(r.message, 'success'); return r; } catch(e: any) { addNotification(e.message, 'error'); return { success: false, message: e.message }; } };

  const fetchTeamStats = async () => { return await api.fetchTeamStats(); };
  const updateSystemNotice = async (notice: string) => { await api.updateAdminPlatformSettings({ systemNotice: notice }); setSystemNotice(notice); addNotification('System Notice Updated', 'success'); };
  const t = (key: string) => { const lang = currentUser?.language || 'en'; const dict = translations[lang] || translations['en']; return dict[key] || translations['en'][key] || key; };

  const value: AppContextType = {
    users, currentUser, admin, investmentPlans, currentView, loginAsUser, appName, appLogo, themeColor, isLoading, comments, chatSessions, socialLinks, luckyDrawPrizes, luckyDrawWinningPrizeIds, paymentSettings, activityLog, pendingDeposit: pendingPaymentDetails, financialRequests, systemNotice,
    setCurrentView, register, login, adminLogin, logout, adminLogout, loginAsUserFunc, returnToAdmin, updateUser, deleteUser, investInPlan, maskPhone, addNotification, showConfirmation, 
    makeWithdrawal: (userId, amount, fundPassword) => makeWithdrawal(userId, amount, fundPassword),
    changeUserPassword: (id, o, n) => api.changeUserPassword(o, n).then(r => { addNotification('Password changed', 'success'); return r; }).catch(e => { addNotification(e.message, 'error'); return { success: false, message: e.message }; }),
    addInvestmentPlan: (p) => api.addInvestmentPlan(p).then(r => { setInvestmentPlans(prev => [...prev, r]); addNotification('Plan added', 'success'); return { success: true }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    updateInvestmentPlan: (id, u) => api.updateInvestmentPlan(id, u).then(r => { setInvestmentPlans(prev => prev.map(p => p.id === id ? r : p)); addNotification('Plan updated', 'success'); return { success: true }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    deleteInvestmentPlan: (id) => api.deleteInvestmentPlan(id).then(() => { setInvestmentPlans(prev => prev.filter(p => p.id !== id)); addNotification('Plan deleted', 'success'); }).catch(e => addNotification(e.message, 'error')),
    requestBankAccountOtp: (id) => api.requestBankAccountOtp(id).then(r => { addNotification(`OTP Sent: ${r.otp}`, 'success'); return r; }),
    updateBankAccount: (id, d, o) => api.updateBankAccount(d, o).then(r => { setCurrentUser(r.user); addNotification('Bank info updated', 'success'); return { success: true }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    playLuckyDraw: () => api.playLuckyDraw().then(r => { setCurrentUser(r.user); return { success: true, prize: r.prize }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    requestFundPasswordOtp: (id) => api.requestFundPasswordOtp(id).then(r => { addNotification(`OTP Sent: ${r.otp}`, 'success'); return r; }),
    updateFundPassword: (id, n, o) => api.updateFundPassword(n, o).then(r => { setCurrentUser(r.user); addNotification('Fund pwd updated', 'success'); return { success: true }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    markNotificationsAsRead: () => api.markNotificationsAsRead().then(r => { setCurrentUser(r.user); }),
    updateAppName: async (n) => { setAppName(n); await api.updateAdminPlatformSettings({ appName: n }); },
    updateAppLogo: async (l) => { setAppLogo(l); await api.updateAdminPlatformSettings({ appLogo: l }); },
    updateThemeColor: async (c) => { setThemeColor(c); await api.updateAdminPlatformSettings({ themeColor: c }); },
    changeAdminPassword: (o, n) => api.changeAdminPassword(o, n).then(r => { addNotification('Admin Pwd Changed', 'success'); return r; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    performDailyCheckIn: () => api.performDailyCheckIn().then(r => { setCurrentUser(r.user); addNotification(r.message, 'success'); return r; }).catch(e => { addNotification(e.message, 'error'); return { success: false, message: e.message, reward: 0 }; }),
    addComment: (d) => api.addComment(d).then(r => { setComments(prev => [r, ...prev]); addNotification('Comment posted', 'success'); }).catch(e => addNotification(e.message, 'error')),
    deleteComment: (id) => api.deleteComment(id).then(() => { setComments(prev => prev.filter(c => c.id !== id)); addNotification('Comment deleted', 'success'); }).catch(e => addNotification(e.message, 'error')),
    updateComment: (id, t) => api.updateComment(id, t).then(r => { setComments(prev => prev.map(c => c.id === id ? r : c)); addNotification('Comment updated', 'success'); }).catch(e => addNotification(e.message, 'error')),
    sendChatMessage: (uid, m) => api.sendChatMessage(m).then(r => { setChatSessions(prev => { const s = [...prev]; const idx = s.findIndex(x => x.userId === uid); if(idx > -1) { s[idx].messages.push(r); s[idx].lastMessageTimestamp = r.timestamp; } else { s.push({ userId: uid, messages: [r], lastMessageTimestamp: r.timestamp, userUnreadCount: 0, adminUnreadCount: 0 }); } return s; }); }).catch(e => addNotification(e.message, 'error')),
    markChatAsRead: (uid) => api.markChatAsRead().then(() => { setChatSessions(prev => prev.map(s => s.userId === uid ? { ...s, userUnreadCount: 0 } : s)); }),
    updateSocialLinks: (l) => api.updateAdminPlatformSettings({ socialLinks: l }).then(() => { setSocialLinks(prev => ({ ...prev, ...l })); addNotification('Links updated', 'success'); }).catch(e => addNotification(e.message, 'error')),
    updatePaymentSettings: (s) => api.updateAdminPaymentSettings(s).then(r => { setPaymentSettings(r); addNotification('Payment settings updated', 'success'); }).catch(e => addNotification(e.message, 'error')),
    requestPasswordResetOtp: (p) => api.requestPasswordResetOtp(p).then(r => { addNotification(`OTP Sent: ${r.otp}`, 'success'); return r; }),
    resetPasswordWithOtp: (p, o, n) => api.resetPasswordWithOtp(p, o, n).then(r => { addNotification('Pwd Reset', 'success'); return r; }),
    requestRegisterOtp,
    addLuckyDrawPrize: (p) => api.addLuckyDrawPrize(p).then(r => { setLuckyDrawPrizes(prev => [...prev, r]); addNotification('Prize added', 'success'); return { success: true }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    updateLuckyDrawPrize: (id, u) => api.updateLuckyDrawPrize(id, u).then(r => { setLuckyDrawPrizes(prev => prev.map(p => p.id === id ? r : p)); addNotification('Prize updated', 'success'); return { success: true }; }).catch(e => { addNotification(e.message, 'error'); return { success: false }; }),
    deleteLuckyDrawPrize: (id) => api.deleteLuckyDrawPrize(id).then(() => { setLuckyDrawPrizes(prev => prev.filter(p => p.id !== id)); addNotification('Prize deleted', 'success'); }).catch(e => addNotification(e.message, 'error')),
    setLuckyDrawWinningPrizes: (ids) => api.setLuckyDrawWinningPrizes(ids).then(() => { setLuckyDrawWinningPrizeIds(ids); addNotification('Force Win updated', 'success'); }).catch(e => addNotification(e.message, 'error')),
    initiateDeposit, submitDepositRequest, fetchFinancialRequests, approveFinancialRequest, rejectFinancialRequest, distributeDailyEarnings, dismissSms: () => {}, mockSms: [], t, fetchTeamStats, updateSystemNotice,
    notifications, confirmation, hideConfirmation, handleConfirm, setUsers, setActivityLog, setInvestmentPlans, setComments, setChatSessions
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
