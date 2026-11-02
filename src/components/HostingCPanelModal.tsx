import React, { useState } from 'react';
import {
  Server,
  HardDrive,
  Activity,
  FolderTree,
  Database,
  Mail,
  Lock,
  Terminal,
  RotateCw,
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { DomainItem } from '../types';

interface HostingCPanelModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePhpVersion: (domainId: string, version: string) => void;
  onReissueSsl: (domainId: string) => void;
}

export const HostingCPanelModal: React.FC<HostingCPanelModalProps> = ({
  domain,
  isOpen,
  onClose,
  onUpdatePhpVersion,
  onReissueSsl,
}) => {
  if (!isOpen || !domain) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'email' | 'database'>('overview');
  const [copiedEpp, setCopiedEpp] = useState(false);
  const [selectedPhp, setSelectedPhp] = useState(domain.phpVersion);
  const [isReissuingSsl, setIsReissuingSsl] = useState(false);
  const [sslSuccessMessage, setSslSuccessMessage] = useState(false);

  const diskPercent = Math.round((domain.diskUsageMB / domain.diskLimitMB) * 100);
  const bwPercent = Math.round((domain.bandwidthUsageGB / domain.bandwidthLimitGB) * 100);

  const handleCopyEpp = () => {
    navigator.clipboard.writeText(domain.eppCode);
    setCopiedEpp(true);
    setTimeout(() => setCopiedEpp(false), 2500);
  };

  const handlePhpChange = (v: string) => {
    setSelectedPhp(v);
    onUpdatePhpVersion(domain.id, v);
  };

  const handleTriggerReissueSsl = () => {
    setIsReissuingSsl(true);
    setTimeout(() => {
      onReissueSsl(domain.id);
      setIsReissuingSsl(false);
      setSslSuccessMessage(true);
      setTimeout(() => setSslSuccessMessage(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-mono">
                  cPanel Cloud Tools • {domain.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {domain.hostingPlan}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pusat kontrol hosting, web server LiteSpeed, phpMyAdmin, email bisnis, dan resource usage
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

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-slate-950 border border-slate-800 rounded-2xl w-fit text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ringkasan &amp; Resource
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'files' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            File Manager (public_html)
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Akun Email Bisnis
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'database' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            MySQL &amp; phpMyAdmin
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Resource Usage Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Disk Space */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      NVMe Disk Storage
                    </span>
                    <span className="font-mono text-cyan-300">
                      {(domain.diskUsageMB / 1024).toFixed(1)} GB / {(domain.diskLimitMB / 1024).toFixed(0)} GB
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        diskPercent > 80 ? 'bg-rose-500' : diskPercent > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${diskPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                    <span>Terpakai: {diskPercent}%</span>
                    <span>Format: ext4 NVMe Enterprise</span>
                  </div>
                </div>

                {/* Bandwidth Usage */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      Bandwidth Bulanan
                    </span>
                    <span className="font-mono text-indigo-300">
                      {domain.bandwidthUsageGB} GB / {domain.bandwidthLimitGB} GB
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bwPercent > 80 ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${bwPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                    <span>Terpakai: {bwPercent}%</span>
                    <span>Reset per tanggal 1 setiap bulan</span>
                  </div>
                </div>
              </div>

              {/* Quick Settings: PHP Version & SSL Re-issuance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PHP Configuration */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      PHP Engine Selector
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      Active: PHP {selectedPhp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pilih versi runtime PHP untuk kompatibilitas framework Anda (WordPress, Laravel, CI4):
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-xs">
                    {['8.1', '8.2', '8.3', '8.4'].map((ver) => (
                      <button
                        key={ver}
                        type="button"
                        onClick={() => handlePhpChange(ver)}
                        className={`py-1.5 rounded-xl border text-center transition cursor-pointer font-bold ${
                          selectedPhp === ver
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {ver}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SSL Re-issue */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      Auto-SSL Certificate
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {domain.sslIssuer}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sertifikat aktif dengan enkripsi TLS 1.3 / HTTP/3. Dapat di-reissue sewaktu-waktu.
                  </p>
                  {sslSuccessMessage && (
                    <div className="text-[11px] text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sertifikat SSL Let&apos;s Encrypt berhasil diperbarui!</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleTriggerReissueSsl}
                    disabled={isReissuingSsl}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isReissuingSsl ? 'animate-spin' : ''}`} />
                    <span>{isReissuingSsl ? 'Memverifikasi ACME Challenge...' : 'Reissue SSL Let\'s Encrypt'}</span>
                  </button>
                </div>
              </div>

              {/* Domain Transfer Lock & EPP Code */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white">Domain Transfer Lock &amp; EPP/Auth Code</h4>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      LOCKED (Aman)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kode autentikasi rahasia untuk memproteksi domain dari transfer tanpa izin.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-indigo-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    {domain.eppCode}
                  </span>
                  <button
                    onClick={handleCopyEpp}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedEpp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEpp ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-white flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  /home/{domain.name.replace(/\./g, '_')}/public_html/
                </span>
                <span className="text-emerald-400">Web Root Aktif</span>
              </div>
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                  <span className="text-indigo-400">📁 wp-content/</span>
                  <span className="text-slate-500">Directory</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                  <span className="text-indigo-400">📁 wp-includes/</span>
                  <span className="text-slate-500">Directory</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                  <span className="text-emerald-300">📄 index.php</span>
                  <span className="text-slate-500">4.2 KB</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                  <span className="text-amber-300">🔒 .htaccess (LiteSpeed Cache rules)</span>
                  <span className="text-slate-500">1.8 KB</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition">
                  <span className="text-slate-300">📄 wp-config.php</span>
                  <span className="text-slate-500">3.1 KB</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  Akun Email Aktif (@{domain.name})
                </h4>
                <button
                  type="button"
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  + Tambah Akun Email
                </button>
              </div>
              <div className="bg-slate-950 rounded-2xl border border-slate-800 divide-y divide-slate-800 text-xs">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-white font-bold">admin@{domain.name}</span>
                    <p className="text-[11px] text-slate-500">Storage: 240 MB / 5 GB • IMAP/POP3/SMTP</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                    Aktif
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-white font-bold">info@{domain.name}</span>
                    <p className="text-[11px] text-slate-500">Storage: 85 MB / 5 GB • IMAP/POP3/SMTP</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Database MariaDB / MySQL Enterprise
                </h4>
                <span className="text-[10px] text-slate-400">Server: localhost:3306</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-white font-bold text-xs">db_{domain.name.replace(/\./g, '_')}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Collation: utf8mb4_unicode_520_ci • 42 Tables</p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                >
                  Buka phpMyAdmin ↗
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
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
