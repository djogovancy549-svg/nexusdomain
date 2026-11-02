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
  Cloud,
  Zap,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DnsRecord, DomainItem } from '../types';

interface DnsManagerModalProps {
  domain: DomainItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRecords: (domainId: string, updatedRecords: DnsRecord[], nameservers: string[], dnssec: boolean) => void;
  onRequestDeleteRecord: (record: DnsRecord, onConfirmDelete: () => void) => void;
  initialTab?: 'subdomains' | 'records' | 'nameservers';
}

export const DnsManagerModal: React.FC<DnsManagerModalProps> = ({
  domain,
  isOpen,
  onClose,
  onSaveRecords,
  onRequestDeleteRecord,
  initialTab = 'subdomains',
}) => {
  if (!isOpen || !domain) return null;

  const [activeTab, setActiveTab] = useState<'subdomains' | 'records' | 'nameservers'>(initialTab);
  const [records, setRecords] = useState<DnsRecord[]>(domain.dnsRecords);
  const [nameservers, setNameservers] = useState<string[]>(domain.nameservers);
  const [dnssecEnabled, setDnssecEnabled] = useState<boolean>(domain.dnssecEnabled);
  const [nsType, setNsType] = useState<'default' | 'custom'>(
    domain.nameservers.every((ns) => ns.includes('nexahost')) ? 'default' : 'custom'
  );

  // Subdomain Creation Wizard State
  const [subPrefix, setSubPrefix] = useState('');
  const [subTargetType, setSubTargetType] = useState<'pages' | 'ip' | 'cname'>('pages');
  const [subTargetValue, setSubTargetValue] = useState('contoh-projek.pages.dev');
  const [subSuccessMsg, setSubSuccessMsg] = useState('');

  // Cloudflare Pages Quick Preset State
  const defaultCfTarget = `${domain.name.split('.')[0]}.pages.dev`;
  const [cfPagesTarget, setCfPagesTarget] = useState(defaultCfTarget);
  const [showCfPreset, setShowCfPreset] = useState(false);
  const [cfAppliedMsg, setCfAppliedMsg] = useState(false);

  // New generic record input state
  const [newType, setNewType] = useState<DnsRecord['type']>('A');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTtl, setNewTtl] = useState(3600);
  const [newPriority, setNewPriority] = useState<number | undefined>(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customNsInput, setCustomNsInput] = useState(domain.nameservers.join('\n'));

  // Active Subdomains are records where name is not '@' and not root domain
  const activeSubdomains = records.filter(
    (r) => r.name !== '@' && r.name !== domain.name && (r.type === 'A' || r.type === 'CNAME' || r.type === 'AAAA')
  );

  // Handle Quick Subdomain Creation
  const handleCreateSubdomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrefix = subPrefix.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanPrefix) return;

    let target = subTargetValue.trim();
    if (subTargetType === 'ip') {
      target = target || domain.ipAddress || '104.21.74.12';
    } else if (subTargetType === 'pages') {
      target = target || `${cleanPrefix}-${domain.name.split('.')[0]}.pages.dev`;
    }

    // Remove existing record for this subdomain if any
    const filtered = records.filter((r) => r.name.toLowerCase() !== cleanPrefix);
    const newRecord: DnsRecord = {
      id: `rec-sub-${Date.now()}`,
      type: subTargetType === 'ip' ? 'A' : 'CNAME',
      name: cleanPrefix,
      value: target,
      ttl: 3600,
    };

    setRecords([...filtered, newRecord]);
    setSubSuccessMsg(`Subdomain ${cleanPrefix}.${domain.name} berhasil dibuat!`);
    setSubPrefix('');
    setTimeout(() => setSubSuccessMsg(''), 4500);
  };

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

  const applyCloudflarePagesPreset = () => {
    if (!cfPagesTarget.trim()) return;
    const target = cfPagesTarget
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');

    // Remove conflicting A or CNAME records for @, domain name, and www
    const filtered = records.filter(
      (r) =>
        !(
          (r.name === '@' || r.name === domain.name || r.name === 'www') &&
          (r.type === 'A' || r.type === 'CNAME')
        )
    );

    const updated: DnsRecord[] = [
      ...filtered,
      {
        id: `rec-cname-root-${Date.now()}`,
        type: 'CNAME',
        name: '@',
        value: target,
        ttl: 3600,
      },
      {
        id: `rec-cname-www-${Date.now() + 1}`,
        type: 'CNAME',
        name: 'www',
        value: target,
        ttl: 3600,
      },
    ];

    setRecords(updated);
    setCfAppliedMsg(true);
    setTimeout(() => setCfAppliedMsg(false), 4000);
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
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-mono">
                  DNS &amp; Subdomain Hub • {domain.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Anycast DNS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola subdomain tak terbatas, routing Cloudflare Pages / IP server, dan proteksi DNSSEC
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 pb-1 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('subdomains')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'subdomains'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kelola Subdomain ({activeSubdomains.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'records'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Semua Record DNS ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nameservers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'nameservers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nameservers &amp; DNSSEC</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4 space-y-6">
          {/* TAB 1: SUBDOMAINS MANAGEMENT */}
          {activeTab === 'subdomains' && (
            <div className="space-y-6">
              {/* Educational Explanation Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span>Bagaimana Subdomain Bekerja di NageDomain?</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      GRATIS &amp; UNLIMITED
                    </span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Subdomain (contoh: <strong className="text-amber-300">admin.{domain.name}</strong>,{' '}
                    <strong className="text-cyan-300">app.{domain.name}</strong>,{' '}
                    <strong className="text-indigo-300">toko.{domain.name}</strong>) adalah hak bebas yang melekat pada domain Anda tanpa biaya pendaftaran tambahan. Sistem kami otomatis mengaitkannya ke DNS Anycast dengan proteksi <strong>Wildcard SSL (*.{domain.name})</strong>.
                  </p>
                </div>
              </div>

              {/* Subdomain Creation Form */}
              <form
                onSubmit={handleCreateSubdomain}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Buat Subdomain Baru</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Otomatis routing DNS &amp; tersertifikasi HTTPS
                  </span>
                </div>

                {/* Subdomain Prefix Input */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                    Nama Awalan Subdomain:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={subPrefix}
                        onChange={(e) => setSubPrefix(e.target.value)}
                        placeholder="contoh: admin, app, portal, api, toko"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-300">.{domain.name}</span>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                    <span className="text-slate-500">Pilihan Cepat:</span>
                    {['admin', 'app', 'portal', 'api', 'toko', 'blog', 'member'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setSubPrefix(p);
                          if (subTargetType === 'pages') {
                            setSubTargetValue(`${p}-${domain.name.split('.')[0]}.pages.dev`);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer transition font-mono"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Type Selector */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                    Tujuan Pengarahan (Routing Target):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubTargetType('pages');
                        setSubTargetValue(
                          subPrefix ? `${subPrefix}-${domain.name.split('.')[0]}.pages.dev` : 'contoh-projek.pages.dev'
                        );
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        subTargetType === 'pages'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Cloudflare Pages</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">CNAME ke *.pages.dev</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSubTargetType('ip');
                        setSubTargetValue(domain.ipAddress || '104.21.74.12');
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        subTargetType === 'ip'
                          ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5" />
                        <span>IP Server / Hosting</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">A Record (IPv4)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSubTargetType('cname');
                        setSubTargetValue('cname.external-host.com');
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        subTargetType === 'cname'
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Custom CNAME</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Vercel, Google, Shopify, dll.</div>
                    </button>
                  </div>
                </div>

                {/* Target Value Input */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                    {subTargetType === 'ip' ? 'IP Server Tujuan:' : 'Alamat Host Tujuan:'}
                  </label>
                  <input
                    type="text"
                    value={subTargetValue}
                    onChange={(e) => setSubTargetValue(e.target.value)}
                    placeholder={subTargetType === 'ip' ? '104.21.74.12' : 'contoh-projek.pages.dev'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Live Preview Box */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">Preview:</span>
                    <span className="font-bold text-amber-300">
                      https://{subPrefix || 'sub'}.{domain.name}
                    </span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="text-cyan-300 truncate max-w-xs">{subTargetValue || '-'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-sans font-bold">
                    SSL Wildcard Ready
                  </span>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!subPrefix.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan Subdomain Ini</span>
                  </button>
                </div>
              </form>

              {subSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>{subSuccessMsg}</strong> Jangan lupa klik <em>"Simpan Perubahan DNS"</em> di bawah untuk mempublikasikannya.
                  </span>
                </div>
              )}

              {/* List of Active Subdomains */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Subdomain Terdaftar ({activeSubdomains.length})</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Semua dilindungi sertifikat HTTPS Wildcard
                  </span>
                </div>

                {activeSubdomains.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 space-y-2">
                    <p className="text-xs">Belum ada subdomain tambahan untuk domain {domain.name}.</p>
                    <p className="text-[11px] text-slate-500">
                      Gunakan formulir di atas untuk membuat subdomain seperti <code>admin.{domain.name}</code> atau <code>app.{domain.name}</code>.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeSubdomains.map((sub) => {
                      const fullSubUrl = `${sub.name}.${domain.name}`;
                      return (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm font-mono">{fullSubUrl}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                {sub.type}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Lock className="w-2.5 h-2.5" />
                                <span>SSL Wildcard</span>
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                              <span>Menuju ke:</span>
                              <span className="text-amber-300">{sub.value}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-500 text-[11px]">TTL: {sub.ttl}s</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <a
                              href={`https://${fullSubUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1"
                              title="Buka Subdomain di Tab Baru"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Buka URL</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(sub)}
                              title="Hapus Subdomain ini"
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ALL DNS RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              {/* Quick Preset: Cloudflare Pages / Workers (*.pages.dev) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Preset Cepat: Hubungkan ke Cloudflare Pages</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          1-Klik DNS
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Arahkan apex domain (@) dan www ({domain.name}) ke aplikasi Cloudflare Pages seperti <strong className="text-amber-300">contoh-projek.pages.dev</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCfPreset(!showCfPreset)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 self-start sm:self-auto cursor-pointer"
                  >
                    {showCfPreset ? 'Sembunyikan' : 'Buka Pengaturan Pages'}
                  </button>
                </div>

                {showCfPreset && (
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex-1 w-full">
                        <label className="text-[10px] text-slate-400 block mb-1">
                          URL Host Target Cloudflare Pages:
                        </label>
                        <input
                          type="text"
                          value={cfPagesTarget}
                          onChange={(e) => setCfPagesTarget(e.target.value)}
                          placeholder="contoh-projek.pages.dev"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyCloudflarePagesPreset}
                        className="w-full sm:w-auto mt-4 sm:mt-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/25 shrink-0"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Terapkan CNAME Pages</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                      <strong className="text-slate-200 block mb-0.5">Yang akan dikonfigurasi:</strong>
                      • <code>CNAME @ &rarr; {cfPagesTarget || 'contoh-projek.pages.dev'}</code> (Apex root domain)<br />
                      • <code>CNAME www &rarr; {cfPagesTarget || 'contoh-projek.pages.dev'}</code> (Subdomain www)<br />
                      • Menghapus record IP default (A record) yang bentrok secara otomatis.
                    </div>
                  </div>
                )}

                {cfAppliedMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong>Berhasil diterapkan ke tabel records di bawah!</strong> Klik <em>"Simpan Perubahan DNS"</em> untuk mempublikasikan.
                    </span>
                  </div>
                )}
              </div>

              {/* DNS Records Management Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Daftar Record DNS ({records.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Record Manual</span>
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
                          placeholder="104.21.74.12 atau host.domain.com"
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
          )}

          {/* TAB 3: NAMESERVERS & DNSSEC */}
          {activeTab === 'nameservers' && (
            <div className="space-y-6">
              {/* DNSSEC Section */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      dnssecEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">DNSSEC Security Protection</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          dnssecEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {dnssecEnabled ? 'PROTECTED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Mencegah DNS Cache Poisoning dan Man-in-the-Middle (MitM) spoofing melalui tanda tangan digital ECDSA.
                    </p>
                    {dnssecEnabled && (
                      <div className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                        <div>
                          Key Tag: <span className="text-indigo-300 font-bold">23719</span> • Algorithm:{' '}
                          <span className="text-cyan-300">13 (ECDSA P-256 with SHA-256)</span>
                        </div>
                        <div className="truncate text-slate-500 mt-0.5">Digest: E2D5C8F8A3B21094857201948ACDFE54...</div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
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
            </div>
          )}
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
            <span>Simpan Perubahan DNS &amp; Subdomain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
