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
  setCurrentView: (view: string) => void;
  register: (userData: Pick<User, 'phone' | 'password' | 'name' | 'email'>) => { success: boolean; userId?: string };
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  adminLogin: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  adminLogout: () => void;
  loginAsUserFunc: (userId: string) => void;
  returnToAdmin: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  investInPlan: (planId: string, quantity: number) => { success: boolean; message: string };
  maskPhone: (phone: string) => string;
  addNotification: (message: string, type?: NotificationType) => void;
  showConfirmation: (title: string, message: string | ReactNode, onConfirm: () => void) => void;
  makeDeposit: (userId: string, amount: number) => { success: boolean };
  makeWithdrawal: (userId: string, amount: number) => { success: boolean; message?: string };
  changeUserPassword: (userId: string, oldPass: string, newPass: string) => { success: boolean; message?: string };
  addInvestmentPlan: (planData: Omit<InvestmentPlan, 'id'>) => { success: boolean; message?: string };
  updateInvestmentPlan: (planId: string, updates: Partial<Omit<InvestmentPlan, 'id'>>) => { success: boolean; message?: string };
  deleteInvestmentPlan: (planId: string) => void;
  requestBankAccountOtp: (userId: string) => { success: boolean; message?: string };
  updateBankAccount: (userId: string, accountDetails: Omit<BankAccount, 'bankName'>, otp: string) => { success: boolean; message?: string };
  playLuckyDraw: () => { success: boolean; prize?: Prize };
  requestFundPasswordOtp: (userId: string) => { success: boolean; message?: string };
  updateFundPassword: (userId: string, newFundPassword: string, otp: string) => { success: boolean; message?: string };
  markNotificationsAsRead: () => void;
  updateAppName: (newName: string) => void;
  updateAppLogo: (newLogo: string) => void;
  updateThemeColor: (color: ThemeColor) => void;
  changeAdminPassword: (oldPass: string, newPass: string) => { success: boolean; message?: string };
}