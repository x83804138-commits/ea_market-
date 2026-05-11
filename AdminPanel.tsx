import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Activity, 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink,
  Package as PackageIcon,
  Video,
  Trophy,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Maximize2,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { EAPackage, PackageId, Transaction, BankInfo, User } from '../types';
import ImageLightbox from './ImageLightbox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#10b981', '#f43f5e', '#f97316'];

interface AdminPanelProps {
  packages: EAPackage[];
  transactions: Transaction[];
  users: User[];
  bankInfo: BankInfo;
  onUpdatePackages: (newPackages: EAPackage[], bankInfo?: BankInfo) => void;
  onUpdateUsers: (newUsers: User[]) => void;
  onBack: () => void;
  key?: string;
}

export default function AdminPanel({ packages, transactions, users, bankInfo, onUpdatePackages, onUpdateUsers, onBack }: AdminPanelProps) {
  const [editingPackages, setEditingPackages] = React.useState<EAPackage[]>(packages);
  const [timeFilter, setTimeFilter] = React.useState<'total' | 'weekly' | 'monthly'>('total');
  const [lightbox, setLightbox] = React.useState<{ isOpen: boolean; images: string[]; index: number }>({
    isOpen: false,
    images: [],
    index: 0
  });

  const [tempBankInfo, setTempBankInfo] = React.useState<BankInfo>(bankInfo);

  const [securityAlerts, setSecurityAlerts] = React.useState<any[]>(() => {
    return JSON.parse(localStorage.getItem('security_alerts') || '[]');
  });

  const clearSecurityLogs = () => {
    localStorage.removeItem('security_alerts');
    setSecurityAlerts([]);
  };

  // Helper to check if a date string is within the last X days
  const isWithinDays = (dateStr: string, days: number) => {
    try {
      // Basic parse for Thai locale string "d/m/yyyy H:i:s"
      const parts = dateStr.split(' ')[0].split('/');
      if (parts.length !== 3) return true; // Fallback to true if unparseable for 'total'
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]) - 543; // Convert Thai year to Gregorian if needed
      
      const date = new Date(year, month, day);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days;
    } catch (e) {
      return true;
    }
  };

  const getFilteredTransactions = () => {
    if (timeFilter === 'total') return transactions;
    const days = timeFilter === 'weekly' ? 7 : 30;
    return transactions.filter(t => isWithinDays(t.timestamp, days));
  };

  const filteredTransactions = getFilteredTransactions();

  // Aggregate user counts per package for ranking
  const packageRankings = packages.map(pkg => {
    const pkgTrans = filteredTransactions.filter(t => t.packageId === pkg.id);
    return {
      ...pkg,
      rentCount: pkgTrans.length
    };
  }).sort((a, b) => b.rentCount - a.rentCount);

  // Group users by package for deep dive
  const usersGroupedByPackage = packages.map(pkg => {
    const pkgTrans = transactions.filter(t => t.packageId === pkg.id);
    // Unique user ids/names for this package
    const uniqueUserNames = Array.from(new Set(pkgTrans.map(t => t.userName)));
    
    // Find registered user details for these names (best effort mapping)
    const packageUsers = uniqueUserNames.map(name => {
      // Find a user whose register record (email or phone) might match or just list transaction info
      // In a real app, Transaction would have a userId linking to the Users table
      const registeredUser = users.find(u => u.email === name || u.phone === name);
      return {
        name,
        details: registeredUser
      };
    });

    return {
      pkg,
      users: packageUsers,
      totalCount: pkgTrans.length
    };
  });

  const parseThaiDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(' ')[0].split('/');
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]) - 543;
      return new Date(year, month, day);
    } catch (e) {
      return null;
    }
  };

  const handleFieldChange = (id: PackageId, field: keyof EAPackage, value: any) => {
    setEditingPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleFeatureChange = (pkgId: PackageId, index: number, value: string) => {
    setEditingPackages(prev => prev.map(p => {
      if (p.id === pkgId) {
        const newFeatures = [...p.features];
        newFeatures[index] = value;
        return { ...p, features: newFeatures };
      }
      return p;
    }));
  };

  const removeFeature = (pkgId: PackageId, index: number) => {
    setEditingPackages(prev => prev.map(p => {
      if (p.id === pkgId) {
        return { ...p, features: p.features.filter((_, i) => i !== index) };
      }
      return p;
    }));
  };

  const addFeature = (pkgId: PackageId) => {
    setEditingPackages(prev => prev.map(p => {
      if (p.id === pkgId) {
        return { ...p, features: [...p.features, 'New Feature'] };
      }
      return p;
    }));
  };

  const addPerformancePoint = (pkgId: PackageId) => {
    setEditingPackages(prev => prev.map(p => {
      if (p.id === pkgId) {
        const history = p.performanceHistory || [];
        return { ...p, performanceHistory: [...history, { year: '2024', return: '+0%' }] };
      }
      return p;
    }));
  };

  const updatePerformancePoint = (pkgId: PackageId, index: number, field: 'year' | 'return', value: string) => {
    setEditingPackages(prev => prev.map(p => {
      if (p.id === pkgId && p.performanceHistory) {
        const newHistory = [...p.performanceHistory];
        newHistory[index] = { ...newHistory[index], [field]: value };
        return { ...p, performanceHistory: newHistory };
      }
      return p;
    }));
  };

  const removePerformancePoint = (pkgId: PackageId, index: number) => {
    setEditingPackages(prev => prev.map(p => {
      if (p.id === pkgId && p.performanceHistory) {
        return { ...p, performanceHistory: p.performanceHistory.filter((_, i) => i !== index) };
      }
      return p;
    }));
  };

  const saveChanges = () => {
    onUpdatePackages(editingPackages, tempBankInfo);
    alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
  };

  const providerStates: Record<string, number> = {};
  transactions.forEach(t => {
    const pkg = packages.find(p => p.id === t.packageId);
    if (pkg) {
      const owner = pkg.features.find(f => f.startsWith('Contact LINE:'))?.split(': ')[1] || 'Official';
      providerStates[owner] = (providerStates[owner] || 0) + 1;
    }
  });
  const topProvider = Object.entries(providerStates).sort((a, b) => b[1] - a[1])[0];

  // Calculate Top Provider per Package Type based on transaction data
  const getTopProvidersPerPackage = () => {
    const stats: Record<string, { owner: string; count: number }> = {};
    
    packages.forEach(p => {
      const owner = p.features.find(f => f.startsWith('Contact LINE:'))?.split(': ')[1] || 'Official';
      const count = transactions.filter(t => t.packageId === p.id).length;
      
      const key = p.name;
      if (!stats[key] || count > stats[key].count) {
        stats[key] = { owner, count };
      }
    });
    
    return stats;
  };

  const topProvidersPerPackage = getTopProvidersPerPackage();

  const handleApprove = (id: string) => {
    const newPackages = editingPackages.map(p => p.id === id ? { ...p, status: 'active' } as EAPackage : p);
    setEditingPackages(newPackages);
    onUpdatePackages(newPackages);
    alert('อนุมัติ EA เรียบร้อยแล้ว!');
  };

  const handleReject = (id: string) => {
    const newPackages = editingPackages.filter(p => p.id !== id);
    setEditingPackages(newPackages);
    onUpdatePackages(newPackages);
  };

  const pendingPackages = editingPackages.filter(p => p.status === 'pending');
  const pendingUsers = users.filter(u => u.role && !u.isApproved);

  const handleApproveUser = (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isApproved: true } : u);
    onUpdateUsers(updatedUsers);
    alert('อนุมัติผู้ใช้งานเรียบร้อยแล้ว!');
  };

  const handleRejectUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    onUpdateUsers(updatedUsers);
  };

  const getAnalyticsData = () => {
    const allCheckIns = users.flatMap(u => u.checkInHistory || []);
    const now = new Date();
    const nowUTC = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 1. Check-in Stats
    const dailyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(nowUTC);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = allCheckIns.filter(c => c.date === dateStr).length;
      return { 
        name: d.toLocaleDateString('th-TH', { weekday: 'short' }), 
        count,
      };
    });

    const weeklyData = Array.from({ length: 4 }).map((_, i) => {
      const d = new Date(nowUTC);
      d.setDate(d.getDate() - (3 - i) * 7);
      const start = new Date(d);
      start.setDate(start.getDate() - 7);
      const end = d;
      
      const count = allCheckIns.filter(c => {
        const itemDate = new Date(c.date);
        return itemDate >= start && itemDate <= end;
      }).length;

      return { name: `W${4 - i}`, count };
    });

    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = d.toLocaleDateString('th-TH', { month: 'short' });
      
      const count = allCheckIns.filter(c => {
        const itemDate = new Date(c.date);
        return itemDate.getMonth() === d.getMonth() && itemDate.getFullYear() === d.getFullYear();
      }).length;

      return { name: monthStr, count };
    });

    // 2. Revenue Stats (from transactions)
    const revenueDailyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(nowUTC);
      d.setDate(d.getDate() - (6 - i));
      const amount = transactions.filter(t => {
        const tDate = parseThaiDate(t.timestamp);
        return tDate && tDate.getTime() === d.getTime();
      }).reduce((sum, t) => sum + t.amount, 0);

      return { 
        name: d.toLocaleDateString('th-TH', { weekday: 'short' }), 
        amount,
      };
    });

    const revenueWeeklyData = Array.from({ length: 4 }).map((_, i) => {
      const d = new Date(nowUTC);
      d.setDate(d.getDate() - (3 - i) * 7);
      const start = new Date(d);
      start.setDate(start.getDate() - 7);
      const end = d;
      
      const amount = transactions.filter(t => {
        const tDate = parseThaiDate(t.timestamp);
        return tDate && tDate >= start && tDate <= end;
      }).reduce((sum, t) => sum + t.amount, 0);

      return { name: `W${4 - i}`, amount };
    });

    const revenueMonthlyData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = d.toLocaleDateString('th-TH', { month: 'short' });
      
      const amount = transactions.filter(t => {
        const tDate = parseThaiDate(t.timestamp);
        return tDate && tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      }).reduce((sum, t) => sum + t.amount, 0);

      return { name: monthStr, amount };
    });

    return { dailyData, weeklyData, monthlyData, revenueDailyData, revenueWeeklyData, revenueMonthlyData };
  };

  const { dailyData, weeklyData, monthlyData, revenueDailyData, revenueWeeklyData, revenueMonthlyData } = getAnalyticsData();

  // Pie Chart Data: Distribution of Active Users per EA (Current Month)
  const getPieData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions to current month only
    const monthlyTrans = transactions.filter(t => {
      try {
        const parts = t.timestamp.split(' ')[0].split('/');
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]) - 543;
        const date = new Date(year, month, 1);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      } catch (e) {
        return false;
      }
    });

    const data = packages.map(pkg => {
      const pkgTrans = monthlyTrans.filter(t => t.packageId === pkg.id);
      return {
        name: pkg.name,
        value: pkgTrans.reduce((sum, t) => sum + t.amount, 0),
        userCount: new Set(pkgTrans.map(t => t.userName)).size
      };
    })
    .filter(d => d.value > 0 || packages.length <= 5)
    .sort((a, b) => b.value - a.value);
    
    return data;
  };

  const pieData = getPieData();
  const totalRevenueInMonth = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const totalUsersInMonth = pieData.reduce((acc, curr) => acc + curr.userCount, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Pending Users and Submissions Section */}
        {(pendingPackages.length > 0 || pendingUsers.length > 0) && (
          <div className="mb-16 space-y-12">
            {pendingUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-4 px-2 mb-8">
                  <ShieldCheck className="w-8 h-8 text-blue-500" />
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">User Approvals</h2>
                    <p className="text-gray-500 text-sm">ตรวจสอบและอนุมัติบัญชีผู้ใช้งานใหม่ ({pendingUsers.length})</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="bg-[#141414] border border-blue-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full" />
                      
                      <div className="flex items-center gap-6 flex-grow">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center font-black text-blue-500">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-white truncate uppercase tracking-tight">{user.email}</h3>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${user.role === 'renter' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'}`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span>ID: <span className="text-gray-300">{user.id}</span></span>
                            <span>Phone: <span className="text-gray-300">{user.phone}</span></span>
                            <span>Line ID: <span className="text-yellow-500">{user.lineId || 'N/A'}</span></span>
                            <span>Bank: <span className="text-gray-300">{user.bankName} ({user.bankAccountNo})</span></span>
                            <span>Joined: <span className="text-gray-300">{user.registeredAt}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          className="flex-1 md:flex-none px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve (อนุมัติ)
                        </button>
                        <button 
                          onClick={() => handleRejectUser(user.id)}
                          className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-xl transition-all border border-red-500/20 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                        >
                          <XCircle className="w-4 h-4" />
                          Delete (ลบทิ้ง)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingPackages.length > 0 && (
              <div>
                <div className="flex items-center gap-4 px-2 mb-8">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">EA Submissions</h2>
                    <p className="text-gray-500 text-sm">ตรวจสอบและอนุมัติ EA ที่ผู้ใช้ส่งเข้ามา ({pendingPackages.length})</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {pendingPackages.map((pkg) => (
                    <div key={pkg.id} className="bg-[#141414] border border-orange-500/20 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 bg-orange-500 h-full" />
                      
                      <div className="w-full md:w-64 aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 order-2 md:order-1">
                        {pkg.videoUrl ? (
                          <video src={pkg.videoUrl} className="w-full h-full object-cover" controls muted />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700">No Preview</div>
                        )}
                      </div>

                      <div className="flex-grow space-y-2 order-3 md:order-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black text-white uppercase">{pkg.name}</h3>
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase rounded border border-orange-500/20">Pending</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                          <span>หมวดหมู่ (Category): <span className="text-white">{pkg.category}</span></span>
                          <span>เเพ็คเกจ (Package): <span className="text-white">{pkg.tradingAssets}</span></span>
                          <span>ราคา (Price): <span className="text-yellow-500">{pkg.price.toLocaleString()} THB</span></span>
                          <span>Win Rate: <span className="text-green-500">{pkg.winRate}</span></span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Included Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {pkg.features.map((f, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 border border-white/5">{f}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">{pkg.description}</p>
                        <div className="pt-4 flex flex-wrap gap-3">
                          {pkg.backtestImageUrls?.map((url, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setLightbox({ isOpen: true, images: pkg.backtestImageUrls || [], index: i })}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-white/10 overflow-hidden cursor-pointer bg-black relative group shadow-xl"
                            >
                              <img src={url} alt="Backtest" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto order-1 md:order-3">
                        <button 
                          onClick={() => handleApprove(pkg.id)}
                          className="flex-1 md:flex-none px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(pkg.id)}
                          className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-2xl transition-all border border-red-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">จัดการระบบ สถิติ และแพ็คเกจ EA ทั้งหมด</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onBack}
              className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all text-sm uppercase tracking-widest"
            >
              กลับหน้าหลัก
            </button>
            <button 
              onClick={saveChanges}
              className="flex-1 md:flex-none px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>

        {/* Lender Leaderboard Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 px-2 mb-8">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Top Lender Leaderboard</h2>
              <p className="text-gray-500 text-sm">รายชื่อเจ้าของ EA ที่มีผู้ใช้งานสูงสุดประจำเดือน (แยกตามสัดส่วนการปล่อยเช่า)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(providerStates)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count], index) => (
                <div 
                  key={name}
                  className="bg-[#141414] border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:border-yellow-500/30 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                      index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 
                      index === 1 ? 'bg-gray-300 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">EA Owner / Provider</p>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        {name}
                        {index === 0 && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/30">MONTHLY CHAMPION</span>}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Active Rentals</p>
                      <p className="text-2xl font-black text-white">{count}</p>
                    </div>
                    <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden hidden md:block">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / (topProvider?.[1] || 1)) * 100}%` }}
                        className={`h-full ${index === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-2xl group-hover:bg-yellow-500/10 transition-all" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Top Provider (Month)</p>
                <h3 className="text-xl font-black text-white truncate uppercase tracking-tighter">
                  {topProvider ? topProvider[0] : 'None'}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Registered Users</p>
                <h3 className="text-2xl font-black text-white">
                  {users.length.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Revenue</p>
                <h3 className="text-2xl font-black text-white">
                  ฿{transactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Packages</p>
                <h3 className="text-2xl font-black text-white">
                  {packages.filter(p => p.status === 'active').length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Management Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 px-2 mb-8">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bank Settings</h2>
              <p className="text-gray-500 text-sm">ตั้งค่าข้อมูลธนาคารสำหรับรับโอนเงินและการตรวจสอบสลิป</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Bank Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tempBankInfo.bankName}
                    onChange={(e) => setTempBankInfo({ ...tempBankInfo, bankName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. ธนาคารกสิกรไทย"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Account Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tempBankInfo.accountName}
                    onChange={(e) => setTempBankInfo({ ...tempBankInfo, accountName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. นายสมชาย มั่นคง"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Account Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tempBankInfo.accountNo}
                    onChange={(e) => setTempBankInfo({ ...tempBankInfo, accountNo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 123-4-56789-0"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-4 p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs font-medium text-gray-400 leading-relaxed">
                ระบบจะใช้ชื่อธนาคาร <span className="text-white font-black underline decoration-blue-500/50">"{tempBankInfo.bankName}"</span> ในหน้าชำระเงินและตรวจสอบชื่อบัญชี <span className="text-white font-black underline decoration-blue-500/50">"{tempBankInfo.accountName}"</span> โดยอัตโนมัติ
              </p>
            </div>
          </div>
        </div>

        {/* Security Alerts Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Security Alerts</h2>
                <p className="text-gray-500 text-sm">ประวัติการพยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต (Logs Sent to Email)</p>
              </div>
            </div>
            {securityAlerts.length > 0 && (
              <button 
                onClick={clearSecurityLogs}
                className="text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Clear Logs
              </button>
            )}
          </div>

          <div className="bg-[#141414] border border-red-500/10 rounded-[40px] overflow-hidden">
            {securityAlerts.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-gray-600 font-bold uppercase tracking-widest">No security threats detected</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Timestamp</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">User/Email</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Action</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityAlerts.map((alert, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-gray-400 font-mono">{alert.timestamp}</td>
                        <td className="px-8 py-5 text-sm font-black text-white uppercase tracking-tight">{alert.email}</td>
                        <td className="px-8 py-5 text-sm text-gray-400 font-medium">{alert.action}</td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-full border border-red-500/20">
                              {alert.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Analytics */}
        <div className="mb-20">
          <div className="flex items-center gap-4 px-2 mb-8">
            <CalendarDays className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Check-in Analytics</h2>
              <p className="text-gray-500 text-sm">สถิติการเช็กอินรายวัน สัปดาห์ และเดือน</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily (Bar/Candle Style) */}
            <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-black text-white uppercase tracking-widest">Daily Activity</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Last 7 Days
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly (Bar Style) */}
            <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-black text-white uppercase tracking-widest">Weekly Trends</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Last 4 Weeks
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#eab308', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly (Line Chart) */}
            <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-black text-white uppercase tracking-widest">Monthly Growth</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Last 6 Months
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#a855f7" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#141414' }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analytics (New) */}
        <div className="mb-20">
          <div className="flex items-center gap-4 px-2 mb-8">
            <LineChartIcon className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Revenue Analytics</h2>
              <p className="text-gray-500 text-sm">การสรุปรายได้รายวัน รายสัปดาห์ และรายเดือน</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Daily */}
            <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-black text-white uppercase tracking-widest">Daily Revenue</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Last 7 Days
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueDailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      formatter={(v: number) => [`฿${v.toLocaleString()}`, 'Income']}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Weekly */}
            <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-black text-white uppercase tracking-widest">Weekly Revenue</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Last 4 Weeks
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      formatter={(v: number) => [`฿${v.toLocaleString()}`, 'Income']}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Monthly */}
            <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-black text-white uppercase tracking-widest">Monthly Growth</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Last 6 Months
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#eab308', fontWeight: 'bold' }}
                      formatter={(v: number) => [`฿${v.toLocaleString()}`, 'Income']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#eab308" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#eab308', strokeWidth: 2, stroke: '#141414' }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* EA Distribution (Pie Chart - Monthly) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 bg-[#141414] border border-white/10 rounded-[40px] p-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <PieChartIcon className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">EA Monthly Revenue Distribution</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">สัดส่วนรายได้การเช่า EA ประจำเดือน (%)</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number, name: string, props: any) => {
                      if (name === 'Monthly Income') return [`฿${value.toLocaleString()}`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      const item = pieData.find(d => d.name === label);
                      return `${label} (${item?.userCount || 0} Users)`;
                    }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    formatter={(value: string, entry: any) => {
                      const { payload } = entry;
                      const percent = totalRevenueInMonth > 0 ? ((payload.value / totalRevenueInMonth) * 100).toFixed(1) : '0.0';
                      return <span className="text-[10px] font-black text-white uppercase tracking-widest">{value} ({percent}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-[40px] p-8 flex flex-col justify-center">
            <div className="mb-8">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center">Month Summary</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h4 className="text-2xl font-black text-white tracking-tighter">฿{totalRevenueInMonth.toLocaleString()}</h4>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Revenue</p>
                </div>
                <div className="text-center border-l border-white/5">
                  <h4 className="text-2xl font-black text-blue-500 tracking-tighter">{totalUsersInMonth}</h4>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Customers</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {pieData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase truncate max-w-[100px]">{item.name}</p>
                      <p className="text-[8px] font-bold text-gray-500">{item.userCount} Users</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-yellow-500">
                    {totalRevenueInMonth > 0 ? ((item.value / totalRevenueInMonth) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage per EA */}
        <div className="mb-16">
          <div className="flex items-center gap-4 px-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Usage Statistics (Per EA)</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">สถิติผู้ใช้งานและผู้ปล่อยเช่าสูงสุดรายแพ็คเกจ</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(p => (
              <div key={p.id + '_stat'} className="bg-[#141414] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all" />
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{p.id}</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{p.name}</h3>
                  </div>
                  <div className="text-right">
                    <div>
                       <p className="text-2xl font-black text-white">฿{transactions.filter(t => t.packageId === p.id).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                       <p className="text-[8px] font-bold text-gray-600 uppercase">Total Revenue</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-right">
                        <p className="text-xs font-black text-white">{(p.stats?.dailyActiveUsers || 0).toLocaleString()}</p>
                        <p className="text-[7px] font-bold text-gray-600 uppercase">Daily</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-white">{(p.stats?.weeklyActiveUsers || 0).toLocaleString()}</p>
                        <p className="text-[7px] font-bold text-gray-600 uppercase">Weekly</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 justify-end mt-2">
                        <p className={`text-xl font-black ${new Set(transactions.filter(t => t.packageId === p.id).map(t => t.userName)).size >= 50 ? 'text-green-500' : 'text-blue-500'}`}>
                          {new Set(transactions.filter(t => t.packageId === p.id).map(t => t.userName)).size}
                        </p>
                        {new Set(transactions.filter(t => t.packageId === p.id).map(t => t.userName)).size >= 50 && (
                          <div className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[7px] font-black text-green-500 uppercase tracking-widest">
                            Qualified 10%
                          </div>
                        )}
                      </div>
                      <p className="text-[8px] font-bold text-gray-600 uppercase">Unique Customers</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Top Lender for this EA</p>
                      <p className="text-sm font-black text-white uppercase truncate max-w-[180px]">
                        {topProvidersPerPackage[p.name]?.owner || 'System'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking and Insights Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Package Rankings</h2>
                <p className="text-gray-500 text-sm">เรียงลำดับแพ็คเกจที่มีผู้สนใจเช่ามากที่สุด</p>
              </div>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['total', 'weekly', 'monthly'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    timeFilter === filter 
                    ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                    : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {filter === 'total' ? 'All Time' : filter === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packageRankings.map((pkg, index) => (
              <motion.div
                key={pkg.id + '_rank'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#141414] border border-white/10 rounded-[32px] p-8 relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/10 transition-all" />
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-black text-yellow-500 border border-white/10">
                    #{index + 1}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Growth</p>
                    <div className="flex items-center gap-1 text-green-500 font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{Math.floor(Math.random() * 20)}%</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black text-white">{pkg.rentCount}</span>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Rents</span>
                </div>

                <div className="space-y-3">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ width: `${(pkg.rentCount / (packageRankings[0].rentCount || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Market Share: {((pkg.rentCount / (filteredTransactions.length || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Deep Dive Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 px-2 mb-8">
            <Filter className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Package User Insights</h2>
              <p className="text-gray-500 text-sm">จำแนกผู้ใช้และข้อมูลบัญชีแยกตามแต่ละแพ็คเกจ</p>
            </div>
          </div>

          <div className="space-y-8">
            {usersGroupedByPackage.map(({ pkg, users: pkgUsers, totalCount }) => (
              <div key={pkg.id + '_insight'} className="bg-[#141414] border border-white/10 rounded-[40px] overflow-hidden">
                <div className="p-8 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-black">
                      {pkg.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{totalCount} total rentals since launch</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Users</p>
                      <p className="text-xl font-black text-white">{pkgUsers.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Profitability</p>
                      <p className="text-xl font-black text-green-500">{pkg.performanceSummary.split('|')[0] || 'High'}</p>
                    </div>
                  </div>
                </div>

                  <div className="overflow-x-auto -mx-8">
                    <div className="min-w-[800px] inline-block w-full align-middle">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">User / Owner</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Access</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Master Password</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Bank Details</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Account No.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {pkgUsers.length > 0 ? pkgUsers.map((u, i) => (
                            <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-8 py-6">
                                <p className="font-bold text-white mb-0.5 break-words max-w-[150px]">{u.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Package Holder</p>
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-400 break-all max-w-[200px]">
                                {u.details?.email || 'N/A'}
                              </td>
                              <td className="px-8 py-6 font-mono text-xs text-yellow-500/50">
                                {u.details?.password || '••••••••'}
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-sm text-white font-bold break-words max-w-[150px]">{u.details?.bankName || 'Unknown Bank'}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{u.details?.phone || 'No Phone'}</p>
                              </td>
                              <td className="px-8 py-6 font-mono text-sm text-gray-400">
                                {u.details?.bankAccountNo || 'XXXX-XXXX-XX'}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} className="px-8 py-10 text-center text-gray-600 italic">
                                No users have rented this package yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Provider of the Month and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-[#141414] border border-white/10 rounded-[40px] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] group-hover:bg-yellow-500/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Provider Leaderboard</h2>
                  <p className="text-gray-500 text-sm">อันดับผู้ปล่อยเช่า EA ยอดนิยมประจำเดือน</p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(providerStates)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([owner, count], idx) => (
                    <div key={owner} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all group/item">
                      <div className="flex items-center gap-6">
                        <span className={`text-2xl font-black ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                          0{idx + 1}
                        </span>
                        <div>
                          <p className="text-xl font-black text-white uppercase tracking-tight">{owner}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{count} Active Rentals</span>
                            {count >= 50 && (
                              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[7px] font-black text-green-500 uppercase tracking-widest">
                                Qualified for 10% Bonus
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Success Rate</p>
                        <p className="text-lg font-black text-green-500">{90 + (5 - idx)}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-500 border border-yellow-400 rounded-[40px] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_20px_50px_rgba(234,179,8,0.2)]">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
             <div className="relative z-10">
               <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-12">
                 <Trophy className="w-10 h-10 text-yellow-500" />
               </div>
               <p className="text-black/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-mono">Top Provider (Month)</p>
               <h3 className="text-4xl font-black text-black uppercase tracking-tighter mb-4 leading-none break-words max-w-[200px]">
                 {topProvider ? topProvider[0] : 'System'}
               </h3>
               <div className="inline-block px-4 py-2 bg-black text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                 Verified Platinum
               </div>
               <div className="space-y-2 w-full pt-6 border-t border-black/10">
                 <div className="flex justify-between items-center text-black/60 text-[10px] font-black uppercase tracking-widest">
                   <span>Monthly Reward</span>
                   <span className="text-black">Up to 25% Bonus</span>
                 </div>
                 <div className="flex justify-between items-center text-black/60 text-[10px] font-black uppercase tracking-widest">
                   <span>Users Managed</span>
                   <span className="text-black">{topProvider ? topProvider[1] : 0} Users</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Bank Account Settings */}
        <div className="mb-16">
          <div className="bg-[#141414] border border-white/10 rounded-[40px] p-10">
            <div className="flex items-center gap-4 mb-10">
              <CreditCard className="w-8 h-8 text-purple-500" />
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bank Account Settings</h2>
                <p className="text-gray-500 text-sm">การตั้งค่าบัญชีธนาคารสำหรับรับชำระเงินค่าเช่า EA</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bank Name</label>
                <input 
                  type="text" 
                  value={tempBankInfo.bankName}
                  onChange={(e) => setTempBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 outline-none transition-colors font-bold"
                  placeholder="e.g. Kasikorn Bank"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Number</label>
                <input 
                  type="text" 
                  value={tempBankInfo.accountNo}
                  onChange={(e) => setTempBankInfo(prev => ({ ...prev, accountNo: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 outline-none transition-colors font-mono"
                  placeholder="e.g. XXX-X-XXXXX-X"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Holder Name</label>
                <input 
                  type="text" 
                  value={tempBankInfo.accountName}
                  onChange={(e) => setTempBankInfo(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-purple-500/50 outline-none transition-colors font-bold"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={saveChanges}
                  className="w-full h-[60px] bg-purple-500 hover:bg-purple-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Users Database with Activity History */}
        <div className="mb-16">
          <div className="flex items-center gap-4 px-2 mb-6">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">User Activity & Database</h2>
              <p className="text-gray-500 text-sm">ตรวจสอบประวัติการใช้งาน ตั้งแต่วันแรกจนถึงปัจจุบัน แยกตามประเภทผู้ใช้งาน</p>
            </div>
          </div>
          
          <div className="bg-[#141414] border border-white/10 rounded-[40px] overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[1200px] w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">User Profile</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap border-l border-white/5">Identity Detail</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap border-l border-white/5">Registration History</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap border-l border-white/5">Activity / History Log</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users && users.length > 0 ? users.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).map((u) => {
                      const userEAs = packages.filter(p => p.authorEmail === u.email);
                      const daysActive = Math.ceil((new Date().getTime() - new Date(u.registeredAt).getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* User Profile column */}
                          <td className="px-8 py-8 align-top">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white group-hover:border-purple-500/50 transition-all">
                                {u.email[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px]">{u.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'renter' ? 'bg-blue-500/10 text-blue-500' : u.role === 'provider' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                    {u.role || 'GUEST'}
                                  </span>
                                  {u.isApproved && <ShieldCheck className="w-3 h-3 text-green-500" />}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Detail column */}
                          <td className="px-8 py-8 align-top border-l border-white/5">
                            <div className="space-y-2">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Phone / Line</span>
                                <span className="text-xs text-white font-bold">{u.phone}</span>
                                <span className="text-[10px] text-yellow-500 font-black">LINE: {u.lineId || '-'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Bank Account</span>
                                <span className="text-xs text-gray-300">{u.bankName}</span>
                                <span className="text-xs font-mono text-gray-500">{u.bankAccountNo}</span>
                              </div>
                            </div>
                          </td>

                          {/* Registration column */}
                          <td className="px-8 py-8 align-top border-l border-white/5">
                            <div className="flex flex-col justify-between h-full">
                              <div>
                                <p className="text-xs font-black text-white">{u.registeredAt}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Joined Date</p>
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-purple-500" />
                                  <span className="text-sm font-black text-white">{daysActive} วัน</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">อยู่ในระบบมาแล้ว</p>
                              </div>
                            </div>
                          </td>

                          {/* Activity history column */}
                          <td className="px-8 py-8 align-top border-l border-white/5">
                            <div className="min-w-[400px]">
                              {u.role === 'renter' ? (
                                <div className="space-y-4">
                                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Subscription History (ประวัติการเช่า)</p>
                                  {u.subscriptions && u.subscriptions.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                      {u.subscriptions.map((sub, idx) => {
                                        const pkg = packages.find(p => p.id === sub.packageId);
                                        return (
                                          <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group/sub">
                                            <div className="flex justify-between items-start mb-2">
                                              <span className="text-sm font-black text-white uppercase tracking-tight">EA: {pkg?.name || sub.packageId}</span>
                                              <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                                {sub.status}
                                              </span>
                                            </div>
                                            <div className="flex gap-6">
                                              <div>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">Start Date</p>
                                                <p className="text-[11px] font-black text-gray-300">{sub.startDate}</p>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">End Date</p>
                                                <p className="text-[11px] font-black text-gray-300">{sub.endDate}</p>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">Account</p>
                                                <p className="text-[11px] font-black text-blue-500">{sub.tradingAccount || '-'}</p>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-600 italic">No rental history found</p>
                                  )}
                                </div>
                              ) : u.role === 'provider' ? (
                                <div className="space-y-4">
                                  <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Provider History (ประวัติการปล่อยเช่า)</p>
                                  {userEAs.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                      {userEAs.map((pkg, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-black text-white uppercase tracking-tight">{pkg.name}</span>
                                            <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${pkg.status === 'active' ? 'bg-green-500 text-black' : 'bg-orange-500 text-white'}`}>
                                              {pkg.status}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-end">
                                            <div>
                                              <p className="text-[10px] font-bold text-gray-500 uppercase">Release Date</p>
                                              <p className="text-xs font-black text-gray-300">{u.registeredAt}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-[10px] font-bold text-gray-500 uppercase">Rentals</p>
                                              <p className="text-xs font-black text-yellow-500">{transactions.filter(t => t.packageId === pkg.id).length} ครั้ง</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-600 italic">No EA released yet</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-600 italic">Waiting for identity selection...</p>
                              )}
                            </div>
                          </td>

                          {/* Actions column */}
                          <td className="px-8 py-8 text-right align-top">
                            <button 
                              onClick={() => handleRejectUser(u.id)}
                              className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <Users className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                          <p className="text-gray-600 font-bold uppercase tracking-widest italic">
                            No users registered yet.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>


        {/* Transaction History */}
        <div className="mb-16">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-4">
              <CreditCard className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Transaction History</h2>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Receiving Bank</p>
              <p className="text-xs font-bold text-white">{bankInfo.bankName} - {bankInfo.accountNo}</p>
            </div>
          </div>
          
          <div className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Package</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Trading Credentials</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Slip</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.length > 0 ? transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{t.id}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{t.timestamp}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">{t.userName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{t.packageName}</td>
                      <td className="px-6 py-4">
                        {t.tradingAccount ? (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-blue-500 font-mono">ID: {t.tradingAccount}</p>
                            <p className="text-[10px] font-bold text-gray-500 font-mono">PASS: {t.brokerPassword}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-700 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {t.slipUrl ? (
                          <div className="w-10 h-10 rounded border border-white/10 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-black">
                            <img src={t.slipUrl} alt="Slip" className="w-full h-full object-cover" onClick={() => window.open(t.slipUrl)} />
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-600 uppercase">No Slip</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-yellow-500">฿{t.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-black uppercase rounded-md border border-green-500/20">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-600 font-medium italic">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Package Editor */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <PackageIcon className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Package Management</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {editingPackages.map((pkg) => (
              <div key={pkg.id} className="bg-[#141414] border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-yellow-500">{pkg.name}</h3>
                  <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">{pkg.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Price (THB)</label>
                    <input 
                      type="number" 
                      value={pkg.price}
                      onChange={(e) => handleFieldChange(pkg.id, 'price', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Capital Range</label>
                    <input 
                      type="text" 
                      value={pkg.capitalRange}
                      onChange={(e) => handleFieldChange(pkg.id, 'capitalRange', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Current User Count</label>
                    <input 
                      type="number" 
                      value={pkg.userCount}
                      onChange={(e) => handleFieldChange(pkg.id, 'userCount', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Performance Stats</label>
                    <input 
                      type="text" 
                      value={pkg.performanceSummary}
                      onChange={(e) => handleFieldChange(pkg.id, 'performanceSummary', e.target.value)}
                      placeholder="Win Rate 80% | Profit 10%..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Video URL (Embed)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        type="text" 
                        value={pkg.videoUrl || ''}
                        onChange={(e) => handleFieldChange(pkg.id, 'videoUrl', e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500/50 outline-none transition-colors text-sm"
                      />
                    </div>
                    {pkg.videoUrl && (
                      <a href={pkg.videoUrl} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-xl hover:text-yellow-500 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={pkg.description}
                    onChange={(e) => handleFieldChange(pkg.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none transition-colors resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Historical Performance (5 Years+)</label>
                    <button 
                      onClick={() => addPerformancePoint(pkg.id)}
                      className="text-blue-500 text-[10px] font-black uppercase hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Year Data
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(pkg.performanceHistory || []).map((point, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          type="text" 
                          value={point.year}
                          onChange={(e) => updatePerformancePoint(pkg.id, i, 'year', e.target.value)}
                          placeholder="Year (e.g. 2023)"
                          className="w-24 bg-white/2 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-300 focus:border-yellow-500/50 outline-none"
                        />
                        <input 
                          type="text" 
                          value={point.return}
                          onChange={(e) => updatePerformancePoint(pkg.id, i, 'return', e.target.value)}
                          placeholder="Return (e.g. +45%)"
                          className="flex-grow bg-white/2 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-300 focus:border-yellow-500/50 outline-none"
                        />
                        <button 
                          onClick={() => removePerformancePoint(pkg.id, i)}
                          className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Features & Limits</label>
                    <button 
                      onClick={() => addFeature(pkg.id)}
                      className="text-yellow-500 text-[10px] font-black uppercase hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          type="text" 
                          value={feature}
                          onChange={(e) => handleFeatureChange(pkg.id, i, e.target.value)}
                          className="flex-grow bg-white/2 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-300 focus:border-yellow-500/50 outline-none"
                        />
                        <button 
                          onClick={() => removeFeature(pkg.id, i)}
                          className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ImageLightbox 
        images={lightbox.images}
        isOpen={lightbox.isOpen}
        initialIndex={lightbox.index}
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
