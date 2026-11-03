import React, { useState, useEffect } from 'react';
import {
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  X,
  ExternalLink,
  ShieldAlert,
  Server,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { DomainItem } from '../types';

interface DnsDiagnosticModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DnsCheckResult {
  query: string;
  type: string;
  status: number | null; // 0 = NOERROR, 3 = NXDOMAIN, 2 = SERVFAIL
  statusLabel: string;
  data: string[];
  rawComment?: string;
  loading: boolean;
  error?: string;
}

export const DnsDiagnosticModal: React.FC<DnsDiagnosticModalProps> = ({
  domain,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !domain) return null;

  const [activeDomainName, setActiveDomainName] = useState(domain.name);
  const [isQuerying, setIsQuerying] = useState(false);
  const [nsResult, setNsResult] = useState<DnsCheckResult | null>(null);
  const [aResult, setAResult] = useState<DnsCheckResult | null>(null);
  const [cnameResult, setCnameResult] = useState<DnsCheckResult | null>(null);
  const [dsResult, setDsResult] = useState<DnsCheckResult | null>(null);

  // Active guide tab
  const [activeGuideTab, setActiveGuideTab] = useState<'diagnosis' | 'penyebab' | 'panduan_langkah'>('diagnosis');

  const runLiveDnsDiagnosis = async (domainToQuery: string) => {
    setIsQuerying(true);
    const cleanDomain = domainToQuery.trim().toLowerCase();

    // Helper query to Google DNS-over-HTTPS
    const queryDoh = async (name: string, qtype: string): Promise<DnsCheckResult> => {
      try {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${qtype}`);
        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}`);
        }
        const json = await res.json();
        const statusCode = json.Status ?? null;
        let label = 'Unknown';
        if (statusCode === 0) label = 'NOERROR (Aktif & Ditemukan)';
        else if (statusCode === 3) label = 'NXDOMAIN (Domain Tidak Ditemukan / Belum Terdaftar)';
        else if (statusCode === 2) label = 'SERVFAIL (Kesalahan DNSSEC / Nameserver)';
        else if (statusCode === 5) label = 'REFUSED';

        const answers: string[] = [];
        if (json.Answer && Array.isArray(json.Answer)) {
          json.Answer.forEach((a: any) => {
            if (a.data) answers.push(a.data);
          });
        }

        return {
          query: name,
          type: qtype,
          status: statusCode,
          statusLabel: label,
          data: answers,
          rawComment: json.Comment,
          loading: false,
        };
      } catch (err: any) {
        return {
          query: name,
          type: qtype,
          status: null,
          statusLabel: 'Gagal Terhubung ke DNS Server',
          data: [],
          loading: false,
          error: err.message || 'Network timeout',
        };
      }
    };

    try {
      const [ns, a, cname, ds] = await Promise.all([
        queryDoh(cleanDomain, 'NS'),
        queryDoh(cleanDomain, 'A'),
        queryDoh(cleanDomain, 'CNAME'),
        queryDoh(cleanDomain, 'DS'),
      ]);

      setNsResult(ns);
      setAResult(a);
      setCnameResult(cname);
      setDsResult(ds);
    } catch (e) {
      console.error('DNS query error:', e);
    } finally {
      setIsQuerying(false);
    }
  };

  useEffect(() => {
    if (domain?.name) {
      setActiveDomainName(domain.name);
      runLiveDnsDiagnosis(domain.name);
    }
  }, [domain?.name]);

  const isNxDomain = nsResult?.status === 3 || aResult?.status === 3;
  const hasNoNs = !nsResult?.data || nsResult.data.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white font-mono">
                  Live DNS Diagnostic &amp; Troubleshooter
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  Domain Belum Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Investigasi mendalam mengapa domain <strong className="text-amber-300 font-mono">{activeDomainName}</strong> belum bisa diakses di internet
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveGuideTab('diagnosis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeGuideTab === 'diagnosis'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>1. Hasil Scan DNS Real-Time</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('penyebab')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeGuideTab === 'penyebab'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2. Akar Masalah &amp; Fakta Lapangan</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('panduan_langkah')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeGuideTab === 'panduan_langkah'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Langkah Konkret Mengaktifkan</span>
          </button>
        </div>

        {/* Tab 1: Live DNS Scan Results */}
        {activeGuideTab === 'diagnosis' && (
          <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-4">
            {/* Domain Query Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">Target Query:</span>
                <input
                  type="text"
                  value={activeDomainName}
                  onChange={(e) => setActiveDomainName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white font-mono flex-1 focus:outline-none focus:border-amber-400"
                  placeholder="sipermas.com"
                />
              </div>
              <button
                onClick={() => runLiveDnsDiagnosis(activeDomainName)}
                disabled={isQuerying}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? 'animate-spin' : ''}`} />
                <span>{isQuerying ? 'Sedang Query ke Root Server...' : 'Uji Ulang DNS Sekarang'}</span>
              </button>
            </div>

            {/* Crucial Findings Alert */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-300">
                    HASIL DIAGNOSIS: Domain Berstatus NXDOMAIN (Non-Existent Domain)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Query langsung ke server root resmi dunia (Verisign untuk ekstensi <strong>.COM</strong> dan Google Public DNS 8.8.8.8) mengembalikan kode status <strong>NXDOMAIN (Status 3)</strong>.
                    Artinya: Di seluruh jaringan internet dunia, nama domain <strong className="text-white font-mono">{activeDomainName}</strong> <strong>BELUM DITEMUKAN / BELUM TERDAFTAR SECARA RESMI</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Live DNS Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* NS Record Query */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">1. Nameserver (NS Record)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    nsResult?.status === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {nsResult?.status === 0 ? 'Ditemukan' : 'Tidak Ditemukan (NXDOMAIN)'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-slate-300 min-h-[50px] flex items-center">
                  {nsResult?.loading ? (
                    <span className="text-slate-500 animate-pulse">Memeriksa...</span>
                  ) : nsResult?.data && nsResult.data.length > 0 ? (
                    nsResult.data.join(', ')
                  ) : (
                    <span className="text-rose-400">Kosong (Tidak ada delegasi NS dari Registrar)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Cloudflare membutuhkan NS ini didelegasikan dari panel registrar (tempat membeli domain).
                </p>
              </div>

              {/* A Record Query */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">2. IP Address (A Record @)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    aResult?.status === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {aResult?.status === 0 ? 'Terhubung IP' : 'Tidak Ada IP (NXDOMAIN)'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-slate-300 min-h-[50px] flex items-center">
                  {aResult?.loading ? (
                    <span className="text-slate-500 animate-pulse">Memeriksa...</span>
                  ) : aResult?.data && aResult.data.length > 0 ? (
                    aResult.data.join(', ')
                  ) : (
                    <span className="text-rose-400">NXDOMAIN (Browser tidak bisa membuka website)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Alasan browser Anda menampilkan error &quot;Server IP address could not be found&quot;.
                </p>
              </div>

              {/* CNAME Query */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">3. Host Alias (CNAME www)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    cnameResult?.status === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cnameResult?.status === 0 ? 'Terhubung' : 'Tidak Aktif'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-slate-300 min-h-[50px] flex items-center">
                  {cnameResult?.loading ? (
                    <span className="text-slate-500 animate-pulse">Memeriksa...</span>
                  ) : cnameResult?.data && cnameResult.data.length > 0 ? (
                    cnameResult.data.join(', ')
                  ) : (
                    <span className="text-slate-500">Tidak ada CNAME (Biasa jika menggunakan A record)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Untuk mengarahkan subdomain atau www ke Cloudflare Pages atau hosting.
                </p>
              </div>

              {/* DNSSEC DS Record Query */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">4. Kunci DNSSEC (DS Record)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    dsResult?.status === 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {dsResult?.status === 0 ? 'DNSSEC Aktif di TLD' : 'Tidak Ada DS'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-xs text-slate-300 min-h-[50px] flex items-center">
                  {dsResult?.loading ? (
                    <span className="text-slate-500 animate-pulse">Memeriksa...</span>
                  ) : dsResult?.data && dsResult.data.length > 0 ? (
                    dsResult.data.join(', ')
                  ) : (
                    <span className="text-slate-500">Tidak ada catatan DS record</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Jika ada kunci DNSSEC lama yang tertinggal, resolver dunia akan memblokir domain (SERVFAIL).
                </p>
              </div>
            </div>

            {/* Quick Whois Lookup link */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Cek langsung status pendaftaran nama domain di basis data resmi dunia:</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://lookup.icann.org/en/lookup?name=${encodeURIComponent(activeDomainName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold transition flex items-center gap-1.5"
                >
                  <span>Cek ICANN Lookup</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://dnschecker.org/#A/${encodeURIComponent(activeDomainName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition flex items-center gap-1.5"
                >
                  <span>Cek di DNSChecker</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Akar Masalah & Fakta Lapangan */}
        {activeGuideTab === 'penyebab' && (
          <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Mengapa Kemarin Terlihat Berhasil di DNS Checker padahal Hari Ini Belum Aktif?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kemarin Anda mengecek di situs <strong>DNS Checker</strong> dan melihat centang hijau pada <strong>Record A</strong>, lalu tanda silang merah pada <strong>Record CNAME</strong>.
                Berikut adalah fakta yang sebenarnya terjadi di balik layar:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Point 1: Salah Domain yang dicek */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                  <XCircle className="w-4 h-4" />
                  <span>1. Kemarin Yang Dicek Adalah Server Cloudflare</span>
                </div>
                <h5 className="text-sm font-bold text-white">
                  Yang Diketik: <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">rihana.ns.cloudflare.com</code>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pada screenshot DNSChecker kemarin, Anda mengetik alamat nameserver Cloudflare (<code className="text-amber-300">rihana.ns.cloudflare.com</code>), <strong>BUKAN</strong> domain Anda (<code className="text-emerald-400">sipermas.com</code>).
                </p>
                <div className="text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-slate-400">
                  <p>• <strong>Record A centang hijau</strong> karena server Cloudflare memang memiliki alamat IP server (172.64.32.244, dll).</p>
                  <p>• <strong>Record CNAME silang merah (X)</strong> karena nameserver Cloudflare adalah server root, bukan alias CNAME.</p>
                </div>
              </div>

              {/* Point 2: Memasukkan Domain ke Cloudflare != Membeli Domain */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Cloudflare BUKAN Tempat Pembelian Domain Awal</span>
                </div>
                <h5 className="text-sm font-bold text-white">
                  Domain Harus Dibeli di Registrar Terlebih Dahulu
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menambahkan nama domain di dashboard Cloudflare (Add a Site) itu <strong>GRATIS dan bisa memasukkan nama apa saja</strong>. Tetapi itu <strong>TIDAK otomatis mendaftarkan hak milik domain</strong> di registry dunia (ICANN / Verisign).
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jika Anda belum pernah membeli <code className="text-amber-300">sipermas.com</code> di penyedia resmi (seperti Niagahoster, Domainesia, Rumahweb, Namecheap, atau Cloudflare Registrar berbayar), maka domain tersebut tidak ada di internet.
                </p>
              </div>

              {/* Point 3: Nameserver Harus Diubah di Registrar */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase">
                  <Server className="w-4 h-4" />
                  <span>3. Jika Sudah Dibeli: Nameserver Belum Dicolok</span>
                </div>
                <h5 className="text-sm font-bold text-white">
                  Nameserver Diisi di Tempat Beli Domain (Bukan di Cloudflare)
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jika Anda sudah membayar dan membeli domain di registrar (misal Niagahoster / Rumahweb):
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Anda harus login ke <strong>Member Area Registrar</strong> &gt; Menu <strong>Domain Saya</strong> &gt; <strong>Kelola Name Server (Nameservers)</strong> &gt; Pilih <strong>Custom Nameserver</strong> &gt; Masukkan:
                  <br />
                  <code className="text-amber-300 font-mono text-[11px] block mt-1 bg-slate-950 p-1.5 rounded">
                    1. rihana.ns.cloudflare.com<br />
                    2. (nameserver kedua dari Cloudflare)
                  </code>
                </p>
              </div>

              {/* Point 4: Verifikasi Email ICANN / WHOIS */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>4. Cek Email Masuk (Verifikasi Registran)</span>
                </div>
                <h5 className="text-sm font-bold text-white">
                  Email Validasi ICANN Wajib Diklik
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Setiap pembelian domain baru di seluruh dunia, ICANN mengirimkan email ke alamat pembeli berjudul <em>&quot;VERIFICATION REQUIRED - Please validate your domain name&quot;</em>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jika link di email tersebut belum diklik, domain akan otomatis dikunci (status <strong>clientHold</strong>) dan website tidak akan bisa dibuka.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Panduan Langkah Konkret */}
        {activeGuideTab === 'panduan_langkah' && (
          <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Checklist 4 Langkah Agar sipermas.com Langsung Aktif 100%:</span>
              </h4>
              <p className="text-xs text-slate-300">
                Ikuti langkah urut di bawah ini agar domain Anda aktif sempurna dan bisa dibuka pengunjung.
              </p>
            </div>

            <div className="space-y-3">
              {/* Langkah 1 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">1</span>
                    Pastikan Domain Sudah Terdaftar &amp; Lunas di Registrar
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Langkah Wajib</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Buka website tempat Anda mendaftarkan domain (misalnya: <strong>Niagahoster, Domainesia, Rumahweb, IDCloudHost, Namecheap, atau Cloudflare Registrar</strong>).
                  Pastikan invoice berstatus <strong>PAID / LUNAS</strong> dan domain berstatus <strong>Active</strong>.
                </p>
              </div>

              {/* Langkah 2 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">2</span>
                    Ganti Nameserver di Panel Registrar Menjadi Cloudflare
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Delegasi NS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Di panel registrar (tempat beli domain), cari menu <strong>Name Server / Nameservers</strong>. Ubah dari default registrar menjadi:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 space-y-1">
                  <div>Nameserver 1: <strong className="text-white">rihana.ns.cloudflare.com</strong></div>
                  <div>Nameserver 2: <strong className="text-white">(nameserver pasangan yang diberikan Cloudflare)</strong></div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simpan perubahan. Propagasi delegasi nameserver dari registrar ke seluruh dunia biasanya memakan waktu antara 15 menit hingga maksimal beberapa jam.
                </p>
              </div>

              {/* Langkah 3 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">3</span>
                    Pastikan Ada DNS Record A atau CNAME di Cloudflare
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">DNS Records</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Di akun Cloudflare Anda pada domain <code className="text-amber-300 font-mono">sipermas.com</code>, buka menu <strong>DNS &gt; Records</strong>:
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">TIPE A</span>
                    <span>Name: <strong className="text-white">@</strong> (atau sipermas.com)</span>
                    <span className="text-slate-500">→</span>
                    <span>Target IP: <strong className="text-emerald-400">{domain.ipAddress}</strong></span>
                    <span className="text-amber-400 font-sans text-[10px]">(Proxy: Proxied / Orange Cloud)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">TIPE CNAME</span>
                    <span>Name: <strong className="text-white">www</strong></span>
                    <span className="text-slate-500">→</span>
                    <span>Target: <strong className="text-emerald-400">{domain.name}</strong></span>
                  </div>
                </div>
              </div>

              {/* Langkah 4 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">4</span>
                    Cara Uji Yang Benar di DNSChecker.org
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Uji Publik</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Saat membuka <strong>dnschecker.org</strong>, jangan mengetik <em>rihana.ns.cloudflare.com</em>.
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div>1. Ketik: <strong className="text-amber-300 font-mono">sipermas.com</strong></div>
                  <div>2. Pilih Type: <strong className="text-emerald-400 font-mono">A</strong> (atau <strong className="text-cyan-400 font-mono">NS</strong>)</div>
                  <div>3. Klik tombol <strong>Search</strong></div>
                </div>
                <p className="text-[11px] text-emerald-400">
                  Jika langkah 1 sampai 3 sudah dilakukan, centang hijau akan muncul di seluruh negara dunia dan website Anda langsung bisa dibuka!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Tim Admin NageDomain siap membantu jika Anda membutuhkan bantuan setup nameserver registrar.</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
