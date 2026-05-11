import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, ShieldCheck, CreditCard, ChevronRight, Check, Star, MessageSquare, BarChart3, Zap, Maximize2, Minimize2, X, Lightbulb, Activity, Users, TrendingUp, Trophy, Trash2, ImageIcon } from 'lucide-react';
import { EAPackage, BankInfo, Subscription } from '../types';
import ReviewForm from './ReviewForm';
import ImageLightbox from './ImageLightbox';

interface PackageDetailProps {
  pkg: EAPackage;
  bankInfo: BankInfo;
  onBack: () => void;
  onRent: (pkg: EAPackage, slipUrl?: string, tradingAccount?: string, brokerPassword?: string) => void;
  isRented: boolean;
  onAddReview: (rating: number, comment: string) => void;
  onDelete?: (id: string) => void;
  subscription?: Subscription;
  key?: string;
}

export default function PackageDetail({ pkg, bankInfo, onBack, onRent, isRented, onAddReview, onDelete, subscription }: PackageDetailProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [receivingName, setReceivingName] = React.useState('');
  const [slip, setSlip] = React.useState<string | null>(null);
  const [isChartExpanded, setIsChartExpanded] = React.useState(false);
  const [lightbox, setLightbox] = React.useState({ isOpen: false, index: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const averageRating = pkg.reviews.length > 0
    ? pkg.reviews.reduce((acc, r) => acc + r.rating, 0) / pkg.reviews.length
    : 0;

  const [verificationStatus, setVerificationStatus] = React.useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlip(reader.result as string);
        setVerificationStatus('idle'); // Reset when new file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const verifySlip = () => {
    if (!slip || !receivingName) return;
    
    setVerificationStatus('verifying');
    
    // Simulate system checking the slip
    setTimeout(() => {
      const isNameMatch = receivingName.trim() === bankInfo.accountName;
      // In a real system, we would also verify the bankName from the slip data
      
      if (isNameMatch) {
        setVerificationStatus('success');
        alert(`ชำระเงินเรียบร้อย (รับชำระผ่าน ${bankInfo.bankName}) โปรดสอบถามข้อมูลเพิ่มเติมผ่าน LINE ในขั้นตอนต่อไป`);
      } else {
        setVerificationStatus('failed');
        alert(`ชำระเงินล้มเหลว (ข้อมูลบัญชีผู้รับไม่ตรงกับ ${bankInfo.bankName})`);
      }
    }, 1500);
  };

  const isNameCorrect = receivingName.trim() === bankInfo.accountName;
  const canConfirm = slip !== null && verificationStatus === 'success';


  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#0A0A0A] pt-32 pb-40"
      >
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] sm:text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก (Back to Home)
          </button>

          {onDelete && (
            <button 
              onClick={() => onDelete(pkg.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ลบเเพ็คเกจ (Delete Package)
            </button>
          )}
        </div>

        {/* Market Leadership Badge (New) */}
        {pkg.stats?.globalRank === 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-6 sm:p-8 md:p-10 bg-gradient-to-br from-yellow-500 via-yellow-400 to-orange-500 rounded-[32px] md:rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_30px_60px_rgba(234,179,8,0.25)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 relative z-10 w-full md:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/10 backdrop-blur-md rounded-[20px] sm:rounded-[24px] flex items-center justify-center border border-black/5 shrink-0">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
              </div>
              <div className="text-black">
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none mb-2 break-words">Market Leader No. 1</h2>
                <p className="font-black text-black/70 uppercase tracking-widest text-[9px] sm:text-[10px] leading-relaxed">EA รุ่นที่มียอมรับสูงสุดและมีผู้ใช้งานมากที่สุดประจำเดือน</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 relative z-10 w-full md:w-auto">
              <div className="px-5 py-2.5 bg-black/10 backdrop-blur-md rounded-2xl border border-black/5 flex items-center gap-2">
                <Users className="w-4 h-4 text-black" />
                <span className="font-black text-black text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap">{pkg.stats?.totalActiveUsers.toLocaleString()} Active Users</span>
              </div>
              <div className="px-5 py-2.5 bg-green-500/20 backdrop-blur-md rounded-2xl border border-black/5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-black" />
                <span className="font-black text-black text-[9px] sm:text-[10px] uppercase tracking-widest whitespace-nowrap">Growth +24%</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side: Video & Details */}
          <div className="space-y-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative aspect-video bg-[#141414] rounded-3xl overflow-hidden border border-white/5 shadow-2xl group/chart"
            >
              {pkg.videoUrl ? (
                <>
                  {pkg.videoUrl.startsWith('blob:') ? (
                    <video 
                      src={pkg.videoUrl} 
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <iframe 
                      src={pkg.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  <button 
                    onClick={() => setIsChartExpanded(true)}
                    className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white opacity-0 group-hover/chart:opacity-100 transition-all hover:bg-yellow-500 hover:text-black hover:border-yellow-500"
                    title="ขยายจอกราฟ"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                  <Play className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">Video Demo</p>
                </div>
              )}
            </motion.div>

            {/* Expert Recommendation Box */}
            {pkg.recommendation && (
              <div className="p-8 bg-blue-500/5 rounded-3xl border border-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">คำแนะนำจากผู้เชี่ยวชาญ (Expert Advice)</h3>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-1 bg-blue-500/30 rounded-full" />
                  <p className="text-gray-300 leading-relaxed font-medium italic">
                    "{pkg.recommendation}"
                  </p>
                </div>
              </div>
            )}

            {/* Performance Summary Box */}
            <div className="p-6 sm:p-8 bg-black/40 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-xl">
                    <Activity className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Performance Metrics</h3>
                </div>
                {pkg.stats && (
                  <div className="px-4 py-1 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Global Rank: #{pkg.stats.globalRank}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Daily Win Rate</p>
                  <p className="text-2xl sm:text-3xl font-black text-white">{pkg.stats?.dailyWinRate || pkg.performanceSummary.split('%')[0] + '%'}</p>
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: pkg.stats?.dailyWinRate || '0%' }} />
                  </div>
                </div>
                <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Win Rate</p>
                  <p className="text-2xl sm:text-3xl font-black text-white">{pkg.stats?.weeklyWinRate || pkg.performanceSummary.split('%')[0] + '%'}</p>
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: pkg.stats?.weeklyWinRate || '0%' }} />
                  </div>
                </div>
                <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly Win Rate</p>
                  <p className="text-2xl sm:text-3xl font-black text-white">{pkg.stats?.monthlyWinRate || pkg.performanceSummary.split('%')[0] + '%'}</p>
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: pkg.stats?.monthlyWinRate || '0%' }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Active System Users</p>
                </div>
                <p className="text-lg md:text-xl font-black text-white">{pkg.stats?.totalActiveUsers.toLocaleString() || (pkg.userCount * 12).toLocaleString()} Users</p>
              </div>
            </div>

            <div className="p-8 bg-yellow-500/5 rounded-3xl border border-yellow-500/20">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-yellow-500">สรุปผลงานล่าสุด</h3>
              </div>
              <p className="text-2xl font-black text-white mb-2">{pkg.performanceSummary}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">อัปเดต ณ เวลาปัจจุบัน จากผลตอบแทนผู้เชี่ยวชาญ</p>
              
              {(pkg.currentUsers !== undefined || pkg.winRate || pkg.usersLastMonth !== undefined) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-yellow-500/10">
                  {pkg.currentUsers !== undefined && (
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">คนเช่าใช้งาน ณ ปัจจุบัน</p>
                      <p className="text-xl font-black text-white">{pkg.currentUsers.toLocaleString()} <span className="text-[10px] text-gray-600">USERS</span></p>
                    </div>
                  )}
                  {pkg.usersLastMonth !== undefined && (
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">คนใช้งานตลอด 1 เดือน จากเดือนที่แล้ว</p>
                      <p className="text-xl font-black text-gray-400">{pkg.usersLastMonth.toLocaleString()} <span className="text-[10px] text-gray-600">USERS</span></p>
                    </div>
                  )}
                  {pkg.winRate && (
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">อัตราชนะ</p>
                      <p className="text-xl font-black text-green-500">{pkg.winRate}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Backtest Images Section */}
            {pkg.backtestImageUrls && pkg.backtestImageUrls.length > 0 && (
              <div className="p-6 sm:p-8 bg-[#141414] rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white">ภาพผลการเทรดย้อนหลัง</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {pkg.backtestImageUrls.map((url, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLightbox({ isOpen: true, index: i })}
                      className="aspect-video sm:aspect-square lg:aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10 cursor-pointer group relative shadow-lg"
                    >
                      <img src={url} alt={`Backtest ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance History Section */}
            {pkg.performanceHistory && pkg.performanceHistory.length > 0 && (
              <div className="p-8 bg-[#141414] rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white">ประวัติผลการดำเนินงาน (5 ปีย้อนหลัง)</h2>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-t-xl text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>ปี (Year)</span>
                    <span>ผลตอบแทน (Return)</span>
                  </div>
                  {pkg.performanceHistory.map((point, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-4 bg-white/[0.02] border-b border-white/5 last:border-b-0 last:rounded-b-xl">
                      <span className="text-sm font-bold text-gray-300">{point.year}</span>
                      <span className={`text-sm font-black ${point.return.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {point.return}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 uppercase italic">
                  * ข้อมูลดังกล่าวอ้างอิงจากบัญชีตัวกลางที่ใช้ทดสอบระบบ (Backtest & Forward Test) ผลตอบแทนในอดีตมิได้เป็นสิ่งยืนยันผลตอบแทนในอนาคต
                </p>
              </div>
            )}

            <div className="p-8 bg-[#141414] rounded-3xl border border-white/5 space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">รายละเอียดระบบ</h2>
              
              {pkg.supportedSymbols && pkg.supportedSymbols.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {pkg.supportedSymbols.map(symbol => (
                    <span key={symbol} className="px-3 py-1 bg-white/5 text-[10px] font-black text-gray-400 rounded-lg border border-white/5 uppercase tracking-wider">
                      {symbol}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-400 leading-relaxed">{pkg.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">เงินทุนที่แนะนำ</p>
                  <p className="text-yellow-500 font-bold">{pkg.capitalRange}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">ค่าบริการรายเดือน</p>
                  <p className="text-white font-bold">฿{pkg.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">รีวิวจากผู้ใช้งานจริง</h2>
                </div>
                {pkg.reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white">{averageRating.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-black">({pkg.reviews.length} รีวิว)</span>
                  </div>
                )}
              </div>

              {isRented ? (
                <ReviewForm onSubmit={onAddReview} />
              ) : (
                <div className="p-6 bg-yellow-500/5 rounded-2xl border border-dashed border-yellow-500/20 text-center">
                  <p className="text-sm text-yellow-500/70 font-medium">เฉพาะผู้ที่เช่าใช้งาน EA แพ็คเกจนี้เท่านั้นที่สามารถรีวิวได้</p>
                </div>
              )}

              <div className="space-y-4">
                {pkg.reviews?.length > 0 ? (
                  pkg.reviews.map((review, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white/5 rounded-2xl border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-white text-sm">{review.userName}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">{review.date}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed italic">"{review.comment}"</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-600 text-sm py-10 font-medium italic">ยังไม่มีรีวิวสำหรับแพ็คเกจนี้</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Features & Payment */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none break-words">
                {pkg.name} <span className="text-yellow-500">PACKAGE</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-500/20 rounded-lg">
                    <ShieldCheck className="w-3 md:w-4 h-3 md:h-4 text-green-500" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-green-500 uppercase tracking-widest">Verified EA Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-500/20 rounded-lg">
                    <Zap className="w-3 md:w-4 h-3 md:h-4 text-blue-500" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-widest">Unlimited Concurrent Users</span>
                </div>
                {pkg.reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Star className="w-2.5 md:w-3 h-2.5 md:h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] md:text-xs font-black text-white">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="space-y-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">สิ่งที่คุณจะได้รับ</p>
              <div className="grid grid-cols-1 gap-3">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-[#1A1A1A] rounded-3xl border border-yellow-500/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">ยอดรวมทั้งหมด</p>
                  <p className="text-4xl font-black text-white">฿{pkg.price.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
              </div>

              <div className="mb-8 border-b border-white/5 pb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 underline decoration-yellow-500/30 underline-offset-4">เช่าใช้งานระบบ (Rental Access)</h3>
                
                {subscription && (
                  <div className="mb-6 p-6 bg-white/2 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className={`w-4 h-4 ${subscription.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สถานะระบบ (EA Engine Status)</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                          subscription.status === 'active' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                        }`}>
                          {subscription.status === 'active' ? 'ACTIVE' : 'STOPPED'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">วันคงเหลือ</p>
                          <p className="text-xl font-black text-white leading-none">{subscription.remainingBusinessDays} <span className="text-xs font-bold text-gray-500">Days</span></p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl">
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">วันหมดอายุ</p>
                          <p className="text-xs font-black text-white leading-none">{new Date(subscription.endDate).toLocaleDateString('th-TH')}</p>
                        </div>
                      </div>

                      {subscription.status === 'active' && (() => {
                        const now = new Date();
                        const endDate = new Date(subscription.endDate);
                        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        if (diffDays <= 5 && diffDays >= 0) {
                          return (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                              <div className="flex items-start gap-3">
                                <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-yellow-500 uppercase leading-relaxed">
                                  อีก {diffDays} วัน EA ประจำเดือนนี้จะหมดเวลา หากสนใจ กรุณาชำระเงินครั้งถัดไปเพื่อต่ออายุ
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {subscription.status !== 'active' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-red-500 uppercase leading-relaxed">
                              ระบบหยุดการทำงานเนื่องจากหมดอายุการใช้งาน กรุณาชำระเงินเพื่อเปิดใช้งานอีกครั้ง
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {showConfirm ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center">ขั้นตอนการชำระเงิน</p>
                    
                    <div className="text-center pb-4 border-b border-white/5">
                      <p className="text-sm font-bold text-white">{bankInfo.bankName}</p>
                      <p className="text-2xl font-black text-yellow-500 tracking-tighter my-1">{bankInfo.accountNo}</p>
                      <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{bankInfo.accountName}</p>
                    </div>

                    <div className="space-y-4 pt-2">

                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">คำเตือน (Warning)</p>
                        <p className="text-xs font-bold text-gray-300 leading-relaxed">
                          กรุณาตรวจสอบชื่อ บัญชีก่อนชำระ หากโอนผิด ทางเราจะไม่รับผิดชอบใดๆ
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">1. อัพโหลดรูปสลิปการโอนเงิน</p>
                          <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full py-4 rounded-xl border-2 border-dashed ${slip ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-white/20'} flex flex-col items-center justify-center gap-2 transition-all group`}
                          >
                            {slip ? (
                              <>
                                <div className="w-full h-20 px-4 overflow-hidden">
                                  <img src={slip} alt="Slip" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-[10px] font-black text-green-500 uppercase">อัพโหลดสลิปเรียบร้อยแล้ว (คลิกเพื่อเปลี่ยน)</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">คลิกเพื่ออัพโหลดรูปสลิป</span>
                              </>
                            )}
                          </button>
                        </div>

                        {slip && (
                          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                            <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">2. ระบุชื่อผู้รับโอนที่ปรากฏในสลิป (เพื่อระบบตรวจสอบ)</p>
                              <input 
                                type="text"
                                value={receivingName}
                                onChange={(e) => {
                                  setReceivingName(e.target.value);
                                  setVerificationStatus('idle');
                                }}
                                placeholder="พิมพ์ชื่อบัญชีผู้รับในสลิป..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-colors"
                              />
                            </div>

                            <button 
                              onClick={verifySlip}
                              disabled={!receivingName || verificationStatus === 'verifying'}
                              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                                verificationStatus === 'verifying' 
                                  ? 'bg-white/5 text-gray-500 cursor-wait' 
                                  : verificationStatus === 'success'
                                    ? 'bg-green-500 text-black'
                                    : verificationStatus === 'failed'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              {verificationStatus === 'verifying' ? (
                                <>
                                  <Activity className="w-4 h-4 animate-spin" />
                                  กำลังตรวจสอบข้อมูลสลิป...
                                </>
                              ) : verificationStatus === 'success' ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  ตรวจสอบสำเร็จ: ชำระเงินเรียบร้อย
                                </>
                              ) : verificationStatus === 'failed' ? (
                                <>
                                  <X className="w-4 h-4" />
                                  ตรวจสอบล้มเหลว: ชื่อไม่ตรง
                                </>
                              ) : (
                                'กดเพื่อตรวจสอบความถูกต้องของสลิป'
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => onRent(pkg, slip || undefined)}
                      disabled={!canConfirm}
                      className={`w-full py-5 ${canConfirm ? 'bg-green-500 hover:bg-green-400' : 'bg-gray-800 cursor-not-allowed opacity-50'} text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_20px_rgba(34,197,94,0.2)] flex items-center justify-center gap-2`}
                    >
                      <Check className="w-5 h-5" />
                      ยืนยันการแจ้งโอน
                    </button>
                    <button 
                      onClick={() => {
                        setShowConfirm(false);
                        setReceivingName('');
                        setSlip(null);
                      }}
                      className="w-full py-3 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscription?.status !== 'active' && isRented && (
                    <button 
                      onClick={() => setShowConfirm(true)}
                      className="w-full py-5 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      ต่ออายุการใช้งาน (Renew Now)
                    </button>
                  )}
                  {subscription?.status === 'active' && (
                    <button 
                      className="w-full py-5 bg-green-500 cursor-default text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_rgba(34,197,94,0.1)] flex items-center justify-center gap-2"
                      disabled
                    >
                      <Check className="w-5 h-5" />
                      เปิดใช้งานอยู่ (System Running)
                    </button>
                  )}
                  {!isRented && (
                    <button 
                      onClick={() => setShowConfirm(true)}
                      className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_rgba(234,179,8,0.1)] flex items-center justify-center gap-2 group"
                    >
                      ชำระเงินผ่าน Mobile Banking
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const id = pkg.lineId || 'eamarketth'; // Fallback to platform LINE
                      window.open(`https://line.me/ti/p/~${id}`, '_blank');
                    }}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-3"
                  >
                    <MessageSquare className="w-5 h-5 text-yellow-500" />
                    สอบถามข้อมูลเพิ่มเติมผ่าน LINE
                  </button>
                </div>
              )}

              <p className="text-center text-[10px] text-gray-600 mt-6 uppercase leading-relaxed">
                การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลก่อนตัดสินใจลงทุน<br />
                เงื่อนไขเป็นไปตามที่บริษัทกำหนด
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

      {/* Fullscreen Chart Modal */}
      <AnimatePresence>
        {isChartExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col p-4 md:p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-black text-white uppercase">{pkg.name} Live Chart</h3>
              </div>
              <button 
                onClick={() => setIsChartExpanded(false)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-red-500 hover:border-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-grow bg-[#141414] rounded-3xl overflow-hidden border border-white/5 relative">
              {pkg.videoUrl?.startsWith('blob:') ? (
                <video 
                  src={pkg.videoUrl} 
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <iframe 
                  src={pkg.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              <button 
                onClick={() => setIsChartExpanded(false)}
                className="absolute bottom-6 right-6 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-yellow-500 hover:text-black transition-all"
              >
                <Minimize2 className="w-4 h-4" />
                ย่อหน้าจอ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLightbox 
        images={pkg.backtestImageUrls || []}
        isOpen={lightbox.isOpen}
        initialIndex={lightbox.index}
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
