/**
 * Security & Anti-Exploit Utilities
 * Prevents SQL Injection patterns, XSS attacks, and malicious input vectors
 * Protected by CV. EBI Security Protocol
 */

// Common SQL Injection & Vulnerability patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|TRUNCATE)\b)/i,
  /('|"|;|\/\*|\*\/|--)/i,
  /('|\b)\s*(OR|AND)\s+('1'='1'|1=1|'a'='a')/i,
  /\bUNION\s+(ALL\s+)?SELECT\b/i,
  /INFORMATION_SCHEMA/i,
  /BENCHMARK\s*\(/i,
  /SLEEP\s*\(/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
];

/**
 * Checks if string input contains any known SQL Injection or Exploit payload
 */
export function isSecurityThreat(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitizes input string by stripping potential HTML tags and escaping dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/['"`;\\]/g, '') // Remove quotes, semicolons, and backslashes
    .trim();
}

/**
 * Validates domain input format safely
 */
export function sanitizeDomainQuery(domain: string): { sanitized: string; isBlocked: boolean; threatReason?: string } {
  if (isSecurityThreat(domain)) {
    return {
      sanitized: '',
      isBlocked: true,
      threatReason: 'Terdeteksi percobaan SQL Injection / Script Malicious yang diblokir oleh AI Security CV. EBI System.',
    };
  }

  const clean = domain
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '')
    .trim();

  return { sanitized: clean, isBlocked: false };
}
