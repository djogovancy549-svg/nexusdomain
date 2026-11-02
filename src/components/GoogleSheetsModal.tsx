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
  Code,
  Copy,
  Check,
  Link as LinkIcon,
  Send,
  HelpCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DomainItem, GoogleSheetsConfig, SecurityLog } from '../types';
import {
  calculateRemainingDays,
  exportDomainsToCSV,
} from '../services/googleSheets';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  WebhookSyncConfig,
} from '../services/webhookSync';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  sheetsConfig: GoogleSheetsConfig;
  webhookConfig: WebhookSyncConfig;
  domains: DomainItem[];
  securityLogs: SecurityLog[];
  onGoogleSignIn: () => void;
  onTriggerSync: () => Promise<void>;
  onTriggerWebhookSync: () => Promise<void>;
  onUpdateWebhookConfig: (config: Partial<WebhookSyncConfig>) => void;
  onCreateNewSheet: () => Promise<void>;
  onToggleAutoSync: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sheetsConfig,
  webhookConfig,
  domains,
  securityLogs,
  onGoogleSignIn,
  onTriggerSync,
  onTriggerWebhookSync,
  onUpdateWebhookConfig,
  onCreateNewSheet,
  onToggleAutoSync,
}) => {
  const [activeTab, setActiveTab] = useState<'webhook' | 'oauth' | 'preview'>('webhook');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [inputWebhookUrl, setInputWebhookUrl] = useState(webhookConfig.webhookUrl || '');
  const [inputSheetUrl, setInputSheetUrl] = useState(webhookConfig.sheetUrl || '');
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveWebhookSettings = () => {
    onUpdateWebhookConfig({
      webhookUrl: inputWebhookUrl.trim(),
      sheetUrl: inputSheetUrl.trim(),
    });
  };

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
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Koneksi Database Google Sheets &amp; Webhook Deploy
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Dual Sync Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kirim data domain, batas waktu, WhatsApp pembeli, dan status pembayaran langsung via Webhook Apps Script &amp; URL Sheet
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

        {/* Method Switcher Navigation */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-950 border border-slate-800 rounded-2xl w-fit text-xs">
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Webhook Deploy &amp; URL Sheet (Rekomendasi)</span>
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'oauth'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google Workspace OAuth</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Preview Struktur Data ({domains.length})</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-5">
          {/* TAB 1: WEBHOOK DEPLOY & URL SHEET */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              {/* Webhook Configuration Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-emerald-400" />
                      <span>Konfigurasi Link Google Sheet &amp; Webhook Deploy</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Masukkan link spreadsheet dan link webhook hasil deploy Google Apps Script Anda
                    </p>
                  </div>

                  {webhookConfig.lastWebhookSyncAt && (
                    <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      Terakhir Terkirim: {webhookConfig.lastWebhookSyncAt}
                    </span>
                  )}
                </div>

                {/* Form Inputs */}
                <div className="space-y-3 pt-1">
                  {/* URL Google Sheet */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">
                        1. URL Link Google Spreadsheet Anda:
                      </label>
                      {inputSheetUrl && inputSheetUrl.startsWith('http') && (
                        <a
                          href={inputSheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Buka Sheet di Tab Baru</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/1A2B3C4D.../edit"
                      value={inputSheetUrl}
                      onChange={(e) => setInputSheetUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* URL Webhook Deploy */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      2. URL Webhook Deploy (Google Apps Script Web App):
                    </label>
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                      value={inputWebhookUrl}
                      onChange={(e) => setInputWebhookUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      URL ini diperoleh setelah menerapkan (*Deploy as Web App*) kode Apps Script pada Google Sheet Anda.
                    </p>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveWebhookSettings}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      Simpan Pengaturan URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScriptCode(!showScriptCode)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{showScriptCode ? 'Tutup Kode Skrip' : 'Lihat Kode Apps Script Webhook'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      handleSaveWebhookSettings();
                      await onTriggerWebhookSync();
                    }}
                    disabled={webhookConfig.isSendingWebhook}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {webhookConfig.isSendingWebhook ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengirim ke Webhook...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Data Sekarang ke Google Sheet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Apps Script Code & Guide */}
              {showScriptCode && (
                <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-cyan-400" />
                        <span>Kode Google Apps Script Webhook (Siap Copy-Paste):</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Salin dan tempelkan ke Google Sheets Anda di menu <strong>Ekstensi &gt; Apps Script</strong>
                      </p>
                    </div>

                    <button
                      onClick={handleCopyScript}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Semua Kode'}</span>
                    </button>
                  </div>

                  {/* 4-Step Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                    <div>
                      <strong className="text-indigo-400 block">Langkah 1:</strong>
                      Buka Google Sheet baru &gt; Menu Ekstensi &gt; Apps Script.
                    </div>
                    <div>
                      <strong className="text-indigo-400 block">Langkah 2:</strong>
                      Hapus semua kode lama &gt; Paste kode di bawah ini &gt; Simpan.
                    </div>
                    <div>
                      <strong className="text-indigo-400 block">Langkah 3:</strong>
                      Klik Deploy &gt; New deployment &gt; Pilih jenis Web app.
                    </div>
                    <div>
                      <strong className="text-indigo-400 block">Langkah 4:</strong>
                      Akses: &quot;Anyone&quot; &gt; Deploy &gt; Salin URL Webhook ke sini!
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-64">
                      {GOOGLE_APPS_SCRIPT_CODE}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE WORKSPACE OAUTH */}
          {activeTab === 'oauth' && (
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
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
                      Akun Google Workspace Terhubung:
                    </p>
                    <p className="text-sm font-bold text-white">
                      {currentUser ? currentUser.email : 'Belum Terhubung'}
                    </p>
                  </div>
                </div>

                {!currentUser ? (
                  <button
                    onClick={onGoogleSignIn}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-slate-900 hover:bg-slate-200 transition shadow cursor-pointer"
                  >
                    Masuk dengan Google
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
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sheetsConfig.isSyncing ? 'animate-spin' : ''}`} />
                      <span>{sheetsConfig.isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATA PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Daftar Kolom Penjual Domain &amp; Batas Waktu yang Masuk ke Google Sheet:</span>
                <button
                  onClick={handleExportCSV}
                  disabled={isExportingCSV}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Unduh Format CSV
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Invoice</th>
                      <th className="px-3 py-2">Domain</th>
                      <th className="px-3 py-2">Pembeli</th>
                      <th className="px-3 py-2">WhatsApp</th>
                      <th className="px-3 py-2">Harga Jual</th>
                      <th className="px-3 py-2">Batas Waktu</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {domains.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-sans">
                          Database saat ini masih kosong. Data akan muncul di sini setelah Anda menerbitkan domain.
                        </td>
                      </tr>
                    ) : (
                      domains.map((d) => {
                        const days = calculateRemainingDays(d.expirationDate);
                        return (
                          <tr key={d.id} className="hover:bg-slate-900/40">
                            <td className="px-3 py-2 text-indigo-400">{d.invoiceNumber || d.id}</td>
                            <td className="px-3 py-2 font-bold text-white">{d.name}</td>
                            <td className="px-3 py-2 font-sans">{d.clientName}</td>
                            <td className="px-3 py-2 text-emerald-400">{d.clientPhone || '-'}</td>
                            <td className="px-3 py-2 text-slate-200">Rp {(d.salePriceIDR || 149000).toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2 text-amber-300">{d.expirationDate}</td>
                            <td className="px-3 py-2 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                {days < 0 ? 'Kadaluarsa' : days <= 30 ? 'Segera Berakhir' : 'Aktif'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Settings: Auto-sync toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Auto-Sync Otomatis Real-Time</h4>
                <p className="text-[11px] text-slate-400">
                  Otomatis kirim data ke Google Sheet / Webhook setiap kali Anda menjual domain baru atau memperpanjang batas waktu
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webhookConfig.autoSyncWebhook}
                onChange={() =>
                  onUpdateWebhookConfig({ autoSyncWebhook: !webhookConfig.autoSyncWebhook })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Koneksi aman langsung ke Google Spreadsheet Anda</span>
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
