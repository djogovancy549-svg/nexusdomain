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
  Sparkles,
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

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPin = pin.trim();
    if (cleanPin === 'domain2026' || cleanPin === 'admin2026' || cleanPin === 'admin') {
      setError('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPin('');
        onSuccess();
        onClose();
      }, 500);
    } else {
      setError('Kode PIN Admin salah! Masukkan PIN Super Admin: domain2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
              Area ini khusus Pemilik Email <strong className="text-amber-300 font-mono">{SUPER_ADMIN_EMAIL}</strong> atau pemegang Kode PIN Admin (<strong className="text-amber-300 font-mono">domain2026</strong>).
            </p>
          </div>

          {/* User Email Status Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Akun Google Terhubung:</span>
              </span>
              {isSuperAdminUser ? (
                <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SUPER ADMIN</span>
                </span>
              ) : (
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>OTENTIKASI PIN</span>
                </span>
              )}
            </div>

            <div className="text-xs font-mono font-bold text-slate-200 bg-slate-900 p-2 rounded-xl border border-slate-800 truncate">
              {currentUser?.email ? (
                <span className={isSuperAdminUser ? 'text-emerald-300 font-bold' : 'text-slate-300'}>
                  {currentUser.email}
                </span>
              ) : (
                <span className="text-slate-400 italic">Otentikasi PIN (domain2026) / Google Auth</span>
              )}
            </div>
          </div>

          {/* PIN Input Form (Always Accessible) */}
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Masukkan Kode PIN Admin</span>
                <span className="text-amber-400 font-mono font-normal">PIN: domain2026</span>
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  placeholder="Masukkan PIN: domain2026"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-amber-500/40 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Super Admin Diverifikasi! Membuka Portal Admin...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Masuk Portal Admin</span>
              </button>
            </div>
          </form>

          {/* Optional Google Login Option */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Login Google Akun ({SUPER_ADMIN_EMAIL})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

