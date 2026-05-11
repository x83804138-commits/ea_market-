import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Star, 
  BarChart3, 
  Zap, 
  ArrowLeft, 
  ShieldCheck, 
  Activity,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Clock,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { EAPackage, User } from '../types';

interface ProviderDashboardProps {
  packages: EAPackage[];
  users: User[];
  currentUserEmail: string;
  onBack: () => void;
  onDeletePackage: (id: string) => void;
}

export default function ProviderDashboard({ packages, users, currentUserEmail, onBack, onDeletePackage }: ProviderDashboardProps) {
  const myEAs = packages.filter(pkg => pkg.authorEmail === currentUserEmail);
  const myEAIds = myEAs.map(ea => ea.id);

  // Find all subscriptions for my EAs
  const mySubscribers = users.flatMap(user => 
    (user.subscriptions || [])
      .filter(sub => myEAIds.includes(sub.packageId as any))
      .map(sub => ({ ...sub, userEmail: user.email, userName: user.email.split('@')[0] }))
  );

  const expiredSubs = mySubscribers.filter(sub => sub.status === 'expired' || !sub.isPaid);

  const totalUsers = myEAs.reduce((acc, pkg) => acc + (pkg.currentUsers || 0), 0);
  const averageRating = myEAs.length > 0 
    ? (myEAs.reduce((acc, pkg) => {
        const pkgRating = pkg.reviews.length > 0 
          ? pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length 
          : 5.0;
        return acc + pkgRating;
      }, 0) / myEAs.length).toFixed(1)
    : '0';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 uppercase text-[10px] font-black tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ย้อนกลับไปหน้าแรก (Back to Home)
          </button>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Provider <span className="text-yellow-500">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">จัดการและติดตามประสิทธิภาพ EA ของคุณ</p>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Active Users</p>
            <p className="text-2xl font-black text-white">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total EAs</p>
            <p className="text-2xl font-black text-white">{myEAs.length}</p>
          </div>
        </div>
      </div>

      {myEAs.length === 0 ? (
        <div className="text-center py-24 bg-[#111] border border-white/5 rounded-[48px]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">No EAs Submitted Yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">คุณยังไม่ได้ส่ง EA เข้าร่วมระบบ เริ่มต้นสร้างรายได้วันนี้ด้วยการแชร์ระบบเทรดของคุณ</p>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-yellow-500 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-transform"
          >
            ไปที่หน้าปล่อยเช่า EA
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Your EA Fleet</h3>
            <div className="space-y-4">
              {myEAs.map((ea) => (
                <motion.div
                  key={ea.id}
                  whileHover={{ y: -4 }}
                  className="p-6 bg-[#111] border border-white/5 rounded-[32px] group"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
                        {ea.imageUrl ? (
                          <img src={ea.imageUrl} alt={ea.name} className="w-full h-full object-cover" />
                        ) : (
                          <Zap className="w-8 h-8 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-white uppercase tracking-tight">{ea.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            ea.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {ea.status === 'active' ? 'APPROVED' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{ea.category} • {ea.tradingAssets}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <p className="text-[10px] font-black text-white">{ea.currentUsers || 0}</p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase">Users</p>
                        </div>
                        <div className="text-center">
                          <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1 fill-yellow-500" />
                          <p className="text-[10px] font-black text-white">
                            {ea.reviews.length > 0 
                              ? (ea.reviews.reduce((sum, r) => sum + r.rating, 0) / ea.reviews.length).toFixed(1) 
                              : '5.0'}
                          </p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase">Rating</p>
                        </div>
                        <div className="text-center">
                          <MessageSquare className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                          <p className="text-[10px] font-black text-white">{ea.reviews.length}</p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase">Reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                     <div className="flex gap-8">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Win Rate</span>
                           <span className="text-xs font-black text-green-500">{ea.winRate}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Price</span>
                           <span className="text-xs font-black text-yellow-500">฿{ea.price.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Monthly Growth</span>
                           <span className="text-xs font-black text-blue-500">+{((ea.currentUsers || 1) / (ea.usersLastMonth || 1) * 100 - 100).toFixed(0)}%</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onDeletePackage(ea.id)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group/del"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                          ลบรายการ EA
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="p-8 bg-[#111] border border-white/10 rounded-[32px] overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[80px] -mr-16 -mt-16 rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Monthly Revenue</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Potential (10% Share)</p>
                  </div>
                </div>

                {/* Circular Summary Container */}
                <div className="flex flex-col items-center justify-center py-8 mb-8 relative">
                   <div className="relative w-48 h-48 flex items-center justify-center">
                      {/* Decorative Outer Circle */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                         <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="transparent"
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="12"
                         />
                         <motion.circle
                            initial={{ strokeDashoffset: 550 }}
                            animate={{ strokeDashoffset: 550 - (550 * 0.75) }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            cx="96"
                            cy="96"
                            r="88"
                            fill="transparent"
                            stroke="url(#yellowGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="550"
                         />
                         <defs>
                            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                               <stop offset="0%" stopColor="#EAB308" />
                               <stop offset="100%" stopColor="#CA8A04" />
                            </linearGradient>
                         </defs>
                      </svg>
                      
                      {/* Internal Text Content */}
                      <div className="text-center z-10">
                         <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Total Potential</p>
                         <p className="text-2xl font-black text-white tracking-tighter leading-none mb-1">
                            ฿{(myEAs.reduce((acc, pkg) => acc + ((pkg.currentUsers || 0) * pkg.price * 0.1), 0)).toLocaleString()}
                         </p>
                         <div className="flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[7px] font-black text-green-500 uppercase tracking-widest">Active EAs</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                  {myEAs.map((ea) => {
                    const totalVolume = (ea.currentUsers || 0) * ea.price;
                    const myShare = totalVolume * 0.1;
                    return (
                      <div key={ea.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{ea.name}</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{ea.tradingAssets}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black text-white">฿{myShare.toLocaleString()}</p>
                             <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Your Share (10%)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest pt-2 border-t border-white/5">
                          <span>฿{ea.price.toLocaleString()} x {ea.currentUsers || 0} users</span>
                          <span className="text-gray-600">= ฿{totalVolume.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Estimated</p>
                    <div className="text-right">
                      <p className="text-3xl font-black text-white tracking-tighter">
                        ฿{(myEAs.reduce((acc, pkg) => acc + ((pkg.currentUsers || 0) * pkg.price * 0.1), 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-relaxed">
                      เงินจะถูกโอนเข้าบัญชีของท่านโดยอัตโนมัติ (Automated transfer to your registered bank account)
                    </p>
                  </div>
                </div>

                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-4 italic">
                  * จะเริ่มคำนวณและจ่ายเมื่อมีผู้ใช้ครบ 50 ท่านขึ้นไป
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#111] border border-white/5 rounded-[32px]">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {expiredSubs.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Subscription Alerts</p>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      ลูกค้าบางท่านยังไม่ชำระค่าเช่าเกิน 30 วัน ระบบได้หยุดการทำงานของ EA อัตโนมัติและแจ้งให้คุณทราบแล้ว
                    </p>
                  </div>
                )}
                
                {expiredSubs.map((sub, i) => (
                  <div key={`exp-${i}`} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 shrink-0 flex items-center justify-center text-red-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-300 font-bold leading-tight mb-1">
                        Subscription Expired: <span className="text-white">{sub.userEmail}</span>
                      </p>
                      <p className="text-[9px] text-red-500/70 font-bold uppercase">Stopped due to non-payment</p>
                    </div>
                  </div>
                ))}

                {[
                  { icon: ShieldCheck, text: "Your EA 'Pro Gold' was approved by Admin", time: "2h ago", color: "text-green-500" },
                  { icon: Star, text: "Received a 5-star review from K. Somchai", time: "5h ago", color: "text-yellow-500" },
                  { icon: Users, text: "5 new users started using your EA today", time: "10h ago", color: "text-blue-500" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 shrink-0 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-300 font-bold leading-tight mb-1">{item.text}</p>
                      <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-white/5 flex justify-center">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          ย้อนกลับไปหน้าแรก (Back to Home)
        </button>
      </div>
    </div>
  );
}
