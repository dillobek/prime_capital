import { AdminApp } from '@/components/admin-app';
import { getDashboard } from '@/lib/data';

export default async function AdminPage() {
  return <AdminApp dashboard={await getDashboard()}/>;
}
