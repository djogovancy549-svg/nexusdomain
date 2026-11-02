import React from 'react';
import { Check, X, Shield, Zap, Server, PhoneCall, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import { ADMIN_PHONE } from './PaymentInvoiceModal';

export const HostingerComparison: React.FC = () => {
  const comparisonItems = [
    {
      feature: 'Kecepatan Server & Latency Akses Indonesia',
      ebi: 'IIX Jakarta Cloud (< 5ms Latency Super Cepat)',
      hostinger: 'Server Luar Negeri / Singapore (120ms - 250ms)',
      isEbiWinner: true,
    },
    {
      feature: 'Transparansi Biaya Perpanjangan (Renewal)',
      ebi: '0% Kenaikan Tersembunyi (Harga Tetap Jujur Tahun ke-2)',
      hostinger: 'Naik hingga 200% - 300% pada tahun berikutnya',
      isEbiWinner: true,
    },
    {
      feature: 'Proteksi WHOIS Privacy & DNSSEC Lifetime',
      ebi: 'GRATIS Selamanya (Rp 0 Tanpa Biaya Tambahan)',
      hostinger: 'Berbayar / Terbatas pada Paket Tertentu',
      isEbiWinner: true,
    },
    {
      feature: 'Metode Pembayaran & Transaksi',
      ebi: 'Transfer Langsung Bank BRI Resmi & Konfirmasi Instan Admin',
      hostinger: 'Diutamakan Kartu Kredit / E-Wallet biaya admin tinggi',
      isEbiWinner: true,
    },
    {
      feature: 'Dukungan Pelanggan (Customer Support)',
      ebi: 'WhatsApp Direct & Email 24/7 Bahasa Indonesia Tanpa Bot',
      hostinger: 'Antrean Support Ticket / Bot AI Bahasa Inggris',
      isEbiWinner: true,
    },
    {
      feature: 'Keamanan Portal & Perlindungan Data',
      ebi: 'Firewall Anti-SQL Injection, Right-Click Lock & Google Sheets Sync',
      hostinger: 'Manajemen Standar tanpa Sinkronisasi Master Sheet Custom',
      isEbiWinner: true,
    },
  ];

  return (
    <div className="w-full my-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Award className="w-4 h-4 text-blue-400" /> Mengapa Memilih CV. EBI?
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Perbandingan Fitur: <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">CV. EBI Domain</span> vs Provider Global (Hostinger)
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Ketahui mengapa ribuan pelanggan bisnis dan pengembang lokal memilih infrastruktur CV. EBI untuk performa domain dan hosting terbaik di Indonesia.
        </p>
      </div>

      {/* Feature Cards Grid for Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-slate-950/70 border border-emerald-500/30 p-5 rounded-2xl relative group hover:border-emerald-500 transition duration-300">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Latency Super Rendah</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Routing langsung ke IXP (Indonesia Internet Exchange) dengan akses waktu tanggap under 5ms, 10x lebih cepat dibanding server luar negeri.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-cyan-500/30 p-5 rounded-2xl relative group hover:border-cyan-500 transition duration-300">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 w-fit mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Tanpa Jebakan Perpanjangan</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Harga perpanjangan domain tahun ke-2 jujur dan transparan tanpa kenaikan harga tersembunyi hingga ratusan persen.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-indigo-500/30 p-5 rounded-2xl relative group hover:border-indigo-500 transition duration-300">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit mb-4">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Support WhatsApp Personal</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dilayani langsung oleh tim teknis admin via WhatsApp & Email tanpa antrean bot otomatis yang membingungkan.
          </p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="p-4 md:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fitur & Layanan Domain
              </th>
              <th className="p-4 md:p-5 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/30 border-x border-emerald-900/50">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" /> CV. EBI Domain Hub
                </span>
              </th>
              <th className="p-4 md:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hostinger / Provider Lain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs md:text-sm">
            {comparisonItems.map((item, index) => (
              <tr key={index} className="hover:bg-slate-900/50 transition">
                <td className="p-4 md:p-5 font-semibold text-slate-200">
                  {item.feature}
                </td>
                <td className="p-4 md:p-5 text-emerald-300 font-medium bg-emerald-950/20 border-x border-emerald-900/30 flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item.ebi}</span>
                </td>
                <td className="p-4 md:p-5 text-slate-400 flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{item.hostinger}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom CTA Callout */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Ingin memindahkan domain dari Hostinger ke CV. EBI?</p>
          <p>Dapatkan gratis sisa masa aktif domain + gratis EPP/Auth code transfer assistance.</p>
        </div>

        <a
          href={`https://wa.me/62${ADMIN_PHONE.replace(/^0/, '')}?text=Halo%20Admin%20CV.%20EBI,%20saya%20ingin%20migrasi%20domain/hosting%20dari%20provider%20lain.`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition duration-200 flex items-center gap-2"
        >
          Konsultasi Migrasi Gratis <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
