'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Headphones, Landmark, ShieldCheck } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

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

        <section className="about" id="about">
          <div>
            <h2>{t('home.about.title')}</h2>
            <p>{t('home.about.text')}</p>
            <Link href="/about">
              {t('common.viewMore')} <ArrowRight />
            </Link>
          </div>
          <div className="about-image">
            <Image src="/residence.png" alt="Prime Capital" fill sizes="50vw" />
          </div>
        </section>

        <section className="directions" id="directions">
          <h2>{t('home.directions.title')}</h2>
          <Direction number="01" title={t('home.directions.apartments.title')} text={t('home.directions.apartments.text')} />
          <Direction number="02" title={t('home.directions.invest.title')} text={t('home.directions.invest.text')} />
        </section>

        <section className="why">
          <h2>{t('home.why.title')}</h2>
          <div>
            <Proof icon={<ShieldCheck />} title={t('home.why.transparent')} text={t('home.why.transparentText')} />
            <Proof icon={<Landmark />} title={t('home.why.secure')} text={t('home.why.secureText')} />
            <Proof icon={<Headphones />} title={t('home.why.support')} text={t('home.why.supportText')} />
          </div>
        </section>

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

function Direction({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="direction">
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="growth">
        <strong>+</strong>
        <svg viewBox="0 0 360 120">
          <polyline points="5,110 70,102 130,80 190,76 250,45 310,35 355,5" />
        </svg>
      </div>
    </article>
  );
}

function Proof({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article>
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
