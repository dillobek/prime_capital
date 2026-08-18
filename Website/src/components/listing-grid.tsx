'use client';
import { useEffect, useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { getProperties, type PropertyListing } from '@/lib/api';

const usd = (value: number) => `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}`;

export function ListingGrid({ type }: { type?: 'new-build' | 'resale' }) {
  const { t } = useLang();
  const [items, setItems] = useState<PropertyListing[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProperties({ type, status: 'active' }).then((result) => {
      if (!cancelled) setItems(result);
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  if (items === null) return <p className="listing-loading">{t('common.loading')}</p>;
  if (items.length === 0) return <p className="listing-loading">{t('listing.empty')}</p>;

  return (
    <div className="listing-grid">
      {items.map((item) => (
        <article key={item.id} className="listing-card">
          <div className="listing-card-icon">
            <Building2 size={22} />
          </div>
          <h3>{item.title}</h3>
          <p className="listing-card-location">
            <MapPin size={14} /> {item.location}
          </p>
          <div className="listing-card-meta">
            <span>{item.rooms} xona</span>
            <span>{item.area} m²</span>
            <span>{item.type === 'new-build' ? t('listing.field.type.newBuild') : t('listing.field.type.secondary')}</span>
          </div>
          <div className="listing-card-price">{usd(item.price)}</div>
        </article>
      ))}
    </div>
  );
}
