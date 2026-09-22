import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Shield, LogOut, LogIn, User as UserIcon, ShoppingBag, Wrench, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  activeTab: 'customer' | 'admin';
  setActiveTab: (tab: 'customer' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  activeTab,
  setActiveTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('customer')}>
            <div className="w-11 h-11 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Bubbles <span className="text-cyan-600">&</span> Co.</span>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Premium Laundry & Dry Clean</p>
            </div>
          </div>

          {/* Desktop Navigation & User Controls */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Role Switcher if admin */}
                {user.role === 'admin' && (
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
                    <button
                      onClick={() => setActiveTab('customer')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'customer'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 inline mr-1.5" />
                      Customer Portal
                    </button>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'admin'
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Shield className="w-4 h-4 inline mr-1.5" />
                      Admin Panel
                    </button>
                  </div>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                  <div className="flex items-center space-x-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full ring-2 ring-cyan-500/20" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{user.displayName}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-2"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all hover:shadow"
              >
                <LogIn className="w-4 h-4" />
                <span>Google Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-2 border-b border-slate-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="flex space-x-2 py-1">
                  <button
                    onClick={() => { setActiveTab('customer'); setMobileMenuOpen(false); }}
                    className={`flex-1 py-2 text-center rounded-lg text-sm font-medium ${
                      activeTab === 'customer' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                    className={`flex-1 py-2 text-center rounded-lg text-sm font-medium ${
                      activeTab === 'admin' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Admin Panel
                  </button>
                </div>
              )}

              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center space-x-2 text-rose-600 bg-rose-50 py-2.5 rounded-xl font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => { onLogin(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 rounded-xl font-medium shadow"
            >
              <LogIn className="w-4 h-4" />
              <span>Google Sign In</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
