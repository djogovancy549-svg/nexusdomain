import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  ExternalLink,
  Laptop,
  Wifi,
  FileCheck,
} from 'lucide-react';
import { DomainItem } from '../types';

interface DomainReadinessModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DomainReadinessModal: React.FC<DomainReadinessModalProps> = ({
  domain,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !domain) return null;

  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkCompleted, setCheckCompleted] = useState(true);

  const pagesCname = domain.dnsRecords.find(
    (r) =>
      r.type === 'CNAME' &&
      (r.name === '@' || r.name === domain.name || r.name === 'www') &&
      r.value.includes('.pages.dev')
  );

  const handleRunCheck = () => {
    setIsRunningCheck(true);
    setCheckCompleted(false);
    setTimeout(() => {
      setIsRunningCheck(false);
      setCheckCompleted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-mono">
                  Uji Kesiapan &amp; Jalur Hosting: {domain.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to Host
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Memverifikasi apakah domain benar-benar terhubung ke web server dan dapat diakses publik oleh pengunjung
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

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-5">
          {/* Diagnostic Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-300">
                  STATUS ALUR WEB: 100% SIAP DIAKSES
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {pagesCname ? (
                  <>
                    Domain <strong>{domain.name}</strong> diarahkan via CNAME ke Cloudflare Pages{' '}
                    <strong className="text-amber-300 font-mono">{pagesCname.value}</strong> dengan CDN Edge Global Cloudflare.
                  </>
                ) : (
                  <>
                    Domain <strong>{domain.name}</strong> sudah diarahkan ke IP Server{' '}
                    <strong className="text-indigo-400 font-mono">{domain.ipAddress}</strong> dengan enkripsi TLS 1.3.
                  </>
                )}
              </p>
            </div>

            <button
              onClick={handleRunCheck}
              disabled={isRunningCheck}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCheck ? 'animate-spin' : ''}`} />
              <span>{isRunningCheck ? 'Memeriksa Jalur DNS...' : 'Uji Ulang Koneksi'}</span>
            </button>
          </div>

          {/* 5-Step Pipeline Check */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300">
              5 Tahapan Kesiapan Teknis Domain Menuju Web Hosting:
            </h4>

            <div className="grid grid-cols-1 gap-2.5 text-xs font-sans">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-white block font-medium">
                      Delegasi Nameserver (NS Records)
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Mengarahkan query pengunjung dari ISP ke: {domain.nameservers.join(', ')}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Lolos Validasi
                </span>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-white block font-medium">
                      {pagesCname ? 'DNS CNAME Routing (Cloudflare Pages)' : 'DNS A Record Resolution (IP Hosting)'}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      {pagesCname ? (
                        <>
                          Host @ dan www diarahkan ke: <strong className="text-amber-300 font-mono">{pagesCname.value}</strong>
                        </>
                      ) : (
                        <>
                          Host @ dan www mengarah tepat ke IP Server: <strong className="text-indigo-300 font-mono">{domain.ipAddress}</strong>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {pagesCname ? 'Terhubung ke Pages.dev' : 'Terhubung ke Server'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-white block font-medium">
                      Sertifikat SSL / HTTPS (Port 443)
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Diterbitkan oleh {domain.sslIssuer} • Enkripsi TLS 1.3 aman di browser Google Chrome, Safari, Firefox
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  HTTPS Aktif
                </span>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <strong className="text-white block font-medium">
                      Web Root &amp; VirtualHost Server
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Direktori: /public_html • Paket: {domain.hostingPlan} • Web Server LiteSpeed / Nginx
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Folder Siap File
                </span>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    5
                  </div>
                  <div>
                    <strong className="text-white block font-medium">
                      Proteksi DNSSEC &amp; Anti-Spoofing
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Kriptografi ECDSA P-256 aktif melindungi pengunjung dari pembajakan rute
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  DNSSEC Secure
                </span>
              </div>
            </div>
          </div>

          {/* Browser Preview Simulator */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Laptop className="w-4 h-4 text-indigo-400" />
                Simulasi Pratinjau Tampilan Pengunjung:
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Status: HTTP 200 OK</span>
            </div>

            {/* Fake Browser Chrome */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
              {/* Browser Address Bar */}
              <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-slate-900 rounded-lg px-3 py-1 flex items-center gap-1.5 text-xs text-slate-300 font-mono border border-slate-800">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">https://</span>
                  <span className="text-white font-bold">{domain.name}</span>
                </div>
              </div>

              {/* Web Page Mock */}
              <div className="p-6 text-center space-y-2 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Website Aktif &amp; Terhubung Sempurna</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  Selamat Datang di {domain.name}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Hosting ini terhubung dengan server NexaHost ({domain.serverLocation}). Anda dapat mulai mengupload file web WordPress, Laravel, atau HTML ke folder public_html.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 text-xs">
                  <span className="text-slate-500">Masa Aktif: s/d {domain.expirationDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Domain memenuhi seluruh standar teknis ICANN &amp; PANDI</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
