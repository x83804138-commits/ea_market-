import { motion } from 'motion/react';
import { Star, Trash2 } from 'lucide-react';
import { EAPackage } from '../types';

interface PackageCardProps {
  pkg: EAPackage;
  onSelect: (pkg: EAPackage) => void;
  onDelete?: () => void;
  isPopular?: boolean;
  isExpired?: boolean;
  key?: string | number;
}

export default function PackageCard({ pkg, onSelect, onDelete, isPopular, isExpired }: PackageCardProps) {
  const averageRating = pkg.reviews.length > 0
    ? pkg.reviews.reduce((acc, r) => acc + r.rating, 0) / pkg.reviews.length
    : 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`relative flex flex-col p-8 rounded-3xl border ${
        isPopular ? 'bg-[#1A1A1A] border-yellow-500/50' : 'bg-[#141414] border-white/5'
      } ${isExpired ? 'opacity-70 grayscale' : ''}`}
    >
      {isExpired && (
        <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded shadow-lg">
          Service Stopped
        </div>
      )}
      {isPopular && !isExpired && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Recommended
        </div>
      )}

      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all z-20"
          title="ลบ EA นี้"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="mb-6 flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase rounded border border-yellow-500/20">
            เเพ็คเกจ: {pkg.tradingAssets}
          </span>
          {pkg.isUserSubmitted && (
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded border border-green-500/20">
              Community
            </span>
          )}
        </div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
          {pkg.reviews.length > 0 && (
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-white">{averageRating.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500">({pkg.reviews.length})</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-white">฿{pkg.price.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">/ เดือน</span>
        </div>
        <p className="block mt-4 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold w-fit">
          {pkg.capitalRange}
        </p>
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Daily</span>
            <span className="text-xs font-black text-white">{(pkg.stats?.dailyActiveUsers || 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Weekly</span>
            <span className="text-xs font-black text-white">{(pkg.stats?.weeklyActiveUsers || 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total</span>
            <span className="text-xs font-black text-white">{(pkg.stats?.totalActiveUsers || pkg.userCount || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Win Rate</span>
            <span className="text-sm font-black text-green-500">{pkg.winRate || pkg.stats?.dailyWinRate || 'N/A'}</span>
          </div>
        </div>

        {pkg.supportedSymbols && pkg.supportedSymbols.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {pkg.supportedSymbols.map(symbol => (
              <span key={symbol} className="px-1.5 py-0.5 bg-white/5 text-[9px] font-bold text-gray-400 rounded border border-white/5 uppercase">
                {symbol}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-gray-500 text-sm line-clamp-2">
          {pkg.description}
        </p>
        {pkg.recommendation && (
          <div className="mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1 opacity-70">Expert Advice</p>
            <p className="text-xs text-gray-400 italic line-clamp-1">"{pkg.recommendation}"</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onSelect(pkg)}
        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
          isPopular
            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
            : 'bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        ดูรายละเอียดเพิ่มเติม
      </button>
    </motion.div>
  );
}
