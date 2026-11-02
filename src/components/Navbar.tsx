import React from 'react';
import {
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Server,
  Lock,
  PlusCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Cloud,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSheetsConfig } from '../types';

import { WebhookSyncConfig } from '../services/webhookSync';

interface NavbarProps {
  activeTab: 'domains' | 'search' | 'hosting' | 'security' | 'sheets';
  setActiveTab: (tab: 'domains' | 'search' | 'hosting' | 'security' | 'sheets') => void;
  currentUser: User | null;
  sheetsConfig: GoogleSheetsConfig;
  webhookConfig?: WebhookSyncConfig;
  currency: 'IDR' | 'USD';
  setCurrency: (c: 'IDR' | 'USD') => void;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  onOpenRegisterModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenCloudflareModal: () => void;
  isLoggingIn: boolean;
  expiringCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  sheetsConfig,
  webhookConfig,
  currency,
  setCurrency,
  onGoogleSignIn,
  onLogout,
  onOpenRegisterModal,
  onOpenSheetsModal,
  onOpenCloudflareModal,
  isLoggingIn,
  expiringCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-8">
            <div
              onClick={() => setActiveTab('domains')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    Ebi<span className="text-amber-400">Domain</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    CV EBI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
                  ebidomain.cvebi.workers.dev
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('domains')}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'domains'
                    ? 'text-white bg-slate-800/90 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Server className="w-4 h-4 text-indigo-400" />
                <span>Kelola Domain &amp; Batas Waktu</span>
                {expiringCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {expiringCount} Segera Berakhir
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'search'
                    ? 'text-white bg-slate-800/90 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Cari Domain &amp; TLD</span>
              </button>

              <button
                onClick={() => setActiveTab('hosting')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'hosting'
                    ? 'text-white bg-slate-800/90 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Server className="w-4 h-4 text-violet-400" />
                <span>Paket Cloud Hosting</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'security'
                    ? 'text-white bg-slate-800/90 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Pusat Keamanan &amp; DNSSEC</span>
              </button>
            </nav>
          </div>

          {/* Right Action Elements: Google Sheets Sync, Currency, Add Domain, Google Auth */}
          <div className="flex items-center gap-3">
            {/* Google Sheets / Webhook Status Indicator */}
            <button
              onClick={onOpenSheetsModal}
              title="Kelola Sinkronisasi Google Sheets &amp; Webhook"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                webhookConfig?.webhookUrl || sheetsConfig.spreadsheetId
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${webhookConfig?.webhookUrl || sheetsConfig.spreadsheetId ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">
                {webhookConfig?.webhookUrl
                  ? 'Webhook Sheet Aktif'
                  : sheetsConfig.spreadsheetId
                  ? 'Google Sheets Aktif'
                  : 'Google Sheets / Webhook'}
              </span>
              {(sheetsConfig.isSyncing || webhookConfig?.isSendingWebhook) && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              )}
            </button>

            {/* Cloudflare Deploy Button */}
            <button
              onClick={onOpenCloudflareModal}
              title="Panduan Deploy ke Cloudflare (ebidomain.cvebi.workers.dev)"
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 hover:bg-amber-500/20 transition cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Cloudflare Deploy</span>
            </button>

            {/* Currency Selector */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setCurrency('IDR')}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  currency === 'IDR'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USD
              </button>
            </div>

            {/* Register New Domain / Order Hosting Button */}
            <button
              onClick={onOpenRegisterModal}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftar Domain</span>
            </button>

            {/* Google Authentication Section */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-indigo-400/30 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {currentUser.displayName || 'Admin Nexa'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar dari Akun Google"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-white hover:bg-slate-100 text-slate-800 shadow-sm border border-slate-300 transition cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="hidden sm:inline">
                  {isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('domains')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'domains' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Kelola ({expiringCount > 0 ? `⚠️ ${expiringCount}` : 'Domain'})</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'search' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Cari Domain</span>
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hosting' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Hosting</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Keamanan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
