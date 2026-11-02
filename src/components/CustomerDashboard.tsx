import React, { useState } from 'react';
import {
  Globe,
  Server,
  ShieldCheck,
  CreditCard,
  Clock,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  Building2,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';
import { DomainItem, TldPricing } from '../types';
import { ADMIN_PHONE, ADMIN_PHONE_WA, ADMIN_EMAIL } from './PaymentInvoiceModal';

interface CustomerDashboardProps {
  domains: DomainItem[];
  tldPricing: TldPricing[];
  currency: 'IDR' | 'USD';
  onOpenRegisterModal: () => void;
  onOpenDnsModal: (domain: DomainItem) => void;
  onOpenHostingModal: (domain: DomainItem) => void;
  onOpenRenewModal: (domain: DomainItem) => void;
  onOpenCertModal: (domain: DomainItem) => void;
  onOpenCfPagesModal: (domain: DomainItem) => void;
  onOpenInvoiceModal: (domain: DomainItem) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  domains,
  tldPricing,
  currency,
  onOpenRegisterModal,
  onOpenDnsModal,
  onOpenHostingModal,
  onOpenRenewModal,
  onOpenCertModal,
  onOpenCfPagesModal,
  onOpenInvoiceModal,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeSubTab, setActiveSubTab] = useState<'domains' | 'billing' | 'security'>('domains');

  // Format currency
  const formatMoney = (idrAmount: number, usdAmount: number) => {
    if (currency === 'USD') {
      const amount = billingCycle === 'monthly' ? usdAmount / 10 : usdAmount;
      return `$${amount.toFixed(2)}/${billingCycle === 'monthly' ? 'bln' : 'thn'}`;
    }
    const amount = billingCycle === 'monthly' ? Math.round(idrAmount / 11) : idrAmount;
    return `Rp ${amount.toLocaleString('id-ID')} /${billingCycle === 'monthly' ? 'bln' : 'thn'}`;
  };

  const activeDomainsCount = domains.filter((d) => d.status === 'active').length;
  const sslActiveCount = domains.filter((d) => d.sslStatus === 'active').length;
  const dnssecCount = domains.filter((d) => d.dnssecEnabled).length;

  const handleGeneralWhatsapp = () => {
    const text = encodeURIComponent(`Halo Admin CV EBI (${ADMIN_PHONE}), saya ingin bertanya tentang pendaftaran domain & hosting.`);
    window.open(`https://wa.me/${ADMIN_PHONE_WA}?text=${text}`, '_blank');
  };

  const handleGeneralEmail = () => {
    window.open(`mailto:${ADMIN_EMAIL}?subject=Pertanyaan%20Layanan%20Domain%20CV%20EBI`, '_blank');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Welcome & Account Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EbiDomain Client Area • Portal Pelanggan Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Selamat Datang di Dashboard Pelanggan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Layanan managed domain &amp; cloud hosting profesional oleh Tim CV EBI. Transfer pembayaran ke Bank BRI resmi dan konfirmasi via HP (<strong className="text-emerald-400 font-mono">{ADMIN_PHONE}</strong>), Email Admin, atau langsung di Web Admin portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleGeneralWhatsapp}
              className="px-4 py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Kontak WA {ADMIN_PHONE}</span>
            </button>
            <button
              onClick={handleGeneralEmail}
              className="px-4 py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Email Admin</span>
            </button>
            <button
              onClick={onOpenRegisterModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Daftar Domain Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keunggulan CV EBI vs Hostinger Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/50 border border-indigo-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Pemberitahuan Layanan Managed Domain CV EBI (Beda dengan Hostinger)</span>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
            AMAN &amp; TERJAMIN
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Di Hostinger, pelanggan dibebaskan mengatur DNS sendiri yang sering kali menyebabkan salah pengetikan dan website down. Di <strong>CV EBI</strong>, demi keamanan pelanggan, <strong>Tim Admin membantu mengonfigurasi DNS, Cloudflare, dan SSL secara gratis setelah pembayaran transfer BRI terverifikasi</strong>. Pelanggan dapat mengonfirmasi pembayaran lewat WA HP <strong>{ADMIN_PHONE}</strong>, tombol email admin, atau langsung di formulir web admin.
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Domain Aktif</span>
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{activeDomainsCount}</div>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Semua terkelola aman</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sertifikat SSL</span>
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{sslActiveCount}</div>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Enkripsi HTTPS Aktif</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Rekening Transfer BRI</span>
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-xs font-mono font-bold text-amber-300">4625-01-020206-53-7</div>
          <p className="text-[11px] text-slate-400 truncate">a.n. Yanti Yesinta Nenu D.W Nggodji</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Siklus Penagihan</span>
            <CreditCard className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tahunan
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation for Client Portal */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveSubTab('domains')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'domains'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Domain Saya ({domains.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('billing')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'billing'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Katalog Harga &amp; Transfer BRI</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'security'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Proteksi Managed Domain</span>
        </button>
      </div>

      {/* Tab 1: Domains List */}
      {activeSubTab === 'domains' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Daftar Domain Milik Anda</h3>
            <span className="text-xs text-slate-400 font-mono">Total {domains.length} Domain terdaftar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-white tracking-wide">{dom.name}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                          dom.paymentStatus === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {dom.paymentStatus === 'paid' ? '✓ LUNAS' : '⏳ MENUNGGU PEMBAYARAN'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Hosting: {dom.hostingPlan}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Jatuh Tempo</span>
                    <div className="text-xs font-bold text-amber-300 font-mono">{dom.expirationDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Status SSL</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      {dom.sslStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">DNSSEC</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {dom.dnssecEnabled ? 'PROTECTED' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => onOpenInvoiceModal(dom)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Faktur &amp; Transfer BRI</span>
                  </button>
                  <button
                    onClick={() => onOpenCertModal(dom)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sertifikat</span>
                  </button>
                  <button
                    onClick={() => onOpenRenewModal(dom)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Perpanjang</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Billing & TLD Pricing */}
      {activeSubTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Katalog Harga Domain &amp; Rekening BRI</h3>
              <p className="text-xs text-slate-400 mt-1">
                Lakukan transfer ke Bank BRI: <strong>4625-01-020206-53-7</strong> (a.n. Yanti Yesinta Nenu D.W Nggodji)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tagihan Per Bulan
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'annual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tagihan Per Tahun
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tldPricing.map((item) => (
              <div
                key={item.tld}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">{item.tld}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                      {item.type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400">Harga Langganan ({billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'})</span>
                    <div className="text-2xl font-extrabold text-amber-400 font-mono">
                      {formatMoney(item.promoPriceIDR, item.promoPriceUSD)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{item.discountBadge}</span>
                  <button
                    onClick={onOpenRegisterModal}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Pesan Sekarang</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security Protection Standards */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Standar Keamanan Managed CV EBI</h3>
            <p className="text-xs text-slate-400 mt-1">
              Setiap domain yang dikelola dilindungi dengan enkripsi berlapis dan proteksi data oleh Tim Admin CV EBI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">DNSSEC ECDSA Cryptography</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Melindungi lalu lintas DNS pelanggan dari serangan pembajakan DNS (*DNS Cache Poisoning*).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">WHOIS Privacy Shield</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menyembunyikan informasi pribadi pemilik domain dari database publik WHOIS.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Transfer Resmi BRI &amp; Kontak Admin</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pembayaran diverifikasi langsung oleh Admin ke rekening Bank BRI (4625-01-020206-53-7 a.n. Yanti Yesinta Nenu D.W Nggodji). Kontak WA HP <strong>{ADMIN_PHONE}</strong> &amp; Layanan Email Admin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
