/**
 * Lightweight client-side rate limiter.
 * (DEVELOPMENT PAUSE ACTIVE: All limits bypass to allow unrestricted testing)
 */

export interface RateLimitResult {
  allowed: boolean;
  /** How many attempts remain in this window */
  remaining: number;
  /** Seconds until the oldest entry expires and frees a slot */
  retryAfterSeconds: number;
}

/**
 * Check if an action is allowed under a rate limit.
 * DEV MODE: Bypassed for unrestricted testing.
 */
export function checkRateLimit(
  _key: string,
  _maxCalls: number,
  _windowMs: number,
): RateLimitResult {
  return { allowed: true, remaining: 999, retryAfterSeconds: 0 };
}

// --- Preconfigured limiters --------------------------------------------------

/** Payment submissions limiter (Bypassed for Dev Testing) */
export function checkPaymentRateLimit(_userId: string): RateLimitResult {
  return { allowed: true, remaining: 999, retryAfterSeconds: 0 };
}

/** Login attempts limiter (Bypassed for Dev Testing) */
export function checkLoginRateLimit(): RateLimitResult {
  return { allowed: true, remaining: 999, retryAfterSeconds: 0 };
}

/** Registration attempts limiter (Bypassed for Dev Testing) */
export function checkRegisterRateLimit(): RateLimitResult {
  return { allowed: true, remaining: 999, retryAfterSeconds: 0 };
}

/** Analysis submissions limiter (Bypassed for Dev Testing) */
export function checkAnalysisRateLimit(_userId: string): RateLimitResult {
  return { allowed: true, remaining: 999, retryAfterSeconds: 0 };
}

/** Human-readable countdown string e.g. "4m 32s" */
export function formatRetryAfter(seconds: number): string {
  if (seconds <= 0) return "now";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
