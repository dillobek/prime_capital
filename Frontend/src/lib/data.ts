import type { DashboardSummary } from '@prime/contracts';

export const fallbackDashboard: DashboardSummary = {
  users: 12458,
  activeListings: 324,
  balances: [
    { id: 'prime-capital', name: 'Prime Capital', amount: 2345678900, monthlyChange: 6.7, updatedAt: new Date().toISOString() },
    { id: 'php-invest', name: 'PHP Invest', amount: 1234567800, monthlyChange: -3.2, updatedAt: new Date().toISOString() },
  ],
  recentProperties: [
    { id: '1', title: 'Tashkent City, 2-xonali', type: 'new-build', location: 'Shayxontohur', price: 1250000000, rooms: 2, area: 68, status: 'active', createdAt: '2026-08-15T10:32:00.000Z' },
    { id: '2', title: 'Green Park, 3-xonali', type: 'new-build', location: 'Yunusobod', price: 1780000000, rooms: 3, area: 92, status: 'active', createdAt: '2026-08-15T08:18:00.000Z' },
    { id: '3', title: 'Chilonzor, 2-xonali', type: 'resale', location: 'Chilonzor', price: 860000000, rooms: 2, area: 58, status: 'pending', createdAt: '2026-08-15T06:05:00.000Z' },
    { id: '4', title: 'Yangi Hayot, 4-xonali', type: 'new-build', location: 'Yashnobod', price: 2450000000, rooms: 4, area: 126, status: 'inactive', createdAt: '2026-08-14T13:45:00.000Z' },
    { id: '5', title: 'Mirzo Ulug‘bek, 1-xonali', type: 'resale', location: 'Mirzo Ulug‘bek', price: 620000000, rooms: 1, area: 42, status: 'active', createdAt: '2026-08-14T11:30:00.000Z' },
  ],
};

export async function getDashboard(): Promise<DashboardSummary> {
  const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4000/api/v1';
  try {
    const response = await fetch(`${apiUrl}/dashboard`, { cache: 'no-store' });
    if (!response.ok) throw new Error('API unavailable');
    return response.json();
  } catch {
    return fallbackDashboard;
  }
}
