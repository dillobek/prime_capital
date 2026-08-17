import type { PropertyListing } from '@prime/contracts';
import { Apartment } from './icons';
/** Property prices are always in USD — never so'm/UZS. */
const usd = (value:number) => `$${new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value)}`;
const status = { active: 'Faol', pending: 'Kutilmoqda', inactive: 'Nofaol' } as const;

export function PropertyTable({ items }: { items: PropertyListing[] }) {
  return <section className="properties panel"><div className="panel-head"><h2>So‘nggi kvartira e’lonlari</h2><button>+ E’lon qo‘shish</button></div>
    <div className="table-wrap"><table><thead><tr><th>Nomi</th><th>Turi</th><th>Narxi ($)</th><th>Status</th><th>Sanasi</th><th>Amallar</th></tr></thead>
    <tbody>{items.map((item)=><tr key={item.id}><td><span className="property-icon"><Apartment size={18}/></span>{item.title}</td><td>{item.type === 'new-build' ? 'Novostroyka' : 'Ikkilamchi'}</td><td>{usd(item.price)}</td><td><span className={`status ${item.status}`}>{status[item.status]}</span></td><td>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</td><td className="actions"><button>Ko‘rish</button><button>•••</button></td></tr>)}</tbody></table></div>
  </section>;
}
