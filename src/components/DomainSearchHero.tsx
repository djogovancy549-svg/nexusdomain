import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
} from 'lucide-react';
import { TLD_PRICING_CATALOG } from '../data/initialData';
import { DomainItem, TldPricing } from '../types';

interface DomainSearchHeroProps {
  existingDomains: DomainItem[];
  currency: 'IDR' | 'USD';
  onSelectRegisterDomain: (domainName: string, tld: string, price: number) => void;
}

export const DomainSearchHero: React.FC<DomainSearchHeroProps> = ({
  existingDomains,
  currency,
  onSelectRegisterDomain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Indonesia ccTLD' | 'Global' | 'Tech & Business'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle clean domain input (strip protocol, www, spaces, etc.)
  const cleanInput = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/https?:\/\//, '')
      .replace(/www\./, '')
      .replace(/[^a-z0-9-.]/g, '');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchQuery(cleanInput(searchTerm));
  };

  // Base domain keyword
  const baseKeyword = searchQuery
    ? searchQuery.split('.')[0]
    : searchTerm
    ? cleanInput(searchTerm).split('.')[0]
    : 'tokoberkah';

  // Format currency helper
  const formatPrice = (item: TldPricing) => {
    if (currency === 'IDR') {
      return `Rp ${item.promoPriceIDR.toLocaleString('id-ID')}`;
    }
    return `$${item.promoPriceUSD.toFixed(2)}`;
  };

  const formatNormalPrice = (item: TldPricing) => {
    if (currency === 'IDR') {
      return `Rp ${item.normalPriceIDR.toLocaleString('id-ID')}`;
    }
    return `$${item.normalPriceUSD.toFixed(2)}`;
  };

  // Check if a generated domain already exists in our registered database
  const isDomainTaken = (fullDomain: string) => {
    return existingDomains.some((d) => d.name.toLowerCase() === fullDomain.toLowerCase());
  };

  const filteredTlds = TLD_PRICING_CATALOG.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.type === selectedCategory;
  });

  return (
    <section className="relative overflow-hidden pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
      {/* Background Lighting Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Resmi Mitra PANDI &amp; ICANN Accredited • Proteksi DNSSEC &amp; SSL Otomatis</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Cari &amp; Daftarkan Domain Impian{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
            Berkeamanan Tinggi
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Amankan merek bisnis Anda dengan proteksi DNSSEC, SSL Seumur Hidup, dan database tersinkronisasi langsung ke Google Sheets dengan monitoring batas waktu kadaluarsa otomatis.
        </p>

        {/* Search Input Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-8 max-w-3xl mx-auto bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-2 backdrop-blur-xl"
        >
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik nama domain impian Anda (contoh: tokokreatif, warungdigital)..."
              className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Cek Domain</span>
          </button>
        </form>

        {/* Popular TLD Pricing Quick Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Rekomendasi TLD:</span>
          {TLD_PRICING_CATALOG.slice(0, 5).map((tldItem) => (
            <button
              key={tldItem.tld}
              onClick={() => {
                setSearchTerm(baseKeyword + tldItem.tld);
                setSearchQuery(baseKeyword + tldItem.tld);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="font-bold text-indigo-300">{tldItem.tld}</span>
              <span className="text-slate-400 text-[11px]">{formatPrice(tldItem)}/th</span>
            </button>
          ))}
          {/* Quick preset for user request */}
          <button
            onClick={() => {
              setSearchTerm('sipermas.my.id');
              setSearchQuery('sipermas.my.id');
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="font-bold">sipermas.my.id</span>
            <span className="text-amber-200/80 text-[11px] font-mono">Rp 12.000/th</span>
          </button>
        </div>

        {/* TLD Filter Category Tabs */}
        <div className="mt-10 flex items-center justify-center gap-1.5 p-1 bg-slate-900/60 border border-slate-800 rounded-xl w-fit mx-auto text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Ekstensi ({TLD_PRICING_CATALOG.length})
          </button>
          <button
            onClick={() => setSelectedCategory('Indonesia ccTLD')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              selectedCategory === 'Indonesia ccTLD'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇩 Domain Indonesia (.id, .my.id, .co.id)
          </button>
          <button
            onClick={() => setSelectedCategory('Global')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              selectedCategory === 'Global'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 Global (.com, .net, .org)
          </button>
          <button
            onClick={() => setSelectedCategory('Tech & Business')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              selectedCategory === 'Tech & Business'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚀 Tech &amp; Startup (.tech, .online)
          </button>
        </div>

        {/* Domain Search Results Grid */}
        {baseKeyword === 'sipermas' && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-indigo-500/20 border border-amber-500/40 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white font-mono">
                    sipermas<span className="text-amber-400">.my.id</span>
                  </h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Tersedia &amp; Siap Dihubungkan
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Domain resmi Indonesia PANDI • Siap langsung dihubungkan ke Cloudflare Pages <strong className="text-amber-300 font-mono">adminsipermas.pages.dev</strong> dengan proteksi DNSSEC &amp; SSL gratis seumur hidup.
                </p>
                <div className="mt-2 text-xs font-mono text-amber-300 font-bold">
                  Rp 12.000 <span className="text-slate-400 line-through text-[11px] font-normal">Rp 45.000</span> / tahun pertama
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRegisterDomain('sipermas', '.my.id', currency === 'IDR' ? 12000 : 0.99)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Daftarkan sipermas.my.id</span>
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
          {filteredTlds.map((tldItem) => {
            const fullDomain = `${baseKeyword}${tldItem.tld}`;
            const taken = isDomainTaken(fullDomain);

            return (
              <div
                key={tldItem.tld}
                className={`p-4 rounded-2xl border transition-all ${
                  taken
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {tldItem.discountBadge}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 font-mono truncate max-w-[200px]">
                      {baseKeyword}
                      <span className="text-indigo-400">{tldItem.tld}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {taken ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Terdaftar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Tersedia
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-white">
                        {formatPrice(tldItem)}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        {formatNormalPrice(tldItem)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">/ tahun pertama</span>
                  </div>

                  {!taken ? (
                    <button
                      onClick={() =>
                        onSelectRegisterDomain(
                          baseKeyword,
                          tldItem.tld,
                          currency === 'IDR' ? tldItem.promoPriceIDR : tldItem.promoPriceUSD
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      <span>Daftarkan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Sudah dimiliki
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
