import React from 'react';
import { motion } from 'framer-motion';
import { AdminUser } from '../types';
import {
  MapPin,
  ShieldCheck,
  UserCheck,
  LogOut,
  Download,
  RotateCcw,
  Store,
  Compass,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  admin: AdminUser;
  activeTab: 'public' | 'login' | 'admin';
  setActiveTab: (tab: 'public' | 'login' | 'admin') => void;
  onLogoutAdmin: () => void;
  onResetData: () => void;
  totalPlaces: number;
  totalCategories: number;
  darkMode: boolean;           // ← tambahkan
  onToggleDarkMode: () => void; // ← tambahkan
}

export const Navbar: React.FC<NavbarProps> = ({
  admin,
  activeTab,
  setActiveTab,
  onLogoutAdmin,
  onResetData,
  totalPlaces,
  totalCategories,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('public')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                  Benculuk<span className="text-emerald-600">Spot</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Direktori Kuliner, Wisata & Fasilitas
                </p>
              </div>
            </button>

            {/* Total Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <Store className="w-3 h-3 mr-1 text-emerald-600" />
                {totalPlaces} Lokasi
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                {totalCategories} Kategori
              </span>
            </div>
          </div>

          {/* Navigation & Admin Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {/* Quick Reset Data Button */}
            

            {/* Tab Switching / Admin Login state */}
            {admin.isLoggedIn ? (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab('public')}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'public'
                      ? 'text-emerald-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {activeTab === 'public' && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Lihat Direktori</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {activeTab === 'admin' && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-emerald-600 rounded-lg shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <ShieldCheck className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Dashboard Admin</span>
                </button>

                <button
                  onClick={onLogoutAdmin}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors ml-0.5"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab('public')}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'public'
                      ? 'text-emerald-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {activeTab === 'public' && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Lihat Direktori</span>
                </button>

                <button
                  
                >
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-emerald-600 rounded-lg shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <ShieldCheck className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10"></span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
