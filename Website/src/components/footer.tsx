'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Logo } from './header';

export function Footer() {
  const { t } = useLang();
  return (
    <footer>
      <Logo />
      <p>{t('home.about.text')}</p>
      <nav>
        <Link href="/about">{t('nav.about')}</Link>
        <Link href="/apartments">{t('nav.apartments')}</Link>
        <Link href="/promotions">{t('nav.promotions')}</Link>
      </nav>
      <small>© 2026 Prime Capital. {t('footer.rights')}</small>
    </footer>
  );
}
