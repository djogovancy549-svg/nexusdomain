import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { DomainItem } from '../types';
import { calculateRemainingDays } from '../services/googleSheets';

interface RenewDomainModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  currency: 'IDR' | 'USD';
  onRenewSuccess: (domainId: string, newExpirationDate: string, yearsAdded: number) => void;
}

export const RenewDomainModal: React.FC<RenewDomainModalProps> = ({
  domain,
  isOpen,
  onClose,
  currency,
  onRenewSuccess,
}) => {
  if (!isOpen || !domain) return null;

  const [yearsToAdd, setYearsToAdd] = useState<number>(1);
  const currentDays = calculateRemainingDays(domain.expirationDate);

  // Compute new expiration date from current expiration date
  const currentExpiry = new Date(domain.expirationDate);
  const baseDate = currentDays < 0 ? new Date() : currentExpiry;
  const newExpiry = new Date(baseDate);
  newExpiry.setFullYear(newExpiry.getFullYear() + yearsToAdd);
  const formattedNewExpiry = newExpiry.toISOString().slice(0, 10);

  const pricePerYearIDR = domain.tld === '.my.id' ? 12000 : domain.tld === '.id' ? 225000 : 149000;
  const pricePerYearUSD = domain.tld === '.my.id' ? 0.99 : domain.tld === '.id' ? 14.90 : 9.99;

  const totalPrice = currency === 'IDR' ? pricePerYearIDR * yearsToAdd : pricePerYearUSD * yearsToAdd;

  const handleConfirmRenew = () => {
    onRenewSuccess(domain.id, formattedNewExpiry, yearsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Perpanjang Batas Waktu Domain
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {domain.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Current Status Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Batas Waktu Saat Ini:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {domain.expirationDate}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Sisa Waktu:</span>
              <span className={`font-bold ${currentDays < 0 ? 'text-rose-400' : currentDays <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currentDays < 0 ? `Kadaluarsa (${Math.abs(currentDays)} hari lalu)` : `${currentDays} Hari Lagi`}
              </span>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Pilih Tambahan Masa Aktif:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[1, 2, 3].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setYearsToAdd(yr)}
                  className={`py-2.5 rounded-xl border text-center transition cursor-pointer ${
                    yearsToAdd === yr
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +{yr} Tahun
                </button>
              ))}
            </div>
          </div>

          {/* New Expiry Date Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">Batas Waktu Baru Setelah Perpanjangan:</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">
                  {formattedNewExpiry}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Total Biaya:</span>
              <span className="font-bold text-white text-sm">
                {currency === 'IDR' ? `Rp ${totalPrice.toLocaleString('id-ID')}` : `$${totalPrice.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Sync Notice */}
          <div className="text-[11px] text-slate-400 flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Pembaruan batas waktu ini akan otomatis disinkronkan ke database Google Sheet Anda.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmRenew}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi Perpanjangan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
