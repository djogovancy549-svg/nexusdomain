import React, { useState } from 'react';
import {
  Globe,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  X,
  AlertCircle,
  HelpCircle,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { DomainItem, DnsRecord } from '../types';

interface CloudflarePagesConnectModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyPagesDns: (domainId: string, pagesUrl: string) => void;
}

export const CloudflarePagesConnectModal: React.FC<CloudflarePagesConnectModalProps> = ({
  domain,
  isOpen,
  onClose,
  onApplyPagesDns,
}) => {
  if (!isOpen || !domain) return null;

  // Default target Pages URL based on domain name or user's example
  const defaultTarget = domain.name.includes('sipermas')
    ? 'adminsipermas.pages.dev'
    : `${domain.name.split('.')[0]}.pages.dev`;

  const [targetPagesUrl, setTargetPagesUrl] = useState(defaultTarget);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Check if domain already has CNAME pointing to this pages url
  const hasRootCname = domain.dnsRecords.some(
    (r) => r.type === 'CNAME' && (r.name === '@' || r.name === domain.name) && r.value.includes('.pages.dev')
  );
  const hasWwwCname = domain.dnsRecords.some(
    (r) => r.type === 'CNAME' && r.name === 'www' && r.value.includes('.pages.dev')
  );

  const cleanTarget = targetPagesUrl
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyDns = () => {
    if (!cleanTarget) return;
    setIsApplying(true);
    setTimeout(() => {
      onApplyPagesDns(domain.id, cleanTarget);
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-mono">
                  Hubungkan {domain.name} ke Cloudflare Pages
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Custom Domain
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Panduan resmi &amp; generator DNS otomatis untuk mengarahkan domain kustom ke aplikasi Cloudflare Pages (*.pages.dev)
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-6">
          {/* Target Pages Input & 1-Click DNS Injector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Langkah 1: Tentukan Target Cloudflare Pages</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masukkan subdomain aplikasi Cloudflare Pages Anda yang ingin dihubungkan
                </p>
              </div>
              {(hasRootCname || appliedSuccess) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DNS Sudah Terpasang</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={targetPagesUrl}
                  onChange={(e) => setTargetPagesUrl(e.target.value)}
                  placeholder="contoh: adminsipermas.pages.dev"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyDns}
                disabled={isApplying || !cleanTarget}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menerapkan DNS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Pasang DNS Otomatis (1-Klik)</span>
                  </>
                )}
              </button>
            </div>

            {appliedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>Sukses!</strong> Record CNAME untuk <strong>{domain.name}</strong> dan <strong>www.{domain.name}</strong> berhasil diarahkan ke <strong>{cleanTarget}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* DNS Records Comparison Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Konfigurasi Record DNS yang Diterapkan di EbiDomain:</span>
              <span className="text-[11px] text-slate-400 font-normal">TTL: 3600 (Auto)</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Tipe</th>
                    <th className="px-3.5 py-2.5">Nama / Host</th>
                    <th className="px-3.5 py-2.5">Target / Nilai CNAME</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi Salin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {/* Root Domain */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        CNAME
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-white">
                      @ <span className="text-slate-500 font-normal">({domain.name})</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-indigo-300 font-bold">{cleanTarget || 'adminsipermas.pages.dev'}</td>
                    <td className="px-3.5 py-2.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(cleanTarget || 'adminsipermas.pages.dev', 'cname-root')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer inline-flex items-center gap-1"
                      >
                        {copiedKey === 'cname-root' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Subdomain WWW */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        CNAME
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-white">
                      www <span className="text-slate-500 font-normal">(www.{domain.name})</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-indigo-300 font-bold">{cleanTarget || 'adminsipermas.pages.dev'}</td>
                    <td className="px-3.5 py-2.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => handleCopy(cleanTarget || 'adminsipermas.pages.dev', 'cname-www')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer inline-flex items-center gap-1"
                      >
                        {copiedKey === 'cname-www' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step by Step Guide for Cloudflare Dashboard */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Langkah 2: Daftarkan Custom Domain di Dashboard Cloudflare Pages</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <strong className="text-white block font-semibold">
                    Buka Dashboard Cloudflare
                  </strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Login ke akun Cloudflare Anda di <span className="font-mono text-indigo-300">dash.cloudflare.com</span> lalu pilih menu <strong>Workers &amp; Pages</strong> di sidebar kiri.
                  </p>
                </div>
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 shrink-0"
                >
                  <span>Buka Cloudflare</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <strong className="text-white block font-semibold">
                    Pilih Project Pages: "{cleanTarget.split('.')[0] || 'adminsipermas'}"
                  </strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Klik nama project Pages Anda yang memuat aplikasi <strong>{cleanTarget}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <strong className="text-white block font-semibold">
                    Masuk ke Tab "Custom Domains" &gt; Klik "Set up a custom domain"
                  </strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Ketik nama domain yang dibeli: <strong className="text-white font-mono">{domain.name}</strong>. Anda juga bisa mengulanginya untuk <strong className="text-white font-mono">www.{domain.name}</strong>.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(domain.name, 'cf-domain-name')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin: {domain.name}</span>
                    </button>
                    {copiedKey === 'cf-domain-name' && (
                      <span className="text-[11px] text-emerald-400">Tersalin ke clipboard!</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1">
                  <strong className="text-white block font-semibold">
                    Aktivasi &amp; SSL/TLS Otomatis (Aktif dalam 5-15 Menit)
                  </strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Cloudflare Pages akan memverifikasi CNAME DNS secara otomatis dan menerbitkan Sertifikat SSL Universal (HTTPS). Status akan berubah menjadi <span className="text-emerald-400 font-bold">Active</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Link Preview */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">URL Tujuan Akhir Setelah Terhubung:</span>
                <span className="text-white font-mono font-bold">https://{domain.name} &rarr; https://{cleanTarget}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://${cleanTarget}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Cek {cleanTarget}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleApplyDns}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terapkan DNS &amp; Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
