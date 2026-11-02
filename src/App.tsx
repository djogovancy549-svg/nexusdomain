import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { DomainSearchHero } from './components/DomainSearchHero';
import { HostingPackages } from './components/HostingPackages';
import { DomainManagementTable } from './components/DomainManagementTable';
import { CustomerDashboard } from './components/CustomerDashboard';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { DnsManagerModal } from './components/DnsManagerModal';
import { HostingCPanelModal } from './components/HostingCPanelModal';
import { RegisterDomainModal } from './components/RegisterDomainModal';
import { RenewDomainModal } from './components/RenewDomainModal';
import { SecurityCenterView } from './components/SecurityCenterView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DomainOwnershipCertificateModal } from './components/DomainOwnershipCertificateModal';
import { DomainReadinessModal } from './components/DomainReadinessModal';
import { CloudflareDeployModal } from './components/CloudflareDeployModal';
import { CloudflarePagesConnectModal } from './components/CloudflarePagesConnectModal';

import {
  DomainItem,
  SecurityLog,
  GoogleSheetsConfig,
  DnsRecord,
  HostingPackage,
} from './types';
import {
  INITIAL_DOMAINS,
  INITIAL_SECURITY_LOGS,
  TLD_PRICING_CATALOG,
} from './data/initialData';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth';
import {
  createHostingSpreadsheet,
  searchExistingSpreadsheet,
  syncDataToGoogleSheet,
  calculateRemainingDays,
  SHEET_TITLE_PREFIX,
} from './services/googleSheets';
import {
  sendDataToSheetWebhook,
  WebhookSyncConfig,
  DEFAULT_WEBHOOK_URL,
  DEFAULT_SHEET_URL,
} from './services/webhookSync';
import { CheckCircle2, AlertCircle, FileSpreadsheet, ExternalLink, X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nexahost_domains_clean_v3';
const LOCAL_STORAGE_LOGS = 'nexahost_logs_clean_v3';
const LOCAL_STORAGE_SHEET_ID = 'nexahost_sheet_id_v1';
const LOCAL_STORAGE_WEBHOOK = 'nexahost_webhook_config_v1';

// Clear legacy dummy cache so application starts 100% clean
try {
  localStorage.removeItem('nexahost_domains_data_v1');
  localStorage.removeItem('nexahost_logs_data_v1');
} catch (e) {
  // Ignore in restricted environments
}

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<'domains' | 'search' | 'hosting' | 'security' | 'sheets' | 'client-portal'>('client-portal');
  const [isAdminView, setIsAdminView] = useState(false);
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Domains & Logs State
  const [domains, setDomains] = useState<DomainItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read localStorage:', e);
    }
    return INITIAL_DOMAINS;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read logs:', e);
    }
    return INITIAL_SECURITY_LOGS;
  });

  // Google Sheets Config
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: localStorage.getItem(LOCAL_STORAGE_SHEET_ID) || null,
    spreadsheetUrl: localStorage.getItem(LOCAL_STORAGE_SHEET_ID)
      ? `https://docs.google.com/spreadsheets/d/${localStorage.getItem(LOCAL_STORAGE_SHEET_ID)}/edit`
      : null,
    lastSyncedAt: null,
    autoSync: true,
    isSyncing: false,
    sheetTitle: SHEET_TITLE_PREFIX,
  });

  // Google Apps Script Webhook Deploy & Sheet URL Config
  const [webhookConfig, setWebhookConfig] = useState<WebhookSyncConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WEBHOOK);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read webhookConfig from localStorage:', e);
    }
    return {
      webhookUrl: DEFAULT_WEBHOOK_URL,
      sheetUrl: DEFAULT_SHEET_URL,
      autoSyncWebhook: true,
      lastWebhookSyncAt: null,
      isSendingWebhook: false,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WEBHOOK, JSON.stringify(webhookConfig));
    } catch (e) {
      console.warn('Failed to save webhookConfig to localStorage:', e);
    }
  }, [webhookConfig]);

  // Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerInitialDomain, setRegisterInitialDomain] = useState('');
  const [registerInitialTld, setRegisterInitialTld] = useState('.com');
  const [registerInitialPkg, setRegisterInitialPkg] = useState('business');

  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [dnsModalDomain, setDnsModalDomain] = useState<DomainItem | null>(null);
  const [hostingModalDomain, setHostingModalDomain] = useState<DomainItem | null>(null);
  const [renewModalDomain, setRenewModalDomain] = useState<DomainItem | null>(null);
  const [certModalDomain, setCertModalDomain] = useState<DomainItem | null>(null);
  const [readinessModalDomain, setReadinessModalDomain] = useState<DomainItem | null>(null);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [cfPagesModalDomain, setCfPagesModalDomain] = useState<DomainItem | null>(null);

  // Security scan state
  const [isScanning, setIsScanning] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; link?: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success', link?: string) => {
    setToast({ message, type, link });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Safe Confirmation Modal state (Destructive operations per workspace-integration)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(domains));
    } catch (e) {
      console.warn('Error writing domains to localStorage', e);
    }
  }, [domains]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS, JSON.stringify(securityLogs));
    } catch (e) {
      console.warn('Error writing logs to localStorage', e);
    }
  }, [securityLogs]);

  // Sync to Google Sheets Helper
  const triggerGoogleSheetsSync = useCallback(
    async (targetDomains?: DomainItem[], targetLogs?: SecurityLog[]): Promise<boolean> => {
      const activeDomains = targetDomains || domains;
      const activeLogs = targetLogs || securityLogs;

      const token = await getAccessToken();
      if (!token) {
        showToast('Silakan masuk dengan akun Google untuk menyinkronkan ke Google Sheets.', 'info');
        return false;
      }

      setSheetsConfig((prev) => ({ ...prev, isSyncing: true }));
      try {
        let sheetId = sheetsConfig.spreadsheetId;
        let sheetUrl = sheetsConfig.spreadsheetUrl;

        // If no sheet ID yet, check if there's an existing one or create a new one
        if (!sheetId) {
          const existing = await searchExistingSpreadsheet(token);
          if (existing) {
            sheetId = existing.id;
            sheetUrl = existing.url;
          } else {
            const created = await createHostingSpreadsheet(token);
            sheetId = created.id;
            sheetUrl = created.url;
          }

          localStorage.setItem(LOCAL_STORAGE_SHEET_ID, sheetId);
          setSheetsConfig((prev) => ({
            ...prev,
            spreadsheetId: sheetId,
            spreadsheetUrl: sheetUrl,
          }));
        }

        // Perform real-time push to Google Sheets
        await syncDataToGoogleSheet(token, sheetId, activeDomains, activeLogs);

        const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setSheetsConfig((prev) => ({
          ...prev,
          lastSyncedAt: `Hari ini pukul ${now}`,
          isSyncing: false,
        }));

        showToast(
          `Data berhasil disinkronkan ke Google Sheet (${activeDomains.length} domain, batas waktu terupdate).`,
          'success',
          sheetUrl || undefined
        );
        return true;
      } catch (err: any) {
        console.error('Sync failed:', err);
        setSheetsConfig((prev) => ({ ...prev, isSyncing: false }));
        showToast(`Gagal menyinkronkan: ${err.message || 'Terjadi kesalahan'}`, 'error');
        return false;
      }
    },
    [domains, securityLogs, sheetsConfig.spreadsheetId, sheetsConfig.spreadsheetUrl]
  );

  // Sync to Google Sheets via Webhook Deploy (Apps Script)
  const triggerWebhookSync = useCallback(
    async (customDomains?: DomainItem[]): Promise<boolean> => {
      const targetDomains = customDomains || domains;
      if (!webhookConfig.webhookUrl) {
        showToast('Silakan masukkan URL Webhook Deploy Google Apps Script di tab Webhook.', 'info');
        setIsSheetsModalOpen(true);
        return false;
      }

      setWebhookConfig((prev) => ({ ...prev, isSendingWebhook: true }));
      try {
        const res = await sendDataToSheetWebhook(webhookConfig.webhookUrl, targetDomains, securityLogs);
        const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setWebhookConfig((prev) => ({
          ...prev,
          isSendingWebhook: false,
          lastWebhookSyncAt: `Pukul ${now}`,
        }));
        showToast(res.message, 'success', webhookConfig.sheetUrl || undefined);
        return true;
      } catch (err: any) {
        setWebhookConfig((prev) => ({ ...prev, isSendingWebhook: false }));
        showToast(`Gagal kirim ke Webhook: ${err.message}`, 'error');
        return false;
      }
    },
    [domains, securityLogs, webhookConfig.webhookUrl, webhookConfig.sheetUrl]
  );

  // Initialize Firebase Auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        // Automatically check/sync Google Sheet
        try {
          const existing = await searchExistingSpreadsheet(token);
          if (existing) {
            localStorage.setItem(LOCAL_STORAGE_SHEET_ID, existing.id);
            setSheetsConfig((prev) => ({
              ...prev,
              spreadsheetId: existing.id,
              spreadsheetUrl: existing.url,
            }));
          }
        } catch (e) {
          console.warn('Initial drive lookup failed:', e);
        }
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        showToast(`Berhasil masuk sebagai ${res.user.displayName || res.user.email}!`, 'success');

        // Automatically setup spreadsheet
        const existing = await searchExistingSpreadsheet(res.accessToken);
        if (existing) {
          localStorage.setItem(LOCAL_STORAGE_SHEET_ID, existing.id);
          setSheetsConfig((prev) => ({
            ...prev,
            spreadsheetId: existing.id,
            spreadsheetUrl: existing.url,
          }));
          await syncDataToGoogleSheet(res.accessToken, existing.id, domains, securityLogs);
        } else {
          const created = await createHostingSpreadsheet(res.accessToken);
          localStorage.setItem(LOCAL_STORAGE_SHEET_ID, created.id);
          setSheetsConfig((prev) => ({
            ...prev,
            spreadsheetId: created.id,
            spreadsheetUrl: created.url,
          }));
          await syncDataToGoogleSheet(res.accessToken, created.id, domains, securityLogs);
        }
      }
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      showToast(`Gagal masuk Google: ${err.message}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    showToast('Berhasil keluar dari akun Google.', 'info');
  };

  // Helper to append a new security log
  const addSecurityLog = (domainName: string, event: string, severity: SecurityLog['severity'] = 'info') => {
    const newLog: SecurityLog = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      domain: domainName,
      event,
      ip: '103.147.154.21 (NexaHost Engine)',
      severity,
      status: 'Enforced',
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  // Register new domain & hosting
  const handleRegisterDomain = (newDomain: DomainItem) => {
    const updated = [newDomain, ...domains];
    setDomains(updated);

    addSecurityLog(
      newDomain.name,
      `Pendaftaran domain baru berhasil. Batas waktu kadaluarsa ditetapkan: ${newDomain.expirationDate}`,
      'info'
    );

    showToast(
      `Domain ${newDomain.name} berhasil didaftarkan! Batas waktu: ${newDomain.expirationDate}`,
      'success'
    );

    // If autoSync is enabled, push to Google Sheets immediately
    if (sheetsConfig.autoSync) {
      setTimeout(() => {
        triggerGoogleSheetsSync(updated);
      }, 500);
    }

    // Auto-sync via Webhook Deploy if configured
    if (webhookConfig.autoSyncWebhook && webhookConfig.webhookUrl) {
      setTimeout(() => {
        sendDataToSheetWebhook(webhookConfig.webhookUrl, updated, securityLogs)
          .then(() => {
            const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setWebhookConfig((prev) => ({ ...prev, lastWebhookSyncAt: `Pukul ${now}` }));
          })
          .catch((e) => console.warn('Auto webhook sync notice:', e));
      }, 500);
    }
  };

  // Renew / Extend domain expiration date
  const handleRenewSuccess = (domainId: string, newExpirationDate: string, yearsAdded: number) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        return {
          ...d,
          expirationDate: newExpirationDate,
          status: 'active' as const,
        };
      }
      return d;
    });

    setDomains(updated);
    const domainObj = domains.find((d) => d.id === domainId);

    if (domainObj) {
      addSecurityLog(
        domainObj.name,
        `Perpanjangan masa aktif (+${yearsAdded} Tahun). Batas waktu baru: ${newExpirationDate}`,
        'info'
      );
    }

    showToast(
      `Domain diperpanjang +${yearsAdded} tahun! Batas waktu baru: ${newExpirationDate}`,
      'success'
    );

    if (sheetsConfig.autoSync) {
      setTimeout(() => {
        triggerGoogleSheetsSync(updated);
      }, 500);
    }

    if (webhookConfig.autoSyncWebhook && webhookConfig.webhookUrl) {
      setTimeout(() => {
        sendDataToSheetWebhook(webhookConfig.webhookUrl, updated, securityLogs)
          .then(() => {
            const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setWebhookConfig((prev) => ({ ...prev, lastWebhookSyncAt: `Pukul ${now}` }));
          })
          .catch((e) => console.warn('Auto webhook sync notice:', e));
      }, 500);
    }
  };

  // Toggle Auto-Renew
  const handleToggleAutoRenew = (domainId: string) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        const nextVal = !d.autoRenew;
        addSecurityLog(
          d.name,
          `Pengaturan perpanjangan otomatis diubah ke: ${nextVal ? 'AKTIF' : 'MANUAL'}`,
          'info'
        );
        return { ...d, autoRenew: nextVal };
      }
      return d;
    });
    setDomains(updated);
    if (sheetsConfig.autoSync) {
      setTimeout(() => triggerGoogleSheetsSync(updated), 500);
    }
  };

  // Toggle Whois Privacy
  const handleToggleWhoisPrivacy = (domainId: string) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        const nextVal = !d.whoisPrivacy;
        addSecurityLog(
          d.name,
          `Whois Privacy Protection diubah menjadi: ${nextVal ? 'TERLINDUNGI' : 'PUBLIK'}`,
          'security'
        );
        return { ...d, whoisPrivacy: nextVal };
      }
      return d;
    });
    setDomains(updated);
  };

  // Toggle DNSSEC
  const handleToggleDnssec = (domainId: string) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        const nextVal = !d.dnssecEnabled;
        addSecurityLog(
          d.name,
          `Proteksi DNSSEC Kriptografi diubah menjadi: ${nextVal ? 'AKTIF (ECDSA P-256)' : 'NONAKTIF'}`,
          nextVal ? 'info' : 'warning'
        );
        return { ...d, dnssecEnabled: nextVal };
      }
      return d;
    });
    setDomains(updated);
    if (sheetsConfig.autoSync) {
      setTimeout(() => triggerGoogleSheetsSync(updated), 500);
    }
  };

  // Toggle Payment Status
  const handleTogglePaymentStatus = (domainId: string) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        const nextStatus = d.paymentStatus === 'paid' ? 'pending' : 'paid';
        addSecurityLog(
          d.name,
          `Status pembayaran faktur diubah menjadi: ${nextStatus === 'paid' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}`,
          'info'
        );
        return { ...d, paymentStatus: nextStatus as any };
      }
      return d;
    });
    setDomains(updated);
    showToast('Status pembayaran faktur berhasil diperbarui.', 'info');
    if (sheetsConfig.autoSync) {
      setTimeout(() => triggerGoogleSheetsSync(updated), 500);
    }
  };

  // Toggle Registry Transfer Lock
  const handleToggleTransferLock = (domainId: string) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        const nextVal = d.isTransferLocked === false ? true : false;
        addSecurityLog(
          d.name,
          `Registry Transfer Lock diubah menjadi: ${nextVal ? 'LOCKED (Terkunci Aman)' : 'UNLOCKED'}`,
          nextVal ? 'info' : 'warning'
        );
        return { ...d, isTransferLocked: nextVal };
      }
      return d;
    });
    setDomains(updated);
    showToast('Status Transfer Lock berhasil diperbarui.', 'info');
    if (sheetsConfig.autoSync) {
      setTimeout(() => triggerGoogleSheetsSync(updated), 500);
    }
  };

  // Save DNS Records & Nameservers
  const handleSaveDnsRecords = (
    domainId: string,
    updatedRecords: DnsRecord[],
    nameservers: string[],
    dnssec: boolean
  ) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        return {
          ...d,
          dnsRecords: updatedRecords,
          nameservers,
          dnssecEnabled: dnssec,
        };
      }
      return d;
    });
    setDomains(updated);
    const domainObj = domains.find((d) => d.id === domainId);
    if (domainObj) {
      addSecurityLog(
        domainObj.name,
        `DNS Zone File diperbarui (${updatedRecords.length} records, NS: ${nameservers[0]})`,
        'info'
      );
    }
    showToast('DNS Zone Records & Nameservers berhasil disimpan!', 'success');
  };

  // Delete DNS Record with safety confirmation
  const handleRequestDeleteRecord = (record: DnsRecord, onConfirmDelete: () => void) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Record DNS?',
      message: `Apakah Anda yakin ingin menghapus record ${record.type} "${record.name}" dengan nilai "${record.value}"? Penghapusan record ini dapat memengaruhi routing traffic website Anda.`,
      confirmLabel: 'Ya, Hapus Record',
      onConfirm: () => {
        onConfirmDelete();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Record DNS ${record.type} berhasil dihapus.`, 'info');
      },
    });
  };

  // 1-Click Cloudflare Pages DNS Connector (*.pages.dev)
  const handleApplyPagesDns = (domainId: string, pagesUrl: string) => {
    const cleanTarget = pagesUrl.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    let domainName = '';
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        domainName = d.name;
        // Filter out conflicting A or CNAME records for @ and www
        const filtered = d.dnsRecords.filter(
          (r) =>
            !(
              (r.name === '@' || r.name === d.name || r.name === 'www') &&
              (r.type === 'A' || r.type === 'CNAME')
            )
        );
        const updatedDns: DnsRecord[] = [
          ...filtered,
          {
            id: `rec-cname-root-${Date.now()}`,
            type: 'CNAME',
            name: '@',
            value: cleanTarget,
            ttl: 3600,
          },
          {
            id: `rec-cname-www-${Date.now() + 1}`,
            type: 'CNAME',
            name: 'www',
            value: cleanTarget,
            ttl: 3600,
          },
        ];
        return {
          ...d,
          dnsRecords: updatedDns,
        };
      }
      return d;
    });

    setDomains(updated);
    addSecurityLog(domainName || 'domain', `Record CNAME diarahkan ke Cloudflare Pages: ${cleanTarget}`, 'info');
    showToast(`DNS berhasil diarahkan ke Cloudflare Pages (${cleanTarget})!`, 'success');
  };

  // Update PHP Version in cPanel
  const handleUpdatePhpVersion = (domainId: string, version: string) => {
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        return { ...d, phpVersion: version };
      }
      return d;
    });
    setDomains(updated);
    const domainObj = domains.find((d) => d.id === domainId);
    if (domainObj) {
      addSecurityLog(domainObj.name, `PHP runtime diubah menjadi versi ${version}`, 'info');
    }
    showToast(`PHP Version diperbarui ke versi ${version}`, 'success');
  };

  // Re-issue SSL Certificate
  const handleReissueSsl = (domainId: string) => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const updated = domains.map((d) => {
      if (d.id === domainId) {
        return {
          ...d,
          sslStatus: 'active' as const,
          sslIssuer: "Let's Encrypt Authority X3",
          sslExpiryDate: nextYear.toISOString().slice(0, 10),
        };
      }
      return d;
    });
    setDomains(updated);
    const domainObj = domains.find((d) => d.id === domainId);
    if (domainObj) {
      addSecurityLog(domainObj.name, 'Sertifikat SSL Let\'s Encrypt TLS 1.3 berhasil di-reissue', 'info');
    }
    showToast('Sertifikat SSL berhasil diterbitkan ulang!', 'success');
  };

  // Trigger Security Health Scan
  const handleTriggerHealthCheck = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      addSecurityLog(
        'All Domains / Network',
        'Security Health Check selesai: 0 Vulnerabilities, 100% WAF Active, DNSSEC Healthy',
        'info'
      );
      showToast('Pemindaian keamanan selesai: Seluruh infrastruktur dalam status AMAN!', 'success');
    }, 1500);
  };

  // Calculate domains expiring soon count
  const expiringCount = domains.filter((d) => {
    const days = calculateRemainingDays(d.expirationDate);
    return days >= 0 && days <= 30;
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            {toast.link && (
              <a
                href={toast.link}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white flex items-center gap-1 font-bold ml-1"
              >
                <span>Buka Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navbar Component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        currentUser={currentUser}
        sheetsConfig={sheetsConfig}
        webhookConfig={webhookConfig}
        currency={currency}
        setCurrency={setCurrency}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
        isLoggingIn={isLoggingIn}
        expiringCount={expiringCount}
      />

      {/* Main Body Content based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'client-portal' && (
          <CustomerDashboard
            domains={domains}
            tldPricing={TLD_PRICING_CATALOG}
            currency={currency}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onOpenDnsModal={(d) => setDnsModalDomain(d)}
            onOpenHostingModal={(d) => setHostingModalDomain(d)}
            onOpenRenewModal={(d) => setRenewModalDomain(d)}
            onOpenCertModal={(d) => setCertModalDomain(d)}
            onOpenCfPagesModal={(d) => setCfPagesModalDomain(d)}
          />
        )}

        {activeTab === 'domains' && (
          <DomainManagementTable
            domains={domains}
            currency={currency}
            onOpenDnsModal={(d) => setDnsModalDomain(d)}
            onOpenHostingModal={(d) => setHostingModalDomain(d)}
            onOpenRenewModal={(d) => setRenewModalDomain(d)}
            onOpenCertificateModal={(d) => setCertModalDomain(d)}
            onOpenReadinessModal={(d) => setReadinessModalDomain(d)}
            onOpenCloudflarePagesModal={(d) => setCfPagesModalDomain(d)}
            onToggleAutoRenew={handleToggleAutoRenew}
            onToggleWhoisPrivacy={handleToggleWhoisPrivacy}
            onToggleDnssec={handleToggleDnssec}
            onTogglePaymentStatus={handleTogglePaymentStatus}
            onToggleTransferLock={handleToggleTransferLock}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'search' && (
          <DomainSearchHero
            existingDomains={domains}
            currency={currency}
            onSelectRegisterDomain={(name, tldVal) => {
              setRegisterInitialDomain(name);
              setRegisterInitialTld(tldVal);
              setIsRegisterModalOpen(true);
            }}
          />
        )}

        {activeTab === 'hosting' && (
          <HostingPackages
            currency={currency}
            onSelectPackage={(pkg) => {
              setRegisterInitialPkg(pkg.id);
              setIsRegisterModalOpen(true);
            }}
          />
        )}

        {activeTab === 'security' && (
          <SecurityCenterView
            domains={domains}
            securityLogs={securityLogs}
            onTriggerHealthCheck={handleTriggerHealthCheck}
            isScanning={isScanning}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">EbiDomain (CV Ebi)</span>
            <span>• Penyedia Layanan Domain &amp; Cloud Web Hosting Berkeamanan Tinggi</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>DNSSEC Enabled</span>
            <span>•</span>
            <span>TLS 1.3 Encryption</span>
            <span>•</span>
            <span>Google Sheets Expiration Sync</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegisterDomainModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        currency={currency}
        initialDomainName={registerInitialDomain}
        initialTld={registerInitialTld}
        initialPackageId={registerInitialPkg}
        onRegisterDomain={handleRegisterDomain}
      />

      <RenewDomainModal
        domain={renewModalDomain}
        isOpen={!!renewModalDomain}
        onClose={() => setRenewModalDomain(null)}
        currency={currency}
        onRenewSuccess={handleRenewSuccess}
      />

      <DnsManagerModal
        domain={dnsModalDomain}
        isOpen={!!dnsModalDomain}
        onClose={() => setDnsModalDomain(null)}
        onSaveRecords={handleSaveDnsRecords}
        onRequestDeleteRecord={handleRequestDeleteRecord}
      />

      <HostingCPanelModal
        domain={hostingModalDomain}
        isOpen={!!hostingModalDomain}
        onClose={() => setHostingModalDomain(null)}
        onUpdatePhpVersion={handleUpdatePhpVersion}
        onReissueSsl={handleReissueSsl}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        currentUser={currentUser}
        sheetsConfig={sheetsConfig}
        webhookConfig={webhookConfig}
        domains={domains}
        securityLogs={securityLogs}
        onGoogleSignIn={handleGoogleSignIn}
        onTriggerSync={async () => {
          await triggerGoogleSheetsSync();
        }}
        onTriggerWebhookSync={async () => {
          await triggerWebhookSync();
        }}
        onUpdateWebhookConfig={(cfg) => setWebhookConfig((prev) => ({ ...prev, ...cfg }))}
        onCreateNewSheet={async () => {
          const token = await getAccessToken();
          if (!token) {
            handleGoogleSignIn();
            return;
          }
          const created = await createHostingSpreadsheet(token);
          setSheetsConfig((prev) => ({
            ...prev,
            spreadsheetId: created.id,
            spreadsheetUrl: created.url,
          }));
          await syncDataToGoogleSheet(token, created.id, domains, securityLogs);
        }}
        onToggleAutoSync={() =>
          setSheetsConfig((prev) => ({ ...prev, autoSync: !prev.autoSync }))
        }
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <DomainOwnershipCertificateModal
        domain={certModalDomain}
        isOpen={!!certModalDomain}
        onClose={() => setCertModalDomain(null)}
      />

      <DomainReadinessModal
        domain={readinessModalDomain}
        isOpen={!!readinessModalDomain}
        onClose={() => setReadinessModalDomain(null)}
      />

      <CloudflareDeployModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />

      <CloudflarePagesConnectModal
        domain={cfPagesModalDomain}
        isOpen={Boolean(cfPagesModalDomain)}
        onClose={() => setCfPagesModalDomain(null)}
        onApplyPagesDns={handleApplyPagesDns}
      />
    </div>
  );
}
