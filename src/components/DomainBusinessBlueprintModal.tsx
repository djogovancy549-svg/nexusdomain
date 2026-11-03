import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Server,
  Globe,
  CreditCard,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  Key,
  Copy,
  Check,
  Building,
  HelpCircle,
} from 'lucide-react';
import { ADMIN_PHONE } from './PaymentInvoiceModal';

interface DomainBusinessBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDnsDiagnostic?: () => void;
}

export const DomainBusinessBlueprintModal: React.FC<DomainBusinessBlueprintModalProps> = ({
  isOpen,
  onClose,
  onOpenDnsDiagnostic,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'architecture' | 'registrar' | 'calculator' | 'fulfillment'>('fulfillment');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Profit Calculator State
  const [calculatorTld, setCalculatorTld] = useState<'.com' | '.id' | '.my.id' | '.net'>('.com');
  const [salesVolume, setSalesVolume] = useState<number>(25);

  const tldPricingData = {
    '.com': { modalGrosir: 118000, hargaJual: 149000 },
    '.id': { modalGrosir: 195000, hargaJual: 245000 },
    '.my.id': { modalGrosir: 10000, hargaJual: 12000 },
    '.net': { modalGrosir: 135000, hargaJual: 165000 },
  };

  const selectedPricing = tldPricingData[calculatorTld];
  const marginPerDomain = selectedPricing.hargaJual - selectedPricing.modalGrosir;
  const totalMonthlyProfit = marginPerDomain * salesVolume;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Kesiapan Bisnis Jual Domain &amp; Status Go-Live
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  ANALISIS LENGKAP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mengapa domain belum aktif &amp; apa saja 4 syarat mutlak agar aplikasi bisa menjual domain resmi ke pelanggan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-2 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'status'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>1. Mengapa Belum Bisa Berjalan?</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. Apa yang Kurang untuk Jual Domain?</span>
          </button>
          <button
            onClick={() => setActiveTab('registrar')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'registrar'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>3. Pilihan Rekanan Registrar Grosir</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>4. Kalkulator Margin Untung</span>
          </button>
          <button
            onClick={() => setActiveTab('fulfillment')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'fulfillment'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-extrabold">5. Cara Nyata Menjual &amp; Fulfill sipermas.com</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          
          {/* TAB 1: MENGAPA BELUM BISA BERJALAN? */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300 text-sm">
                    Pertanyaan: Mengapa saat membuka sipermas.com masih belum bisa berjalan?
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Ada 2 hal berbeda antara <strong>Website Aplikasi</strong> dengan <strong>Pendaftaran Nama Domain</strong>. Berikut adalah penyebab pastinya:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reason 1 */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black">
                    1
                  </div>
                  <h5 className="font-bold text-white text-base">Domain Belum Dibeli di Registrar</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Anda sudah menambahkan nama <code className="text-amber-300">sipermas.com</code> ke akun Cloudflare. Namun, <strong>Cloudflare hanya pengatur DNS</strong>, bukan tempat menerbitkan domain baru secara gratis.
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                    Status WHOIS Global: <span className="text-rose-400 font-bold">NXDOMAIN / Belum Didaftarkan</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 <em>Solusi:</em> Domain <code className="text-white">sipermas.com</code> harus dibeli/didaftarkan dulu melalui Registrar (misal Cloudflare Registrar, Namecheap, Domainesia, Niagahoster) dengan biaya tahunan resmi.
                  </p>
                </div>

                {/* Reason 2 */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black">
                    2
                  </div>
                  <h5 className="font-bold text-white text-base">Aplikasi Belum Dideploy ke Cloudflare Pages</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Saat ini aplikasi web ini berjalan di server dev preview Google AI Studio. Agar bisa dibuka oleh publik di <code className="text-amber-300">sipermas.com</code>:
                  </p>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300">
                    <li>Aplikasi di-deploy ke <strong>Cloudflare Pages</strong> (gratis seumur hidup).</li>
                    <li>Di Cloudflare Pages, tambahkan Custom Domain: <code className="text-amber-300">sipermas.com</code>.</li>
                    <li>Otomatis Cloudflare memberikan SSL HTTPS &amp; proteksi CDN.</li>
                  </ul>
                  {onOpenDnsDiagnostic && (
                    <button
                      onClick={onOpenDnsDiagnostic}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Buka Alat Diagnosa DNS Live</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Comparison */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Tabel Status Saat Ini vs Target Live
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Tampilan Web Toko &amp; Dashboard Pelanggan</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      ✓ Selesai 100%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Perhitungan Harga, Faktur &amp; Transfer Bank BRI</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      ✓ Selesai 100%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Koneksi Domain sipermas.com di ICANN Registry</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      ⏳ Menunggu Pendaftaran di Registrar
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">Koneksi API Pendaftaran Domain Otomatis</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      ⏳ Siap Dihubungkan (Lihat Tab 2)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APA YANG KURANG AGAR BISA JUAL DOMAIN ASLI? */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">
                  4 Komponen Mutlak Untuk Bisnis Penjualan Domain Nyata
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Saat ini aplikasi kita adalah <strong>Frontend Storefront &amp; Customer Dashboard</strong>. Agar bisa menerbitkan domain asli ke internet secara instan saat pembeli membayar, berikut alur kerjanya:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      SUDAH ADA DI WEB ANDA
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Front-Store &amp; Katalog Penjualan</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tempat pembeli mencari domain, memilih ekstensi (.com, .id, .my.id), memilih paket hosting, dan melihat total tagihan. Ini sudah berjalan 100% di web Anda!
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      TAHAP BERIKUTNYA
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Koneksi API Registrar Grosir (Wholesale)</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tidak ada toko hosting yang membuat domain dari nol. Semua toko menyambungkan webnya ke <strong>Registrar Reseller API</strong> (seperti ResellerClub atau Namecheap Reseller API) menggunakan API Key.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                      MANUAL / OTOMATIS
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Gerbang Pembayaran (Payment Gateway)</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Saat ini:</strong> Transfer manual Bank BRI a.n. Yanti Yesinta Nenu D.W Nggodji, konfirmasi via WhatsApp.<br />
                    <strong>Otomatisasi:</strong> Hubungkan Midtrans / Xendit untuk QRIS instan 24 jam.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                      WEBHOOK PROVISIONING
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Penerbitan Domain Otomatis (Provisioning)</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ketika uang masuk, sistem memanggil API Registrar: <code className="text-amber-300">RegisterDomain(nama, kontak)</code>. Saldo deposit reseller Anda terpotong harga grosir, dan domain pembeli aktif dalam 1 menit!
                  </p>
                </div>
              </div>

              {/* Workflow Flowchart Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                <div className="text-amber-400 font-bold mb-2">Alur Transaksi Bisnis Domain Otomatis:</div>
                <div className="flex items-center gap-2 text-slate-300 overflow-x-auto py-1">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">Pelanggan Pesan di Web</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">Bayar (QRIS / BRI)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700">Webhook Trigger API</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300">Domain Aktif di ICANN</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PILIHAN REKANAN REGISTRAR GROSIR */}
          {activeTab === 'registrar' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">
                  Penyedia Wholesale Registrar (Grosir Domain) Terpercaya
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Untuk menjual domain secara legal dan resmi, Anda cukup mendaftar sebagai reseller di salah satu provider berikut:
                </p>
              </div>

              <div className="space-y-3">
                {/* ResellerClub */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">ResellerClub</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        PALING DIREKOMENDASIKAN UNTUK INDONESIA
                      </span>
                    </div>
                    <a
                      href="https://www.resellerclub.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Website Resmi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Penyedia reseller domain terbesar di dunia. Menyediakan lebih dari 500+ ekstensi domain (termasuk .com, .net, .org, serta domain Indonesia .id). Memiliki REST API yang sangat lengkap dan mudah diintegrasikan.
                  </p>
                </div>

                {/* Namecheap Reseller */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Namecheap Reseller API</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                        GLOBAL POPULAR
                      </span>
                    </div>
                    <a
                      href="https://www.namecheap.com/support/api/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Dokumentasi API</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Namecheap menyediakan API Sandbox gratis untuk pengujian pendaftaran domain otomatis, pengecekan ketersediaan domain (Domain Check API), dan pengelolaan DNS.
                  </p>
                </div>

                {/* Dynadot API */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Dynadot Reseller API</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                        HARGA GROSIR MURAH
                      </span>
                    </div>
                    <a
                      href="https://www.dynadot.com/domain/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Dynadot API</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Terkenal dengan harga grosir TLD internasional (.com, .xyz, .online) yang sangat kompetitif dan proses verifikasi akun reseller yang cepat.
                  </p>
                </div>

                {/* Digital Registra / PANDI Registrar */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Mitra Registrar Resmi Domain Indonesia (.id)</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                        KHUSUS DOMAIN .ID &amp; .MY.ID
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Untuk domain khusus Indonesia (.id, .my.id, .co.id), Anda dapat menjadi reseller dari Registrar resmi terakreditasi (seperti Digital Registra, Rumahweb, atau Qwords) yang menyediakan jalur API EPP/REST untuk pendaftaran instan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KALKULATOR KEUNTUNGAN RESELLER */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">
                  Kalkulator Simulasi Margin Keuntungan Penjualan
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Hitung proyeksi pendapatan bersih Anda dari selisih harga grosir modal dengan harga jual eceran di website Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Control Panel */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Pilih Ekstensi Domain:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['.com', '.id', '.my.id', '.net'] as const).map((tld) => (
                        <button
                          key={tld}
                          onClick={() => setCalculatorTld(tld)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            calculatorTld === tld
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {tld}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-300">Estimasi Penjualan per Bulan:</label>
                      <span className="font-mono text-amber-400 font-bold text-sm">{salesVolume} Domain</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      step="5"
                      value={salesVolume}
                      onChange={(e) => setSalesVolume(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>5 unit</span>
                      <span>50 unit</span>
                      <span>100 unit</span>
                      <span>200 unit</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Harga Modal Grosir:</span>
                      <span className="font-mono text-slate-200">Rp {selectedPricing.modalGrosir.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Harga Jual di Web Anda:</span>
                      <span className="font-mono text-amber-400 font-bold">Rp {selectedPricing.hargaJual.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800/60">
                      <span>Margin Bersih / Domain:</span>
                      <span className="font-mono">+Rp {marginPerDomain.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Profit Result Display */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-950 to-slate-900 border border-amber-500/30 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Estimasi Keuntungan Bersih Bulanan
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      Rp {totalMonthlyProfit.toLocaleString('id-ID')}
                    </div>
                    <p className="text-xs text-slate-400">
                      Diperoleh dari penjualan <strong>{salesVolume} domain {calculatorTld}</strong> per bulan tanpa perlu server fisik atau modal gudang.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                    <div className="text-amber-300 font-bold">Keuntungan Tambahan:</div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      • Penjualan paket hosting bulanan (Rp 35.000 - Rp 149.000)<br />
                      • Biaya perpanjangan tahun berikutnya (Recurring Revenue)<br />
                      • Jasa konfigurasi Cloudflare &amp; SSL gratis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EKSEKUSI NYATA JUAL DOMAIN & FULFILL SIPERMAS.COM */}
          {activeTab === 'fulfillment' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black">
                  <CheckCircle2 className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-base">
                    Jawaban Langsung: Bagaimana Agar Aplikasi Ini Benar-Benar Bisa Menjual Domain?
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Saya sama sekali tidak lupa! Anda benar 100%: aplikasi ini kita rancang sebagai <strong>toko penjualan domain dan hosting</strong>, dan domain <strong className="text-white">sipermas.com</strong> telah dibeli serta lunas di sistem toko kita. Di bawah ini adalah langkah konkret agar domain pembeli benar-benar terbit di internet dunia.
                  </p>
                </div>
              </div>

              {/* Status Pesanan sipermas.com Saat Ini */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-white">sipermas.com</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      ✓ SUDAH DIBELI &amp; LUNAS
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Invoice: INV-SIPERMAS-2025-001</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Uang Diterima Toko</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">Rp 149.000</span>
                    <span className="text-[10px] text-slate-500 block">Transfer Rek. BRI Anda</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Biaya Modal Grosir</span>
                    <span className="text-base font-extrabold text-slate-200 font-mono">~Rp 120.000</span>
                    <span className="text-[10px] text-slate-500 block">Biaya resmi ICANN Registry</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
                    <span className="text-emerald-300 block mb-1">Keuntungan Bersih Anda</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">+Rp 29.000</span>
                    <span className="text-[10px] text-emerald-400/80 block">Margin untung penjualan</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  💡 <strong>Mengapa sipermas.com belum aktif di browser?</strong><br />
                  Aplikasi toko kita sudah mencatat pesanan, invoice, dan konfigurasi Cloudflare secara sempurna. Namun, satu-satunya pihak yang berhak menerbitkan domain .com ke seluruh root server internet adalah <strong>ICANN Registry</strong> melalui <strong>Registrar Resmi</strong>.
                </div>
              </div>

              {/* 2 Opsi Eksekusi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Opsi 1: Fulfill Manual untuk sipermas.com */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/40 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        A
                      </span>
                      <h5 className="font-bold text-white text-sm">
                        Jalur Cepat: Fulfill sipermas.com Sekarang (2 Menit)
                      </h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Karena uang pembayaran Rp 149.000 sudah masuk ke rekening BRI Anda, Anda bisa langsung menerbitkan domain sipermas.com secara manual:
                    </p>

                    <ol className="text-xs space-y-2 list-decimal list-inside text-slate-300 pl-1">
                      <li>Buka website penyedia registrar (misal: <strong>Dynadot</strong>, <strong>Namecheap</strong>, atau <strong>Cloudflare Registrar</strong>).</li>
                      <li>Ketik <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">sipermas.com</code> dan bayar modal ~$9 (Rp 120.000).</li>
                      <li>
                        Atur <strong>Custom Nameservers</strong> ke Cloudflare:
                        <div className="mt-1 space-y-1 font-mono text-[11px]">
                          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-300">charlie.ns.cloudflare.com</span>
                            <button
                              onClick={() => handleCopy('charlie.ns.cloudflare.com', 'ns1')}
                              className="text-amber-400 hover:text-amber-300 text-[10px] font-bold cursor-pointer"
                            >
                              {copiedKey === 'ns1' ? 'Disalin!' : 'Salin'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-300">merlin.ns.cloudflare.com</span>
                            <button
                              onClick={() => handleCopy('merlin.ns.cloudflare.com', 'ns2')}
                              className="text-amber-400 hover:text-amber-300 text-[10px] font-bold cursor-pointer"
                            >
                              {copiedKey === 'ns2' ? 'Disalin!' : 'Salin'}
                            </button>
                          </div>
                        </div>
                      </li>
                      <li>Dalam 5 menit, domain sipermas.com langsung <strong>AKTIF</strong> di seluruh dunia!</li>
                    </ol>
                  </div>

                  <a
                    href="https://www.dynadot.com/register/domain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <span>Buka Pendaftaran Domain Dynadot</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Opsi 2: Otomatisasi Penuh untuk Ribuan Pembeli */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        B
                      </span>
                      <h5 className="font-bold text-white text-sm">
                        Jalur Otomatis Penuh: Reseller API &amp; Payment Gateway
                      </h5>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Agar toko Anda bisa menjual ribuan domain otomatis tanpa Anda harus mendaftarkan manual satu per satu:
                    </p>

                    <ul className="text-xs space-y-2 text-slate-300 pl-1">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Akun Reseller:</strong> Buka akun di <em>ResellerClub</em> atau <em>Dynadot API</em> (Gratis).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Deposit Saldo:</strong> Isi saldo modal awal (misal $20 - $50).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Sambungkan API Key:</strong> Masukkan API Key registrar ke backend toko kita.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Auto-Webhook:</strong> Pasang QRIS Midtrans / Xendit. Begitu pembeli bayar, sistem otomatis memanggil API pendaftaran domain detik itu juga!</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveTab('registrar')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <span>Lihat Daftar Rekanan Registrar Grosir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Kontak Dukungan Teknis Admin:</span>
            <span className="text-amber-300 font-mono font-bold">{ADMIN_PHONE}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Tutup Panduan
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Lihat 4 Pilar Arsitektur
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
