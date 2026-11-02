import React, { useState } from 'react';
import {
  Globe,
  Clock,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Settings,
  Server,
  FileSpreadsheet,
  Plus,
  Award,
  Share2,
  DollarSign,
  Phone,
  FileCheck,
  Wifi,
  Cloud,
  Check,
  Inbox,
  UserCheck,
  Mail,
  Send,
} from 'lucide-react';
import { DomainItem, PaymentConfirmation } from '../types';
import { calculateRemainingDays, getExpirationStatusLabel } from '../services/googleSheets';
import { ADMIN_PHONE, ADMIN_EMAIL } from './PaymentInvoiceModal';

interface DomainManagementTableProps {
  domains: DomainItem[];
  currency: 'IDR' | 'USD';
  isAdminView?: boolean;
  paymentConfirmations?: PaymentConfirmation[];
  onVerifyConfirmation?: (confirmationId: string, domainId: string) => void;
  onRejectConfirmation?: (confirmationId: string) => void;
  onOpenDnsModal: (domain: DomainItem) => void;
  onOpenHostingModal: (domain: DomainItem) => void;
  onOpenRenewModal: (domain: DomainItem) => void;
  onOpenCertificateModal: (domain: DomainItem) => void;
  onOpenReadinessModal: (domain: DomainItem) => void;
  onOpenCloudflarePagesModal?: (domain: DomainItem) => void;
  onToggleAutoRenew: (domainId: string) => void;
  onToggleWhoisPrivacy: (domainId: string) => void;
  onToggleDnssec: (domainId: string) => void;
  onTogglePaymentStatus: (domainId: string) => void;
  onToggleTransferLock: (domainId: string) => void;
  onOpenRegisterModal: () => void;
  onOpenSheetsModal: () => void;
}

export const DomainManagementTable: React.FC<DomainManagementTableProps> = ({
  domains,
  currency,
  isAdminView = true,
  paymentConfirmations = [],
  onVerifyConfirmation,
  onRejectConfirmation,
  onOpenDnsModal,
  onOpenHostingModal,
  onOpenRenewModal,
  onOpenCertificateModal,
  onOpenReadinessModal,
  onOpenCloudflarePagesModal,
  onToggleAutoRenew,
  onToggleWhoisPrivacy,
  onToggleDnssec,
  onTogglePaymentStatus,
  onToggleTransferLock,
  onOpenRegisterModal,
  onOpenSheetsModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring_soon' | 'expired'>('all');
  const [showConfirmationsTab, setShowConfirmationsTab] = useState(false);

  // Stats calculation
  const totalDomains = domains.length;
  const expiringSoonCount = domains.filter((d) => {
    const days = calculateRemainingDays(d.expirationDate);
    return days >= 0 && days <= 30;
  }).length;

  const expiredCount = domains.filter((d) => {
    const days = calculateRemainingDays(d.expirationDate);
    return days < 0;
  }).length;

  const activeCount = domains.filter((d) => {
    const days = calculateRemainingDays(d.expirationDate);
    return days > 30;
  }).length;

  const dnssecCount = domains.filter((d) => d.dnssecEnabled).length;
  const pendingConfirmations = paymentConfirmations.filter((c) => c.status === 'pending');

  // Total sales revenue calculated
  const totalRevenueIDR = domains.reduce((acc, d) => acc + (d.salePriceIDR || 149000), 0);

  // Filter logic
  const filteredDomains = domains.filter((domain) => {
    const matchesSearch =
      domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.hostingPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (domain.clientPhone && domain.clientPhone.includes(searchTerm));

    const days = calculateRemainingDays(domain.expirationDate);

    if (filterStatus === 'active') return matchesSearch && days > 30;
    if (filterStatus === 'expiring_soon') return matchesSearch && days >= 0 && days <= 30;
    if (filterStatus === 'expired') return matchesSearch && days < 0;
    return matchesSearch;
  });

  const sendWhatsAppReminder = (domain: DomainItem) => {
    const days = calculateRemainingDays(domain.expirationDate);
    const msg = encodeURIComponent(
      `Halo Bapak/Ibu ${domain.clientName},\n\nKami dari layanan penyedia domain menginformasikan bahwa masa aktif domain Anda:\n🌐 *${domain.name}*\nBatas Waktu (Expired): *${domain.expirationDate}* (${days < 0 ? 'Sudah Kadaluarsa' : `${days} hari lagi`}).\n\nUntuk menjaga website dan email Anda tetap aktif terlindungi DNSSEC & SSL, silakan konfirmasi perpanjangan kepada kami. Terima kasih!`
    );
    const phone = domain.clientPhone ? domain.clientPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Provider / Registrar Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Registrar Management Center (Super Admin)
            </span>
            <span className="text-xs text-slate-400">Owner: Super Admin</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Kelola Pelanggan, Verifikasi Pembayaran, &amp; Setting DNS
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Kontak Resmi Admin HP: <strong className="text-emerald-400 font-mono">{ADMIN_PHONE}</strong> | Portal Admin Verified
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {pendingConfirmations.length > 0 && (
            <button
              onClick={() => setShowConfirmationsTab(!showConfirmationsTab)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer animate-pulse"
            >
              <Inbox className="w-4 h-4" />
              <span>{pendingConfirmations.length} Konfirmasi Pembayaran Masuk</span>
            </button>
          )}

          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-right hidden md:block">
            <span className="text-[10px] text-slate-400 block font-medium">Total Nilai Penjualan</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              Rp {totalRevenueIDR.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jual / Terbitkan Domain Baru</span>
          </button>
        </div>
      </div>

      {/* Payment Confirmations Inbox Section */}
      {(showConfirmationsTab || pendingConfirmations.length > 0) && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-amber-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Kotak Konfirmasi Pembayaran Masuk ({pendingConfirmations.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Konfirmasi pembayaran dari pelanggan via Web Portal / WhatsApp HP ({ADMIN_PHONE})
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmationsTab(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800"
            >
              Tutup Panel
            </button>
          </div>

          {pendingConfirmations.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Belum ada konfirmasi pembayaran baru yang menunggu verifikasi.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingConfirmations.map((conf) => (
                <div
                  key={conf.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {conf.invoiceNumber}
                      </span>
                      <h4 className="text-sm font-extrabold text-white font-mono mt-1">
                        {conf.domainName}
                      </h4>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      Rp {conf.amountIDR.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                    <div>Pengirim: <strong className="text-white">{conf.senderName}</strong></div>
                    <div>No HP/WA: <span className="text-emerald-300">{conf.senderPhone}</span></div>
                    <div>Bank: <span className="text-slate-200">{conf.senderBank}</span> | Tgl: {conf.transferDate}</div>
                    {conf.notes && <div className="text-[11px] text-slate-400 italic font-sans">Catatan: {conf.notes}</div>}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onVerifyConfirmation && onVerifyConfirmation(conf.id, conf.domainId)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui &amp; Tandai LUNAS</span>
                    </button>
                    {onRejectConfirmation && (
                      <button
                        onClick={() => onRejectConfirmation(conf.id)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs transition cursor-pointer"
                      >
                        Tolak
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expiration Alert Banner */}
      {expiringSoonCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Pemberitahuan Batas Waktu Kadaluarsa Domain Pelanggan
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Ada <strong>{expiringSoonCount} domain pelanggan</strong> dengan masa berlaku kurang dari 30 hari. Hubungi pembeli via WhatsApp HP ({ADMIN_PHONE}) untuk mengirim tagihan perpanjangan.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('expiring_soon')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            Lihat Domain Segera Berakhir
          </button>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Domains Sold */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Domain Terjual ke Klien</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {totalDomains}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              {activeCount} Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tersimpan di Google Sheets</p>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setFilterStatus('expiring_soon')}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer shadow-md transition"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Perlu Ditagih (&lt; 30 Hari)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {expiringSoonCount}
            </span>
            <span className="text-xs text-amber-400/80 font-medium">Batas Waktu Dekat</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Siap dikirim reminder WA</p>
        </div>

        {/* Expired */}
        <div
          onClick={() => setFilterStatus('expired')}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 cursor-pointer shadow-md transition"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Kadaluarsa (Expired)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              {expiredCount}
            </span>
            <span className="text-xs text-rose-400/80 font-medium">Grace Period 30 hari</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pelanggan dapat restore</p>
        </div>

        {/* High Security Shield */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Proteksi DNSSEC &amp; SSL</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {Math.round((dnssecCount / (totalDomains || 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {dnssecCount} Domain Terlindungi
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Anti-Spoofing &amp; TLS 1.3</p>
        </div>
      </div>

      {/* Search, Filter & Quick Action Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari domain, nama pembeli, email, WA..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua ({totalDomains})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Aktif ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('expiring_soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              filterStatus === 'expiring_soon'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-amber-400 hover:text-amber-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Segera Berakhir ({expiringSoonCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'expired'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Kadaluarsa ({expiredCount})
          </button>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenSheetsModal}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheet Database</span>
          </button>
        </div>
      </div>

      {/* Domain Cards & Table List */}
      <div className="space-y-3.5">
        {filteredDomains.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Globe className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">
                Database Domain Bersih &amp; Siap Digunakan
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Semua data dummy telah dibersihkan. Aplikasi sekarang dalam status baru dan kosong. Mulai terbitkan dan alokasikan domain resmi pertama Anda kepada pelanggan!
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenRegisterModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Terbitkan Domain Pertama Anda</span>
              </button>
              <button
                onClick={onOpenSheetsModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Buka Google Sheets Sync</span>
              </button>
            </div>
          </div>
        ) : (
          filteredDomains.map((domain) => {
            const daysRemaining = calculateRemainingDays(domain.expirationDate);
            const statusInfo = getExpirationStatusLabel(domain.expirationDate);

            return (
              <div
                key={domain.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/90 shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Domain Name, Client, Hosting & Badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
                        <span>{domain.name}</span>
                        <a
                          href={`https://${domain.name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-indigo-400 transition"
                          title="Buka Website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </h3>

                      {/* Expiration Badge with Deadline Warning */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.colorClass}`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Batas Waktu: {statusInfo.label}</span>
                      </span>

                      {/* Payment Status Pill */}
                      {isAdminView ? (
                        <button
                          onClick={() => onTogglePaymentStatus(domain.id)}
                          title="Klik untuk mengubah status pembayaran pelanggan (Mode Admin)"
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded border transition cursor-pointer ${
                            domain.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {domain.paymentStatus === 'paid' ? '✓ Lunas' : '⏳ Menunggu Pembayaran'}
                        </button>
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                            domain.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                          title="Status Pembayaran Terverifikasi Admin"
                        >
                          {domain.paymentStatus === 'paid' ? '✓ Lunas' : '⏳ Menunggu Pembayaran'}
                        </span>
                      )}

                      {/* Selling Price */}
                      <span className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        Harga: Rp {(domain.salePriceIDR || 149000).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Metadata line: Client, Email, WhatsApp, Plan, Expiry Date */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
                      <div>
                        Pembeli:{' '}
                        <strong className="text-slate-200">{domain.clientName}</strong>
                      </div>
                      <div className="hidden sm:inline text-slate-600">•</div>
                      <div>Email: <span className="text-slate-300">{domain.clientEmail}</span></div>
                      {domain.clientPhone && (
                        <>
                          <div className="hidden sm:inline text-slate-600">•</div>
                          <div>WA: <span className="text-emerald-400 font-mono">{domain.clientPhone}</span></div>
                        </>
                      )}
                      <div className="hidden sm:inline text-slate-600">•</div>
                      <div>
                        Paket:{' '}
                        <span className="text-indigo-300 font-semibold">
                          {domain.hostingPlan}
                        </span>
                      </div>
                      <div className="hidden sm:inline text-slate-600">•</div>
                      <div>
                        Batas Waktu:{' '}
                        <strong className="text-amber-300 font-mono">
                          {domain.expirationDate}
                        </strong>
                      </div>
                    </div>

                    {/* High Security Feature Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* DNSSEC */}
                      <button
                        onClick={() => onToggleDnssec(domain.id)}
                        title="Klik untuk mengubah status DNSSEC"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition ${
                          domain.dnssecEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>DNSSEC: {domain.dnssecEnabled ? 'Aktif' : 'Nonaktif'}</span>
                      </button>

                      {/* SSL Status */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <Lock className="w-3 h-3" />
                        <span>SSL: {domain.sslIssuer}</span>
                      </span>

                      {/* Whois Privacy */}
                      <button
                        onClick={() => onToggleWhoisPrivacy(domain.id)}
                        title="Klik untuk mengubah proteksi Whois"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition ${
                          domain.whoisPrivacy
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {domain.whoisPrivacy ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Whois: Terlindungi</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Whois: Publik</span>
                          </>
                        )}
                      </button>

                      {/* Transfer Lock */}
                      <button
                        onClick={() => onToggleTransferLock(domain.id)}
                        title="Registry Transfer Lock mencegah pencurian domain"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition ${
                          domain.isTransferLocked !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>{domain.isTransferLocked !== false ? 'Transfer Lock: ON' : 'Transfer Lock: OFF'}</span>
                      </button>

                      {/* IP address */}
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                        IP: {domain.ipAddress}
                      </span>
                    </div>
                  </div>

                  {/* Right: Seller & Registrar Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                    {/* Send WhatsApp Reminder */}
                    <button
                      onClick={() => sendWhatsAppReminder(domain)}
                      title="Kirim pemberitahuan tagihan / batas waktu ke WhatsApp pembeli"
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reminder WA</span>
                    </button>

                    {/* Ownership Certificate */}
                    <button
                      onClick={() => onOpenCertificateModal(domain)}
                      title="Buka dan cetak sertifikat resmi hak milik domain untuk pembeli"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sertifikat</span>
                    </button>

                    {/* Test Web Readiness */}
                    <button
                      onClick={() => onOpenReadinessModal(domain)}
                      title="Uji kesiapan teknis domain dan koneksi ke web hosting publik"
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Uji Web</span>
                    </button>

                    {/* Renew Button */}
                    <button
                      onClick={() => onOpenRenewModal(domain)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                        daysRemaining <= 30
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{daysRemaining < 0 ? 'Restore' : 'Perpanjang'}</span>
                    </button>

                    {/* Connect to Cloudflare Pages */}
                    {onOpenCloudflarePagesModal && (
                      <button
                        onClick={() => onOpenCloudflarePagesModal(domain)}
                        title="Hubungkan domain ini ke aplikasi Cloudflare Pages (*.pages.dev)"
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Cloud className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pages.dev</span>
                      </button>
                    )}

                    {/* Manage DNS */}
                    <button
                      onClick={() => onOpenDnsModal(domain)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>DNS / Subdomain</span>
                    </button>

                    {/* Hosting cPanel / Webmin */}
                    <button
                      onClick={() => onOpenHostingModal(domain)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Server className="w-3.5 h-3.5 text-cyan-400" />
                      <span>cPanel</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
