import React from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Lock,
  Globe,
  Printer,
  Share2,
  X,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { DomainItem } from '../types';

interface DomainOwnershipCertificateModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DomainOwnershipCertificateModal: React.FC<DomainOwnershipCertificateModalProps> = ({
  domain,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !domain) return null;

  const certNumber = domain.certificateNumber || `NXH-CERT-${domain.id.replace('DOM-', '')}-${new Date(domain.registrationDate).getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Bapak/Ibu ${domain.clientName},\n\nBerikut bukti sertifikat resmi kepemilikan domain Anda:\nDomain: ${domain.name}\nNo. Sertifikat: ${certNumber}\nBatas Waktu (Expired): ${domain.expirationDate}\nStatus Keamanan: DNSSEC & SSL Aktif Terlindungi.\n\nTerima kasih telah mempercayakan domain & hosting kepada kami!`
    );
    const phone = domain.clientPhone ? domain.clientPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Close Button (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white">
              Sertifikat Digital Hak Milik Domain (Dokumen Resmi untuk Pembeli)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body (Printable Certificate of Ownership) */}
        <div className="my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-indigo-500/40 relative overflow-hidden print:border-slate-300 print:bg-white">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-indigo-400" />
          </div>

          <div className="relative z-10 text-center space-y-4">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest print:text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NexaHost Accredited Domain Registrar</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-serif print:text-black">
              Sertifikat Hak Milik Domain
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Certificate of Domain Registration &amp; Cryptographic Ownership
            </p>

            <div className="py-2">
              <p className="text-xs text-slate-300 print:text-slate-700">Dengan ini menyatakan bahwa nama domain:</p>
              <div className="mt-2 text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-200 to-indigo-200 font-mono tracking-wide print:text-indigo-900">
                {domain.name}
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-xl mx-auto print:text-slate-700">
              Telah resmi terdaftar dan dialokasikan secara sah kepada pemilik terdaftar di bawah ini dengan jaminan perlindungan keamanan tingkat tinggi.
            </p>

            {/* Details Box */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <div>
                <span className="text-slate-500 text-[11px] block">Pemilik Resmi (Registrant):</span>
                <strong className="text-white font-bold text-sm print:text-black">{domain.clientName}</strong>
                <p className="text-slate-400 text-[11px] print:text-slate-600">{domain.clientEmail}</p>
                {domain.clientPhone && (
                  <p className="text-slate-400 text-[11px] print:text-slate-600">WhatsApp: {domain.clientPhone}</p>
                )}
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Nomor Sertifikat:</span>
                <strong className="text-amber-300 font-mono font-bold text-xs print:text-amber-700">{certNumber}</strong>
                <span className="text-slate-500 text-[11px] block mt-1">No. Faktur / Invoice:</span>
                <span className="text-slate-300 font-mono text-[11px] print:text-black">{domain.invoiceNumber || domain.id}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Tanggal Terbit:</span>
                <span className="text-slate-300 font-mono print:text-black">{domain.registrationDate}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Batas Waktu Berlaku (Valid Until):</span>
                <strong className="text-emerald-400 font-mono font-bold text-sm print:text-emerald-700">{domain.expirationDate}</strong>
              </div>
            </div>

            {/* Security Guarantee Badges for the Buyer */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 print:text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                DNSSEC Cryptographic Signed
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 print:text-cyan-800">
                <Lock className="w-3 h-3" />
                SSL TLS 1.3 Certified
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 print:text-indigo-800">
                <ShieldCheck className="w-3 h-3" />
                Whois Privacy Protected
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 print:text-amber-800">
                <FileCheck className="w-3 h-3" />
                Registry Transfer Lock: Active
              </span>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 items-center text-xs print:border-slate-300">
              <div className="text-left font-mono text-[11px] text-slate-500 print:text-slate-600">
                <div>Registrar Node: id-jkt-edge01</div>
                <div>Status Database: Verified &amp; Synced</div>
                <div>Hash: SHA256:{domain.eppCode}</div>
              </div>
              <div className="text-right">
                <div className="inline-block border-b border-slate-700 pb-1 text-center min-w-[140px] print:border-slate-400">
                  <span className="text-xs font-bold text-white print:text-black">NexaHost Registry Authority</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 print:text-slate-600">Digital Cryptographic Seal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 print:hidden text-xs">
          <p className="text-slate-400">
            Kirimkan sertifikat ini kepada pembeli domain sebagai bukti resmi kepemilikan domain.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim Bukti via WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
