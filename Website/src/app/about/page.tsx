'use client';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AboutPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <h1>{t('about.title')}</h1>
          <p>{t('about.intro')}</p>
        </section>
        <section className="about-block">
          <h2>{t('about.mission.title')}</h2>
          <p>{t('about.mission.text')}</p>
        </section>
        <section className="values-block">
          <h2>{t('about.values.title')}</h2>
          <div className="values-grid">
            <article>
              <ShieldCheck />
              <h3>{t('about.values.trust')}</h3>
            </article>
            <article>
              <TrendingUp />
              <h3>{t('about.values.transparency')}</h3>
            </article>
            <article>
              <Users />
              <h3>{t('about.values.growth')}</h3>
            </article>
          </div>
        </section>
        <section className="about-block">
          <h2>{t('about.team.title')}</h2>
          <p>{t('about.team.text')}</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
