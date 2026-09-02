/**
 * Normalizes an Uzbek phone number to `+998XXXXXXXXX`, tolerating spaces,
 * dashes, parentheses, a missing `+`, or just the 9-digit subscriber number
 * (the way people naturally type it). Used both when validating a fresh OTP
 * request and when matching against phone numbers already on file — those
 * were collected by the Telegram bot (`telegram.service.ts`'s `askPhone()`)
 * with a much looser regex, so stored values aren't guaranteed to already
 * be in this exact shape.
 */
export function normalizeUzPhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith('0998')) return `+${digits.slice(1)}`;
  const trimmed = input.trim();
  return trimmed.startsWith('+') ? trimmed : digits ? `+${digits}` : trimmed;
}

/** `+998901234567` -> `998901234567`, the shape Eskiz's `mobile_phone` field expects. */
export function toEskizMobilePhone(normalizedPhone: string): string {
  return normalizedPhone.replace(/^\+/, '');
}
