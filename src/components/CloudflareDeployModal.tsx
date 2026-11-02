import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  X,
  Sparkles,
} from 'lucide-react';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cloudflare orange glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Panduan Deploy ke Cloudflare Workers
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase font-mono">
                  ebidomain.cvebi.workers.dev
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aplikasi ini 100% kompatibel dan siap dipublish ke subdomain Cloudflare Workers Anda
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
          {/* Target Host Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Target Live URL Cloudflare:</span>
              </span>
              <div className="text-base sm:text-lg font-mono font-extrabold text-white mt-1 flex items-center gap-2">
                <span>https://ebidomain.cvebi.workers.dev</span>
                <a
                  href="https://ebidomain.cvebi.workers.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-amber-400 transition"
                  title="Buka URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Penyedia Domain &amp; Cloud Hosting EbiDomain (CV Ebi)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Siap Deploy</span>
              </span>
            </div>
          </div>

          {/* Keuntungan Cloudflare */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>CDN Anycast 300+ Kota</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aplikasi dilayani dari server terdekat (Jakarta/Singapura) dengan kecepatan loading instan &lt; 20ms.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Free SSL &amp; Anti-DDoS</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sertifikat SSL otomatis aktif dan proteksi anti-DDoS gratis dari jaringan Cloudflare.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>wrangler.toml Siap</span>
              </div>
              <p className="text-[11px] text-slate-400">
                File konfigurasi Cloudflare <code>wrangler.toml</code> dan routing <code>_redirects</code> sudah dibuat di proyek ini.
              </p>
            </div>
          </div>

          {/* Metode Deploy 1: Wrangler CLI */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Cara 1: Deploy Cepat via Terminal (Wrangler CLI)</span>
              </h4>
              <span className="text-[10px] text-slate-400">Rekomendasi (Hanya 1 Menit)</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Jalankan perintah ini di komputer / server Anda untuk langsung mem-publish aplikasi ke Cloudflare:
            </p>

            <div className="space-y-2">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-300">
                <code>npm run build</code>
                <button
                  onClick={() => handleCopy('npm run build', 'build')}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Salin Perintah"
                >
                  {copiedCmd === 'build' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-amber-300">
                <code>npx wrangler deploy</code>
                <button
                  onClick={() => handleCopy('npx wrangler deploy', 'deploy')}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Salin Perintah"
                >
                  {copiedCmd === 'deploy' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Wrangler akan secara otomatis membaca file <code>wrangler.toml</code> yang telah dikonfigurasi dengan nama <strong>ebidomain</strong> dan folder <strong>dist</strong>.
            </p>
          </div>

          {/* Metode Deploy 2: Cloudflare Dashboard (Drag & Drop) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Cara 2: Deploy Tanpa Terminal (Dashboard Cloudflare Pages)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
              <li>
                Buka <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">dash.cloudflare.com</a> dan login ke akun Cloudflare CV Ebi Anda.
              </li>
              <li>
                Pilih menu <strong>Workers &amp; Pages</strong> &gt; klik <strong>Create application</strong> &gt; pilih tab <strong>Pages</strong>.
              </li>
              <li>
                Pilih opsi <strong>Upload assets</strong> &gt; beri nama proyek: <code>ebidomain</code>.
              </li>
              <li>
                Jalankan <code>npm run build</code> di proyek ini, lalu upload folder <code>dist/</code> hasil build.
              </li>
              <li>
                Klik <strong>Deploy site</strong>. Selesai! Aplikasi langsung aktif di <strong>ebidomain.cvebi.workers.dev</strong>.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Semua file routing Cloudflare (_redirects &amp; _headers) sudah terkonfigurasi</span>
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
