import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CreditCard, Activity, ArrowRight, Zap, Target, Shield, BarChart3, Star, Trophy, Calendar, Search, ShieldCheck, X, Check, ShieldAlert, Trash2 } from 'lucide-react';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import PackageCard from './components/PackageCard';
import AuthModal from './components/AuthModal';
import PackageDetail from './components/PackageDetail';
import { EA_PACKAGES as INITIAL_EA_PACKAGES } from './constants';
import { EAPackage, Transaction, BankInfo, User, Subscription } from './types';
import AdminPanel from './components/AdminPanel';
import PostEAForm from './components/PostEAForm';
import ProviderDashboard from './components/ProviderDashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [authType, setAuthType] = React.useState<'login' | 'register'>('login');
  const [selectedPackage, setSelectedPackage] = React.useState<EAPackage | null>(null);
  const [selectedTier, setSelectedTier] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'home' | 'admin' | 'post-ea' | 'identity-choice' | 'renter-setup' | 'provider-agreement' | 'provider-dashboard'>('home');
  const [currentUserEmail, setCurrentUserEmail] = React.useState<string | null>(() => {
    return localStorage.getItem('user_email');
  });
  const [rentedPackageIds, setRentedPackageIds] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('rented_ea_packages');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = React.useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ea_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = React.useState<User[]>(() => {
    const saved = localStorage.getItem('ea_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [bankInfo, setBankInfo] = React.useState<BankInfo>(() => {
    const saved = localStorage.getItem('bank_info');
    return saved ? JSON.parse(saved) : {
      bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
      accountNo: '506-402421-6',
      accountName: 'กิตติพงษ์ เอี่ยมสุภา'
    };
  });
  
  // Persist packages to localStorage
  const [packages, setPackages] = React.useState<EAPackage[]>(() => {
    const saved = localStorage.getItem('ea_packages_v2');
    return saved ? JSON.parse(saved) : INITIAL_EA_PACKAGES;
  });

  const updatePackages = (newPackages: EAPackage[], newBankInfo?: BankInfo) => {
    setPackages(newPackages);
    localStorage.setItem('ea_packages_v2', JSON.stringify(newPackages));
    if (newBankInfo) {
      setBankInfo(newBankInfo);
      localStorage.setItem('bank_info', JSON.stringify(newBankInfo));
    }
  };

  const handlePostEASubmit = (data: any) => {
    const videoUrl = data.videoFile ? URL.createObjectURL(data.videoFile) : undefined;
    const backtestImageUrls = data.backtestImages.map((file: File) => URL.createObjectURL(file));

    const newPackage: EAPackage = {
      id: `user-${Math.random().toString(36).substring(7)}` as any,
      name: data.name,
      category: data.category,
      price: parseInt(data.price) || 0,
      capitalRange: 'ตามความเหมาะสม',
      description: data.description,
      userCount: parseInt(data.currentUsers) || 0,
      usersLastMonth: parseInt(data.usersLastMonth) || 0,
      currentUsers: parseInt(data.currentUsers) || 0,
      winRate: data.winRate,
      tradingAssets: data.tradingAssets,
      recommendation: data.recommendation,
      performanceSummary: `Win Rate ${data.winRate} | Assets: ${data.tradingAssets}`,
      videoUrl: videoUrl,
      backtestImageUrls: backtestImageUrls,
      reviews: [],
      features: data.features || ['ระบบยืนยันจากผู้ใช้งาน', 'Backtest 5 ปี+', `Contact LINE: ${data.lineId}`],
      isUserSubmitted: true,
      status: 'pending',
      lineId: data.lineId,
      authorEmail: currentUserEmail || undefined,
      stats: {
        dailyWinRate: data.winRate,
        weeklyWinRate: data.winRate,
        monthlyWinRate: data.winRate,
        globalRank: packages.length + 1,
        totalActiveUsers: parseInt(data.currentUsers) || 0
      }
    };

    // Find the first index of a package with the same category, package type (tradingAssets), AND price
    const firstMatchIndex = packages.findIndex(
      pkg => pkg.category === data.category && 
             pkg.tradingAssets === data.tradingAssets &&
             pkg.price === parseInt(data.price)
    );

    let updatedPackages;
    if (firstMatchIndex !== -1) {
      // Insert right after the first matching EA
      updatedPackages = [
        ...packages.slice(0, firstMatchIndex + 1),
        newPackage,
        ...packages.slice(firstMatchIndex + 1)
      ];
    } else {
      // If no exact match (category + type + price), try category + type
      const secondMatchIndex = packages.findIndex(
        pkg => pkg.category === data.category && pkg.tradingAssets === data.tradingAssets
      );
      
      if (secondMatchIndex !== -1) {
        updatedPackages = [
          ...packages.slice(0, secondMatchIndex + 1),
          newPackage,
          ...packages.slice(secondMatchIndex + 1)
        ];
      } else {
        // Fallback to searching just category
        const thirdMatchIndex = packages.findIndex(pkg => pkg.category === data.category);
        if (thirdMatchIndex !== -1) {
          updatedPackages = [
            ...packages.slice(0, thirdMatchIndex + 1),
            newPackage,
            ...packages.slice(thirdMatchIndex + 1)
          ];
        } else {
          updatedPackages = [...packages, newPackage];
        }
      }
    }

    updatePackages(updatedPackages);
    setView('home');
  };

  const handleDeletePackage = (id: string) => {
    const newPackages = packages.filter(pkg => pkg.id !== id);
    setPackages(newPackages);
    localStorage.setItem('ea_packages_v2', JSON.stringify(newPackages));
    if (selectedPackage?.id === id) {
      setSelectedPackage(null);
    }
  };

  const requireAuth = (action: () => void) => {
    if (!isLoggedIn) {
      openAuth('register');
      return;
    }
    action();
  };

  const calculateBusinessDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    let curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const getTopProviderData = () => {
    const providerStats: Record<string, number> = {};
    packages.filter(p => !!p.isUserSubmitted && p.status === 'active').forEach(p => {
      const owner = p.features.find(f => f.startsWith('Contact LINE:'))?.split(': ')[1] || 'Unknown';
      providerStats[owner] = (providerStats[owner] || 0) + (p.stats?.totalActiveUsers || 0);
    });

    const topOwner = Object.entries(providerStats).sort((a, b) => b[1] - a[1])[0];
    return topOwner ? { name: topOwner[0], count: topOwner[1] } : null;
  };

  const topProvider = getTopProviderData();
  const [showCheckInModal, setShowCheckInModal] = React.useState(false);

  React.useEffect(() => {
    if (isLoggedIn && currentUserEmail) {
      const user = users.find(u => u.email === currentUserEmail);
      const today = new Date().toISOString().split('T')[0];
      if (user && user.lastCheckInDate !== today) {
        setShowCheckInModal(true);
      }
    }
  }, [isLoggedIn, currentUserEmail, users]);

  const handleCheckIn = () => {
    if (!currentUserEmail) return;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const userIndex = users.findIndex(u => u.email === currentUserEmail);
    if (userIndex === -1) return;
    
    const user = users[userIndex];
    if (user.lastCheckInDate === today) {
      alert('วันนี้คุณเช็กอินไปแล้ว! (Already Checked-in Today)');
      return;
    }

    const newCheckIn = { date: today, timestamp: now.toISOString() };
    const history = [...(user.checkInHistory || []), newCheckIn];
    
    // Check for 3-month streak (90 days approximation for simplicity, or we can check actual months)
    // For this demo, let's say 90 days total check-ins grants the reward
    const totalCheckIns = history.length;
    const isBigRewardDay = totalCheckIns > 0 && totalCheckIns % 90 === 0;

    const updatedUser = {
      ...user,
      lastCheckInDate: today,
      checkInHistory: history
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    setUsers(updatedUsers);
    localStorage.setItem('ea_users', JSON.stringify(updatedUsers));
    
    setShowCheckInModal(false);

    if (isBigRewardDay) {
      alert('🎉 ยินดีด้วย! คุณเช็กอินครบ 3 เดือน (90 วัน) รับสิทธิ์รัน EA ฟรี 1 อาทิตย์!');
    } else {
      alert('เช็กอินสำเร็จ! สะสมให้ครบ 3 เดือนเพื่อรับสิทธิ์รัน EA ฟรี');
    }
  };

  const [expiringSubscriptions, setExpiringSubscriptions] = React.useState<any[]>([]);
  const [stoppedSubscriptions, setStoppedSubscriptions] = React.useState<any[]>([]);

  // Check for expired subscriptions
  React.useEffect(() => {
    const checkExpirations = () => {
      if (!isLoggedIn || !currentUserEmail) return;
      
      const now = new Date();
      let hasChanges = false;
      let newStopped: any[] = [];
      let newExpiring: any[] = [];

      const updatedUsers = users.map(user => {
        if (user.email !== currentUserEmail) return user;

        const updatedSubs = (user.subscriptions || []).map(sub => {
          const startDate = new Date(sub.startDate);
          const diffTime = Math.abs(now.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (sub.status === 'active') {
            // Expiring in 5 days (25-29 days out)
            if (diffDays >= 25 && diffDays < 30) {
              newExpiring.push(sub);
            }
            
            // If 30 days passed and not paid
            if (diffDays >= 30) {
              hasChanges = true;
              newStopped.push(sub);
              return { ...sub, status: 'expired' as const, isPaid: false };
            }
          } else if (sub.status === 'expired') {
            newStopped.push(sub);
          }
          return sub;
        });
        
        if (hasChanges) {
          return { ...user, subscriptions: updatedSubs };
        }
        return user;
      });

      setStoppedSubscriptions(newStopped);
      setExpiringSubscriptions(newExpiring);

      if (hasChanges) {
        setUsers(updatedUsers);
        localStorage.setItem('ea_users', JSON.stringify(updatedUsers));
      }
    };

    checkExpirations();
  }, [users, isLoggedIn, currentUserEmail]);

  React.useEffect(() => {
    if (isLoggedIn && currentUserEmail) {
      const user = users.find(u => u.email === currentUserEmail);
      if (user?.subscriptions) {
        const now = new Date();
        const expiring = user.subscriptions.filter(sub => {
          if (sub.status !== 'active') return false;
          const endDate = new Date(sub.endDate);
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 5;
        });
        setExpiringSubscriptions(expiring);

        // Auto-suspend check
        const hasExpired = user.subscriptions.some(sub => sub.status === 'active' && new Date(sub.endDate) < now);
        if (hasExpired) {
          const updatedUsers = users.map(u => {
            if (u.email === currentUserEmail) {
              return {
                ...u,
                subscriptions: u.subscriptions.map(sub => 
                  (sub.status === 'active' && new Date(sub.endDate) < now) 
                    ? { ...sub, status: 'suspended' as const } 
                    : sub
                )
              };
            }
            return u;
          });
          setUsers(updatedUsers);
          localStorage.setItem('ea_users', JSON.stringify(updatedUsers));
        }
      }
    }
  }, [isLoggedIn, currentUserEmail, users]);

  const handleRentPackage = (pkg: EAPackage, slipUrl?: string, tradingAccount?: string, brokerPassword?: string) => {
    requireAuth(() => {
      // Create Subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      const newSubscription: Subscription = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        packageId: pkg.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        remainingBusinessDays: calculateBusinessDays(startDate, endDate),
        tradingAccount,
        brokerPassword,
        userEmail: currentUserEmail || '',
        isPaid: true // Initial purchase is considered paid
      };

      // Update User
      const updatedUsers = users.map(u => {
        if (u.email === currentUserEmail) {
          const subs = u.subscriptions || [];
          return { ...u, subscriptions: [newSubscription, ...subs] };
        }
        return u;
      });
      setUsers(updatedUsers);
      localStorage.setItem('ea_users', JSON.stringify(updatedUsers));

      // Add to rented IDs
      if (!rentedPackageIds.includes(pkg.id)) {
        const newRented = [...rentedPackageIds, pkg.id];
        setRentedPackageIds(newRented);
        localStorage.setItem('rented_ea_packages', JSON.stringify(newRented));
      }

      // Add to transactions
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        userName: currentUserEmail || 'K. Investor (Guest)',
        packageName: pkg.name,
        packageId: pkg.id as any,
        amount: pkg.price,
        status: 'completed',
        timestamp: new Date().toLocaleString('th-TH'),
        bankName: bankInfo.bankName,
        accountNo: bankInfo.accountNo,
        slipUrl,
        tradingAccount,
        brokerPassword
      };

      const newTransactions = [newTransaction, ...transactions];
      setTransactions(newTransactions);
      localStorage.setItem('ea_transactions', JSON.stringify(newTransactions));

      // Increment user count for the package
      const newPackages = packages.map(p => 
        p.id === pkg.id ? { ...p, userCount: p.userCount + 1 } : p
      );
      updatePackages(newPackages);
    });
  };

  const handleLogin = (userData?: Partial<User>) => {
    const ADMIN_EMAIL = 'x83804138@gmail.com';
    const ADMIN_PASS = 'Tarkitti-47!';

    if (userData?.email === ADMIN_EMAIL && userData?.password === ADMIN_PASS) {
      setIsLoggedIn(true);
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('is_admin', 'true');
      if (userData?.email) {
        setCurrentUserEmail(userData.email);
        localStorage.setItem('user_email', userData.email);
      }
      setIsAuthOpen(false);
      setView('admin');
      return;
    }

    setIsLoggedIn(true);
    localStorage.setItem('is_logged_in', 'true');
    localStorage.removeItem('is_admin');
    if (userData?.email) {
      setCurrentUserEmail(userData.email);
      localStorage.setItem('user_email', userData.email);
    }
    setIsAuthOpen(false);
    setShowCheckInModal(true);

    if (userData && authType === 'register') {
      const newUser: User = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        email: userData.email || '',
        password: userData.password, // Password as requested
        phone: userData.phone || '',
        lineId: userData.lineId || '',
        bankName: userData.bankName || '',
        bankAccountNo: userData.bankAccountNo || '',
        registeredAt: new Date().toLocaleString('th-TH'),
        subscriptions: [],
        checkInHistory: [],
        role: undefined // New users start without a role
      };
      const updatedUsers = [newUser, ...users];
      setUsers(updatedUsers);
      localStorage.setItem('ea_users', JSON.stringify(updatedUsers));
      
      // Redirect to identity choice after registration
      setView('identity-choice');
    } else if (isLoggedIn && currentUserEmail) {
      // Check if logged in user has a role
      const user = users.find(u => u.email === (userData?.email || currentUserEmail));
      if (user && !user.role) {
        setView('identity-choice');
      } else {
        setShowCheckInModal(true);
      }
    }
  };

  const handleSelectRole = (role: 'renter' | 'provider') => {
    if (!currentUserEmail) return;
    
    const updatedUsers = users.map(u => {
      if (u.email === currentUserEmail) {
        return { ...u, role };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('ea_users', JSON.stringify(updatedUsers));
    
    if (role === 'renter') {
      setView('renter-setup');
    } else {
      setView('provider-agreement');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('is_logged_in', 'false');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_email');
    setCurrentUserEmail(null);
    setView('home');
  };

  const handleAddReview = (packageId: string, rating: number, comment: string) => {
    const newPackages = packages.map(pkg => {
      if (pkg.id === packageId) {
        return {
          ...pkg,
          reviews: [
            {
              userName: 'K. Investor (You)',
              comment,
              rating,
              date: new Date().toISOString().split('T')[0]
            },
            ...pkg.reviews
          ]
        };
      }
      return pkg;
    });
    updatePackages(newPackages);
  };

  const openAuth = (type: 'login' | 'register') => {
    setAuthType(type);
    setIsAuthOpen(true);
  };

  const handleSelectPackage = (pkg: EAPackage) => {
    requireAuth(() => {
      setSelectedPackage(pkg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleAdminClick = () => {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (isLoggedIn && isAdmin) {
      setView('admin');
    } else {
      // Security Alert Trigger
      const now = new Date().toLocaleString('th-TH');
      const intruderInfo = {
        email: currentUserEmail || 'Guest (Unknown)',
        timestamp: now,
        action: 'Attempted to access Admin Panel',
        status: 'Blocked'
      };
      
      const alerts = JSON.parse(localStorage.getItem('security_alerts') || '[]');
      localStorage.setItem('security_alerts', JSON.stringify([intruderInfo, ...alerts].slice(0, 50)));

      // Simulate Email Dispatch
      console.warn(`[SECURITY ALERT] Immediate email notification sent to x83804138@gmail.com for intrusion attempt by ${intruderInfo.email}`);
      
      setAuthType('login');
      setIsAuthOpen(true);
      alert('⚠️ ระบบความปลอดภัย: การพยายามเข้าถึงหน้าผู้ดูแลระบบโดยไม่ได้รับอนุญาตถูกบันทึกไว้แล้ว และแจ้งเตือนไปยังอีเมลผู้ดูแลระบบทันที\n\n(Access Denied: unauthorized attempt logged and notified to admin)');
    }
  };

  const handlePostEAClick = () => {
    if (!isLoggedIn) {
      openAuth('register');
      return;
    }
    setView('post-ea');
  };

  const currentUser = users.find(u => u.email === currentUserEmail);
  const isAdmin = currentUserEmail === 'x83804138@gmail.com';

  // Force logout if user was deleted by admin
  React.useEffect(() => {
    if (isLoggedIn && currentUserEmail && users.length > 0 && !isAdmin) {
      const userExists = users.some(u => u.email === currentUserEmail);
      if (!userExists) {
        handleLogout();
      }
    }
  }, [isLoggedIn, currentUserEmail, users, isAdmin]);

  // Lock scroll when approval is pending
  React.useEffect(() => {
    const isPending = isLoggedIn && !isAdmin && currentUser && currentUser.role && !currentUser.isApproved && view !== 'renter-setup' && view !== 'provider-agreement' && view !== 'identity-choice';
    if (isPending) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoggedIn, isAdmin, currentUser, view]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-yellow-500/30 selection:text-yellow-500 relative">
      <Navbar 
        onLoginClick={() => openAuth('login')}
        onRegisterClick={() => openAuth('register')}
        onLogoutClick={handleLogout}
        onAdminClick={handleAdminClick}
        onProviderDashboardClick={() => setView('provider-dashboard')}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onHomeClick={() => {
          setView('home');
          setSelectedPackage(null);
          setSelectedTier(null);
          setSelectedCategory(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Subscription Expiry Banner */}
      <AnimatePresence>
        {stoppedSubscriptions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-red-500 font-black text-sm uppercase tracking-tighter">
                    EA ของคุณหยุดทำงาน (Service Stopped)
                  </p>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest leading-none mt-1">
                    เนื่องจากครบกำหนด 30 วันและยังไม่ได้ชำระเงิน กรุณาติดต่อแอดมินเพื่อต่ออายุ
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setStoppedSubscriptions([])}
                className="text-white/40 hover:text-white transition-colors p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
        {expiringSubscriptions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-500/10 border-b border-yellow-500/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-yellow-500 font-black text-sm uppercase tracking-tighter">
                    การแจ้งเตือนรอบชำระเงิน (Subscription Alert)
                  </p>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    อีก 5 วัน EA ประจำเดือนนี้จะหมดเวลา หากสนใจ กรุณาชำระเงินครั้งถัดไป
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setExpiringSubscriptions([])}
                className="text-white/40 hover:text-white transition-colors p-2"
              >
                <Zap className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-in Modal Overlay */}
      <AnimatePresence>
        {showCheckInModal && isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCheckInModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500" />
              
              <div className="p-10 flex flex-col items-center text-center relative">
                {users.find(u => u.email === currentUserEmail)?.lastCheckInDate === new Date().toISOString().split('T')[0] && (
                  <button 
                    onClick={() => setShowCheckInModal(false)}
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8 relative group">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-all rounded-full" />
                  <Calendar className="w-12 h-12 text-blue-500 relative z-10" />
                </div>

                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                  Welcome {users.find(u => u.email === currentUserEmail)?.lastCheckInDate === new Date().toISOString().split('T')[0] ? 'Back!' : 'Today!'}
                </h2>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest leading-relaxed mb-8">
                  อย่าลืมเช็กกินประจำวันเพื่อรับรางวัลพิเศษ<br />
                  สะสมครบ 3 เดือน รับสิทธิ์รัน EA ฟรี 1 อาทิตย์
                </p>

                <div className="w-full grid grid-cols-1 gap-4 mb-10">
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Check-in Status</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white leading-none">
                        {users.find(u => u.email === currentUserEmail)?.checkInHistory?.length || 0}
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase mb-1">Days Total</span>
                    </div>
                  </div>
                </div>

                {users.find(u => u.email === currentUserEmail)?.lastCheckInDate === new Date().toISOString().split('T')[0] ? (
                  <button
                    onClick={() => setShowCheckInModal(false)}
                    className="w-full py-5 bg-green-500/20 text-green-500 border border-green-500/30 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                  >
                    <ShieldCheck className="w-6 h-6" />
                    วันนี้คุณเช็กอินแล้ว
                  </button>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    className="w-full py-5 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_rgba(59,130,246,0.2)] flex items-center justify-center gap-3 group"
                  >
                    <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    เช็กอินรับรางวัลประจำวัน
                  </button>
                )}
                
                <button 
                  onClick={() => setShowCheckInModal(false)}
                  className="mt-6 text-[10px] font-black text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
                >
                  {users.find(u => u.email === currentUserEmail)?.lastCheckInDate === new Date().toISOString().split('T')[0] ? 'ปิดหน้าต่าง' : 'ไว้ทำภายหลัง (Remind me later)'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'admin' ? (
          <AdminPanel 
            key="admin"
            packages={packages} 
            transactions={transactions}
            users={users}
            bankInfo={bankInfo}
            onUpdatePackages={updatePackages} 
            onUpdateUsers={(newUsers) => {
              setUsers(newUsers);
              localStorage.setItem('ea_users', JSON.stringify(newUsers));
            }}
            onBack={() => setView('home')}
          />
        ) : view === 'renter-setup' ? (
          <motion.div
            key="renter-setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen py-32 px-4 flex items-center justify-center bg-[#0A0A0A]"
          >
            <div className="max-w-4xl w-full">
              <div className="p-12 bg-[#111] border border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-8">
                    <ShieldCheck className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">Setup Your Trading Account</h2>
                  <p className="text-gray-400 font-medium leading-relaxed mb-10 max-w-2xl text-lg">
                    ยินดีต้อนรับเข้าพักผู้เช่า! เพื่อประสิทธิภาพและความปลอดภัยสูงสุดในการทำงานของ EA เราแนะนำให้คุณเปิดบัญชีเทรดกับโบรกเกอร์พาร์ทเนอร์ของเราผ่านลิงก์ด้านล่างนี้
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] hover:border-blue-500/30 transition-colors group">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Step 01: Registration</p>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">เปิดบัญชีเทรด Global</h4>
                      <p className="text-gray-500 text-sm mb-6 leading-relaxed">คลิกปุ่มด้านล่างเพื่อไปยังหน้าสมัครสมาชิกโบรกเกอร์ (คำเตือน: ต้องใส่รหัสอ้างอิง K2gCrpY1 เท่านั้น)</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('K2gCrpY1');
                          alert('คัดลอกรหัสเชิญเรียบร้อยแล้ว! (K2gCrpY1) กรุณาใช้รหัสนี้ในการสมัครบัญชีเทรด หากไม่ใส่จะไม่ผ่านการตรวจสอบ');
                          setTimeout(() => {
                            window.open('https://vigco.co/la-com-inv/th/K2gCrpY1', '_blank');
                          }, 100);
                        }}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                      >
                        Open Trading Account
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-8 bg-green-500/5 border border-green-500/10 rounded-[32px] hover:border-green-500/30 transition-colors group">
                      <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4">Step 02: Verification</p>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">ยืนยันตัวตนกับเแอดมิน</h4>
                      <p className="text-gray-500 text-sm mb-6 leading-relaxed">เมื่อเปิดบัญชีเสร็จสิ้น กรุณาแอดไลน์และแจ้งอีเมลเพื่ออนุมัติการใช้งานเข้าสู่ระบบ</p>
                      <a 
                        href="https://line.me/R/ti/p/@116ksvuu"
                        target="_blank"
                        className="w-full py-4 bg-[#06C755] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                      >
                        Line ID: @116ksvuu
                        <Target className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">Warning: Invitation Code <span className="text-white font-black">K2gCrpY1</span> is REQUIRED</p>
                    </div>
                    <button 
                      onClick={() => setView('home')}
                      className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      เสร็จสิ้นและรอการอนุมัติ (Done & Wait)
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === 'provider-agreement' ? (
          <motion.div
            key="provider-agreement"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen py-32 px-4 flex items-center justify-center bg-[#0A0A0A]"
          >
            <div className="max-w-4xl w-full">
              <div className="p-12 bg-[#111] border border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mb-8">
                    <Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6 whitespace-nowrap">Provider Partner Agreement</h2>
                  <p className="text-gray-400 font-medium leading-relaxed mb-10 max-w-2xl text-lg">
                    ข้อตกลงการปล่อยเช่าและแบ่งปันกลยุทธ์ (Revenue Share Agreement) โปรดอ่านเงื่อนไขก่อนเริ่มต้นเสนอระบบเทรดอัจฉริยะของคุณเข้าสู่ Marketplace
                  </p>

                  <div className="space-y-6 mb-12">
                     <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <h4 className="text-white font-black uppercase tracking-tight mb-2">1. ข้อตกลงส่วนแบ่งรายได้ (Revenue Share)</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">นักพัฒนาจะได้รับส่วนแบ่งรายได้ 10% ทุกเดือน เมื่อมีผู้ใช้งานเช่า EA ขั้นต่ำ 50 ท่านขึ้นไป นอกนั้นระบบจะคำนวณตามมาตรฐานสากล</p>
                     </div>
                     <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <h4 className="text-white font-black uppercase tracking-tight mb-2">2. มาตรฐานระบบและการตรวจสอบ</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">EA ทุกตัวที่ส่งเข้ามาต้องผ่านการตรวจสอบ Backtest อย่างน้อย 5 ปี และมีผลงานรันสด (Myfxbook/Veried) เพื่อความน่าเชื่อถือ</p>
                     </div>
                     <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <h4 className="text-white font-black uppercase tracking-tight mb-2">3. การจัดอันดับและเงินรางวัลประจำเดือน</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">แสดงผลงานใน Global Ranking ชิงรางวัลประจำเดือน สูงถึง 25% สำหรับอันดับ Top Performance ประจำเดือนนั้นๆ</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <button 
                      onClick={() => setView('post-ea')}
                      className="flex-1 py-5 bg-yellow-500 text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_20px_40px_rgba(234,179,8,0.1)] flex items-center justify-center gap-3"
                    >
                      Accept & Post My EA
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setView('identity-choice')}
                      className="px-10 py-5 bg-white/5 text-white/50 border border-white/5 rounded-2xl font-black text-sm uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === 'post-ea' ? (
          <PostEAForm 
            packages={packages}
            onBack={() => setView('home')}
            onSubmit={handlePostEASubmit}
          />
        ) : view === 'provider-dashboard' ? (
          <ProviderDashboard 
            packages={packages}
            users={users}
            currentUserEmail={currentUserEmail || ''}
            onBack={() => setView('home')}
            onDeletePackage={handleDeletePackage}
          />
        ) : view === 'identity-choice' ? (
          <motion.div
            key="identity-choice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen flex items-center justify-center py-20 px-4 bg-[#0A0A0A]"
          >
            <div className="max-w-6xl w-full">
              <div className="text-center mb-16">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">
                    Professional Registration • ยินดีต้อนรับสมาชิกใหม่
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">
                    Welcome to the<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-yellow-500">EA Marketplace</span>
                  </h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-xl mx-auto">
                    โปรดเลือกสถานะการใช้งานของคุณเพื่อเริ่มต้น เราจะปรับแต่งหน้าตาแอปพลิเคชันให้เหมาะสมกับเป้าหมายของคุณที่สุด
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Path 1: Renters */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-8 md:p-12 bg-[#141414] border border-white/5 rounded-[56px] relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-10">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[28px] flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-500">
                      <Users className="w-10 h-10 text-blue-500 group-hover:text-black transition-colors" />
                    </div>
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">ผู้เช่าเทรด (Renter)</h2>
                      <p className="text-blue-500/60 text-xs font-black uppercase tracking-widest italic">"สร้างกำไรอัตโนมัติบนพอร์ตของคุณ"</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    {[
                      'เข้าถึง Marketplace รวม EA ชั้นนำระดับโลก',
                      'ระบบ Copy Trade ความแม่นยำสูง (Low Latency)',
                      'ถอนกำไรได้ทันที 24ชม. ผ่านโบรกเกอร์พาร์ทเนอร์',
                      'ฟรี! เช็กอินรายวันรับแต้มสะสมใช้งาน EA ครบ 3 เดือน รับ สิทธิ์รัน EA ฟรี 1 อาทิตย์ ตามเเพ็คเกจที่ครบเงื่อนไข'
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-4 text-sm font-medium text-gray-400">
                        <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                          <Check className="w-3 h-3 text-blue-500" />
                        </div>
                        <span className="leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl mb-10 group-hover:border-blue-500/30 transition-colors">
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5" /> Requirement Check
                     </p>
                      <div 
                        onClick={() => {
                          navigator.clipboard.writeText('K2gCrpY1');
                          alert('คัดลอกรหัสเชิญเรียบร้อยแล้ว! (K2gCrpY1)');
                          setTimeout(() => {
                            window.open('https://vigco.co/la-com-inv/th/K2gCrpY1', '_blank');
                          }, 100);
                        }}
                        className="p-4 bg-black/40 border border-white/5 rounded-2xl hover:bg-black transition-all cursor-pointer group/link flex items-center justify-between"
                      >
                        <div className="text-left">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 leading-none">Important Warning</p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">
                            คำเตือน: หากไม่ใส่รหัสอ้างอิง <span className="text-white underline font-black">K2gCrpY1</span> จะไม่ผ่านการตรวจสอบ
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center group-hover/link:bg-yellow-500 transition-colors">
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover/link:text-black transition-colors" />
                        </div>
                      </div>
                  </div>

                  <button 
                    onClick={() => handleSelectRole('renter')}
                    className="w-full py-6 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.15)] flex items-center justify-center gap-3 active:scale-95"
                  >
                    Start Renting Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Path 2: Providers */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-8 md:p-12 bg-[#141414] border border-white/5 rounded-[56px] relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-10">
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-[28px] flex items-center justify-center shrink-0 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:scale-110 transition-all duration-500">
                      <Zap className="w-10 h-10 text-yellow-500 group-hover:text-black transition-colors fill-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">นักพัฒนา (Provider)</h2>
                      <p className="text-yellow-500/60 text-xs font-black uppercase tracking-widest italic">"ขายกลยุทธ์ สร้างรายได้ไร้ขีดจำกัด"</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    {[
                      'นำเสนอ EA ของคุณให้ผู้ใช้กว่าหมื่นคนเห็น',
                      'รับส่วนแบ่ง Revenue Share 10% ทุกเดือน',
                      'ระบบ Billing และจัดการใบอนุญาตอัตโนมัติ',
                      'แสดงผลงานใน Global Ranking ชิงรางวัลประจำเดือน สูงถึง 25%'
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-4 text-sm font-medium text-gray-400">
                        <div className="w-5 h-5 bg-yellow-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-yellow-500/20">
                          <Check className="w-3 h-3 text-yellow-500" />
                        </div>
                        <span className="leading-relaxed">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl mb-10 group-hover:border-yellow-500/30 transition-colors">
                     <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Star className="w-3.5 h-3.5 fill-yellow-500" /> Professional Dashboard
                     </p>
                     <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                       "รับค่านายหน้าและผลตอบแทนส่วนแบ่งตลาดเริ่มต้น 50 ท่านขึ้นไป จ่ายตรงทุกสิ้นเดือนผ่านระบบออโต้"
                     </p>
                  </div>

                  <button 
                    onClick={() => handleSelectRole('provider')}
                    className="w-full py-6 bg-yellow-500 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-yellow-400 transition-all shadow-[0_20px_40px_rgba(234,179,8,0.15)] flex items-center justify-center gap-3 active:scale-95"
                  >
                    Host My Strategy
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>

              <div className="mt-16 text-center">
                <button 
                  onClick={() => setView('home')}
                  className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                >
                  ข้ามขั้นตอนการเลือก (Skip for now)
                </button>
              </div>
            </div>
          </motion.div>
        ) : !selectedPackage ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
              {/* ... (existing hero content) */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="max-w-3xl">
                  {topProvider && (
                    <div className="flex flex-wrap gap-4 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl group overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none mb-1">Top Lender of the Month</p>
                          <p className="text-white font-black text-sm uppercase tracking-tighter">🏆 {topProvider.name}</p>
                        </div>
                      </motion.div>

                      {isLoggedIn && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCheckIn}
                          className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                        >
                          <Calendar className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform" />
                          <div className="text-left">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Daily Reward</p>
                            <p className="text-white font-black text-sm uppercase tracking-tighter">กิจกรรมเช็กอินประจำวัน</p>
                          </div>
                        </motion.button>
                      )}
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-yellow-500 uppercase tracking-widest mb-6"
                  >
                    <Zap className="w-3 h-3 fill-yellow-500" />
                    #1 EA Marketplace in Thailand
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 break-words"
                  >
                    INVEST <span className="text-yellow-500 underline decoration-yellow-500/30 underline-offset-8">SMARTER</span> WITH AUTOMATION.
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl"
                  >
                    เปลี่ยนการเทรดให้เป็นเรื่องง่ายด้วยระบบ AI อัจฉริยะที่ออกแบบมาเพื่อ XAUUSD, Forex, และ Commodities โดยเฉพาะ พร้อมระบบจัดการทุนที่แม่นยำ
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-4 items-center"
                  >
                    <button 
                      onClick={() => {
                        if (isLoggedIn) {
                          if (currentUser?.role === 'provider') {
                            setView('provider-dashboard');
                          } else {
                            document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          openAuth('register');
                        }
                      }}
                      className="group flex items-center gap-3 bg-white text-black px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                    >
                      {isLoggedIn 
                        ? (currentUser?.role === 'provider' ? 'จัดการ EA ของคุณ (My Dashboard)' : 'เริ่มเช่าใช้งานเลย') 
                        : 'สมัครสมาชิกเพื่อเริ่มใช้งาน'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    {!isLoggedIn && (
                      <button 
                        onClick={() => openAuth('login')}
                        className="px-8 py-5 border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                      >
                        เข้าสู่ระบบ
                      </button>
                    )}
                    {isLoggedIn && (
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white">{packages.filter(p => p.status === 'active').length}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Total Packages</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white">3</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Asset Categories</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            {isLoggedIn && (
              <section id="stats" className="py-20 bg-white/2 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="ผู้ใช้งานต่อวัน" value="1,280" icon={Users} trend="+12.5%" />
                    <StatCard label="ผู้ใช้งานต่อเดือน" value="42,500" icon={Activity} trend="+8.2%" />
                    <StatCard label="รายการชำระเงิน" value="8,942" icon={CreditCard} />
                    <StatCard label="คะแนนความพึงพอใจ" value="4.9/5" icon={Shield} />
                  </div>
                </div>
              </section>
            )}

            {/* Simple Steps for New Users */}
            {isLoggedIn && !currentUser?.role && (
              <section className="py-24 bg-black relative overflow-hidden border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                  <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">Start Your Journey in 2 Steps</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">ขั้นตอนง่ายๆ ในการเริ่มต้นทำกำไรกับเรา</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      {
                        step: "01",
                        title: "Choose Identity",
                        desc: "เลือกสถานะผู้เช่า (Renter) หรือนักพัฒนา (Provider) หลังสมัครสมาชิก",
                        icon: <Users className="w-6 h-6 text-blue-500" />
                      },
                      {
                        step: "02",
                        title: "Open Broker Account",
                        desc: "เปิดบัญชีผ่าน Link พาร์ทเนอร์ของเราเพื่อความปลอดภัยและเสถียรภาพสูงสุด",
                        icon: <ShieldCheck className="w-6 h-6 text-yellow-500" />,
                        link: "https://vigco.co/la-com-inv/th/K2gCrpY1",
                        code: "K2gCrpY1"
                      }
                    ].map((item, i) => (
                      <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] relative hover:border-white/10 transition-colors group">
                        <div className="text-[64px] font-black text-white/5 absolute top-4 right-8 font-mono group-hover:text-white/10 transition-colors leading-none">{item.step}</div>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3">{item.title}</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{item.desc}</p>
                        {item.link && (
                          <div 
                            onClick={() => window.open(item.link, '_blank')}
                            className="flex items-center gap-2 text-[10px] font-black text-yellow-500 uppercase tracking-widest hover:text-yellow-400 cursor-pointer pt-2 group/btn"
                          >
                            Register Now <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Packages Section */}
            {isLoggedIn && (!currentUser?.role || currentUser?.role === 'renter' || currentUser?.role === 'admin') && (
              <section id="packages" className="py-32 bg-[#0F0F0F] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-[#0A0A0A] to-transparent z-0" />
                
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-8">
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mb-4">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase break-words">
                          {!selectedTier ? 'เลือกเเพ็คเกจ' : !selectedCategory ? `เเพ็คเกจ ${selectedTier}` : `เเพ็คเกจ ${selectedTier} • ${selectedCategory}`}
                        </h2>
                        {!selectedTier && (
                          <div className="flex flex-col shrink-0">
                            <span className="text-2xl sm:text-4xl font-black text-white leading-none">{packages.filter(p => p.status === 'active').length}</span>
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] whitespace-nowrap">Total Packages</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 max-w-xl font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                        {!selectedTier 
                          ? 'เลือกเเพ็คเกจที่เหมาะสมกับงบประมาณและการลงทุนของคุณ'
                          : !selectedCategory 
                            ? `แสดงหมวดหมู่สินทรัพย์ที่มี EA ปล่อยเช่าในเเพ็คเกจ ${selectedTier}`
                            : `แสดงรายการ EA ทั้งหมดในเเพ็คเกจ ${selectedTier} หมวดหมู่ ${selectedCategory}`}
                      </p>
                    </div>
                    {selectedTier && (
                      <button 
                        onClick={() => {
                          if (selectedCategory) setSelectedCategory(null);
                          else setSelectedTier(null);
                        }}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        ย้อนกลับ (Back)
                      </button>
                    )}
                  </div>

                  <div className="text-center mt-16 mb-12 px-4 max-w-3xl mx-auto">
                    <p className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
                      การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลก่อนตัดสินใจลงทุน • เงื่อนไขเป็นไปตามที่บริษัทกำหนด
                    </p>
                  </div>

                  {/* Level 1: Tier Selection */}
                  {!selectedTier && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {['Basic', 'Standard', 'Pro', 'VIP', 'VVIP', 'VVVIP'].map((tier) => {
                        const tierConfigs: Record<string, any> = {
                          'Basic': { color: 'text-blue-500', glow: 'bg-blue-500/20', border: 'border-blue-500/20', desc: 'เริ่มต้นการลงทุน' },
                          'Standard': { color: 'text-green-500', glow: 'bg-green-500/20', border: 'border-green-500/20', desc: 'ประสิทธิภาพมาตรฐาน' },
                          'Pro': { color: 'text-purple-500', glow: 'bg-purple-500/20', border: 'border-purple-500/20', desc: 'สำหรับมืออาชีพ' },
                          'VIP': { color: 'text-yellow-500', glow: 'bg-yellow-500/20', border: 'border-yellow-500/20', desc: 'สิทธิประโยชน์ระดับ VIP' },
                          'VVIP': { color: 'text-orange-500', glow: 'bg-orange-500/20', border: 'border-orange-500/20', desc: 'การดูแลระดับพรีเมียม' },
                          'VVVIP': { color: 'text-red-500', glow: 'bg-red-500/20', border: 'border-red-500/20', desc: 'ที่สุดของระบบเทรด' },
                        };
                        const config = tierConfigs[tier];
                        const count = packages.filter(p => p.tradingAssets === tier && p.status === 'active').length;
                        
                        return (
                          <motion.div
                            key={tier}
                            whileHover={{ y: -10 }}
                            onClick={() => {
                              setSelectedTier(tier);
                              document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`group cursor-pointer bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 ${config.border} transition-all shadow-2xl relative overflow-hidden`}
                          >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${config.glow} blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-opacity-20 transition-colors`} />
                            <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                              <Zap className={`w-8 h-8 ${config.color}`} />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">{tier} <span className="text-yellow-500">TIER</span></h3>
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">{config.desc}</p>
                            <div className="flex items-center gap-3 mb-8">
                              <span className={`text-4xl font-black ${config.color}`}>{count}</span>
                              <div className="flex flex-col">
                                <p className="text-white text-xs font-black uppercase tracking-widest leading-none">Asset Categories</p>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Available Models</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 ${config.color} font-black uppercase tracking-widest text-[10px] relative z-10`}>
                              เลือกเเพ็คเกจนี้
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Level 2: Category Selection within Tier */}
                  {selectedTier && !selectedCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {Array.from(new Set(packages.filter(p => p.tradingAssets === selectedTier && p.status === 'active').map(p => p.category))).map((cat) => {
                        const count = packages.filter(p => p.tradingAssets === selectedTier && p.category === cat && p.status === 'active').length;
                        const categoryDescs: Record<string, string> = {
                          'GOLD': 'XAUUSD, XAUAUD, XAUEUR, XAUJPY',
                          'SILVER': 'XAGUSD, XAGAUD',
                          'FOREX': 'EURUSD, GBPUSD, USDJPY, USDCAD, AUDUSD, GBXUSD, USDCZK, USDAED',
                          'OIL': 'CL-OIL, USOUSD, UKOUSD, UKOUSDft'
                        };
                        return (
                          <motion.div
                            key={cat}
                            whileHover={{ y: -10 }}
                            onClick={() => {
                              setSelectedCategory(cat);
                              document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="group cursor-pointer bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 hover:border-white/20 transition-all shadow-2xl relative overflow-hidden text-center"
                          >
                            <h3 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{cat === 'OIL' ? 'OIL / ENERGY' : cat}</h3>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-4 px-4 line-clamp-1 group-hover:line-clamp-none transition-all">
                              {categoryDescs[cat || ''] || ''}
                            </p>
                            <div className="flex flex-col items-center gap-2 mb-8">
                              <span className="text-5xl font-black text-yellow-500">{count}</span>
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">EA Items Available</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-[10px] relative z-10">
                              เปิดชม EA หมวดนี้
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Level 3: EA Models List */}
                  {selectedTier && selectedCategory && (
                    <div className="space-y-20">
                      {Array.from(new Set(packages
                        .filter(p => p.tradingAssets === selectedTier && p.category === selectedCategory && p.status === 'active')
                        .map(p => p.price)))
                        .sort((a: any, b: any) => a - b)
                        .map(price => {
                          const filteredPackages = packages
                            .filter(p => p.tradingAssets === selectedTier && p.category === selectedCategory && p.status === 'active' && p.price === price)
                            .sort((a, b) => {
                              // Prioritize Usage: Daily -> Weekly -> Monthly (Total)
                              const dailyA = a.stats?.dailyActiveUsers || 0;
                              const dailyB = b.stats?.dailyActiveUsers || 0;
                              if (dailyB !== dailyA) return dailyB - dailyA;

                              const weeklyA = a.stats?.weeklyActiveUsers || 0;
                              const weeklyB = b.stats?.weeklyActiveUsers || 0;
                              if (weeklyB !== weeklyA) return weeklyB - weeklyA;

                              const usersA = a.stats?.totalActiveUsers || a.userCount || 0;
                              const usersB = b.stats?.totalActiveUsers || b.userCount || 0;
                              if (usersB !== usersA) return usersB - usersA;

                              // Then Win Rate
                              const winRateA = parseFloat(a.winRate || a.stats?.dailyWinRate || '0');
                              const winRateB = parseFloat(b.winRate || b.stats?.dailyWinRate || '0');
                              if (winRateB !== winRateA) return winRateB - winRateA;

                              // Then Rating
                              const ratingA = a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
                              const ratingB = b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
                              return ratingB - ratingA;
                            });

                          if (filteredPackages.length === 0) return null;

                          return (
                            <div key={price} className="space-y-10">
                              <div className="flex items-center gap-6">
                                <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <div className="px-8 py-3 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl relative group">
                                  <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <span className="text-white font-black uppercase tracking-[0.3em] text-xs relative z-10">
                                    PRICE GROUP: <span className="text-yellow-500">฿{price.toLocaleString()}</span> / Month
                                  </span>
                                </div>
                                <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPackages.map((pkg) => {
                                  const canDelete = currentUser?.role === 'admin' || 
                                    (currentUser?.role === 'provider' && pkg.authorEmail === currentUserEmail);

                                  const userSub = users.find(u => u.email === currentUserEmail)?.subscriptions?.find(sub => sub.packageId === pkg.id);
                                  const isExpired = userSub?.status === 'expired' || (userSub && !userSub.isPaid);

                                  return (
                                    <PackageCard 
                                      key={pkg.id} 
                                      pkg={pkg} 
                                      onSelect={handleSelectPackage}
                                      onDelete={canDelete ? () => handleDeletePackage(pkg.id) : undefined}
                                      isPopular={pkg.userCount === Math.max(...packages.map(p => p.userCount))}
                                      isExpired={isExpired}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Partner Section (New) */}
            {isLoggedIn && (!currentUser?.role || currentUser?.role === 'provider' || currentUser?.role === 'admin') && (
              <section className="py-20 md:py-32 bg-[#0A0A0A] border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="relative p-8 sm:p-12 md:p-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[32px] md:rounded-[50px] overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                      <div className="max-w-2xl w-full">
                        <span className="text-black font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Lender Program</span>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-black uppercase tracking-tighter mt-4 mb-6 md:mb-8 leading-[0.85] break-words">
                          มาเป็นผู้ร่วมสร้าง<br />
                          <span className="text-white">EA MARKET</span>
                        </h2>
                        <div className="space-y-4 mb-8 md:mb-10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                              <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div>
                              <p className="text-black font-black text-lg md:text-xl uppercase tracking-tighter">ส่วนแบ่งรายได้ 10% ทุกเดือน</p>
                              <p className="text-black/60 text-[10px] md:text-xs font-bold uppercase tracking-widest">ต้องมีผู้ใช้งานเริ่มต้น 50 ท่าน ขึ้นไป</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-black font-black text-base md:text-lg uppercase tracking-tighter leading-none">รับ 25% สำหรับ EA ยอดนิยม</p>
                              <p className="text-black/70 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">ยอดผู้ใช้งานมากกว่า 200 และสูงสุดประจำเดือน</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                              <Target className="w-5 h-5 md:w-6 md:h-6 text-black" />
                            </div>
                            <div>
                              <p className="text-black font-black text-base md:text-lg uppercase tracking-tighter leading-none">เริ่มจ่ายในเดือนที่ 2 เป็นต้นไป</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-black/80 font-bold text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                          หากคุณมีระบบ EA ประสิทธิภาพสูง ไม่จำกัดจำนวนระบบ
                          ท่านสามารถส่งรายละเอียดระบบเพื่อตรวจสอบและนำขึ้นแพลตฟอร์มได้ทันที
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={handlePostEAClick}
                            className="w-full sm:w-auto bg-black text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-zinc-900 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
                          >
                            <Zap className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                            โพสต์ EA เพื่อปล่อยเช่า
                          </button>
                        </div>
                      </div>
                      <div className="hidden md:flex w-full md:w-1/3 aspect-square bg-black/10 rounded-[40px] items-center justify-center border border-white/20 shrink-0">
                        <div className="text-center">
                          <p className="text-5xl md:text-7xl mb-6">🚀</p>
                          <p className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter leading-none">รายได้เสริม 10%<br/>Revenue Share</p>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-2">ต้องมีผู้ใช้งานเริ่มต้น 50 ท่าน ขึ้นไป</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        ) : (
          <PackageDetail 
            key="detail"
            pkg={selectedPackage} 
            bankInfo={bankInfo}
            onBack={() => setSelectedPackage(null)}
            onRent={(pkg, slip, account, pass) => handleRentPackage(pkg, slip, account, pass)}
            isRented={rentedPackageIds.includes(selectedPackage.id)}
            onAddReview={(rating, comment) => handleAddReview(selectedPackage.id, rating, comment)}
            onDelete={selectedPackage.isUserSubmitted ? handleDeletePackage : undefined}
            subscription={users.find(u => u.email === currentUserEmail)?.subscriptions?.find(sub => sub.packageId === selectedPackage.id)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-yellow-500" />
              <span className="text-xl font-bold tracking-tight text-white uppercase">
                EA MARKET <span className="text-yellow-500">TH</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 EA MARKET TH. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm font-medium text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLogin}
        type={authType}
        switchTo={setAuthType}
      />

      {/* Pending Approval Overlay - Global Block */}
      <AnimatePresence>
        {isLoggedIn && !isAdmin && currentUser && currentUser.role && !currentUser.isApproved && view !== 'renter-setup' && view !== 'provider-agreement' && view !== 'identity-choice' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[48px] p-12 text-center shadow-2xl"
            >
              <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShieldCheck className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Account Pending Approval</h2>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest leading-relaxed mb-8">
                ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา! บัญชีของคุณ ({currentUser.email}) กำลังรอการตรวจสอบและอนุมัติจากผู้ดูแลระบบ
              </p>
              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl mb-8">
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Contact Administration</p>
                 <div className="flex flex-col items-center gap-4">
                    <p className="text-sm font-medium text-gray-300">กรุณาแจ้งแอดมินทาง LINE เพื่อเร่งการตรวจสอบ</p>
                    <a 
                      href="https://line.me/R/ti/p/@116ksvuu" 
                      target="_blank" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#06C755] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Line ID: @116ksvuu
                    </a>
                 </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
              >
                Log Out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
