'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { login, setToken } from '@/lib/auth';

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    setLoading(true);
    setError('');
    try {
      const { token } = await login(email, password);
      setToken(token);
      router.push('/');
    } catch {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="login-section">
          <div className="login-card">
            <h1>{t('login.title')}</h1>
            <p>{t('login.subtitle')}</p>
            <form onSubmit={onSubmit}>
              <label>
                {t('login.email')}
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label>
                {t('login.password')}
                <input name="password" type="password" required autoComplete="current-password" />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button className="button" type="submit" disabled={loading}>
                {loading ? t('login.loading') : t('login.submit')}
              </button>
            </form>
            <p className="login-hint">{t('login.viaTelegram')}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
