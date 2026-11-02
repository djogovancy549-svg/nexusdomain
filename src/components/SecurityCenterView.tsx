import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Globe,
} from 'lucide-react';
import { DomainItem, SecurityLog } from '../types';

interface SecurityCenterViewProps {
  domains: DomainItem[];
  securityLogs: SecurityLog[];
  onTriggerHealthCheck: () => void;
  isScanning: boolean;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  domains,
  securityLogs,
  onTriggerHealthCheck,
  isScanning,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'danger' | 'warning' | 'info'>('all');
  const [searchLog, setSearchLog] = useState('');

  const dnssecActiveCount = domains.filter((d) => d.dnssecEnabled).length;
  const sslActiveCount = domains.filter((d) => d.sslStatus === 'active').length;
  const whoisProtectedCount = domains.filter((d) => d.whoisPrivacy).length;

  const filteredLogs = securityLogs.filter((log) => {
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesSearch =
      log.domain.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.event.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchLog.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Top Banner: Security Score & Live Shield */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NexaShield Active Defense • Grade A+ Enterprise Security</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pusat Pertahanan &amp; Keamanan Tingkat Tinggi
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Arsitektur keamanan multi-layer yang melindungi setiap domain dari serangan DDoS L3/L4/L7, DNS hijacking melalui DNSSEC, sertifikat SSL TLS 1.3 otomatis, dan perlindungan privasi data identitas pemilik domain.
            </p>
          </div>

          {/* Security Score Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shrink-0 self-start lg:self-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center flex-col">
                <span className="text-xs font-bold text-slate-400">SCORE</span>
                <span className="text-xl font-extrabold text-white">99.4%</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>STATUS: DILINDUNGI PENUH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Zero Breach in Last 365 Days</p>
              <button
                onClick={onTriggerHealthCheck}
                disabled={isScanning}
                className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Memindai Jaringan...' : 'Jalankan Scan Keamanan'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Security Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: DNSSEC */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">DNSSEC Kriptografi</h4>
            <p className="text-xs text-slate-400 mt-1">
              Menghilangkan risiko DNS Spoofing &amp; Cache Poisoning via ECDSA P-256 signatures.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Aktif pada:</span>
            <span className="font-bold text-indigo-300">{dnssecActiveCount} / {domains.length} Domain</span>
          </div>
        </div>

        {/* Pillar 2: SSL TLS 1.3 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Auto-SSL TLS 1.3</h4>
            <p className="text-xs text-slate-400 mt-1">
              Enkripsi end-to-end 256-bit otomatis terpasang dengan perpanjangan tanpa downtime.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Terpasang:</span>
            <span className="font-bold text-cyan-300">{sslActiveCount} / {domains.length} Domain</span>
          </div>
        </div>

        {/* Pillar 3: L7 Anti-DDoS Shield */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">L7 Anti-DDoS &amp; WAF</h4>
            <p className="text-xs text-slate-400 mt-1">
              Kapasitas mitigasi serangan hingga 4.5 Tbps dan filtering bot malicious real-time.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Mitigasi Serangan:</span>
            <span className="font-bold text-emerald-400">100% Berhasil</span>
          </div>
        </div>

        {/* Pillar 4: Whois Privacy */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Whois Privacy Guard</h4>
            <p className="text-xs text-slate-400 mt-1">
              Sembunyikan nama, alamat, nomor telepon, dan email dari database WHOIS publik.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Terproteksi:</span>
            <span className="font-bold text-violet-300">{whoisProtectedCount} / {domains.length} Domain</span>
          </div>
        </div>
      </div>

      {/* Real-time Security Audit Log Stream */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Security Event Stream &amp; Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Log aktivitas keamanan yang otomatis disinkronkan ke tab &quot;Security &amp; Audit Logs&quot; di Google Sheets
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari log IP / domain..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">Semua Severity</option>
              <option value="danger">Danger (Serangan)</option>
              <option value="warning">Warning</option>
              <option value="info">Info / Enforced</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Peristiwa Keamanan</th>
                <th className="px-4 py-3">IP Sumber</th>
                <th className="px-4 py-3">Tingkat</th>
                <th className="px-4 py-3 text-right">Status Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500 font-sans text-xs">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">Belum ada peristiwa keamanan tercatat.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Log audit akan otomatis terisi saat domain baru diterbitkan, DNS diperbarui, atau sertifikat SSL diterbitkan.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 font-bold text-white">{log.domain}</td>
                    <td className="px-4 py-3 font-sans text-slate-200">{log.event}</td>
                    <td className="px-4 py-3 text-slate-400">{log.ip}</td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.severity === 'danger'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
