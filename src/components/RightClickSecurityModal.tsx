import React from 'react';
import { ShieldAlert, Lock, ShieldCheck, X } from 'lucide-react';

interface RightClickSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const RightClickSecurityModal: React.FC<RightClickSecurityModalProps> = ({
  isOpen,
  onClose,
  reason = 'Klik kanan & inspeksi elemen dinonaktifkan demi perlindungan hak cipta data pelanggan, struktur DNS, dan transaksi CV. EBI.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6">
        {/* Glowing Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-3 h-3" /> EBI Security Shield Enabled
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Perlindungan Keamanan Aktif
            </h3>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-sm text-slate-300 space-y-2 mb-6">
          <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Sistem Anti-Exploit CV. EBI
          </p>
          <p className="leading-relaxed text-slate-300">
            {reason}
          </p>
        </div>

        <div className="text-xs text-slate-400 space-y-1 mb-6 border-l-2 border-emerald-500/50 pl-3">
          <p>• Seluruh lalu lintas data dilindungi enkripsi SSL 256-bit.</p>
          <p>• Otomatis mencegah injeksi SQL, XSS, dan ekstraksi data unauthorized.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition duration-200"
        >
          Saya Mengerti & Lanjutkan
        </button>
      </div>
    </div>
  );
};
