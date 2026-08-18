'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getAbout, type AboutContent } from '@/lib/api';

export default function AboutPage() {
  const { t } = useLang();
  const [about, setAbout] = useState<AboutContent | null>(null);

  useEffect(() => {
    getAbout().then(setAbout);
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <h1>{about?.title || t('about.title')}</h1>
        </section>
        <section className="about-block">
          {about === null ? (
            <p>{t('common.loading')}</p>
          ) : (
            about.body.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
