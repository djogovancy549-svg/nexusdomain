import React, { useState } from 'react';
import {
  Check,
  Zap,
  Server,
  ShieldCheck,
  Globe,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { HOSTING_PACKAGES } from '../data/initialData';
import { HostingPackage } from '../types';

interface HostingPackagesProps {
  currency: 'IDR' | 'USD';
  onSelectPackage: (pkg: HostingPackage, billingCycle: 'yearly' | 'monthly') => void;
}

export const HostingPackages: React.FC<HostingPackagesProps> = ({
  currency,
  onSelectPackage,
}) => {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedDC, setSelectedDC] = useState<'jakarta' | 'singapore' | 'us'>('jakarta');

  const formatPrice = (priceIDR: number, priceUSD: number) => {
    if (currency === 'IDR') {
      return `Rp ${priceIDR.toLocaleString('id-ID')}`;
    }
    return `$${priceUSD.toFixed(2)}`;
  };

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Server className="w-3.5 h-3.5" />
            <span>Infrastruktur Cloud NVMe Tier-4 Enterprise</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Paket Cloud Web Hosting Berperforma Tinggi
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Didukung teknologi NVMe Gen-4, perlindungan L7 Anti-DDoS NexaShield, gratis SSL seumur hidup, dan manajemen domain terpadu.
          </p>

          {/* Controls: Billing Cycle & Datacenter Location */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs">
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Tahunan (Diskon Hingga 45%)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  + Domain Gratis
                </span>
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bulanan
              </button>
            </div>

            {/* Datacenter Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs">
              <span className="px-2 text-slate-400 text-[11px] font-medium hidden sm:inline">
                Lokasi Server:
              </span>
              <button
                onClick={() => setSelectedDC('jakarta')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  selectedDC === 'jakarta'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇮🇩 Jakarta (2ms)
              </button>
              <button
                onClick={() => setSelectedDC('singapore')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  selectedDC === 'singapore'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇸🇬 Singapore (8ms)
              </button>
              <button
                onClick={() => setSelectedDC('us')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  selectedDC === 'us'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🇺🇸 US West
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOSTING_PACKAGES.map((pkg) => {
            const isRec = pkg.recommended;
            const price = billingCycle === 'yearly' ? pkg.pricePerMonthIDR : pkg.pricePerMonthIDR * 1.35;
            const priceUSD = billingCycle === 'yearly' ? pkg.pricePerMonthUSD : pkg.pricePerMonthUSD * 1.35;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isRec
                    ? 'bg-gradient-to-b from-indigo-950/80 via-slate-900/90 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-102 lg:-translate-y-2'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {isRec && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                    Paling Populer &amp; Hemat
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                    {pkg.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">
                        {formatPrice(Math.round(price), priceUSD)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ bulan</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Ditagih tahunan (Domain Gratis 1 Th)
                      </p>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="mt-5 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <strong className="text-white">{pkg.features.websites}</strong>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{pkg.features.storage}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{pkg.features.performance}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className={pkg.features.freeDomain ? 'text-emerald-300 font-semibold' : ''}>
                        {pkg.features.freeDomain ? 'Gratis Domain 1 Tahun (.com / .id)' : 'Domain belum termasuk'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{pkg.features.ssl}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>{pkg.features.ddosShield}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{pkg.features.backup}</span>
                    </li>
                  </ul>
                </div>

                {/* Select Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onSelectPackage(pkg, billingCycle)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      isRec
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <span>Pilih Paket {pkg.name.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
