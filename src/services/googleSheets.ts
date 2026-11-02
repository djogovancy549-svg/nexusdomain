import { DomainItem, SecurityLog } from '../types';

export const SHEET_TITLE_PREFIX = 'NageDomain - Database Hosting & Domain (Batas Waktu)';

/**
 * Calculate remaining days until expiration date
 */
export const calculateRemainingDays = (expirationDateStr: string): number => {
  const expiry = new Date(expirationDateStr);
  const now = new Date();
  // Reset time part to midnight for clean day calculation
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get human readable status label in Indonesian
 */
export const getExpirationStatusLabel = (expirationDateStr: string): {
  status: 'active' | 'expiring_soon' | 'expired';
  label: string;
  colorClass: string;
} => {
  const days = calculateRemainingDays(expirationDateStr);
  if (days < 0) {
    return {
      status: 'expired',
      label: `Kadaluarsa (${Math.abs(days)} hari lalu)`,
      colorClass: 'text-red-400 bg-red-500/10 border-red-500/20',
    };
  }
  if (days <= 30) {
    return {
      status: 'expiring_soon',
      label: `Segera Berakhir (${days} hari lagi)`,
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
  }
  return {
    status: 'active',
    label: `Aktif (${days} hari)`,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
};

/**
 * Search Google Drive for existing NageDomain spreadsheet to prevent duplicates
 */
export const searchExistingSpreadsheet = async (accessToken: string): Promise<{ id: string; name: string; url: string } | null> => {
  try {
    const q = encodeURIComponent("name contains 'NageDomain' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=5`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.warn('Drive search failed:', await res.text());
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      return {
        id: file.id,
        name: file.name,
        url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
      };
    }
    return null;
  } catch (err) {
    console.error('Error finding spreadsheet in Drive:', err);
    return null;
  }
};

/**
 * Create a brand new Google Spreadsheet formatted with 2 tabs for hosting & domain management
 */
export const createHostingSpreadsheet = async (
  accessToken: string,
  title: string = SHEET_TITLE_PREFIX
): Promise<{ id: string; url: string }> => {
  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Domains & Batas Waktu',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100,
            columnCount: 21,
          },
        },
      },
      {
        properties: {
          title: 'Security & Audit Logs',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100,
            columnCount: 7,
          },
        },
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal membuat Google Sheet: ${errText}`);
  }

  const result = await res.json();
  const spreadsheetId = result.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { id: spreadsheetId, url };
};

/**
 * Push domains & security logs to Google Sheet with formatted rows
 */
export const syncDataToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  domains: DomainItem[],
  logs: SecurityLog[]
): Promise<boolean> => {
  const nowStr = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Headers and values for Sheet 1: Domains & Batas Waktu (Format Penjual / Registrar)
  const domainHeaders = [
    'ID Registrasi / Invoice',
    'Nama Domain',
    'Ekstensi (TLD)',
    'Nama Pembeli (Klien)',
    'Email Pembeli',
    'WhatsApp Pembeli',
    'Harga Jual (IDR)',
    'Status Pembayaran',
    'Paket Hosting',
    'Lokasi Server',
    'Tgl Registrasi',
    'Batas Waktu (Expired)',
    'Sisa Hari',
    'Status Masa Aktif',
    'Auto Renew',
    'Proteksi DNSSEC',
    'Status SSL',
    'Whois Privacy',
    'Transfer Lock (Anti-Theft)',
    'IP Server',
    'Terakhir Disinkronkan',
  ];

  const domainRows = domains.map((d) => {
    const remainingDays = calculateRemainingDays(d.expirationDate);
    const statusLabel =
      remainingDays < 0
        ? `KADALUARSA (${Math.abs(remainingDays)} hari lalu)`
        : remainingDays <= 30
        ? `SEGERA BERAKHIR (${remainingDays} hari)`
        : `AKTIF (${remainingDays} hari)`;

    return [
      d.invoiceNumber || d.id,
      d.name,
      d.tld,
      d.clientName,
      d.clientEmail,
      d.clientPhone || '-',
      d.salePriceIDR ? `Rp ${d.salePriceIDR.toLocaleString('id-ID')}` : 'Rp 149.000',
      d.paymentStatus === 'paid' ? 'LUNAS' : d.paymentStatus === 'pending' ? 'MENUNGGU PEMBAYARAN' : 'BELUM DIBAYAR',
      d.hostingPlan,
      d.serverLocation,
      d.registrationDate,
      d.expirationDate, // Batas Waktu
      remainingDays.toString(),
      statusLabel,
      d.autoRenew ? 'AKTIF (Auto)' : 'MANUAL',
      d.dnssecEnabled ? 'PROTECTED (DNSSEC ECDSA)' : 'NONAKTIF',
      d.sslStatus === 'active' ? `AKTIF (${d.sslIssuer})` : 'TIDAK AKTIF',
      d.whoisPrivacy ? 'TERLINDUNGI (Private)' : 'PUBLIK',
      d.isTransferLocked !== false ? 'LOCKED (Terkunci Aman)' : 'UNLOCKED',
      d.ipAddress,
      nowStr,
    ];
  });

  const domainSheetValues = [domainHeaders, ...domainRows];

  // Headers and values for Sheet 2: Security & Audit Logs
  const logHeaders = [
    'Log ID',
    'Timestamp',
    'Target Domain',
    'Aktivitas Keamanan',
    'IP Sumber',
    'Tingkat Severity',
    'Status Penanganan',
  ];

  const logRows = logs.map((l) => [
    l.id,
    l.timestamp,
    l.domain,
    l.event,
    l.ip,
    l.severity.toUpperCase(),
    l.status,
  ]);

  const logSheetValues = [logHeaders, ...logRows];

  // 1. Update Domains Tab
  const updateDomainsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Domains & Batas Waktu!A1:U${domainSheetValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: domainSheetValues,
      }),
    }
  );

  if (!updateDomainsRes.ok) {
    const errText = await updateDomainsRes.text();
    throw new Error(`Gagal memperbarui tab Domains: ${errText}`);
  }

  // 2. Update Security Logs Tab
  const updateLogsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Security & Audit Logs!A1:G${logSheetValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: logSheetValues,
      }),
    }
  );

  if (!updateLogsRes.ok) {
    const errText = await updateLogsRes.text();
    console.warn(`Catatan log keamanan belum berhasil diupdate: ${errText}`);
  }

  return true;
};

/**
 * Generate CSV for direct download backup
 */
export const exportDomainsToCSV = (domains: DomainItem[]): string => {
  const headers = [
    'ID Registrasi',
    'Nama Domain',
    'Ekstensi',
    'Klien',
    'Email',
    'Paket Hosting',
    'Tgl Registrasi',
    'Batas Waktu (Expired)',
    'Sisa Hari',
    'Status',
    'Auto Renew',
    'DNSSEC',
    'SSL',
  ];

  const rows = domains.map((d) => {
    const remainingDays = calculateRemainingDays(d.expirationDate);
    const status = remainingDays < 0 ? 'Kadaluarsa' : remainingDays <= 30 ? 'Segera Berakhir' : 'Aktif';
    return [
      `"${d.id}"`,
      `"${d.name}"`,
      `"${d.tld}"`,
      `"${d.clientName}"`,
      `"${d.clientEmail}"`,
      `"${d.hostingPlan}"`,
      `"${d.registrationDate}"`,
      `"${d.expirationDate}"`,
      `"${remainingDays}"`,
      `"${status}"`,
      `"${d.autoRenew ? 'Ya' : 'Tidak'}"`,
      `"${d.dnssecEnabled ? 'Aktif' : 'Nonaktif'}"`,
      `"${d.sslStatus}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
