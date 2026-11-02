import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  X,
  CheckCircle2,
  Mail,
  User,
  ExternalLink,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: FirebaseUser | null;
  onGoogleSignIn: () => void;
}

export const SUPER_ADMIN_EMAIL = 'djogovancy549@gmail.com';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onGoogleSignIn,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isSuperAdminUser =
    currentUser && currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdminUser) {
      setError(`Akses ditolak! Anda harus masuk sebagai email Super Admin (${SUPER_ADMIN_EMAIL}).`);
      return;
    }

    if (pin.trim() === 'domain2026' || pin.trim() === 'admin2026' || pin.trim() === 'admin') {
      setError('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPin('');
        onSuccess();
        onClose();
      }, 500);
    } else {
      setError('Kode PIN Admin salah! Masukkan PIN: domain2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-white">Otentikasi Super Admin</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Area ini khusus pemilik email <strong className="text-amber-300 font-mono">{SUPER_ADMIN_EMAIL}</strong> untuk mengonfirmasi pembayaran &amp; kelola DNS.
            </p>
          </div>

          {/* User Email Status */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Akun Google Terhubung:</span>
              </span>
              {isSuperAdminUser ? (
                <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SUPER ADMIN VERIFIED</span>
                </span>
              ) : (
                <span className="font-bold text-rose-400">TIDAK DIIZINKAN</span>
              )}
            </div>

            <div className="text-xs font-mono font-bold text-white bg-slate-900 p-2 rounded-xl border border-slate-800 truncate">
              {currentUser?.email || 'Belum Masuk dengan Akun Google'}
            </div>
          </div>

          {!isSuperAdminUser ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Hanya email <strong>{SUPER_ADMIN_EMAIL}</strong> yang dapat mengakses Panel Admin. Pengguna lain hanya dapat menggunakan Portal Pelanggan.
                </span>
              </div>

              <button
                onClick={onGoogleSignIn}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Masuk dengan Google ({SUPER_ADMIN_EMAIL})</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Masukkan PIN Admin (ID: domain2026)
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    placeholder="Kode PIN Admin (contoh: domain2026)"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {isSuccess && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Super Admin Diverifikasi! Membuka Panel...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Admin Panel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
