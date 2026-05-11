import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Play, Star, Users, Target, MessageSquare, Video, Zap, MessageCircle, BarChart3, Image as ImageIcon, ArrowRight, Shield, CheckCircle2, CreditCard, Maximize2 } from 'lucide-react';
import { EAPackage, PackageId } from '../types';
import ImageLightbox from './ImageLightbox';

interface PostEAFormProps {
  packages: EAPackage[];
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export default function PostEAForm({ packages, onBack, onSubmit }: PostEAFormProps) {
  const [step, setStep] = React.useState(1);
  const [acceptedRules, setAcceptedRules] = React.useState(false);
  const [lightbox, setLightbox] = React.useState({ isOpen: false, index: 0 });
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: 'GOLD',
    videoFile: null as File | null,
    usersThisMonth: '0',
    usersLastMonth: '0',
    currentUsers: '0',
    rating: '5',
    reviewsCount: '0',
    winRate: '0%',
    lineId: '',
    recommendation: '',
    minCapital: '',
    price: '30000',
    feature1: '',
    feature2: '',
    feature3: '',
    backtestImages: [] as File[],
    tradingAssets: '',
    supportedSymbols: [] as string[],
  });

  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);

  const capitalOptions: Record<string, string[]> = {
    'Basic': ['$100 - $300', '$300 - $500', '$500 - $1,000'],
    'Standard': ['$1,000 - $1,300', '$1,300 - $1,600', '$1,600 - $2,000'],
    'Pro': ['$2,000 - $2,300', '$2,300 - $2,600', '$2,600 - $3,000'],
    'VIP': ['$3,000 - $3,300', '$3,300 - $3,600', '$3,600 - $4,000'],
    'VVIP': ['$4,000 - $4,300', '$4,300 - $4,600', '$4,600 - $5,000'],
    'VVVIP': ['$5,000 - $7,000', '$7,000 - $10,000', '$10,000+'],
  };

  const categorySymbols: Record<string, string[]> = {
    'GOLD': ['XAUUSD', 'XAUAUD', 'XAUEUR', 'XAUJPY'],
    'SILVER': ['XAGUSD', 'XAGAUD'],
    'FOREX': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'GBXUSD', 'USDCZK', 'USDAED'],
    'OIL': ['CL-OIL', 'USOUSD', 'UKOUSD', 'UKOUSDft'],
  };

  const packagePrices: Record<string, string> = {
    'Basic': '5000',
    'Standard': '10000',
    'Pro': '15000',
    'VIP': '20000',
    'VVIP': '30000',
    'VVVIP': '50000',
  };

  React.useEffect(() => {
    // Reset minCapital if it's not valid for the newly selected package
    if (formData.tradingAssets) {
      const validOptions = capitalOptions[formData.tradingAssets] || [];
      if (formData.minCapital && !validOptions.includes(formData.minCapital)) {
        setFormData(prev => ({ ...prev, minCapital: '' }));
      }
      
      // Set price based on package
      setFormData(prev => ({ ...prev, price: packagePrices[formData.tradingAssets] || '' }));
    }
  }, [formData.tradingAssets]);
  React.useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [videoPreview, imagePreviews]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({ ...formData, videoFile: file || null });
    
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    const files = Array.from(fileList);
    setFormData({ ...formData, backtestImages: files });

    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    if (files.length > 0) {
      const newPreviews = files.map((file: File) => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    } else {
      setImagePreviews([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      { key: 'name', label: 'ชื่อระบบ EA' },
      { key: 'description', label: 'คำอธิบาย' },
      { key: 'tradingAssets', label: 'แพ็คเกจ EA' },
      { key: 'minCapital', label: 'เงินทุนที่แนะนำ' },
      { key: 'lineId', label: 'LINE ID' },
      { key: 'winRate', label: 'อัตราชนะ' },
      { key: 'supportedSymbols', label: 'สินทรัพย์ที่รองรับ' },
    ];

    if (formData.supportedSymbols.length === 0) {
      alert('กรุณาเลือกสินทรัพย์ที่รองรับอย่างน้อย 1 รายการ');
      return;
    }

    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData]) {
        alert(`กรุณากรอก${field.label}`);
        return;
      }
    }

    if (!formData.videoFile) {
      alert('กรุณาอัปโหลดวิดีโอสาธิต');
      return;
    }

    if (formData.backtestImages.length === 0) {
      alert('กรุณาอัปโหลดภาพผลการเทรดย้อนหลัง (อย่างน้อย 1 ภาพ)');
      return;
    }

    const features = [formData.feature1, formData.feature2, formData.feature3].filter(f => f.trim() !== '');
    onSubmit({
      ...formData,
      features: features.length > 0 ? features : undefined
    });
    alert('ส่งข้อมูลเรียบร้อยแล้ว ทีมงานจะตรวจสอบและนำขึ้นระบบภายใน 24 ชม.');
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={step > 1 ? () => setStep(step - 1) : onBack}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group font-black uppercase tracking-widest text-[10px] sm:text-xs"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step === 1 ? 'กลับสู่หน้าหลัก (Back)' : 'ย้อนกลับ (Previous)'}
        </button>

        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step ? 'w-8 bg-yellow-500' : s < step ? 'w-4 bg-green-500' : 'w-4 bg-white/10'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-12">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4">
                  <Zap className="w-3 h-3 fill-yellow-500" />
                  Lender Program - Step 01
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter break-words">
                  เป็นผู้ปล่อยเช่า <span className="text-yellow-500">EA</span>
                </h1>
                <p className="text-gray-500 mt-4 font-medium">แบ่งปันระบบการเทรดที่มีประสิทธิภาพของคุณ พร้อมรับส่วนแบ่งรายได้ทุกเดือน</p>
              </div>
              <div className="w-full md:w-auto p-6 bg-yellow-500 rounded-[24px] md:rounded-[30px] text-black">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">สิทธิประโยชน์นักพัฒนา</p>
                <p className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">ส่วนแบ่ง 10% รายเดือน</p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase mt-2">* ต้องมีผู้ใช้งานเริ่มต้น 50 ท่าน ขึ้นไป (เริ่มจ่ายเดือนที่ 2)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                <Users className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-sm font-black text-white uppercase mb-2">Passive Income</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">สร้างรายได้เสริมจากระบบเทรดที่คุณมีอยู่แล้ว โดยไม่ต้องเฝ้าหน้าจอ</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                <Shield className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="text-sm font-black text-white uppercase mb-2">Trusted Platform</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">เราดูแลระบบการชำระเงินและสิทธิการใช้งานให้คุณอย่างครบวงจร</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                <BarChart3 className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-sm font-black text-white uppercase mb-2">Detailed Stats</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">มีระบบแดชบอร์ดหลังบ้านแสดงจำนวนผู้ใช้งานและยอดรายได้อย่างชัดเจน</p>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3"
            >
              เริ่มต้นขั้นตอนถัดไป (Get Started)
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">
                <Target className="w-3 h-3" />
                Rules & Regulations - Step 02
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
                กฎระเบียบ <span className="text-blue-500">ผู้โพสต์ EA</span>
              </h1>
              <p className="text-gray-500 mt-4 font-medium uppercase tracking-widest text-[10px]">กรุณาอ่านและยอมรับข้อตกลงก่อนดำเนินการต่อ</p>
            </div>

            <div className="space-y-4">
              {[
                { id: 1, text: "ไม่จำกัดจำนวน EA, แพ็คเกจ, และสินทรัพย์ที่ต้องการปล่อยเช่า" },
                { id: 2, text: "ต้องใช้ข้อมูลที่เป็นผลการเทรดจาก บัญชีจริง (Real Account) เท่านั้น" },
                { id: 3, text: "อัตราชนะ (Win Rate) ต้องไม่ต่ำกว่า 30% (หากอยู่ที่ 15-20% จะผ่านการพิจารณาเป็นกรณีพิเศษ)" },
                { id: 4, text: "เมื่อผู้เช่าใช้งาน EA ครบ 3 เดือนต่อเนื่อง จะได้รับสิทธิ์รัน EA ฟรี 1 อาทิตย์" },
                { id: 5, text: "ผู้ปล่อยเช่าต้องให้ผู้เช่าใช้โบรกเกอร์ของเราถึงจะครบเงื่อนไข ในการรับ 10% ทุกเดือน" },
                { id: 6, text: "ต้องกรอกข้อมูลให้ครบถ้วนและระบุ LINE ID ที่สามารถติดต่อได้จริง" }
              ].map((rule) => (
                <div key={rule.id} className="flex gap-4 p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm group-hover:scale-110 transition-transform">
                    {rule.id}
                  </div>
                  <p className="text-gray-300 font-bold text-sm leading-relaxed self-center">{rule.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 flex flex-col gap-6">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div 
                  onClick={() => setAcceptedRules(!acceptedRules)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    acceptedRules ? 'bg-blue-500 border-blue-500' : 'border-white/10 group-hover:border-blue-500/50'
                  }`}
                >
                  {acceptedRules && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-200 transition-colors">
                  ฉันเข้าใจและยอมรับกฎระเบียบทั้งหมด (I accept the rules)
                </span>
              </label>

              <button 
                disabled={!acceptedRules}
                onClick={() => setStep(3)}
                className={`w-full py-5 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${
                  acceptedRules 
                    ? 'bg-blue-500 text-white hover:bg-blue-400' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                เข้าสู่ขั้นตอนกรอกข้อมูล (Next Step)
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black text-green-500 uppercase tracking-widest mb-4">
                <Play className="w-3 h-3 fill-green-500" />
                Fill Information - Step 03
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter">
                กรอกข้อมูล <span className="text-green-500">EA Details</span>
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">ชื่อระบบ EA (EA Name)</label>
                    <input 
                      required
                      type="text"
                      placeholder="เช่น Gold Hunter Pro"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">คำอธิบาย (Description)</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="จุดเด่นของระบบ และกลยุทธ์ที่ใช้..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">คำแนะนำพิเศษ (Expert Recommendation / Best For)</label>
                    <textarea 
                      rows={2}
                      placeholder="ช่วยบอกนักลงทุนว่า EA นี้เหมาะกับใครที่สุด..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                      value={formData.recommendation}
                      onChange={e => setFormData({ ...formData, recommendation: e.target.value })}
                    />
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">เงินทุนที่แนะนำ (Recommended Capital - THB/USD)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 z-10" />
                      <select 
                        required
                        disabled={!formData.tradingAssets}
                        className={`w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors appearance-none ${!formData.tradingAssets ? 'opacity-50 cursor-not-allowed' : 'text-white'}`}
                        value={formData.minCapital}
                        onChange={e => setFormData({ ...formData, minCapital: e.target.value })}
                      >
                        <option value="" disabled className="bg-[#141414]">
                          {!formData.tradingAssets ? 'กรุณาเลือกเเพ็คเกจก่อน...' : 'เลือกเงินทุนที่แนะนำ...'}
                        </option>
                        {formData.tradingAssets && capitalOptions[formData.tradingAssets]?.map(opt => (
                          <option key={opt} value={opt} className="bg-[#141414]">{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">เลือกเเพ็คเกจ (Select Package Tier)</label>
                    <select 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors appearance-none text-white"
                      value={formData.tradingAssets}
                      onChange={e => setFormData({ ...formData, tradingAssets: e.target.value })}
                    >
                      <option value="" disabled className="bg-[#141414]">เลือกเเพ็คเกจ...</option>
                      <option value="Basic" className="bg-[#141414]">Basic Package</option>
                      <option value="Standard" className="bg-[#141414]">Standard Package</option>
                      <option value="Pro" className="bg-[#141414]">Pro Package</option>
                      <option value="VIP" className="bg-[#141414]">VIP Package</option>
                      <option value="VVIP" className="bg-[#141414]">VVIP Package</option>
                      <option value="VVVIP" className="bg-[#141414]">VVVIP Package</option>
                    </select>
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">เลือกหมวดหมู่สินทรัพย์ (Select Asset Category)</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors appearance-none text-white"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value, supportedSymbols: [] })}
                    >
                      <option value="GOLD">หมวดหมู่ GOLD (XAUUSD, XAUAUD, XAUEUR, XAUJPY)</option>
                      <option value="SILVER">หมวดหมู่ SILVER (XAGUSD, XAGAUD)</option>
                      <option value="FOREX">หมวดหมู่ FOREX (EURUSD, GBPUSD, USDJPY, USDCAD, AUDUSD, GBXUSD, USDCZK, USDAED)</option>
                      <option value="OIL">หมวดหมู่ OIL/ENERGY (CL-OIL, USOUSD, UKOUSD, UKOUSDft)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-4">สินทรัพย์ที่รองรับในโหมดนี้ (Supported Assets - Multiple Select)</label>
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                      {categorySymbols[formData.category]?.map(symbol => (
                        <div 
                          key={symbol}
                          onClick={() => {
                            const newSymbols = formData.supportedSymbols.includes(symbol)
                              ? formData.supportedSymbols.filter(s => s !== symbol)
                              : [...formData.supportedSymbols, symbol];
                            setFormData({ ...formData, supportedSymbols: newSymbols });
                          }}
                          className={`p-3 rounded-xl border text-[10px] font-black cursor-pointer transition-all text-center uppercase tracking-tighter ${
                            formData.supportedSymbols.includes(symbol)
                              ? 'bg-yellow-500 border-yellow-500 text-black'
                              : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                          }`}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>
                    {formData.supportedSymbols.length === 0 && (
                      <p className="mt-2 text-[10px] text-red-500 font-bold">* กรุณาเลือกอย่างน้อย 1 สินทรัพย์</p>
                    )}
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-4">ค่าเช่าต่อเดือน (Monthly Rental Price - Fixed by Package)</label>
                    <div className="p-6 bg-yellow-500/10 border border-white/5 rounded-2xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Fixed Price for {formData.tradingAssets || 'Package'}</p>
                          <p className="text-2xl font-black text-white tracking-tighter">
                            {formData.tradingAssets ? `฿${Number(formData.price).toLocaleString()}` : 'Please select package'}
                          </p>
                        </div>
                      </div>
                      {formData.tradingAssets && (
                        <div className="px-4 py-2 bg-yellow-500 rounded-lg text-black text-[10px] font-black uppercase tracking-widest">
                          Secured
                        </div>
                      )}
                    </div>
                  </div>
    
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500">สิ่งที่คุณจะได้รับ (What they will receive - 3 Points)</label>
                    <input 
                      required
                      type="text"
                      placeholder="หัวข้อที่ 1 เช่น ติดตั้งฟรี"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={formData.feature1}
                      onChange={e => setFormData({ ...formData, feature1: e.target.value })}
                    />
                    <input 
                      required
                      type="text"
                      placeholder="หัวข้อที่ 2 เช่น คู่มือการตั้งค่า"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={formData.feature2}
                      onChange={e => setFormData({ ...formData, feature2: e.target.value })}
                    />
                    <input 
                      required
                      type="text"
                      placeholder="หัวข้อที่ 3 เช่น กลุ่มซัพพอร์ต 24 ชม."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={formData.feature3}
                      onChange={e => setFormData({ ...formData, feature3: e.target.value })}
                    />
                  </div>
    
                  <div className="pt-4 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">ช่องทางการติดต่อ (Contact Info)</h3>
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">LINE ID</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        <input 
                          required
                          type="text"
                          placeholder="@yourid"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.lineId}
                          onChange={e => setFormData({ ...formData, lineId: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
    
                {/* Right Column: Performance Stats */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">ยอดคนใช้เดือนนี้</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.usersThisMonth}
                          onChange={e => setFormData({ ...formData, usersThisMonth: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">ยอดคนใช้เดือนที่แล้ว</label>
                      <div className="relative">
                        <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                        <input 
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.usersLastMonth}
                          onChange={e => setFormData({ ...formData, usersLastMonth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
    
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">คนใช้ ณ ปัจจุบัน</label>
                      <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        <input 
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.currentUsers}
                          onChange={e => setFormData({ ...formData, currentUsers: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">อัตราชนะ (Win Rate)</label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <input 
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.winRate}
                          onChange={e => setFormData({ ...formData, winRate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
    
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">เรตติ้ง (Rating 1-5)</label>
                      <div className="relative">
                        <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <input 
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.rating}
                          onChange={e => setFormData({ ...formData, rating: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">จำนวนรีวิว (Reviews)</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                        <input 
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
                          value={formData.reviewsCount}
                          onChange={e => setFormData({ ...formData, reviewsCount: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">วิดีโอสาธิต (Video Demo)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-yellow-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleVideoChange}
                      />
                      {videoPreview ? (
                        <video 
                          src={videoPreview} 
                          className="absolute inset-0 w-full h-full object-cover opacity-30"
                          autoPlay
                          muted
                          loop
                        />
                      ) : (
                        <Video className="w-10 h-10 text-gray-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      )}
                      <div className="relative z-0">
                        <p className="text-sm font-bold text-gray-400">
                          {formData.videoFile ? formData.videoFile.name : 'ลากไฟล์วิดีโอ หรือคลิกเพื่ออัปโหลด'}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-2 uppercase">MP4, MOV (UNLIMITED SIZE)</p>
                      </div>
                    </div>
                  </div>
    
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">ภาพผลการเทรดย้อนหลัง (Backtest Images - 5+ Years)</label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-yellow-500/50 transition-colors cursor-pointer group relative">
                        <input 
                          type="file" 
                          multiple
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImagesChange}
                        />
                        <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-gray-400">
                          {formData.backtestImages.length > 0 
                            ? `เลือกแล้ว ${formData.backtestImages.length} ภาพ (คลิกเพื่อเปลี่ยน)` 
                            : 'ลากไฟล์ภาพ หรือคลิกเพื่ออัปโหลด (ข้อมูลย้อนหลัง 5 ปีขึ้นไป)'}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-2 uppercase">JPG, PNG (MINIMUM 5 YEARS HISTORY REQUIREMENT)</p>
                      </div>
    
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {imagePreviews.map((url, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setLightbox({ isOpen: true, index: i })}
                              className="aspect-square bg-white/5 rounded-xl border border-white/10 overflow-hidden relative group cursor-pointer"
                            >
                              <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
    
              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center gap-6">
                <button 
                  type="submit"
                  className="w-full md:w-auto bg-green-500 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all active:scale-95 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  ยืนยันการโพสต์ EA
                </button>
                <p className="text-xs text-gray-500 font-medium italic">
                  โดยการส่งข้อมูลนี้ คุณยินยอมให้เราตรวจสอบและปรับปรุงข้อมูลให้เหมาะสมก่อนนำขึ้นระบบจริง
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      <ImageLightbox 
        images={imagePreviews}
        isOpen={lightbox.isOpen}
        initialIndex={lightbox.index}
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
