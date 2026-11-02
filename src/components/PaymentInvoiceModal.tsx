import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  MessageSquare,
  X,
  ShieldCheck,
  Mail,
  Phone,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { DomainItem, PaymentConfirmation } from '../types';

interface PaymentInvoiceModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  currency: 'IDR' | 'USD';
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSubmitConfirmation?: (confirmation: Omit<PaymentConfirmation, 'id' | 'status' | 'submittedAt'>) => void;
}

export const ADMIN_PHONE = '082237510129';
export const ADMIN_PHONE_WA = '6282237510129';
export const ADMIN_EMAIL = 'djogovancy549@gmail.com';

export const PaymentInvoiceModal: React.FC<PaymentInvoiceModalProps> = ({
  domain,
  isOpen,
  onClose,
  currency,
  showToast,
  onSubmitConfirmation,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'web-form'>('info');

  // Form states for web admin submission
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderBank, setSenderBank] = useState('BRI');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // WhatsApp confirmation
  const handleSendWhatsappConfirmation = () => {
    const text = encodeURIComponent(
      `Halo Admin CV EBI (${ADMIN_PHONE}),\n\nSaya telah melakukan pembayaran transfer bank untuk pesanan domain:\n🌐 *Domain*: ${domain.name}\n📄 *No. Faktur*: ${domain.invoiceNumber}\n💰 *Total*: Rp ${(domain.salePriceIDR || 149000).toLocaleString('id-ID')}\n\n💳 *Rekening Tujuan*: BRI ${bankAccount.accountNumber} a.n. ${bankAccount.accountHolder}\n👤 *Nama Pemesan*: ${domain.clientName} (${domain.clientEmail})\n\nBerikut bukti transfer pembayaran saya. Mohon verifikasi dan aktifkan domain. Terima kasih!`
    );
    window.open(`https://wa.me/${ADMIN_PHONE_WA}?text=${text}`, '_blank');
  };

  // Email confirmation
  const handleSendEmailConfirmation = () => {
    const subject = encodeURIComponent(`[KONFIRMASI PEMBAYARAN] Domain ${domain.name} - ${domain.invoiceNumber}`);
    const body = encodeURIComponent(
      `Halo Admin CV EBI,\n\nSaya telah melakukan transfer ke rekening Bank BRI:\n\n` +
      `• Domain: ${domain.name}\n` +
      `• No Faktur: ${domain.invoiceNumber}\n` +
      `• Jumlah Transfer: Rp ${(domain.salePriceIDR || 149000).toLocaleString('id-ID')}\n` +
      `• Nama Pemesan: ${domain.clientName}\n` +
      `• Email Pemesan: ${domain.clientEmail}\n\n` +
      `Mohon segera memverifikasi dan mengubah status domain menjadi LUNAS.\n\nTerima kasih!`
    );
    window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  };

  // Web Admin Form Submission
  const handleSubmitWebForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      if (showToast) showToast('Masukkan nama pengirim transfer!', 'error');
      return;
    }

    if (onSubmitConfirmation) {
      onSubmitConfirmation({
        domainId: domain.id,
        domainName: domain.name,
        invoiceNumber: domain.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        amountIDR: domain.salePriceIDR || 149000,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim() || ADMIN_PHONE,
        senderBank: senderBank.trim() || 'Bank BRI',
        transferDate,
        notes: notes.trim(),
      });
    }

    setIsSubmitted(true);
    if (showToast) {
      showToast('Konfirmasi berhasil dikirim ke Web Admin Portal! Admin akan memverifikasi status pembayaran Anda.', 'success');
    }
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

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rincian Tagihan &amp; BRI
            </button>
            <button
              onClick={() => setActiveTab('web-form')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'web-form'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-indigo-300" />
              <span>Konfirmasi Langsung Web Admin</span>
            </button>
          </div>

          {activeTab === 'info' ? (
            <>
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

              {/* Admin Contact Information Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 block font-bold">Kontak Layanan Pelanggan &amp; Admin:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">HP / WhatsApp Admin</span>
                      <span className="text-emerald-300 font-bold">{ADMIN_PHONE}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Email Resmi Admin</span>
                      <span className="text-indigo-300 font-bold truncate block">{ADMIN_EMAIL}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Action Buttons (WA & Email) */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleSendWhatsappConfirmation}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Kirim via WA ({ADMIN_PHONE})</span>
                  </button>

                  <button
                    onClick={handleSendEmailConfirmation}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>Kirim via Email Admin</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('web-form')}
                  className="w-full py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-indigo-400" />
                  <span>Kirim Formulir Konfirmasi Langsung di Web Admin</span>
                </button>
              </div>
            </>
          ) : (
            /* Direct Web Admin Form */
            <div className="space-y-4">
              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">Konfirmasi Berhasil Dikirim!</h4>
                  <p className="text-xs text-emerald-200 leading-relaxed max-w-sm mx-auto">
                    Data pembayaran Anda telah masuk ke dashboard Web Admin. Admin (<strong>{ADMIN_EMAIL}</strong>) akan memverifikasi dan mengubah status domain <strong>{domain.name}</strong> menjadi LUNAS.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Kirim Konfirmasi Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitWebForm} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block">Domain &amp; Tagihan</span>
                      <strong className="text-amber-400 font-mono text-sm">{domain.name}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Jumlah Transfer</span>
                      <strong className="text-white font-mono text-sm">Rp {(domain.salePriceIDR || 149000).toLocaleString('id-ID')}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pengirim Transfer *</label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">No. Handphone / WA *</label>
                      <input
                        type="text"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="Contoh: 082237510129"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Pengirim</label>
                      <input
                        type="text"
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        placeholder="Contoh: Bank BRI / BCA / Mandiri"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Transfer</label>
                      <input
                        type="date"
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan / Ref Pembayaran (Opsional)</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan seperti nomor referensi struk atau pesan untuk admin..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Formulir ke Portal Admin</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
