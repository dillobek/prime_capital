'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Eye, MapPin } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { getProperties, trackPropertyView, type PropertyListing } from '@/lib/api';

const usd = (value: number) => `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}`;

/** Fires the view-impression counter once per listing id per page load (a plain module-level Set, not per-component state, so re-renders/remounts of the same card never double-count). */
const seenViews = new Set<string>();
function trackOnce(id: string) {
  if (seenViews.has(id)) return;
  seenViews.add(id);
  trackPropertyView(id);
}

export function ListingCard({ item }: { item: PropertyListing }) {
  const { t } = useLang();
  useEffect(() => {
    trackOnce(item.id);
  }, [item.id]);
  return (
    <article className="listing-card">
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
      <div className="listing-card-footer">
        <div className="listing-card-price">{usd(item.price)}</div>
        <span className="listing-card-views">
          <Eye size={13} /> {item.views ?? 0}
        </span>
      </div>
    </article>
  );
}

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
        <ListingCard item={item} key={item.id} />
      ))}
    </div>
  );
}

/** Home-page rail: latest N listings of one type, in a horizontal-scroll row, with a "view all" button. */
export function PropertyRail({
  type,
  title,
  viewAllHref,
  limit = 12,
}: {
  type: 'new-build' | 'resale';
  title: string;
  viewAllHref: string;
  limit?: number;
}) {
  const { t } = useLang();
  const [items, setItems] = useState<PropertyListing[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProperties({ type, status: 'active', limit }).then((result) => {
      if (!cancelled) setItems(result);
    });
    return () => {
      cancelled = true;
    };
  }, [type, limit]);

  return (
    <section className="property-rail-section">
      <div className="section-title">
        <h2>{title}</h2>
      </div>
      {items === null ? (
        <p className="listing-loading">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="listing-loading">{t('listing.empty')}</p>
      ) : (
        <div className="property-rail-scroll">
          {items.map((item) => (
            <ListingCard item={item} key={item.id} />
          ))}
        </div>
      )}
      <div className="rail-view-all">
        <Link className="outline" href={viewAllHref}>
          {t('common.viewAll')}
        </Link>
      </div>
    </section>
  );
}
