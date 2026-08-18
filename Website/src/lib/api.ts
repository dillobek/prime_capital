// Local type mirror of @prime/contracts' PropertyListing — kept local (not imported from the
// workspace package) so Website's package.json/lockfile don't need to change for a new dependency.
export type PropertyListing = {
  id: string;
  title: string;
  type: 'new-build' | 'resale';
  location: string;
  price: number;
  rooms: number;
  area: number;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
};

export type ContentItem = { id: string; title: string; description?: string; url?: string; imageUrl?: string };

// These run from client components (pages here are 'use client' for i18n), so use the
// browser-exposed NEXT_PUBLIC_API_URL — same convention as Webapp/src/components/web-app.tsx.
const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api/v1';

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${base}${path}`, { cache: 'no-store' });
    if (!response.ok) throw new Error();
    return response.json();
  } catch {
    return fallback;
  }
}

export async function getProperties(params?: { type?: string; status?: string }): Promise<PropertyListing[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return safeFetch<PropertyListing[]>(`/properties${qs ? `?${qs}` : ''}`, []);
}

export async function getBanners(): Promise<ContentItem[]> {
  return safeFetch<ContentItem[]>('/banners', []);
}
