import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  ShieldCheck,
  X,
  Server,
  Save,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { DnsRecord, DomainItem } from '../types';

interface DnsManagerModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRecords: (domainId: string, updatedRecords: DnsRecord[], nameservers: string[], dnssec: boolean) => void;
  onRequestDeleteRecord: (record: DnsRecord, onConfirmDelete: () => void) => void;
}

export const DnsManagerModal: React.FC<DnsManagerModalProps> = ({
  domain,
  isOpen,
  onClose,
  onSaveRecords,
  onRequestDeleteRecord,
}) => {
  if (!isOpen || !domain) return null;

  const [records, setRecords] = useState<DnsRecord[]>(domain.dnsRecords);
  const [nameservers, setNameservers] = useState<string[]>(domain.nameservers);
  const [dnssecEnabled, setDnssecEnabled] = useState<boolean>(domain.dnssecEnabled);
  const [nsType, setNsType] = useState<'default' | 'custom'>(
    domain.nameservers.every((ns) => ns.includes('nexahost')) ? 'default' : 'custom'
  );

  // New record input state
  const [newType, setNewType] = useState<DnsRecord['type']>('A');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTtl, setNewTtl] = useState(3600);
  const [newPriority, setNewPriority] = useState<number | undefined>(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customNsInput, setCustomNsInput] = useState(domain.nameservers.join('\n'));

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newValue.trim()) return;

    const newRec: DnsRecord = {
      id: `rec-${Date.now()}`,
      type: newType,
      name: newName.trim(),
      value: newValue.trim(),
      ttl: Number(newTtl) || 3600,
      priority: newType === 'MX' ? Number(newPriority) || 10 : undefined,
    };

    setRecords([...records, newRec]);
    setNewName('');
    setNewValue('');
    setShowAddForm(false);
  };

  const handleDeleteRecord = (record: DnsRecord) => {
    onRequestDeleteRecord(record, () => {
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
    });
  };

  const handleSaveAll = () => {
    let finalNs = nameservers;
    if (nsType === 'default') {
      finalNs = ['ns1.nexahost.id', 'ns2.nexahost.id', 'ns3.nexahost.net'];
    } else {
      finalNs = customNsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    onSaveRecords(domain.id, records, finalNs, dnssecEnabled);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-mono">
                  DNS Zone Editor • {domain.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Anycast DNS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola A, CNAME, MX, TXT records dan proteksi kriptografi DNSSEC dengan propagasi global instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-6">
          {/* DNSSEC Section */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${
                dnssecEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">DNSSEC Security Protection</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    dnssecEnabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {dnssecEnabled ? 'PROTECTED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mencegah DNS Cache Poisoning dan Man-in-the-Middle (MitM) spoofing melalui tanda tangan digital ECDSA.
                </p>
                {dnssecEnabled && (
                  <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div>Key Tag: <span className="text-indigo-300 font-bold">23719</span> • Algorithm: <span className="text-cyan-300">13 (ECDSA P-256 with SHA-256)</span></div>
                    <div className="truncate text-slate-500 mt-0.5">Digest: E2D5C8F8A3B21094857201948ACDFE54...</div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setDnssecEnabled(!dnssecEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0 ${
                dnssecEnabled
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
              }`}
            >
              {dnssecEnabled ? 'Nonaktifkan DNSSEC' : 'Aktifkan DNSSEC (Gratis)'}
            </button>
          </div>

          {/* Nameservers Configuration */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Nameserver Konfigurasi</h4>
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setNsType('default')}
                  className={`px-3 py-1 rounded font-medium cursor-pointer ${
                    nsType === 'default' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  NexaHost Default NS
                </button>
                <button
                  type="button"
                  onClick={() => setNsType('custom')}
                  className={`px-3 py-1 rounded font-medium cursor-pointer ${
                    nsType === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Custom Nameserver
                </button>
              </div>
            </div>

            {nsType === 'default' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs text-indigo-300">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">ns1.nexahost.id</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">ns2.nexahost.id</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">ns3.nexahost.net</div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">
                  Masukkan nameserver eksternal (satu per baris):
                </label>
                <textarea
                  rows={3}
                  value={customNsInput}
                  onChange={(e) => setCustomNsInput(e.target.value)}
                  placeholder="ns1.externaldns.com&#10;ns2.externaldns.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* DNS Records Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>DNS Zone Records ({records.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Record Baru</span>
              </button>
            </div>

            {/* Add Record Form */}
            {showAddForm && (
              <form
                onSubmit={handleAddRecord}
                className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3"
              >
                <div className="text-xs font-bold text-indigo-300">Form Tambah Record DNS:</div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tipe</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as DnsRecord['type'])}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-semibold focus:outline-none"
                    >
                      <option value="A">A (IPv4)</option>
                      <option value="AAAA">AAAA (IPv6)</option>
                      <option value="CNAME">CNAME (Alias)</option>
                      <option value="MX">MX (Mail Exchange)</option>
                      <option value="TXT">TXT (Verification)</option>
                      <option value="NS">NS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Host / Name</label>
                    <input
                      type="text"
                      placeholder="@ atau sub"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">Points To / Nilai Target</label>
                    <input
                      type="text"
                      placeholder="103.147.154.21 atau mail.domain.com"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">TTL (Detik)</label>
                    <select
                      value={newTtl}
                      onChange={(e) => setNewTtl(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value={300}>300 (5 Menit)</option>
                      <option value={3600}>3600 (1 Jam)</option>
                      <option value={14400}>14400 (4 Jam)</option>
                      <option value={86400}>86400 (1 Hari)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                  >
                    Simpan Record
                  </button>
                </div>
              </form>
            )}

            {/* Records Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Tipe</th>
                    <th className="px-3.5 py-2.5">Name / Host</th>
                    <th className="px-3.5 py-2.5">Value / Target</th>
                    <th className="px-3.5 py-2.5">TTL</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/50">
                      <td className="px-3.5 py-2.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {r.type}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-white">{r.name}</td>
                      <td className="px-3.5 py-2.5 text-slate-300 break-all">{r.value}</td>
                      <td className="px-3.5 py-2.5 text-slate-400 font-sans">{r.ttl}s</td>
                      <td className="px-3.5 py-2.5 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r)}
                          title="Hapus record DNS ini"
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan DNS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
