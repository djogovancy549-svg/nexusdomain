import React, { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, ExternalLink, X } from 'lucide-react';

const LOCAL_STORAGE_TERMS_KEY = 'nexahost_terms_accepted_v1';

export const TermsBanner: React.FC = () => {
  const [isAccepted, setIsAccepted] = useState(true); // Default true until checked in useEffect
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TERMS_KEY);
      if (saved !== 'true') {
        setIsAccepted(false);
      }
    } catch (e) {
      setIsAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TERMS_KEY, 'true');
    } catch (e) {
      // Ignore storage errors
    }
    setIsAccepted(true);
  };

  return (
    <>
      {/* Sticky Bottom Terms Banner */}
      {!isAccepted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-700/80 backdrop-blur-lg shadow-2xl p-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shrink-0 mt-0.5 md:mt-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white flex items-center gap-2">
                  Syarat, Ketentuan &amp; Kebijakan Data NageDomain
                  <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono">
                    Official Policy 2026
                  </span>
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Dengan menggunakan platform ini, Anda menyetujui ketentuan pendaftaran domain, privasi data pelanggan, 
                  metode konfirmasi pembayaran bank BRI, dan sistem keamanan anti-exploit NageDomain.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Baca Selengkapnya
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none py-2 px-4 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Setuju &amp; Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syarat & Ketentuan Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-bold text-white">
                  Syarat &amp; Ketentuan Layanan NageDomain
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-semibold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-1.5">
                  1. Ketentuan Pendaftaran Domain &amp; Registrasi
                </h3>
                <p>
                  Seluruh domain yang didaftarkan melalui NageDomain (.id, .com, .net, .co.id, dll.) resmi terverifikasi dan berhak mendapatkan fasilitas 
                  Manajemen DNS, DNSSEC gratis, dan perlindungan privasi WHOIS tanpa biaya tersembunyi.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-1.5">
                  2. Metode Pembayaran &amp; Konfirmasi Portal Admin
                </h3>
                <p>
                  Setiap pemesanan domain/hosting wajib diselesaikan melalui transfer ke rekening resmi Bank BRI atas nama 
                  <strong className="text-amber-400 font-semibold"> Yanti Yesinta Nenu D.W Nggodji</strong>. 
                  Aktivasi DNS dan pengelolaan domain diproses segera setelah otentikasi konfirmasi dilakukan oleh Admin Portal.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-1.5">
                  3. Keamanan Data &amp; Privasi Pelanggan
                </h3>
                <p>
                  Database dan struktur data pelanggan dilindungi oleh firewall enkripsi NageDomain. Akses kunci backend (seperti Google Sheets master 
                  dan DNS Zone File) strictly tersimpan di sisi server Admin dan tidak diekspos ke publik demi keamanan infrastruktur domain.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-1.5">
                  4. Larangan Tindakan Hacking &amp; Injeksi Malware
                </h3>
                <p>
                  Dilarang keras melakukan manipulasi payload (SQL Injection, XSS, Script Ingestion, scraping unauthorized). 
                  Sistem keamanan NageDomain secara otomatis mencatat dan memblokir IP address yang mencoba melakukan exploitasi.
                </p>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Terakhir Diperbarui: Tahun 2026 — NageDomain &amp; Cloud System
              </span>
              <button
                onClick={() => {
                  handleAccept();
                  setIsModalOpen(false);
                }}
                className="py-2 px-5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition"
              >
                Saya Menyetujui Ketentuan Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
