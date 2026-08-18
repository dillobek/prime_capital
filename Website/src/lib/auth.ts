// Minimal client-side auth helper for the marketing Website's login page — talks to the
// same backend /auth/login endpoint the Webapp uses, stores its own token under a distinct key.
const TOKEN_KEY = 'prime_website_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function decodeEmail(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.email ?? null;
  } catch {
    return null;
  }
}

const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api/v1';

export async function login(email: string, password: string): Promise<{ token: string }> {
  const response = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('login failed');
  return response.json();
}
