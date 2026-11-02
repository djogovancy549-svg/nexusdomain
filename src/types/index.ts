export interface DnsRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface DomainItem {
  id: string;
  name: string;
  tld: string;
  clientName: string;
  clientEmail: string;
  hostingPlan: string;
  serverLocation: string;
  registrationDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD (Batas Waktu)
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended';
  autoRenew: boolean;
  dnssecEnabled: boolean;
  sslStatus: 'active' | 'pending' | 'expired';
  sslIssuer: string;
  sslExpiryDate: string;
  whoisPrivacy: boolean;
  eppCode: string;
  ipAddress: string;
  nameservers: string[];
  dnsRecords: DnsRecord[];
  diskUsageMB: number;
  diskLimitMB: number;
  bandwidthUsageGB: number;
  bandwidthLimitGB: number;
  phpVersion: string;
  syncedToSheet?: boolean;
  clientPhone?: string;
  salePriceIDR?: number;
  paymentStatus?: 'paid' | 'pending' | 'unpaid';
  invoiceNumber?: string;
  certificateNumber?: string;
  isTransferLocked?: boolean;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  domain: string;
  event: string;
  ip: string;
  severity: 'info' | 'warning' | 'security' | 'danger';
  status: 'Mitigated' | 'Logged' | 'Enforced';
}

export interface TldPricing {
  tld: string;
  promoPriceIDR: number;
  normalPriceIDR: number;
  promoPriceUSD: number;
  normalPriceUSD: number;
  discountBadge: string;
  popular?: boolean;
  type: 'Global' | 'Indonesia ccTLD' | 'Tech & Business';
}

export interface HostingPackage {
  id: string;
  name: string;
  tagline: string;
  pricePerMonthIDR: number;
  pricePerMonthUSD: number;
  renewalPriceIDR: number;
  recommended?: boolean;
  features: {
    websites: string;
    storage: string;
    bandwidth: string;
    freeDomain: boolean;
    ssl: string;
    email: string;
    backup: string;
    performance: string;
    ddosShield: string;
  };
}

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  autoSync: boolean;
  isSyncing: boolean;
  sheetTitle: string;
}

export interface PaymentConfirmation {
  id: string;
  domainId: string;
  domainName: string;
  invoiceNumber: string;
  amountIDR: number;
  senderName: string;
  senderPhone: string;
  senderBank: string;
  transferDate: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
}

