import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Calendar,
  ShieldCheck,
  Table,
  Zap,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DomainItem, GoogleSheetsConfig, SecurityLog } from '../types';
import {
  calculateRemainingDays,
  exportDomainsToCSV,
} from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  sheetsConfig: GoogleSheetsConfig;
  domains: DomainItem[];
  securityLogs: SecurityLog[];
  onGoogleSignIn: () => void;
  onTriggerSync: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
  onToggleAutoSync: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sheetsConfig,
  domains,
  securityLogs,
  onGoogleSignIn,
  onTriggerSync,
  onCreateNewSheet,
  onToggleAutoSync,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'domains' | 'security'>('domains');
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    try {
      const csvContent = exportDomainsToCSV(domains);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `NexaHost-Domains-BatasWaktu-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Integrasi Database Google Sheets
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Real-Time Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Penyimpanan data domain, batas waktu (kadaluarsa), SSL, dan audit keamanan langsung ke spreadsheet Anda
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

        {/* Main Content Area (Scrollable) */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-6">
          {/* Connection Status Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${
                  currentUser && sheetsConfig.spreadsheetId
                    ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                    : currentUser
                    ? 'bg-amber-400 shadow-md shadow-amber-400/50'
                    : 'bg-slate-600'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Akun Google Terhubung:
                  </p>
                  <p className="text-sm font-bold text-white">
                    {currentUser ? currentUser.email : 'Belum Terhubung'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!currentUser ? (
                  <button
                    onClick={onGoogleSignIn}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-slate-900 hover:bg-slate-200 transition shadow cursor-pointer flex items-center gap-2"
                  >
                    <span>Masuk dengan Google</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {sheetsConfig.spreadsheetUrl && (
                      <a
                        href={sheetsConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Spreadsheet ↗</span>
                      </a>
                    )}
                    <button
                      onClick={onTriggerSync}
                      disabled={sheetsConfig.isSyncing}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sheetsConfig.isSyncing ? 'animate-spin' : ''}`} />
                      <span>{sheetsConfig.isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sync Status Banner */}
            {currentUser && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Spreadsheet:{' '}
                    <strong className="text-white font-mono">
                      {sheetsConfig.sheetTitle}
                    </strong>
                  </span>
                </div>
                <div>
                  Terakhir disinkronkan:{' '}
                  <span className="text-slate-300 font-medium">
                    {sheetsConfig.lastSyncedAt || 'Belum pernah'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings & Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Auto-Sync Toggle Tile */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Auto-Sync Realtime</h4>
                  <p className="text-[11px] text-slate-400">
                    Otomatis perbarui baris Google Sheet tiap registrasi &amp; perpanjangan
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sheetsConfig.autoSync}
                  onChange={onToggleAutoSync}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* CSV Backup Download Tile */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cadangan CSV Lokal</h4>
                  <p className="text-[11px] text-slate-400">
                    Ekspor seluruh data domain &amp; batas waktu ke format file .csv
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                disabled={isExportingCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition cursor-pointer"
              >
                Unduh CSV
              </button>
            </div>
          </div>

          {/* Database Tabs Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">
                  Struktur Kolom Database Google Sheet
                </h4>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setActivePreviewTab('domains')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    activePreviewTab === 'domains'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tab 1: Domains &amp; Batas Waktu ({domains.length})
                </button>
                <button
                  onClick={() => setActivePreviewTab('security')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    activePreviewTab === 'security'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tab 2: Security &amp; Audit Logs ({securityLogs.length})
                </button>
              </div>
            </div>

            {/* Live Data Preview Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
              {activePreviewTab === 'domains' ? (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-3.5 py-2.5">Domain</th>
                      <th className="px-3.5 py-2.5">Klien</th>
                      <th className="px-3.5 py-2.5">Paket Hosting</th>
                      <th className="px-3.5 py-2.5">Batas Waktu (Expired)</th>
                      <th className="px-3.5 py-2.5">Sisa Hari</th>
                      <th className="px-3.5 py-2.5">Status</th>
                      <th className="px-3.5 py-2.5">DNSSEC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {domains.map((d) => {
                      const days = calculateRemainingDays(d.expirationDate);
                      return (
                        <tr key={d.id} className="hover:bg-slate-900/40">
                          <td className="px-3.5 py-2.5 font-bold text-white">{d.name}</td>
                          <td className="px-3.5 py-2.5 font-sans">{d.clientName}</td>
                          <td className="px-3.5 py-2.5 font-sans text-indigo-300">{d.hostingPlan}</td>
                          <td className="px-3.5 py-2.5 text-amber-300">{d.expirationDate}</td>
                          <td className="px-3.5 py-2.5 font-bold">
                            {days < 0 ? (
                              <span className="text-red-400">{Math.abs(days)} hari lalu</span>
                            ) : days <= 30 ? (
                              <span className="text-amber-400">{days} hari</span>
                            ) : (
                              <span className="text-emerald-400">{days} hari</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                days < 0
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : days <= 30
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {days < 0 ? 'Kadaluarsa' : days <= 30 ? 'Segera Berakhir' : 'Aktif'}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-sans">
                            {d.dnssecEnabled ? (
                              <span className="text-emerald-400">Aktif</span>
                            ) : (
                              <span className="text-slate-500">Nonaktif</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-3.5 py-2.5">Timestamp</th>
                      <th className="px-3.5 py-2.5">Domain</th>
                      <th className="px-3.5 py-2.5">Aktivitas Keamanan</th>
                      <th className="px-3.5 py-2.5">IP Sumber</th>
                      <th className="px-3.5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {securityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40">
                        <td className="px-3.5 py-2.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-3.5 py-2.5 font-bold text-white">{log.domain}</td>
                        <td className="px-3.5 py-2.5 font-sans text-slate-300">{log.event}</td>
                        <td className="px-3.5 py-2.5 text-slate-400">{log.ip}</td>
                        <td className="px-3.5 py-2.5 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Koneksi aman dengan Google Workspace OAuth Token v4</span>
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
