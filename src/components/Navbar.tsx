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
  Sparkles,
  Shield,
  UserCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSheetsConfig } from '../types';
import { WebhookSyncConfig } from '../services/webhookSync';

interface NavbarProps {
  activeTab: 'domains' | 'search' | 'hosting' | 'security' | 'sheets' | 'client-portal';
  setActiveTab: (tab: 'domains' | 'search' | 'hosting' | 'security' | 'sheets' | 'client-portal') => void;
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
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
  isAdminView,
  setIsAdminView,
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
          <div className="flex items-center gap-6">
            <div
              onClick={() => setActiveTab('client-portal')}
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

            {/* Role Switcher: Admin Agency vs Client Portal */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  setIsAdminView(true);
                  setActiveTab('domains');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isAdminView
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-300" />
                <span>Panel Admin (Agency)</span>
              </button>
              <button
                onClick={() => {
                  setIsAdminView(false);
                  setActiveTab('client-portal');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  !isAdminView
                    ? 'bg-amber-600 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Portal Pelanggan</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('client-portal')}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'client-portal'
                    ? 'text-white bg-amber-600/90 shadow-md shadow-amber-600/20'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Dashboard Pelanggan</span>
              </button>

              {isAdminView && (
                <>
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
                </>
              )}

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
            </nav>
          </div>

          {/* Right Action Elements: Google Sheets Sync (Admin Only), Currency, Add Domain */}
          <div className="flex items-center gap-3">
            {/* Google Sheets / Webhook Status Indicator - ONLY VISIBLE IN ADMIN VIEW */}
            {isAdminView && (
              <button
                onClick={onOpenSheetsModal}
                title="Kelola Sinkronisasi Google Sheets &amp; Webhook (Rahasia Admin)"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                  webhookConfig?.webhookUrl || sheetsConfig.spreadsheetId
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileSpreadsheet className={`w-4 h-4 ${webhookConfig?.webhookUrl || sheetsConfig.spreadsheetId ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden lg:inline">
                  {webhookConfig?.webhookUrl
                    ? 'Database Sheet Aktif'
                    : sheetsConfig.spreadsheetId
                    ? 'Google Sheets Aktif'
                    : 'Database Admin'}
                </span>
                {(sheetsConfig.isSyncing || webhookConfig?.isSendingWebhook) && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                )}
              </button>
            )}

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setCurrency('IDR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === 'IDR'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {isAdminView && (
              <button
                onClick={onOpenRegisterModal}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Jual Domain Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
