import { Bell, Search } from '@/components/icons';
import { Sidebar } from '@/components/sidebar';
import { BalanceEditor } from '@/components/balance-editor';
import { BalanceChart } from '@/components/chart';
import { PropertyTable } from '@/components/property-table';
import { getDashboard } from '@/lib/data';

const money = (value:number) => new Intl.NumberFormat('uz-UZ').format(value);

export default async function DashboardPage() {
  const dashboard = await getDashboard();
  const cards = [
    ['Jami foydalanuvchilar', dashboard.users.toLocaleString(), '+8.4%'],
    ['Prime Capital', money(dashboard.balances[0].amount), `${dashboard.balances[0].monthlyChange > 0 ? '+' : ''}${dashboard.balances[0].monthlyChange}%`],
    ['PHP Invest', money(dashboard.balances[1].amount), `${dashboard.balances[1].monthlyChange > 0 ? '+' : ''}${dashboard.balances[1].monthlyChange}%`],
    ['Faol e’lonlar', dashboard.activeListings.toString(), '+12.1%'],
  ];
  return <div className="app-shell"><Sidebar/><main>
    <header><div><h1>Dashboard</h1><p>Prime Capital platformasini boshqaring</p></div><div className="header-tools"><label><Search size={18}/><input placeholder="Qidirish..."/></label><button className="notification"><Bell size={20}/><span>6</span></button><div className="avatar">AS</div><strong>Admin</strong></div></header>
    <div className="content"><section className="stats">{cards.map(([label,value,change],index)=><article key={label}><div className={`stat-icon c${index}`}>{index+1}</div><div><span>{label}</span><strong>{value}</strong><small className={change.startsWith('-')?'down':''}>{change} <em>o‘tgan oyga nisbatan</em></small></div></article>)}</section>
      <div className="dashboard-grid"><BalanceChart/><BalanceEditor initialBalances={dashboard.balances}/><PropertyTable items={dashboard.recentProperties}/><section className="activity panel"><h2>So‘nggi faoliyat</h2>{['Admin balansni yangiladi','Azizbek e’lonni tahrirladi','Dilshod yangi e’lon qo‘shdi','Admin e’lonni o‘chirdi','Sarvar foydalanuvchi qo‘shdi'].map((item,index)=><div className="activity-row" key={item}><span>{index+1}</span><div><strong>{item}</strong><small>{14-index}:3{index}</small></div></div>)}</section></div>
    </div>
  </main></div>;
}
