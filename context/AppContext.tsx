
import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import type { AppContextType, User, InvestmentPlan, Admin, Investment, Transaction, LoginActivity, Notification, NotificationType, ConfirmationState, ActivityLogEntry, BankAccount, ThemeColor, Prize, Comment, ChatSession, ChatMessage, SocialLinks, MockSms, PaymentSettings } from '../types';
import * as api from './api';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]); // For admin panel
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
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ telegram: '', whatsapp: '' });
  const [luckyDrawPrizes, setLuckyDrawPrizes] = useState<Prize[]>([]);
  const [luckyDrawWinningPrizeIds, setLuckyDrawWinningPrizeIds] = useState<string[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ paymentMethods: [], quickAmounts: [] });
  const [pendingPaymentDetails, setPendingPaymentDetails] = useState<{ upiId?: string; qrCode?: string; amount: number; transactionId: string; } | null>(null);


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
            
            // Also fetch comments initially so they are available
            const initialComments = await api.fetchComments();
            setComments(initialComments);
            
            const token = localStorage.getItem('authToken');
            const userType = localStorage.getItem('userType');

            if (token) {
                 if (userType === 'admin') {
                    // In a real app, you might fetch admin details here
                    setAdmin({ username: 'admin', password: '', isLoggedIn: true });
                    // Check for loginAsUser from previous session
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
            // If token is invalid (401), apiFetch handles logout. Otherwise, show login.
            setCurrentView('login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
        } finally {
            setIsLoading(false);
        }
    };
    initializeApp();
 }, []);

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

  const maskPhone = (phone: string): string => {
    if (phone.length < 10) return phone;
    return phone.substring(0, 2) + '****' + phone.substring(phone.length - 4);
  };

  const requestRegisterOtp = async (phone: string) => {
    try {
        await api.requestRegisterOtp(phone);
        addNotification('OTP sent successfully.', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  // FIX: Make password required for registration, as it's optional in the User type but necessary for creation.
  const register = async (userData: Pick<User, 'phone' | 'name'> & { password: string; otp: string }) => {
    try {
        const { user } = await api.register(userData);
        addNotification(`Account created! User ID: ${user.id}`, 'success');
        return { success: true, userId: user.id };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false };
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
        const { token, user } = await api.login(identifier, password);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userType', 'user');
        setCurrentUser(user);
        setCurrentView('home');
        addNotification(`Welcome back, ${user.name}!`, 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
        const { token } = await api.adminLogin(username, password);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userType', 'admin');
        setAdmin({ username, password: '', isLoggedIn: true });
        setCurrentView('admin-dashboard');
        addNotification('Admin login successful.', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };
  
  const handleLogout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('loginAsUser');
      setCurrentUser(null);
      setLoginAsUser(null);
      setAdmin(prev => ({ ...prev, isLoggedIn: false }));
  };

  const logout = () => {
    addNotification("You have been logged out.", 'info');
    if (loginAsUser) {
        returnToAdmin();
    } else {
        handleLogout();
        setCurrentView('login');
    }
  };

  const adminLogout = async () => {
    handleLogout();
    setCurrentView('login');
    addNotification("Admin logged out.", 'info');
  };

  const loginAsUserFunc = async (userId: string) => {
    // This is now a client-side simulation based on fetched user list.
    // A real implementation might have a dedicated API endpoint for this.
    const user = users.find(u => u.id === userId);
    if (user) {
      setLoginAsUser(user);
      setCurrentUser(user);
      localStorage.setItem('loginAsUser', JSON.stringify(user));
      setCurrentView('home');
      addNotification(`Now viewing as ${user.name} (${user.id}).`, 'info');
    }
  };

  const returnToAdmin = async () => {
    addNotification('Returned to Admin Dashboard.', 'info');
    setLoginAsUser(null);
    setCurrentUser(null);
    localStorage.removeItem('loginAsUser');
    setCurrentView('admin-dashboard');
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
        const updatedUser = await api.updateAdminUser(userId, updates);
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        if (currentUser?.id === userId) setCurrentUser(updatedUser);
        if (loginAsUser?.id === userId) setLoginAsUser(updatedUser);
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
        await api.deleteAdminUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        addNotification(`User ${userId} has been deleted.`, 'success');
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };

  const investInPlan = async (planId: string, quantity: number) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    try {
        const { user: updatedUser } = await api.investInPlan(planId, quantity);
        setCurrentUser(updatedUser);
        addNotification('Investment successful!', 'success');
        return { success: true, message: 'Investment successful!' };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const initiateDeposit = async (amount: number) => {
    try {
        const { paymentDetails } = await api.initiateDeposit(amount);
        setPendingPaymentDetails(paymentDetails);
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };

  const confirmDeposit = async (transactionId: string) => {
     try {
        const { user: updatedUser } = await api.confirmDeposit(transactionId);
        setCurrentUser(updatedUser);
        setPendingPaymentDetails(null);
        addNotification(`Successfully deposited ₹${pendingPaymentDetails?.amount.toFixed(2)}.`, 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false };
    }
  };
  
  const makeWithdrawal = async (userId: string, amount: number, fundPassword: string) => {
      try {
        const { user: updatedUser } = await api.makeWithdrawal(amount, fundPassword);
        setCurrentUser(updatedUser);
        const tax = amount * 0.08;
        addNotification(`Withdrawal of ₹${amount.toFixed(2)} successful. Tax of ₹${tax.toFixed(2)} applied.`, 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const changeUserPassword = async (userId: string, oldPass: string, newPass: string) => {
      try {
        await api.changeUserPassword(oldPass, newPass);
        addNotification('Password changed successfully!', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };
  
  const addInvestmentPlan = async (planData: Omit<InvestmentPlan, 'id'>) => {
      try {
        const newPlan = await api.addInvestmentPlan(planData);
        setInvestmentPlans(prev => [...prev, newPlan]);
        addNotification(`New plan "${planData.name}" added.`, 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const updateInvestmentPlan = async (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>) => {
      try {
        const updatedPlan = await api.updateInvestmentPlan(planId, updates);
        setInvestmentPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
        addNotification(`Plan ${planId} updated successfully.`, 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const deleteInvestmentPlan = async (planId: string) => {
      try {
        await api.deleteInvestmentPlan(planId);
        setInvestmentPlans(prev => prev.filter(p => p.id !== planId));
        addNotification(`Plan ${planId} has been deleted.`, 'success');
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };
  
  const requestBankAccountOtp = async (userId: string) => {
      try {
        await api.requestBankAccountOtp();
        addNotification('OTP sent successfully.', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const updateBankAccount = async (userId: string, accountDetails: Omit<BankAccount, 'bankName'>, otp: string) => {
     try {
        const { user: updatedUser } = await api.updateBankAccount(accountDetails, otp);
        setCurrentUser(updatedUser);
        addNotification("Bank account updated successfully!", 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const playLuckyDraw = async () => {
    try {
        const { prize, user: updatedUser } = await api.playLuckyDraw();
        setCurrentUser(updatedUser);
        return { success: true, prize };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false };
    }
  };

  const requestFundPasswordOtp = async (userId: string) => {
      try {
        await api.requestFundPasswordOtp();
        addNotification('OTP sent successfully.', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const updateFundPassword = async (userId: string, newFundPassword: string, otp: string) => {
      try {
        const { user: updatedUser } = await api.updateFundPassword(newFundPassword, otp);
        setCurrentUser(updatedUser);
        addNotification("Fund password updated successfully!", 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser || !currentUser.transactions.some(t => !t.read)) return;
    try {
        const { user: updatedUser } = await api.markNotificationsAsRead();
        setCurrentUser(updatedUser);
    } catch(error: any) {
        addNotification(error.message, 'error');
    }
  };
  
  const updateAppLogo = async (newLogo: string) => {
      setAppLogo(newLogo);
      await api.updateAdminPlatformSettings({ appLogo: newLogo });
  };
  const updateAppName = async (newName: string) => {
      setAppName(newName);
      await api.updateAdminPlatformSettings({ appName: newName });
  };
  const updateThemeColor = async (color: ThemeColor) => {
      setThemeColor(color);
      await api.updateAdminPlatformSettings({ themeColor: color });
  };

  const changeAdminPassword = async (oldPass: string, newPass: string) => {
      try {
        await api.changeAdminPassword(oldPass, newPass);
        addNotification('Admin password changed successfully!', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const performDailyCheckIn = async () => {
    try {
        const { message, reward, user: updatedUser } = await api.performDailyCheckIn();
        setCurrentUser(updatedUser);
        addNotification(message, 'success');
        return { success: true, message, reward };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message, reward: 0 };
    }
  };
  
  const addComment = async (commentData: { text: string; images: string[] }) => {
    try {
        const newComment = await api.addComment(commentData);
        setComments(prev => [newComment, ...prev]);
        addNotification('Comment posted successfully!', 'success');
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };

  const deleteComment = async (commentId: string) => {
     try {
        await api.deleteComment(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        addNotification('Comment deleted successfully.', 'success');
    } catch(error: any) {
        addNotification(error.message, 'error');
    }
  };

  const updateComment = async (commentId: string, text: string) => {
    try {
        const updatedComment = await api.updateComment(commentId, text);
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
        addNotification('Comment updated successfully.', 'success');
    } catch(error: any) {
        addNotification(error.message, 'error');
    }
  };

  const sendChatMessage = async (userId: string, message: { text?: string; imageUrl?: string }) => {
    try {
        // User sends a message
        const isUser = currentUser && !loginAsUser;
        let newMessage: ChatMessage;

        if (isUser) {
            newMessage = await api.sendChatMessage(message);
        } else {
            // Admin sends a message
            newMessage = await api.sendAdminChatMessage(userId, message);
        }
        
        let session = chatSessions.find(s => s.userId === userId);
        let newSessions = [...chatSessions];

        if (session) {
            session.messages.push(newMessage);
            session.lastMessageTimestamp = newMessage.timestamp;
            newSessions = newSessions.map(s => s.userId === userId ? session! : s);
        } else {
            const userForNewSession = users.find(u => u.id === userId) || currentUser;
            if (userForNewSession) {
                session = { userId, messages: [newMessage], lastMessageTimestamp: newMessage.timestamp, userUnreadCount: 0, adminUnreadCount: 0 };
                newSessions.push(session);
            }
        }
        setChatSessions(newSessions);

    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };
  
  const markChatAsRead = async (userId: string) => {
    try {
        const isUser = !!currentUser && !loginAsUser;
        if(isUser) {
            await api.markChatAsRead();
        } else {
            await api.markAdminChatAsRead(userId);
        }
        
        // Optimistically update UI
        setChatSessions(prev => prev.map(s => {
            if (s.userId === userId) {
                return { ...s, userUnreadCount: isUser ? 0 : s.userUnreadCount, adminUnreadCount: !isUser ? 0 : s.adminUnreadCount };
            }
            return s;
        }));
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };

  const updateSocialLinks = async (links: Partial<SocialLinks>) => {
      try {
        await api.updateAdminPlatformSettings({ socialLinks: links });
        setSocialLinks(prev => ({ ...prev, ...links }));
        addNotification('Social links updated successfully!', 'success');
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };
  
  const updatePaymentSettings = async (settings: Partial<PaymentSettings>) => {
      try {
        const newSettings = await api.updateAdminPaymentSettings(settings);
        setPaymentSettings(newSettings);
        addNotification('Payment settings updated!', 'success');
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };

  const requestPasswordResetOtp = async (phone: string) => {
      try {
        await api.requestPasswordResetOtp(phone);
        addNotification('OTP sent successfully.', 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };
  
  const resetPasswordWithOtp = async (phone: string, otp: string, newPassword: string) => {
       try {
        await api.resetPasswordWithOtp(phone, otp, newPassword);
        addNotification("Password reset successfully!", 'success');
        return { success: true };
    } catch (error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const addLuckyDrawPrize = async (prizeData: Omit<Prize, 'id'>) => {
      try {
        const newPrize = await api.addLuckyDrawPrize(prizeData);
        setLuckyDrawPrizes(prev => [...prev, newPrize]);
        addNotification(`New prize "${prizeData.name}" added.`, 'success');
        return { success: true };
    } catch(error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const updateLuckyDrawPrize = async (prizeId: string, updates: Partial<Omit<Prize, 'id'>>) => {
     try {
        const updatedPrize = await api.updateLuckyDrawPrize(prizeId, updates);
        setLuckyDrawPrizes(prev => prev.map(p => p.id === prizeId ? updatedPrize : p));
        addNotification(`Prize updated successfully.`, 'success');
        return { success: true };
    } catch(error: any) {
        addNotification(error.message, 'error');
        return { success: false, message: error.message };
    }
  };

  const deleteLuckyDrawPrize = async (prizeId: string) => {
     try {
        await api.deleteLuckyDrawPrize(prizeId);
        setLuckyDrawPrizes(prev => prev.filter(p => p.id !== prizeId));
        addNotification(`Prize has been deleted.`, 'success');
    } catch(error: any) {
        addNotification(error.message, 'error');
    }
  };

  const setLuckyDrawWinningPrizes = async (prizeIds: string[]) => {
    try {
        await api.updateAdminPlatformSettings({ luckyDrawWinningPrizeIds: prizeIds });
        setLuckyDrawWinningPrizeIds(prizeIds);
        if (prizeIds.length > 0) {
             addNotification(`Force Win updated: ${prizeIds.length} prize(s) selected.`, 'success');
        } else {
             addNotification('Force Win disabled. Prizes are now random.', 'success');
        }
    } catch (error: any) {
        addNotification(error.message, 'error');
    }
  };


  // --- Functions to be exposed via context ---
  const value: AppContextType = {
    // State
    users, currentUser, admin, investmentPlans, currentView, loginAsUser, appName, appLogo, themeColor, isLoading, comments, chatSessions, socialLinks, luckyDrawPrizes, luckyDrawWinningPrizeIds, paymentSettings, activityLog, 
    pendingDeposit: pendingPaymentDetails, // Mapped to new state
    
    // Setters / Actions
    setCurrentView, register, login, adminLogin, logout, adminLogout,
    loginAsUserFunc, returnToAdmin, updateUser, deleteUser, investInPlan, maskPhone,
    addNotification, showConfirmation, 
    makeWithdrawal: (userId, amount, fundPassword) => makeWithdrawal(userId, amount, fundPassword),
    changeUserPassword,
    addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan, requestBankAccountOtp, updateBankAccount,
    playLuckyDraw, requestFundPasswordOtp, updateFundPassword, markNotificationsAsRead, updateAppName, updateAppLogo,
    updateThemeColor, changeAdminPassword, performDailyCheckIn, addComment, deleteComment, updateComment, sendChatMessage, markChatAsRead, updateSocialLinks, updatePaymentSettings,
    requestPasswordResetOtp, resetPasswordWithOtp, requestRegisterOtp,
    addLuckyDrawPrize, updateLuckyDrawPrize, deleteLuckyDrawPrize, setLuckyDrawWinningPrizes,
    initiateDeposit,
    processDeposit: (userId, amount) => {
      // confirmDeposit is now the correct function
      if (pendingPaymentDetails) {
        return confirmDeposit(pendingPaymentDetails.transactionId);
      }
      return Promise.resolve({ success: false });
    },
    dismissSms: () => {}, // mock sms is removed
    mockSms: [], // mock sms is removed
  };

  // Add confirmation modal handlers to the value object, but not to the AppContextType to avoid clutter
  const contextValue = { ...value, notifications, confirmation, hideConfirmation, handleConfirm, setUsers, setActivityLog, setInvestmentPlans, setComments, setChatSessions };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
