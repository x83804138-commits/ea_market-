import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export default function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#141414] border border-white/5 p-6 rounded-2xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-bold text-white tabular-nums">{value}</h3>
          {trend && (
            <p className="text-green-500 text-xs font-semibold mt-2">
              {trend} <span className="text-gray-600">vs last period</span>
            </p>
          )}
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          <Icon className="w-6 h-6 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
        </div>
      </div>
    </motion.div>
  );
}
