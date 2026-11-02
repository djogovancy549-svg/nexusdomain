import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { DomainSearchHero } from './components/DomainSearchHero';
import { HostingPackages } from './components/HostingPackages';
import { DomainManagementTable } from './components/DomainManagementTable';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminAuthModal, SUPER_ADMIN_EMAIL } from './components/AdminAuthModal';
import { PaymentInvoiceModal, ADMIN_PHONE, ADMIN_EMAIL } from './components/PaymentInvoiceModal';
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
import { RightClickSecurityModal } from './components/RightClickSecurityModal';
import { TermsBanner } from './components/TermsBanner';
import { AdBanner } from './components/AdBanner';
import { HostingerComparison } from './components/HostingerComparison';

import {
  DomainItem,
  SecurityLog,
  GoogleSheetsConfig,
  DnsRecord,
  HostingPackage,
  PaymentConfirmation,
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
const LOCAL_STORAGE_CONFIRMATIONS = 'nexahost_confirmations_v1';

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

  // Payment Confirmations State
  const [paymentConfirmations, setPaymentConfirmations] = useState<PaymentConfirmation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONFIRMATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read paymentConfirmations:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONFIRMATIONS, JSON.stringify(paymentConfirmations));
    } catch (e) {
      console.warn('Failed to save paymentConfirmations:', e);
    }
  }, [paymentConfirmations]);

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
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [dnsModalDomain, setDnsModalDomain] = useState<DomainItem | null>(null);
  const [hostingModalDomain, setHostingModalDomain] = useState<DomainItem | null>(null);
  const [renewModalDomain, setRenewModalDomain] = useState<DomainItem | null>(null);
  const [certModalDomain, setCertModalDomain] = useState<DomainItem | null>(null);
  const [readinessModalDomain, setReadinessModalDomain] = useState<DomainItem | null>(null);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [cfPagesModalDomain, setCfPagesModalDomain] = useState<DomainItem | null>(null);
  const [invoiceModalDomain, setInvoiceModalDomain] = useState<DomainItem | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Strictly enforce Admin view only if authenticated via Super Admin PIN or Super Admin Google Account
  useEffect(() => {
    if (isAdminView && !isAdminAuthenticated && currentUser?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      setIsAdminView(false);
      setActiveTab('client-portal');
    }
  }, [currentUser, isAdminView, isAdminAuthenticated]);

  // Right-click & DevTools Security Protection State
  const [isRightClickSecurityOpen, setIsRightClickSecurityOpen] = useState(false);
  const [securityModalReason, setSecurityModalReason] = useState<string>(
    'Klik kanan & inspeksi elemen dinonaktifkan demi perlindungan hak cipta data pelanggan, struktur DNS, dan transaksi NageDomain.'
  );

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityModalReason(
        'Klik kanan dinonaktifkan demi keamanan transaksi, perlindungan struktur DNS, dan hak cipta data pelanggan NageDomain.'
      );
      setIsRightClickSecurityOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        setSecurityModalReason(
          'Akses DevTools dan Inspect Element dibatasi oleh AI Security Shield NageDomain demi keamanan portal.'
        );
        setIsRightClickSecurityOpen(true);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  // Safe Confirmation Modal state
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
      ip: '103.147.154.21 (NageDomain Engine)',
      severity,
      status: 'Enforced',
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  // Customer Payment Confirmation Submission
  const handleSubmitPaymentConfirmation = (confirmation: Omit<PaymentConfirmation, 'id' | 'status' | 'submittedAt'>) => {
    const newConf: PaymentConfirmation = {
      ...confirmation,
      id: `CONF-${Date.now().toString().slice(-6)}`,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setPaymentConfirmations((prev) => [newConf, ...prev]);
    addSecurityLog(
      confirmation.domainName,
      `Form konfirmasi pembayaran diterima dari ${confirmation.senderName} (${confirmation.senderBank} Rp ${confirmation.amountIDR.toLocaleString('id-ID')}). Menunggu verifikasi admin.`,
      'info'
    );
  };

  // Super Admin Verifies Payment Confirmation
  const handleVerifyPaymentConfirmation = (confirmationId: string, domainId: string) => {
    // 1. Mark domain status as paid
    const updatedDomains = domains.map((d) => {
      if (d.id === domainId) {
        return { ...d, paymentStatus: 'paid' as const };
      }
      return d;
    });
    setDomains(updatedDomains);

    // 2. Mark confirmation as verified
    const updatedConfs = paymentConfirmations.map((c) => {
      if (c.id === confirmationId) {
        return { ...c, status: 'verified' as const };
      }
      return c;
    });
    setPaymentConfirmations(updatedConfs);

    const confObj = paymentConfirmations.find((c) => c.id === confirmationId);
    if (confObj) {
      addSecurityLog(
        confObj.domainName,
        `Pembayaran Rp ${confObj.amountIDR.toLocaleString('id-ID')} dari ${confObj.senderName} TELAH DIVERIFIKASI LUNAS OLEH ADMIN.`,
        'info'
      );
    }

    showToast('Pembayaran berhasil diverifikasi! Status domain kini LUNAS.', 'success');

    if (sheetsConfig.autoSync) {
      setTimeout(() => triggerGoogleSheetsSync(updatedDomains), 500);
    }
  };

  // Super Admin Rejects Payment Confirmation
  const handleRejectPaymentConfirmation = (confirmationId: string) => {
    const updatedConfs = paymentConfirmations.map((c) => {
      if (c.id === confirmationId) {
        return { ...c, status: 'rejected' as const };
      }
      return c;
    });
    setPaymentConfirmations(updatedConfs);
    showToast('Konfirmasi pembayaran ditolak.', 'info');
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

    if (!isAdminView) {
      setInvoiceModalDomain(newDomain);
    }

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
        onOpenAdminAuthModal={() => setIsAdminAuthModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdminAuthenticated(false);
          setIsAdminView(false);
          setActiveTab('client-portal');
          showToast('Anda telah keluar dari Mode Admin', 'info');
        }}
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'client-portal' && (
          <div className="space-y-8">
            <CustomerDashboard
              domains={domains}
              currentUser={currentUser}
              tldPricing={TLD_PRICING_CATALOG}
              currency={currency}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onOpenDnsModal={(d) => setDnsModalDomain(d)}
              onOpenHostingModal={(d) => setHostingModalDomain(d)}
              onOpenRenewModal={(d) => setRenewModalDomain(d)}
              onOpenCertModal={(d) => setCertModalDomain(d)}
              onOpenCfPagesModal={(d) => setCfPagesModalDomain(d)}
              onOpenInvoiceModal={(d) => setInvoiceModalDomain(d)}
            />
            
            {/* Promo Advertising Banner */}
            <AdBanner
              onRegisterClick={(tld) => {
                setRegisterInitialTld(tld);
                setIsRegisterModalOpen(true);
              }}
            />

            {/* Superiority & Hostinger Comparison Section */}
            <HostingerComparison />
          </div>
        )}

        {activeTab === 'domains' && (
          <DomainManagementTable
            domains={domains}
            currency={currency}
            isAdminView={isAdminView}
            paymentConfirmations={paymentConfirmations}
            onVerifyConfirmation={handleVerifyPaymentConfirmation}
            onRejectConfirmation={handleRejectPaymentConfirmation}
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
          <div className="space-y-8">
            <DomainSearchHero
              existingDomains={domains}
              currency={currency}
              onSelectRegisterDomain={(name, tldVal) => {
                setRegisterInitialDomain(name);
                setRegisterInitialTld(tldVal);
                setIsRegisterModalOpen(true);
              }}
              onSecurityAlert={(reason) => {
                setSecurityModalReason(reason);
                setIsRightClickSecurityOpen(true);
              }}
            />

            <AdBanner
              onRegisterClick={(tld) => {
                setRegisterInitialTld(tld);
                setIsRegisterModalOpen(true);
              }}
            />

            <HostingerComparison />
          </div>
        )}

        {activeTab === 'hosting' && (
          <div className="space-y-8">
            <HostingPackages
              currency={currency}
              onSelectPackage={(pkg) => {
                setRegisterInitialPkg(pkg.id);
                setIsRegisterModalOpen(true);
              }}
            />

            <AdBanner
              onRegisterClick={(tld) => {
                setRegisterInitialTld(tld);
                setIsRegisterModalOpen(true);
              }}
            />

            <HostingerComparison />
          </div>
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
            <span className="font-extrabold text-white">NageDomain</span>
            <span>• Penyedia Layanan Domain &amp; Cloud Web Hosting Berkeamanan Tinggi</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kontak HP: {ADMIN_PHONE}</span>
            <span>•</span>
            <a
              href={`mailto:${ADMIN_EMAIL}?subject=Tanya%20Admin%20NageDomain`}
              className="hover:text-indigo-300 transition cursor-pointer font-semibold text-slate-300"
            >
              Hubungi Email Admin
            </a>
            <span>•</span>
            <span>DNSSEC &amp; TLS 1.3</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminView(true);
          setActiveTab('domains');
          showToast('Mode Admin Aktif! Pengelolaan Status Lunas, DNS & Database Terbuka.', 'success');
        }}
      />

      <RegisterDomainModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        currency={currency}
        initialDomainName={registerInitialDomain}
        initialTld={registerInitialTld}
        initialPackageId={registerInitialPkg}
        isAdminView={isAdminView}
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

      <PaymentInvoiceModal
        domain={invoiceModalDomain}
        isOpen={Boolean(invoiceModalDomain)}
        onClose={() => setInvoiceModalDomain(null)}
        currency={currency}
        showToast={showToast}
        onSubmitConfirmation={handleSubmitPaymentConfirmation}
      />

      {/* Right-Click & DevTools Anti-Exploit Security Modal */}
      <RightClickSecurityModal
        isOpen={isRightClickSecurityOpen}
        onClose={() => setIsRightClickSecurityOpen(false)}
        reason={securityModalReason}
      />

      {/* Terms & Conditions Sticky Consent Banner */}
      <TermsBanner />
    </div>
  );
}
