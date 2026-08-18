export type InvestmentProduct = 'prime-capital' | 'php-invest';

export interface Balance {
  id: InvestmentProduct;
  name: string;
  amount: number;
  monthlyChange: number;
  updatedAt: string;
}

export type PropertyStatus = 'active' | 'pending' | 'inactive';

export interface PropertyListing {
  id: string;
  title: string;
  type: 'new-build' | 'resale';
  location: string;
  price: number;
  rooms: number;
  area: number;
  status: PropertyStatus;
  createdAt: string;
  /** Public page-view counter — incremented via POST /properties/:id/view, shown in the admin panel. */
  views: number;
}

export interface DashboardSummary {
  users: number;
  activeListings: number;
  balances: Balance[];
  recentProperties: PropertyListing[];
}
