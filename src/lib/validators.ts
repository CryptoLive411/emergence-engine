// Input validation utilities

/**
 * Validates a Twitter/X handle format
 * Rules: alphanumeric + underscore, 1-15 characters
 */
export const TWITTER_HANDLE_REGEX = /^[a-zA-Z0-9_]{1,15}$/;

export function isValidXHandle(handle: string): boolean {
  const normalized = handle.toLowerCase().replace('@', '');
  return TWITTER_HANDLE_REGEX.test(normalized);
}

export function normalizeXHandle(handle: string): string {
  return handle.toLowerCase().replace('@', '');
}

export function validateXHandle(handle: string): { valid: boolean; error?: string } {
  const normalized = normalizeXHandle(handle);
  
  if (!normalized) {
    return { valid: false, error: 'X handle is required' };
  }
  
  if (normalized.length > 15) {
    return { valid: false, error: 'X handle must be 15 characters or less' };
  }
  
  if (!TWITTER_HANDLE_REGEX.test(normalized)) {
    return { valid: false, error: 'X handle can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true };
}
