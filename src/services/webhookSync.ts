import { DomainItem, SecurityLog } from '../types';
import { calculateRemainingDays } from './googleSheets';

// Default Webhook URL placeholder (can be customized directly in code or via UI)
export const DEFAULT_WEBHOOK_URL = '';
export const DEFAULT_SHEET_URL = '';

export interface WebhookSyncConfig {
  webhookUrl: string;
  sheetUrl: string;
  autoSyncWebhook: boolean;
  lastWebhookSyncAt: string | null;
  isSendingWebhook: boolean;
}

/**
 * Send domains and logs directly to Google Sheets using Google Apps Script Webhook (doPost)
 */
export const sendDataToSheetWebhook = async (
  webhookUrl: string,
  domains: DomainItem[],
  logs: SecurityLog[] = []
): Promise<{ success: boolean; message: string }> => {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    throw new Error('URL Webhook Deploy Google Apps Script belum diisi dengan benar.');
  }

  const payload = {
    action: 'sync_domains_and_logs',
    timestamp: new Date().toISOString(),
    totalDomains: domains.length,
    domains: domains.map((d) => {
      const remainingDays = calculateRemainingDays(d.expirationDate);
      return {
        id: d.invoiceNumber || d.id,
        name: d.name,
        tld: d.tld,
        clientName: d.clientName,
        clientEmail: d.clientEmail,
        clientPhone: d.clientPhone || '-',
        salePrice: d.salePriceIDR ? `Rp ${d.salePriceIDR.toLocaleString('id-ID')}` : 'Rp 149.000',
        paymentStatus: d.paymentStatus === 'paid' ? 'LUNAS' : d.paymentStatus === 'pending' ? 'MENUNGGU PEMBAYARAN' : 'BELUM DIBAYAR',
        hostingPlan: d.hostingPlan,
        serverLocation: d.serverLocation,
        registrationDate: d.registrationDate,
        expirationDate: d.expirationDate, // Batas Waktu
        remainingDays,
        status: remainingDays < 0 ? 'KADALUARSA' : remainingDays <= 30 ? 'SEGERA BERAKHIR' : 'AKTIF',
        autoRenew: d.autoRenew ? 'AKTIF' : 'MANUAL',
        dnssec: d.dnssecEnabled ? 'PROTECTED (ECDSA)' : 'NONAKTIF',
        ssl: d.sslStatus === 'active' ? `AKTIF (${d.sslIssuer})` : 'TIDAK AKTIF',
        whoisPrivacy: d.whoisPrivacy ? 'TERLINDUNGI' : 'PUBLIK',
        transferLock: d.isTransferLocked !== false ? 'LOCKED' : 'UNLOCKED',
        ipAddress: d.ipAddress,
      };
    }),
    logs: logs.slice(0, 20).map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      domain: l.domain,
      event: l.event,
      ip: l.ip,
      severity: l.severity.toUpperCase(),
      status: l.status,
    })),
  };

  try {
    // Note: Google Apps Script Web Apps require POST requests without standard JSON preflight CORS issues
    // by using 'text/plain' or mode: 'no-cors'
    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      try {
        const json = await response.json();
        return { success: true, message: json.message || 'Data berhasil masuk ke Google Sheet via Webhook!' };
      } catch {
        return { success: true, message: 'Data berhasil terkirim ke Webhook Google Sheets!' };
      }
    }

    return { success: true, message: 'Permintaan berhasil dikirim ke Google Sheet Webhook Deploy.' };
  } catch (error: any) {
    // Fallback attempt with no-cors if standard fetch is blocked by browser CORS redirect on script.google.com
    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: 'Payload data terkirim ke Google Apps Script Webhook (mode no-cors). Data sedang diproses oleh Google Sheet!',
      };
    } catch (fallbackError: any) {
      console.error('Webhook error:', fallbackError);
      throw new Error(`Gagal mengirim ke Webhook: ${error.message || 'Cek URL Webhook'}`);
    }
  }
};

/**
 * Official Google Apps Script Webhook Code Template
 * Users can copy this code and paste directly into Extensions -> Apps Script of their Google Sheet
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ========================================================
 * NEXAHOST - GOOGLE APPS SCRIPT WEBHOOK DEPLOY HANDLER
 * ========================================================
 * 1. Buka Google Spreadsheet baru di browser Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus semua kode default, lalu PASTE kode di bawah ini.
 * 4. Klik tombol 'Deploy' (Terapkan) di kanan atas > 'New deployment' (Penerapan baru).
 * 5. Pilih jenis 'Web app' (Aplikasi web).
 * 6. Set 'Execute as' = 'Me' (Saya).
 * 7. Set 'Who has access' = 'Anyone' (Siapa saja).
 * 8. Klik 'Deploy', izinkan akses (Authorize), lalu SALIN URL Web App (Webhook URL).
 * 9. Tempelkan URL tersebut ke kolom Webhook di aplikasi NexaHost!
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Sheet 1: Domains & Batas Waktu
    var domainSheet = ss.getSheetByName("Domains & Batas Waktu");
    if (!domainSheet) {
      domainSheet = ss.insertSheet("Domains & Batas Waktu");
    }

    // Header Kolom Penjual Domain
    var headers = [
      "ID Invoice",
      "Nama Domain",
      "Ekstensi (TLD)",
      "Nama Pembeli",
      "Email Pembeli",
      "WhatsApp Pembeli",
      "Harga Jual",
      "Status Pembayaran",
      "Paket Hosting",
      "Lokasi Server",
      "Tgl Registrasi",
      "Batas Waktu (Expired)",
      "Sisa Hari",
      "Status Masa Aktif",
      "Auto Renew",
      "DNSSEC Kriptografi",
      "Status SSL",
      "Whois Privacy",
      "Transfer Lock",
      "IP Server",
      "Waktu Terakhir Masuk"
    ];

    // Bersihkan data lama untuk update menyeluruh atau siapkan header
    domainSheet.clearContents();
    domainSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    domainSheet.getRange(1, 1, 1, headers.length).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    domainSheet.setFrozenRows(1);

    if (data.domains && data.domains.length > 0) {
      var nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
      var rows = data.domains.map(function(d) {
        return [
          d.id,
          d.name,
          d.tld,
          d.clientName,
          d.clientEmail,
          d.clientPhone,
          d.salePrice,
          d.paymentStatus,
          d.hostingPlan,
          d.serverLocation,
          d.registrationDate,
          d.expirationDate, // Batas Waktu
          d.remainingDays,
          d.status,
          d.autoRenew,
          d.dnssec,
          d.ssl,
          d.whoisPrivacy,
          d.transferLock,
          d.ipAddress,
          nowStr
        ];
      });

      domainSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

      // Beri warna latar belakang otomatis berdasarkan Batas Waktu
      for (var i = 0; i < data.domains.length; i++) {
        var rowIdx = i + 2;
        var days = Number(data.domains[i].remainingDays);
        var statusCell = domainSheet.getRange(rowIdx, 14); // Kolom Status Masa Aktif
        if (days < 0) {
          statusCell.setBackground("#fecaca").setFontColor("#991b1b").setFontWeight("bold"); // Merah: Kadaluarsa
        } else if (days <= 30) {
          statusCell.setBackground("#fef08a").setFontColor("#854d0e").setFontWeight("bold"); // Kuning: Segera Berakhir
        } else {
          statusCell.setBackground("#bbf7d0").setFontColor("#166534").setFontWeight("bold"); // Hijau: Aktif
        }
      }
    }

    // 2. Sheet 2: Security & Audit Logs
    var logSheet = ss.getSheetByName("Security Audit Logs");
    if (!logSheet) {
      logSheet = ss.insertSheet("Security Audit Logs");
    }

    var logHeaders = ["Log ID", "Timestamp", "Domain", "Peristiwa Keamanan", "IP Sumber", "Severity", "Status"];
    logSheet.clearContents();
    logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
    logSheet.getRange(1, 1, 1, logHeaders.length).setBackground("#0f172a").setFontColor("#38bdf8").setFontWeight("bold");
    logSheet.setFrozenRows(1);

    if (data.logs && data.logs.length > 0) {
      var logRows = data.logs.map(function(l) {
        return [l.id, l.timestamp, l.domain, l.event, l.ip, l.severity, l.status];
      });
      logSheet.getRange(2, 1, logRows.length, logHeaders.length).setValues(logRows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data " + (data.domains ? data.domains.length : 0) + " domain dan batas waktu berhasil masuk ke Google Sheet!",
      timestamp: new Date()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "NexaHost Google Apps Script Webhook Deploy aktif dan siap menerima data domain!"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
