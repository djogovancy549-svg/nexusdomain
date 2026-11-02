import React, { useState } from 'react';
import { Tag, Sparkles, Zap, ShieldCheck, ArrowRight, Percent, CheckCircle2, Clock } from 'lucide-react';
import { ADMIN_PHONE } from './PaymentInvoiceModal';

interface AdBannerProps {
  onRegisterClick?: (tld: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onRegisterClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const promos = [
    {
      id: 'id-promo',
      tag: 'PROMO NASIONAL .ID 2026',
      title: 'Domain .ID Resmi Indonesia Hanya Rp 55.000 / Tahun',
      desc: 'Tingkatkan kepercayaan bisnis lokal dengan ekstensi domain resmi Republik Indonesia. Gratis WHOIS Privacy & DNS Management.',
      oldPrice: 'Rp 250.000',
      newPrice: 'Rp 55.000',
      badge: 'Hemat 78%',
      accent: 'from-rose-600 to-amber-600',
      tld: '.id',
    },
    {
      id: 'cloud-hosting',
      tag: 'SUPER CLOUD HOSTING IIX',
      title: 'Cloud NVMe Hosting + Free Domain .COM + SSL Lifetime',
      desc: 'Hosting super cepat lokasi server Jakarta (IIX Latency < 5ms). Gratis Migrasi dari Hostinger / penyedia lain.',
      oldPrice: 'Rp 65.000/bln',
      newPrice: 'Rp 29.000/bln',
      badge: 'Diskon 55%',
      accent: 'from-blue-600 to-indigo-600',
      tld: '.com',
    },
    {
      id: 'my-id-promo',
      tag: 'PROMO DOKUMEN & UMKM',
      title: 'Domain .MY.ID Super Murah Rp 12.000 / Tahun',
      desc: 'Cocok untuk website personal, portfolio, blog, dan branding bisnis pemula. Tanpa syarat KTP ribet.',
      oldPrice: 'Rp 50.000',
      newPrice: 'Rp 12.000',
      badge: 'Super Cheap',
      accent: 'from-emerald-600 to-teal-600',
      tld: '.my.id',
    },
  ];

  return (
    <div className="w-full my-8">
      {/* Banner Title Badge */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
            Penawaran Spesial & Promo Domain CV. EBI
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" /> Berakhir Dalam: 3 Hari
        </div>
      </div>

      {/* Main Promo Carousel Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Background Gradient Mesh */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${promos[activeSlide].accent} transition-all duration-700`} />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text Info */}
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-amber-400">
              <Tag className="w-3.5 h-3.5" />
              {promos[activeSlide].tag}
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded text-[10px] font-bold">
                {promos[activeSlide].badge}
              </span>
            </div>

            <h4 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
              {promos[activeSlide].title}
            </h4>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {promos[activeSlide].desc}
            </p>

            {/* Micro Benefits */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Garansi Uang Kembali
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Free Auto-SSL & DNSSEC
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <Zap className="w-3.5 h-3.5" /> Server Latency &lt; 5ms
              </span>
            </div>
          </div>

          {/* Right Price Card & Action Button */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl text-center w-full md:w-64 backdrop-blur-sm">
            <span className="text-xs text-slate-400">Harga Spesial Promo</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {promos[activeSlide].newPrice}
              </span>
              <span className="text-xs text-slate-500 line-through">
                {promos[activeSlide].oldPrice}
              </span>
            </div>
            
            <button
              onClick={() => onRegisterClick && onRegisterClick(promos[activeSlide].tld)}
              className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 group"
            >
              Klaim Promo Sekarang
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href={`https://wa.me/62${ADMIN_PHONE.replace(/^0/, '')}?text=Halo%20Admin%20CV.%20EBI,%20saya%20tertarik%20dengan%20promo%20${encodeURIComponent(promos[activeSlide].title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[11px] text-slate-400 hover:text-amber-400 transition underline flex items-center gap-1"
            >
              Konsultasi WhatsApp Admin
            </a>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-2 p-3 bg-slate-950/40 border-t border-slate-800/50">
          {promos.map((promo, idx) => (
            <button
              key={promo.id}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
