'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLang, LanguageSwitcher } from '@/lib/i18n';
import { getToken, clearToken, decodeEmail } from '@/lib/auth';

const webapp = 'https://t.me/Prime_capital_bot';

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 173.29 208.48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="#068CEF"
        d="M45.27 167.44L45.27 3.96C45.27 1.52 42.63 0 40.52 1.22L1.58 23.7C0.6 24.27 0 25.31 0 26.44L0 144.96C0 146.09 0.6 147.13 1.58 147.7L40.52 170.18C42.63 171.4 45.27 169.88 45.27 167.44Z M109.28 77.59L109.28 26.44C109.28 25.31 108.68 24.27 107.7 23.7L68.76 1.22C66.65 0 64.01 1.52 64.01 3.96L64.01 100.07C64.01 102.51 66.65 104.03 68.76 102.81L107.7 80.33C108.68 79.76 109.28 78.72 109.28 77.59Z M64.01 182.04L64.01 130.89C64.01 129.76 64.62 128.72 65.6 128.15L104.53 105.67C106.64 104.45 109.28 105.98 109.28 108.41L109.28 204.52C109.28 206.96 106.64 208.48 104.53 207.26L65.6 184.78C64.62 184.21 64.01 183.17 64.01 182.04Z M128.02 41.04L128.02 204.52C128.02 206.96 130.66 208.48 132.77 207.26L171.71 184.78C172.69 184.21 173.29 183.17 173.29 182.04L173.29 63.52C173.29 62.39 172.69 61.35 171.71 60.78L132.77 38.3C130.66 37.08 128.02 38.6 128.02 41.04Z"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link className="logo" href="/">
      <LogoMark />
      <b>
        PRIME<small>CAPITAL</small>
      </b>
    </Link>
  );
}

export function Header() {
  const { t } = useLang();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) setEmail(decodeEmail(token));
  }, []);

  function logout() {
    clearToken();
    setEmail(null);
  }

  return (
    <header id="top">
      <Logo />
      <nav>
        <Link href="/">{t('nav.home')}</Link>
        <Link href="/about">{t('nav.about')}</Link>
        <Link href="/apartments">{t('nav.apartments')}</Link>
        <Link href="/new-buildings">{t('nav.newBuildings')}</Link>
        <Link href="/promotions">{t('nav.promotions')}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitcher />
        {email ? (
          <div className="account-chip">
            <span>{email}</span>
            <button className="outline small" onClick={logout}>
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <Link className="outline small" href="/login">
            {t('nav.login')}
          </Link>
        )}
        <a className="button" href={webapp}>
          {t('nav.openApp')}
        </a>
      </div>
    </header>
  );
}
