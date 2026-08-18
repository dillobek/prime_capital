'use client';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ListingGrid } from '@/components/listing-grid';

export default function NewBuildingsPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <h1>{t('listing.newBuildings.title')}</h1>
          <p>{t('listing.newBuildings.subtitle')}</p>
        </section>
        <section className="listing-section">
          <ListingGrid type="new-build" />
        </section>
      </main>
      <Footer />
    </>
  );
}
