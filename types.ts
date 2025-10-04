import type { ReactNode } from 'react';

export interface Investment {
  planId: string;
  planName: string;
  investedAmount: number;
  totalRevenue: number;
  dailyEarnings: number;
  revenueDays: number;
  quantity: number;
  startDate: string;
  category: string;
}

export interface Transaction {
  id?: string;
  type: 'investment' | 'deposit' | 'withdrawal' | 'reward' | 'prize' | 'system';
  amount: number;
  description: string;
  date: string;
  read?: boolean;
}

export interface LoginActivity {
  date: string;
  device: string;
}

export interface BankAccount {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
}

export interface User {
  id: string;
  phone: string;
  password: string;
  name: string;
  email: string;
  balance: number;
  totalReturns: number;
  rechargeAmount: number;
  withdrawals: number;
  registrationDate: string;
  isActive: boolean;
  investments: Investment[];
  transactions: Transaction[];
  loginActivity: LoginActivity[];
  bankAccount: BankAccount | null;
  luckyDrawChances: number;
  fundPassword?: string | null;
  language?: string;
  dailyCheckIns?: string[];
}

export interface InvestmentPlan {
  id:string;
  name: string;
  minInvestment: number;
  dailyReturn: number;
  duration: number;
  category: string;
}

export interface Admin {
  username: string;
  password: string;
  isLoggedIn: boolean;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
}

export interface ActivityLogEntry {
  id: number;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
}

export type ThemeColor = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow' | 'teal' | 'pink';

export interface Prize {
  name: string;
  type: 'bonus' | 'money' | 'nothing' | 'physical';
  amount: number;
}

export interface AppContextType {
  users: User[];
  currentUser: User | null;
  admin: Admin;
  investmentPlans: InvestmentPlan[];
  currentView: string;
  loginAsUser: User | null;
  appName: string;
  appLogo: string | null;
  activityLog: ActivityLogEntry[];
  themeColor: ThemeColor;
  isLoading: boolean;
  setCurrentView: (view: string) => void;
  register: (userData: Pick<User, 'phone' | 'password' | 'name' | 'email'>) => Promise<{ success: boolean; userId?: string }>;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  adminLogout: () => Promise<void>;
  loginAsUserFunc: (userId: string) => Promise<void>;
  returnToAdmin: () => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  investInPlan: (planId: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  maskPhone: (phone: string) => string;
  addNotification: (message: string, type?: NotificationType) => void;
  showConfirmation: (title: string, message: string | ReactNode, onConfirm: () => void) => void;
  makeDeposit: (userId: string, amount: number) => Promise<{ success: boolean }>;
  makeWithdrawal: (userId: string, amount: number) => Promise<{ success: boolean; message?: string }>;
  changeUserPassword: (userId: string, oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  addInvestmentPlan: (planData: Omit<InvestmentPlan, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateInvestmentPlan: (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>) => Promise<{ success: boolean; message?: string }>;
  deleteInvestmentPlan: (planId: string) => Promise<void>;
  requestBankAccountOtp: (userId: string) => Promise<{ success: boolean; message?: string }>;
  updateBankAccount: (userId: string, accountDetails: Omit<BankAccount, 'bankName'>, otp: string) => Promise<{ success: boolean; message?: string }>;
  playLuckyDraw: () => Promise<{ success: boolean; prize?: Prize }>;
  requestFundPasswordOtp: (userId: string) => Promise<{ success: boolean; message?: string }>;
  updateFundPassword: (userId: string, newFundPassword: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  markNotificationsAsRead: () => Promise<void>;
  updateAppName: (newName: string) => Promise<void>;
  updateAppLogo: (newLogo: string) => Promise<void>;
  updateThemeColor: (color: ThemeColor) => Promise<void>;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  performDailyCheckIn: () => Promise<{ success: boolean; message: string; reward: number }>;
}