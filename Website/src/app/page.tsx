'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyRail } from '@/components/listing-grid';

const webapp = 'https://t.me/Prime_capital_bot';

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <h1>{t('home.hero.title')}</h1>
            <p>{t('home.hero.subtitle')}</p>
            <div>
              <Link className="button" href="/apartments">
                {t('home.hero.cta.apartments')} <ArrowRight />
              </Link>
              <a className="outline" href={webapp}>
                {t('home.hero.cta.app')} <ArrowRight />
              </a>
            </div>
            <svg viewBox="0 0 600 150" aria-hidden="true">
              <polyline points="0,140 120,115 230,105 350,80 470,60 590,8" />
              <circle cx="120" cy="115" r="4" />
              <circle cx="350" cy="80" r="4" />
              <circle cx="590" cy="8" r="4" />
            </svg>
          </div>
          <div className="hero-image">
            <Image src="/residence.png" alt="Prime Capital" fill priority sizes="(max-width: 800px) 100vw, 55vw" />
          </div>
        </section>

        <PropertyRail type="new-build" title={t('listing.newBuildings.title')} viewAllHref="/new-buildings" limit={12} />
        <PropertyRail type="resale" title={t('listing.apartments.title')} viewAllHref="/apartments" limit={12} />

        <section className="cta" id="contact">
          <div>
            <h2>{t('home.cta.title')}</h2>
            <p>{t('home.cta.text')}</p>
            <a className="button" href={webapp}>
              {t('home.cta.button')} <ArrowRight />
            </a>
          </div>
          <Building2 />
        </section>
      </main>
      <Footer />
    </>
  );
}
