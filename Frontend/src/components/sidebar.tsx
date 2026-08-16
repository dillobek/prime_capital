import { Apartment, Bell, BookOpen, CircleUserRound, Gauge, Image, Settings, UsersRound, WalletCards } from './icons';

const items = [
  [Gauge, 'Dashboard'], [WalletCards, 'Balanslar'], [Apartment, 'Kvartiralar'], [Image, 'Bannerlar'],
  [BookOpen, 'Video darslar'], [Bell, 'Bildirishnomalar'], [UsersRound, 'Foydalanuvchilar'], [Settings, 'Sozlamalar'],
] as const;

export function Sidebar() {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><strong>PRIME</strong><span>CAPITAL</span></div></div>
    <nav>{items.map(([Icon, label], index) => <button className={index === 0 ? 'active' : ''} key={label}><Icon size={20}/><span>{label}</span></button>)}</nav>
    <div className="admin-mini"><CircleUserRound size={38}/><div><strong>Admin</strong><span>Super Admin</span></div></div>
  </aside>;
}
