import { getHomeData } from '@/lib/api';
import { WebApp } from '@/components/web-app';
export default async function Page(){ const data=await getHomeData(); return <WebApp {...data}/>; }
