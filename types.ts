export enum PackageId {
  BASIC = 'basic',
  STANDARD = 'standard',
  PRO = 'pro',
  VIP = 'vip',
  VVIP = 'vvip',
  VVVIP = 'vvvip'
}

export interface Review {
  userName: string;
  comment: string;
  rating: number;
  date: string;
}

export interface EAPackage {
  id: PackageId;
  name: string;
  price: number;
  capitalRange: string;
  description: string;
  features: string[];
  imageUrl?: string;
  videoUrl?: string;
  performanceHistory?: { year: string; return: string }[];
  userCount: number; // For determining "Most Popular"
  performanceSummary: string; // e.g. "Win Rate 75%, Drawdown 5%"
  recommendation?: string;
  stats?: {
    dailyWinRate: string;
    weeklyWinRate: string;
    monthlyWinRate: string;
    globalRank: number;
    totalActiveUsers: number;
    dailyActiveUsers?: number;
    weeklyActiveUsers?: number;
  };
  reviews: Review[];
  category?: string;
  // New fields for user-submitted EAs
  usersLastMonth?: number;
  currentUsers?: number;
  winRate?: string;
  tradingAssets?: string;
  backtestImageUrls?: string[];
  isUserSubmitted?: boolean;
  status?: 'active' | 'pending';
  lineId?: string;
  authorEmail?: string;
  supportedSymbols?: string[];
}

export interface Transaction {
  id: string;
  userName: string;
  packageName: string;
  packageId: PackageId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  bankName: string;
  accountNo: string;
  slipUrl?: string;
  tradingAccount?: string;
  brokerPassword?: string;
}

export interface BankInfo {
  bankName: string;
  accountNo: string;
  accountName: string;
}

export interface AppStats {
  dailyUsers: number;
  monthlyUsers: number;
  totalPayments: number;
}

export interface Subscription {
  id: string;
  packageId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'suspended';
  remainingBusinessDays: number;
  lastNotificationSent?: string;
  tradingAccount?: string;
  brokerPassword?: string;
  userEmail?: string; // Track who owns this subscription
  isPaid?: boolean;   // Track if current period is paid
}

export interface CheckIn {
  date: string; // ISO string (YYYY-MM-DD)
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  phone: string;
  bankName: string;
  bankAccountNo: string;
  registeredAt: string;
  subscriptions: Subscription[];
  checkInHistory: CheckIn[];
  lastCheckInDate?: string;
  checkInStreak?: number; // Consecutive months or days? I will track total days and calculate months.
  role?: 'renter' | 'provider';
  isApproved?: boolean;
  lineId?: string;
}
