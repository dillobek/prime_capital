import type { DashboardSummary } from '@prime/contracts';

// No placeholder/demo numbers — if the API is briefly unreachable, show an honest empty/zero state instead of fake data.
export const fallbackDashboard: DashboardSummary = {
  users: 0,
  activeListings: 0,
  balances: [
    { id: 'prime-capital', name: 'Prime Capital', amount: 0, monthlyChange: 0, updatedAt: new Date().toISOString() },
    { id: 'php-invest', name: 'PHP Invest', amount: 0, monthlyChange: 0, updatedAt: new Date().toISOString() },
  ],
  recentProperties: [],
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
