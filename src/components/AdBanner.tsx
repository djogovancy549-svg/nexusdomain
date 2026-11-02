import React, { useState } from 'react';
import { Tag, Sparkles, Zap, ShieldCheck, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { ADMIN_PHONE } from './PaymentInvoiceModal';

// Generated High-Quality Hostinger-Style Banner Assets
import cloudBannerImg from '../assets/images/cloud_hosting_hero_banner_1793612563042.jpg';
import domainBannerImg from '../assets/images/domain_registration_promo_banner_1793612585439.jpg';

interface AdBannerProps {
  onRegisterClick?: (tld: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onRegisterClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const promos = [
    {
      id: 'cloud-hosting',
      tag: 'SUPER CLOUD HOSTING IIX HOSTINGER-CLASS',
      title: 'Cloud NVMe Hosting + Free Domain .COM + SSL Lifetime',
      desc: 'Infrastruktur hosting ultra cepat lokasi server Jakarta (IIX Latency < 5ms). Dilengkapi LiteSpeed Web Server, cPanel otomatis & gratis migrasi dari provider lain.',
      oldPrice: 'Rp 65.000/bln',
      newPrice: 'Rp 29.000/bln',
      badge: 'Diskon 55%',
      accent: 'from-purple-900/90 via-slate-900/90 to-blue-900/90',
      image: cloudBannerImg,
      tld: '.com',
    },
    {
      id: 'id-promo',
      tag: 'PROMO NASIONAL DOMAIN .ID 2026',
      title: 'Domain .ID Resmi Indonesia Hanya Rp 55.000 / Tahun',
      desc: 'Tingkatkan kredibilitas & SEO bisnis Indonesia Anda dengan ekstensi domain resmi Republik Indonesia. Termasuk WHOIS Privacy & DNS Management gratis selamanya.',
      oldPrice: 'Rp 250.000',
      newPrice: 'Rp 55.000',
      badge: 'Hemat 78%',
      accent: 'from-emerald-900/90 via-slate-900/90 to-teal-900/90',
      image: domainBannerImg,
      tld: '.id',
    },
    {
      id: 'my-id-promo',
      tag: 'PROMO DOMAIN UNTUK UMKM & DIGITAL CREATOR',
      title: 'Domain .MY.ID Super Murah Rp 12.000 / Tahun',
      desc: 'Sangat cocok untuk website toko online, portofolio digital, blog pribadi, dan branding profesional tanpa ribet verifikasi dokumen.',
      oldPrice: 'Rp 50.000',
      newPrice: 'Rp 12.000',
      badge: 'Super Saver',
      accent: 'from-amber-900/90 via-slate-900/90 to-orange-900/90',
      image: domainBannerImg,
      tld: '.my.id',
    },
  ];

  return (
    <div className="w-full my-8">
      {/* Banner Top Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
            Penawaran Eksklusif &amp; Promo Hostinger-Class NageDomain
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
          <Clock className="w-3.5 h-3.5" /> Promo Terbatas 2026
        </div>
      </div>

      {/* Hero Visual Promo Carousel */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl min-h-[320px] flex flex-col justify-between">
        {/* Background Graphic Image with Blur Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={promos[activeSlide].image}
            alt={promos[activeSlide].title}
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-all duration-700 filter brightness-90 contrast-110"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${promos[activeSlide].accent} backdrop-blur-[2px] transition-all duration-700`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 my-auto">
          {/* Left Text Box */}
          <div className="space-y-3.5 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-xs font-bold text-amber-400 shadow-lg backdrop-blur-md">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>{promos[activeSlide].tag}</span>
              <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-md text-[10px] font-black uppercase tracking-wider">
                {promos[activeSlide].badge}
              </span>
            </div>

            <h4 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
              {promos[activeSlide].title}
            </h4>

            <p className="text-xs md:text-sm text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
              {promos[activeSlide].desc}
            </p>

            {/* Micro Advantages */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-200 pt-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Garansi Uang Kembali
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Free Auto-SSL &amp; DNSSEC
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-indigo-500/30 text-indigo-300">
                <Zap className="w-4 h-4 text-amber-400" /> Latency Server &lt; 5ms
              </span>
            </div>
          </div>

          {/* Right Price & Call-To-Action Box */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-900/90 border border-amber-500/30 p-6 rounded-2xl text-center w-full md:w-72 shadow-2xl backdrop-blur-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Harga Special Offer
            </span>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                {promos[activeSlide].newPrice}
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                {promos[activeSlide].oldPrice}
              </span>
            </div>

            <button
              onClick={() => onRegisterClick && onRegisterClick(promos[activeSlide].tld)}
              className="w-full mt-5 py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/20 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Klaim Promo Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href={`https://wa.me/62${ADMIN_PHONE.replace(/^0/, '')}?text=Halo%20Admin%20NageDomain,%20saya%20tertarik%20dengan%20promo%20${encodeURIComponent(promos[activeSlide].title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-xs text-slate-300 hover:text-amber-400 transition underline flex items-center gap-1 font-semibold"
            >
              Konsultasi WhatsApp Admin
            </a>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="relative z-10 flex items-center justify-center gap-2 p-3 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md">
          {promos.map((promo, idx) => (
            <button
              key={promo.id}
              onClick={() => setActiveSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx ? 'w-10 bg-amber-400 shadow-lg shadow-amber-400/50' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
