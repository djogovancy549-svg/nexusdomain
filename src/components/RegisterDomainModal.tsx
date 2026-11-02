import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  Calendar,
  Lock,
  ShieldCheck,
  Server,
  User,
  Mail,
  X,
  Zap,
  Phone,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import { HOSTING_PACKAGES, TLD_PRICING_CATALOG } from '../data/initialData';
import { DomainItem } from '../types';

interface RegisterDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'IDR' | 'USD';
  initialDomainName?: string;
  initialTld?: string;
  initialPackageId?: string;
  onRegisterDomain: (domain: DomainItem) => void;
}

export const RegisterDomainModal: React.FC<RegisterDomainModalProps> = ({
  isOpen,
  onClose,
  currency,
  initialDomainName = '',
  initialTld = '.com',
  initialPackageId = 'business',
  onRegisterDomain,
}) => {
  if (!isOpen) return null;

  const [domainKeyword, setDomainKeyword] = useState(
    initialDomainName ? initialDomainName.replace(/\..+$/, '') : ''
  );
  const [tld, setTld] = useState(initialTld || '.com');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [salePrice, setSalePrice] = useState<number>(149000);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'unpaid'>('paid');
  const [hostingPackageId, setHostingPackageId] = useState(initialPackageId || 'business');
  const [tenureYears, setTenureYears] = useState<number>(1);
  const [serverLocation, setServerLocation] = useState('Jakarta (Equinix JK1)');
  const [dnssecEnabled, setDnssecEnabled] = useState(true);
  const [whoisPrivacy, setWhoisPrivacy] = useState(true);
  const [autoRenew, setAutoRenew] = useState(true);
  const [isTransferLocked, setIsTransferLocked] = useState(true);

  // Compute calculated expiration date (Batas Waktu)
  const today = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(today.getFullYear() + tenureYears);
  const formattedExpiryDate = expiryDate.toISOString().slice(0, 10);
  const formattedRegDate = today.toISOString().slice(0, 10);

  const selectedTldItem = TLD_PRICING_CATALOG.find((t) => t.tld === tld) || TLD_PRICING_CATALOG[0];
  const selectedPkg = HOSTING_PACKAGES.find((p) => p.id === hostingPackageId);

  const cleanKeyword = domainKeyword
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '');

  const fullDomainName = cleanKeyword ? `${cleanKeyword}${tld}` : `domain${tld}`;

  // Update default price when TLD changes
  const handleTldChange = (newTld: string) => {
    setTld(newTld);
    const item = TLD_PRICING_CATALOG.find((t) => t.tld === newTld);
    if (item) {
      setSalePrice(item.promoPriceIDR);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanKeyword || !clientName || !clientEmail) return;

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const invoiceNum = `INV-${new Date().getFullYear()}-${randomId}`;
    const certNum = `NXH-CERT-${randomId}-${new Date().getFullYear()}`;

    const newDomain: DomainItem = {
      id: `DOM-${randomId}`,
      name: fullDomainName,
      tld,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim() || undefined,
      salePriceIDR: salePrice,
      paymentStatus,
      invoiceNumber: invoiceNum,
      certificateNumber: certNum,
      isTransferLocked,
      hostingPlan: selectedPkg ? selectedPkg.name : 'Domain Only',
      serverLocation,
      registrationDate: formattedRegDate,
      expirationDate: formattedExpiryDate, // Batas Waktu
      status: 'active',
      autoRenew,
      dnssecEnabled,
      sslStatus: 'active',
      sslIssuer: "Let's Encrypt Authority X3",
      sslExpiryDate: formattedExpiryDate,
      whoisPrivacy,
      eppCode: `${cleanKeyword.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}@#reg`,
      ipAddress: `103.147.154.${Math.floor(10 + Math.random() * 200)}`,
      nameservers: ['ns1.nexahost.id', 'ns2.nexahost.id', 'ns3.nexahost.net'],
      diskUsageMB: 240,
      diskLimitMB: selectedPkg ? (selectedPkg.id === 'vps-enterprise' ? 204800 : 102400) : 10240,
      bandwidthUsageGB: 1,
      bandwidthLimitGB: selectedPkg ? 2000 : 100,
      phpVersion: '8.3',
      syncedToSheet: false,
      dnsRecords: [
        { id: `rec-${Date.now()}-1`, type: 'A', name: '@', value: '103.147.154.21', ttl: 3600 },
        { id: `rec-${Date.now()}-2`, type: 'CNAME', name: 'www', value: fullDomainName, ttl: 3600 },
        { id: `rec-${Date.now()}-3`, type: 'TXT', name: '@', value: 'v=spf1 include:spf.nexahost.id ~all', ttl: 3600 },
      ],
    };

    onRegisterDomain(newDomain);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Terbitkan &amp; Jual Domain ke Pelanggan
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Mode Registrar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alokasikan domain kepada pembeli lengkap dengan invoice, batas waktu, dan sertifikat hak milik berkeamanan tinggi
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 py-4 space-y-5">
          {/* Domain Name & TLD Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Nama Domain yang Dijual
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="contoh: warungonline, tokokreatif"
                  value={domainKeyword}
                  onChange={(e) => setDomainKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <select
                value={tld}
                onChange={(e) => handleTldChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                {TLD_PRICING_CATALOG.map((t) => (
                  <option key={t.tld} value={t.tld}>
                    {t.tld} ({currency === 'IDR' ? `Rp ${t.promoPriceIDR.toLocaleString('id-ID')}` : `$${t.promoPriceUSD}`})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 text-xs text-indigo-400 font-mono flex items-center gap-1.5">
              <span>Domain Terdaftar:</span>
              <strong className="text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {fullDomainName}
              </strong>
            </div>
          </div>

          {/* Customer / Buyer Information */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data Pembeli (Pelanggan / Klien Anda):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Nama Lengkap Pembeli
                </label>
                <input
                  type="text"
                  required
                  placeholder="Budi Pratama"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Email Kontak Pembeli
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  No. WhatsApp / Telepon Pembeli
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Status Pembayaran Faktur
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="paid">LUNAS (Sudah Dibayar Pelanggan)</option>
                  <option value="pending">Menunggu Pembayaran (Pending)</option>
                  <option value="unpaid">Belum Lunas (Unpaid)</option>
                </select>
              </div>
            </div>

            {/* Selling Price input */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Harga Jual ke Pembeli (IDR):</span>
                <span className="text-[10px] text-slate-500">Harga yang Anda tagihkan ke pelanggan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold w-36 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Hosting Package & Server DC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Paket Web Hosting
              </label>
              <select
                value={hostingPackageId}
                onChange={(e) => setHostingPackageId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {HOSTING_PACKAGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="none">Domain Saja (Tanpa Hosting)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Lokasi Datacenter
              </label>
              <select
                value={serverLocation}
                onChange={(e) => setServerLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Jakarta (Equinix JK1)">🇮🇩 Jakarta (Equinix JK1 - 2ms)</option>
                <option value="Jakarta (IDC 3D Duren Tiga)">🇮🇩 Jakarta (IDC 3D Duren Tiga)</option>
                <option value="Singapore (Singtel Changi)">🇸🇬 Singapore (Singtel Changi - 8ms)</option>
                <option value="US West (Silicon Valley)">🇺🇸 US West (Silicon Valley)</option>
              </select>
            </div>
          </div>

          {/* Expiration Period / Batas Waktu Selector */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Masa Berlaku Domain (Batas Waktu Jatuh Tempo)
              </span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                Expired: {formattedExpiryDate}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              {[1, 2, 3, 5].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => setTenureYears(years)}
                  className={`py-2 rounded-xl border text-center transition cursor-pointer ${
                    tenureYears === years
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {years} Tahun
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Masa aktif otomatis dihitung <strong>{tenureYears} tahun</strong> dari hari ini ({formattedRegDate}) hingga{' '}
              <strong className="text-white font-mono">{formattedExpiryDate}</strong>. Nilai ini otomatis tersimpan di Google Sheets dan akan memunculkan alarm saat &lt; 30 hari lagi.
            </p>
          </div>

          {/* High Security Guarantees to provide to the buyer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300">
                Fitur Keamanan Tinggi yang Diberikan ke Pembeli:
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold">Semua Proteksi Aktif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dnssecEnabled}
                  onChange={(e) => setDnssecEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 font-bold block">DNSSEC Kriptografis</span>
                  <span className="text-[10px] text-slate-400">Mencegah hijack &amp; redirect domain pembeli</span>
                </div>
              </label>

              <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whoisPrivacy}
                  onChange={(e) => setWhoisPrivacy(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 font-bold block">Whois Privacy Shield</span>
                  <span className="text-[10px] text-slate-400">Lindungi privasi nama &amp; kontak pembeli</span>
                </div>
              </label>

              <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTransferLocked}
                  onChange={(e) => setIsTransferLocked(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 font-bold block">Registry Transfer Lock</span>
                  <span className="text-[10px] text-slate-400">Kunci domain dari pemindahan tanpa izin</span>
                </div>
              </label>

              <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="text-slate-200 font-bold block">Perpanjangan Otomatis</span>
                  <span className="text-[10px] text-slate-400">Kirim reminder tagihan saat expired</span>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terbitkan &amp; Simpan ke Google Sheets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
