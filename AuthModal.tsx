import React from 'react';
import { X, Mail, Lock, Building2, CreditCard, Phone, ChevronDown, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { THAI_BANKS } from '../constants';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData?: Partial<User>) => void;
  type: 'login' | 'register';
  switchTo: (type: 'login' | 'register') => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess, type, switchTo }: AuthModalProps) {
  const [selectedBank, setSelectedBank] = React.useState<string>('');
  const [isBankSelectorOpen, setIsBankSelectorOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [lineId, setLineId] = React.useState('');
  const [bankAccountNo, setBankAccountNo] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'register') {
      const bankInfo = THAI_BANKS.find(b => b.id === selectedBank);
      onSuccess({
        email,
        password,
        phone,
        lineId,
        bankName: bankInfo ? bankInfo.name : '',
        bankAccountNo,
      });
    } else {
      onSuccess({ email, password });
    }
  };

  const bankInfo = THAI_BANKS.find(b => b.id === selectedBank);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#141414] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#141414] z-10 py-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                {type === 'login' ? 'Welcome Back' : 'Join EA Market'}
              </h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                </div>
              </div>

              {type === 'register' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="08X-XXX-XXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Bank Name</label>
                      <button
                        type="button"
                        onClick={() => setIsBankSelectorOpen(!isBankSelectorOpen)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white flex items-center justify-between focus:outline-none focus:border-yellow-500/50 transition-colors"
                      >
                        <Building2 className="absolute left-4 top-[42px] -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <span className={selectedBank ? 'text-white' : 'text-gray-600'}>
                          {bankInfo ? bankInfo.name : 'Select Bank'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isBankSelectorOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isBankSelectorOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 left-0 right-0 top-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2"
                          >
                            <div className="grid grid-cols-1 gap-1">
                              {THAI_BANKS.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBank(bank.id);
                                    setIsBankSelectorOpen(false);
                                  }}
                                  className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-colors group"
                                >
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                                    style={{ backgroundColor: bank.color }}
                                  >
                                    {bank.shortName}
                                  </div>
                                  <span className="text-sm text-gray-300 group-hover:text-white">{bank.name}</span>
                                  {selectedBank === bank.id && <Check className="w-4 h-4 text-yellow-500 ml-auto" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Account No.</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value)}
                          required
                          placeholder="XXX-X-XXXXX-X"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Line ID</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        required
                        placeholder="@lineid"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                </div>
              </div>

              <button className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] mt-4">
                {type === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm">
                {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => switchTo(type === 'login' ? 'register' : 'login')}
                  className="text-yellow-500 font-bold hover:underline"
                >
                  {type === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
