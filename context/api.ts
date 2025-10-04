import type { User, InvestmentPlan, Admin, ActivityLogEntry, ThemeColor, BankAccount, Prize } from '../types';

// --- MOCK API with localStorage ---
// This service simulates an API by using localStorage.
// All functions are async to mimic network requests.
// This makes it easy to replace with actual fetch() calls to a backend.

const FAKE_LATENCY = 150; // ms

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const storage = {
    getItem: <T>(key: string, defaultValue: T): T => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    },
    setItem: <T>(key: string, value: T): void => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    },
    removeItem: (key: string): void => {
        localStorage.removeItem(key);
    }
};

const initialInvestmentPlans: InvestmentPlan[] = [
  { id: 'EVSE-1', name: 'Home EVSE-1', minInvestment: 415, dailyReturn: 166, duration: 59, category: 'EVSE-A' },
  { id: 'EVSE-2', name: 'Home EVSE-2', minInvestment: 1315, dailyReturn: 539, duration: 59, category: 'EVSE-A' },
  { id: 'EVSE-3', name: 'Home EVSE-3', minInvestment: 2500, dailyReturn: 1000, duration: 59, category: 'EVSE-B' },
  { id: 'EVSE-4', name: 'Premium EVSE-1', minInvestment: 5000, dailyReturn: 2100, duration: 90, category: 'EVSE-C' },
];

const initialAdmin: Admin = {
  username: 'admin',
  password: 'admin',
  isLoggedIn: false,
};

// --- API Functions ---

export async function getInitialData() {
    await delay(FAKE_LATENCY * 3); // Simulate a larger initial fetch
    const users = storage.getItem<User[]>('app_users', []);
    const currentUser = storage.getItem<User | null>('app_currentUser', null);
    const admin = storage.getItem<Admin>('app_admin', initialAdmin);
    const investmentPlans = storage.getItem<InvestmentPlan[]>('app_investmentPlans', initialInvestmentPlans);
    const loginAsUser = storage.getItem<User | null>('app_loginAsUser', null);
    const activityLog = storage.getItem<ActivityLogEntry[]>('app_activityLog', []).map(entry => ({...entry, timestamp: new Date(entry.timestamp)}));
    const appName = storage.getItem<string>('app_appName', 'Wealth Fund');
    const appLogo = storage.getItem<string | null>('app_appLogo', null);
    const themeColor = storage.getItem<ThemeColor>('app_themeColor', 'green');
    
    return {
        users, currentUser, admin, investmentPlans, loginAsUser, activityLog, appName, appLogo, themeColor
    };
}

export async function saveUsers(users: User[]): Promise<void> {
    await delay(FAKE_LATENCY);
    storage.setItem('app_users', users);
}

export async function saveCurrentUser(user: User | null): Promise<void> {
    await delay(FAKE_LATENCY);
    if (user) {
        storage.setItem('app_currentUser', user);
    } else {
        storage.removeItem('app_currentUser');
    }
}

export async function saveAdmin(admin: Admin): Promise<void> {
    await delay(FAKE_LATENCY);
    storage.setItem('app_admin', admin);
}

export async function saveInvestmentPlans(plans: InvestmentPlan[]): Promise<void> {
    await delay(FAKE_LATENCY);
    storage.setItem('app_investmentPlans', plans);
}

export async function saveLoginAsUser(user: User | null): Promise<void> {
    await delay(FAKE_LATENCY);
    if (user) {
        storage.setItem('app_loginAsUser', user);
    } else {
        storage.removeItem('app_loginAsUser');
    }
}

export async function saveActivityLog(log: ActivityLogEntry[]): Promise<void> {
    await delay(FAKE_LATENCY);
    storage.setItem('app_activityLog', log);
}

export async function saveAppName(name: string): Promise<void> {
    await delay(FAKE_LATENCY);
    storage.setItem('app_appName', name);
}

export async function saveAppLogo(logo: string | null): Promise<void> {
    await delay(FAKE_LATENCY);
    if (logo) {
        storage.setItem('app_appLogo', logo);
    } else {
        storage.removeItem('app_appLogo');
    }
}

export async function saveThemeColor(color: ThemeColor): Promise<void> {
    await delay(FAKE_LATENCY);
    storage.setItem('app_themeColor', color);
}

// Higher-level logical operations

export async function playLuckyDrawApi(currentUser: User): Promise<{ success: boolean; prize?: Prize, updatedUser: User }> {
    await delay(FAKE_LATENCY * 2);

    if (currentUser.luckyDrawChances <= 0) {
        return { success: false, updatedUser: currentUser };
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
    
    let updatedUser = { ...currentUser };
    updatedUser.luckyDrawChances = currentUser.luckyDrawChances - 1;

    if (wonPrize.type === 'money' || wonPrize.type === 'bonus') {
        updatedUser.balance = currentUser.balance + wonPrize.amount;
        const newTransaction = {
            id: `TXN-LD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            type: 'prize' as const,
            amount: wonPrize.amount,
            description: `Lucky Draw: ${wonPrize.name}`,
            date: new Date().toISOString(),
            read: false,
        };
        updatedUser.transactions = [newTransaction, ...currentUser.transactions];
    }
    
    // In a real app, this would be a single transaction on the backend.
    // Here we have to fetch users, update the specific one, and save them back.
    const allUsers = storage.getItem<User[]>('app_users', []);
    const updatedUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    storage.setItem('app_users', updatedUsers);
    
    return { success: true, prize: wonPrize, updatedUser };
}