'use client';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getBanners, type ContentItem } from '@/lib/api';

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
                <article key={item.id} className="promo-card">
                  <Sparkles size={20} />
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
