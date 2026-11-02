import React from 'react';
import {
  CreditCard,
  Building2,
  UserCheck,
  CheckCircle2,
  Copy,
  MessageSquare,
  X,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { DomainItem } from '../types';

interface PaymentInvoiceModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  currency: 'IDR' | 'USD';
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PaymentInvoiceModal: React.FC<PaymentInvoiceModalProps> = ({
  domain,
  isOpen,
  onClose,
  currency,
  showToast,
}) => {
  if (!isOpen || !domain) return null;

  const bankAccount = {
    bankName: 'Bank BRI (Bank Rakyat Indonesia)',
    accountNumber: '4625-01-020206-53-7',
    accountHolder: 'Yanti Yesinta Nenu D.W Nggodji',
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (showToast) {
      showToast(`${label} berhasil disalin!`, 'success');
    }
  };

  const handleSendWhatsappConfirmation = () => {
    const text = encodeURIComponent(
      `Halo Admin CV EBI,\n\nSaya telah melakukan pembayaran transfer bank untuk pesanan domain:\n🌐 *Domain*: ${domain.name}\n📄 *No. Faktur*: ${domain.invoiceNumber}\n💰 *Total*: Rp ${(domain.salePriceIDR || 149000).toLocaleString('id-ID')}\n\n💳 *Rekening Tujuan*: BRI ${bankAccount.accountNumber} a.n. ${bankAccount.accountHolder}\n👤 *Nama Pemesan*: ${domain.clientName} (${domain.clientEmail})\n\nBerikut bukti transfer pembayaran saya. Mohon verifikasi dan aktifkan domain. Terima kasih!`
    );
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden my-auto">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">Faktur Pembayaran Domain</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Pending
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                No. Faktur: <strong className="text-slate-200">{domain.invoiceNumber}</strong>
              </p>
            </div>
          </div>

          {/* Domain & Amount Details */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Domain yang Dipesan</span>
              <span className="text-lg font-extrabold text-white font-mono">{domain.name}</span>
              <span className="text-[11px] text-indigo-400 block font-semibold">
                Paket: {domain.hostingPlan}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Tagihan</span>
              <div className="text-2xl font-black text-amber-400 font-mono">
                Rp {(domain.salePriceIDR || 149000).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Official Bank Account Information (BRI) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Instruksi Transfer Bank Resmi</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                VERIFIED ACCOUNT
              </span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Nama Bank</span>
                <span className="font-extrabold text-white">{bankAccount.bankName}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">Nomor Rekening BRI</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 font-mono text-sm tracking-wider">
                    {bankAccount.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(bankAccount.accountNumber, 'Nomor Rekening BRI')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Salin Nomor Rekening"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">Atas Nama (Rekening Resmi)</span>
                <span className="font-extrabold text-white text-right">
                  {bankAccount.accountHolder}
                </span>
              </div>
            </div>
          </div>

          {/* Managed Service Difference vs Hostinger */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Keunggulan Layanan Managed CV EBI (Berbeda dengan Hostinger)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Setelah pembayaran Anda dikonfirmasi, <strong>Tim Admin CV EBI akan membantu mengonfigurasi DNS, memasangkan sertifikat SSL, dan mengarahkan domain secara profesional</strong>. Website Anda terjamin aman tanpa risiko kesalahan pengaturan DNS mandiri.
            </p>
          </div>

          {/* Confirmation Action Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSendWhatsappConfirmation}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Konfirmasi Pembayaran via WhatsApp Admin</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Setelah dikonfirmasi, Admin (`djogovancy549@gmail.com`) akan mengaktifkan status domain menjadi <strong className="text-emerald-400">LUNAS</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
