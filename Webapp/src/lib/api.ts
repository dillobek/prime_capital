import type { Balance, PropertyListing } from '@prime/contracts';
type ContentItem = { id:string; title:string; description?:string; url?:string; imageUrl?:string };
const base = process.env.API_URL ?? 'http://127.0.0.1:4000/api/v1';
const fallbackBalances: Balance[] = [
  { id:'prime-capital', name:'Prime Capital', amount:125000000, monthlyChange:20, updatedAt:new Date().toISOString() },
  { id:'php-invest', name:'PHP Invest', amount:68750000, monthlyChange:-13, updatedAt:new Date().toISOString() },
];
const fallbackProperties: PropertyListing[] = [
  { id:'1', title:'Prime Gardens', type:'new-build', location:'Toshkent, Yunusobod', price:12900000, rooms:2, area:68, status:'active', createdAt:new Date().toISOString() },
  { id:'2', title:'111 Residence', type:'new-build', location:'Toshkent, Chilonzor', price:11800000, rooms:3, area:92, status:'active', createdAt:new Date().toISOString() },
  { id:'3', title:'Skyline Avenue', type:'new-build', location:'Toshkent, Mirzo Ulug‘bek', price:13500000, rooms:2, area:72, status:'active', createdAt:new Date().toISOString() },
];
async function safeFetch<T>(path:string, fallback:T):Promise<T>{ try { const response=await fetch(`${base}${path}`,{cache:'no-store'}); if(!response.ok) throw new Error(); return response.json(); } catch { return fallback; } }
export async function getHomeData(){ const [balances,properties,banners,videos]=await Promise.all([safeFetch('/balances',fallbackBalances),safeFetch('/properties?status=active',fallbackProperties),safeFetch<ContentItem[]>('/banners',[]),safeFetch<ContentItem[]>('/videos',[])]); return {balances,properties,banners,videos}; }
