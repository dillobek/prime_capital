'use client';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ListingGrid } from '@/components/listing-grid';

export default function ApartmentsPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <h1>{t('listing.apartments.title')}</h1>
          <p>{t('listing.apartments.subtitle')}</p>
        </section>
        <section className="listing-section">
          <ListingGrid />
        </section>
      </main>
      <Footer />
    </>
  );
}
