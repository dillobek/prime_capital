'use client';
import { useEffect, useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getBanners, trackBannerView, type ContentItem } from '@/lib/api';

const seenViews = new Set<string>();
function trackOnce(id: string) {
  if (seenViews.has(id)) return;
  seenViews.add(id);
  trackBannerView(id);
}

function PromoCard({ item }: { item: ContentItem }) {
  useEffect(() => {
    trackOnce(item.id);
  }, [item.id]);
  return (
    <article className="promo-card">
      <Sparkles size={20} />
      <h3>{item.title}</h3>
      {item.description && <p>{item.description}</p>}
      <span className="listing-card-views">
        <Eye size={13} /> {item.views ?? 0}
      </span>
    </article>
  );
}

export default function PromotionsPage() {
  const { t } = useLang();
  const [items, setItems] = useState<ContentItem[] | null>(null);

  useEffect(() => {
    getBanners().then(setItems);
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <h1>{t('listing.promotions.title')}</h1>
          <p>{t('listing.promotions.subtitle')}</p>
        </section>
        <section className="listing-section">
          {items === null && <p className="listing-loading">{t('common.loading')}</p>}
          {items?.length === 0 && <p className="listing-loading">{t('listing.empty')}</p>}
          {items && items.length > 0 && (
            <div className="promo-grid">
              {items.map((item) => (
                <PromoCard item={item} key={item.id} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
