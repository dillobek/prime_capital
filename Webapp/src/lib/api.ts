import type { Balance, PropertyListing } from '@prime/contracts';
type ContentItem = { id:string; title:string; description?:string; url?:string; imageUrl?:string };
const base = process.env.API_URL ?? 'http://127.0.0.1:4000/api/v1';
// No placeholder/demo numbers — if the API is briefly unreachable, show an honest empty state instead of fake data.
const fallbackBalances: Balance[] = [
  { id:'prime-capital', name:'Prime Capital', amount:0, monthlyChange:0, updatedAt:new Date().toISOString() },
  { id:'php-invest', name:'PHP Invest', amount:0, monthlyChange:0, updatedAt:new Date().toISOString() },
];
const fallbackProperties: PropertyListing[] = [];
async function safeFetch<T>(path:string, fallback:T):Promise<T>{ try { const response=await fetch(`${base}${path}`,{cache:'no-store'}); if(!response.ok) throw new Error(); return response.json(); } catch { return fallback; } }
export async function getHomeData(){ const [balances,properties,banners,videos]=await Promise.all([safeFetch('/balances',fallbackBalances),safeFetch('/properties?status=active',fallbackProperties),safeFetch<ContentItem[]>('/banners',[]),safeFetch<ContentItem[]>('/videos',[])]); return {balances,properties,banners,videos}; }
