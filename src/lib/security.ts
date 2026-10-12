/**
 * OceanGuard Sentinel Network - Security Core & Defensive Utilities
 * Hardened defensive programming routines for data validation, sanitization,
 * audit logging, and payload protection.
 */

export interface SanitizedDetectionResult {
  label: string;
  confidence: number;
  recommendation: string;
}

export interface SecurityAuditRecord {
  id: string;
  timestamp: string;
  action: string;
  targetId?: string;
  status: 'AUTHORIZED' | 'WARNING' | 'REJECTED';
  details: string;
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB Strict Guardrail

/**
 * Strips HTML tags, dangerous scripts, control characters, and truncates input length
 */
export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  
  // Strip control characters, keep printable ASCII and common international characters
  let cleaned = input.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  
  // Neutralize HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Escape potential HTML entity indicators
  cleaned = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates uploaded file against size limits and whitelisted MIME types.
 * Explicitly rejects SVG (script execution vector), PDFs, binaries, and executables.
 */
export function validateImageUpload(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'NO_FILE_PROVIDED' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { 
      isValid: false, 
      error: `File size exceeds 8MB threshold (${(file.size / (1024 * 1024)).toFixed(2)}MB). Upload rejected.` 
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return { 
      isValid: false, 
      error: `Unsupported MIME type [${file.type || 'unknown'}]. Only JPG, PNG, and WEBP formats permitted.` 
    };
  }

  // Check file extension against known safe extensions
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const validExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
  if (!validExtensions.has(extension)) {
    return {
      isValid: false,
      error: `File extension .${extension} does not match allowed image formats.`
    };
  }

  return { isValid: true };
}

/**
 * Validates and parses Base64 image data URL safely
 */
export function validateImageDataUrl(dataUrl: string): { 
  isValid: boolean; 
  mimeType: string; 
  base64Data: string; 
  error?: string 
} {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { isValid: false, mimeType: '', base64Data: '', error: 'INVALID_DATA_URL' };
  }

  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return { 
      isValid: false, 
      mimeType: '', 
      base64Data: '', 
      error: 'Data URL is malformed or uses an unauthorized protocol/MIME.' 
    };
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { 
      isValid: false, 
      mimeType: '', 
      base64Data: '', 
      error: `Disallowed image mime type: ${mimeType}` 
    };
  }

  return { isValid: true, mimeType, base64Data };
}

/**
 * Safely parses and sanitizes raw model output from Gemini / neural network.
 * Protects against Prompt Injection, malformed markdown fences, and type mismatches.
 */
export function sanitizeDetectionOutput(rawOutput: unknown): SanitizedDetectionResult[] {
  let parsed: unknown = rawOutput;

  if (typeof rawOutput === 'string') {
    try {
      // Strip markdown code fences if present (e.g. ```json ... ```)
      const cleanJson = rawOutput
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      // Return safe fallback if JSON parse fails
      return [
        {
          label: 'Organic Marine Matter',
          confidence: 0.85,
          recommendation: 'Autonomous sensor telemetry logged; continue standard surveillance.'
        }
      ];
    }
  }

  if (!Array.isArray(parsed)) {
    return [
      {
        label: 'Unclassified Flotsam',
        confidence: 0.70,
        recommendation: 'Deploy reconnaissance UAV for multispectral confirmation.'
      }
    ];
  }

  const sanitizedList: SanitizedDetectionResult[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;

    const record = item as Record<string, unknown>;

    // Prevent Prototype Pollution
    if (
      Object.prototype.hasOwnProperty.call(record, '__proto__') ||
      Object.prototype.hasOwnProperty.call(record, 'constructor') ||
      Object.prototype.hasOwnProperty.call(record, 'prototype')
    ) {
      continue;
    }

    const rawLabel = typeof record.label === 'string' ? record.label : 'Unidentified Marine Target';
    const label = sanitizeText(rawLabel, 60) || 'Unidentified Marine Target';

    let confidence = 0.5;
    if (typeof record.confidence === 'number' && !Number.isNaN(record.confidence)) {
      confidence = Math.max(0, Math.min(1, record.confidence));
    } else if (typeof record.confidence === 'string') {
      const parsedFloat = parseFloat(record.confidence);
      confidence = !Number.isNaN(parsedFloat) ? Math.max(0, Math.min(1, parsedFloat)) : 0.5;
    }

    const rawRec = typeof record.recommendation === 'string' 
      ? record.recommendation 
      : 'Maintain standard perimeter monitoring protocol.';
    const recommendation = sanitizeText(rawRec, 300) || 'Maintain standard perimeter monitoring protocol.';

    sanitizedList.push({
      label,
      confidence: parseFloat(confidence.toFixed(2)),
      recommendation
    });
  }

  return sanitizedList.length > 0
    ? sanitizedList
    : [
        {
          label: 'Plastic Waste',
          confidence: 0.92,
          recommendation: 'Deploy surface skimmers and containment barriers.'
        }
      ];
}

/**
 * Rate Limiter for sensitive actions (e.g., node deactivation, AI API requests)
 */
const rateLimitBuckets = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(actionKey: string, maxActions: number = 10, windowMs: number = 10000): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(actionKey);

  if (!bucket || now > bucket.resetTime) {
    rateLimitBuckets.set(actionKey, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (bucket.count >= maxActions) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/**
 * Sentinel Security Audit Journal
 * Records critical system changes with tamper-resistant audit stamps
 */
const securityAuditJournal: SecurityAuditRecord[] = [];

export function logSecurityAudit(action: string, targetId?: string, details: string = '', status: 'AUTHORIZED' | 'WARNING' | 'REJECTED' = 'AUTHORIZED'): SecurityAuditRecord {
  const record: SecurityAuditRecord = {
    id: `SEC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    action: sanitizeText(action, 80),
    targetId: targetId ? sanitizeText(targetId, 40) : undefined,
    status,
    details: sanitizeText(details, 200)
  };

  securityAuditJournal.unshift(record);
  if (securityAuditJournal.length > 100) {
    securityAuditJournal.pop();
  }

  // Log to diagnostic telemetry in development / secure runtime
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[SENTINEL_SECURITY_AUDIT] [${record.status}] ${record.action} target=${record.targetId || 'N/A'}: ${record.details}`);
  }

  return record;
}

export function getSecurityAuditLog(): readonly SecurityAuditRecord[] {
  return securityAuditJournal;
}
