import React from 'react';
import { Menu, X, BarChart3, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
  onAdminClick: () => void;
  onProviderDashboardClick: () => void;
  onHomeClick: () => void;
  isLoggedIn: boolean;
  currentUser?: any;
}

export default function Navbar({ onLoginClick, onRegisterClick, onLogoutClick, onAdminClick, onProviderDashboardClick, onHomeClick, isLoggedIn, currentUser }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={onHomeClick}
          >
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase whitespace-nowrap">
              EA MARKET <span className="text-yellow-500">TH</span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {isLoggedIn && (!currentUser?.role || currentUser?.role === 'renter' || currentUser?.role === 'admin') && (
              <a href="#packages" className="text-gray-300 hover:text-white transition-colors">แพ็คเกจ</a>
            )}
            {isLoggedIn && (
              <a href="#stats" className="text-gray-300 hover:text-white transition-colors">สถิติ</a>
            )}
            {isLoggedIn && currentUser?.role === 'provider' && (
              <button 
                onClick={onProviderDashboardClick}
                className="text-yellow-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest flex items-center gap-2"
              >
                <ShieldCheck className="w-3 h-3" />
                My Dashboard
              </button>
            )}
            {isLoggedIn && (
              <button 
                onClick={onAdminClick}
                className="text-gray-300 hover:text-yellow-500 transition-colors uppercase text-[10px] font-black tracking-widest"
              >
                Admin Central
              </button>
            )}
            <div className="flex items-center gap-4 ml-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${currentUser?.role === 'renter' ? 'bg-blue-500/10 border-blue-500/20' : currentUser?.role === 'provider' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className={`w-1 h-1 rounded-full ${currentUser?.role === 'renter' ? 'bg-blue-500' : currentUser?.role === 'provider' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${currentUser?.role === 'renter' ? 'text-blue-500' : currentUser?.role === 'provider' ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {currentUser?.role || 'Guest'}
                    </span>
                  </div>
                  <button 
                    onClick={onLogoutClick}
                    className="text-xs font-black text-gray-500 uppercase hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={onLoginClick}
                    className="text-white hover:text-yellow-500 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button 
                    onClick={onRegisterClick}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold transition-transform active:scale-95"
                  >
                    สมัครสมาชิก
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-white/10 px-4 py-8 space-y-6 animate-in slide-in-from-top duration-300">
          <div className="space-y-4">
            {isLoggedIn && (!currentUser?.role || currentUser?.role === 'renter' || currentUser?.role === 'admin') && (
              <a 
                href="#packages" 
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl font-black text-gray-300 hover:text-yellow-500 uppercase tracking-tighter"
              >
                แพ็คเกจ (Packages)
              </a>
            )}
            {isLoggedIn && (
              <a 
                href="#stats" 
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl font-black text-gray-300 hover:text-yellow-500 uppercase tracking-tighter"
              >
                สถิติ (Statistics)
              </a>
            )}
            {isLoggedIn && currentUser?.role === 'provider' && (
              <button 
                onClick={() => {
                  onProviderDashboardClick();
                  setIsMenuOpen(false);
                }}
                className="block text-2xl font-black text-yellow-500 hover:text-white uppercase tracking-tighter text-left w-full"
              >
                My Dashboard
              </button>
            )}
            {isLoggedIn && (
              <button 
                onClick={() => {
                  onAdminClick();
                  setIsMenuOpen(false);
                }}
                className="block text-2xl font-black text-gray-300 hover:text-yellow-500 uppercase tracking-tighter text-left w-full"
              >
                Admin Central
              </button>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <User className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-black text-gray-300 uppercase tracking-widest">Investor Mode</span>
                </div>
                <button 
                  onClick={() => {
                    onLogoutClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-5 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    onRegisterClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-5 bg-yellow-500 text-black font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-yellow-500/10"
                >
                  สมัครสมาชิก (Register)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
