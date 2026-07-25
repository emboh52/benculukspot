// Contoh cuplikan di dalam AdminLoginPage.tsx
import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (email: string) => void;
  onBackToPublic: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, onBackToPublic }) => {
  // DIKOSONGKAN AGAR TIDAK TERISI OTOMATIS
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sesuaikan kredensial rahasia Anda di sini
    if (email === 'rudi52' && password === 'Kopok523') {
      onLoginSuccess(email);
    } else {
      setError('Email atau kata sandi salah!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white text-center">
        <Shield className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
        <h2 className="text-xl font-bold">Portal Masuk Admin</h2>
        <p className="text-xs text-slate-400 mt-1">Masukkan kredensial rahasia untuk mengelola data</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl border border-rose-100 text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">EMAIL ADMIN</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email admin"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">KATA SANDI (PASSWORD)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* KOTAK KREDENSIAL DEMO SUDAH DIHAPUS SESUAI PERMINTAAN */}

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm"
        >
          Masuk ke Dashboard Admin
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToPublic}
            className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Direktori Publik
          </button>
        </div>
      </form>
    </div>
  );
};