import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Prime Capital — Ishonchli investitsiya',
  description: 'Ko‘chmas mulk va investitsiya yo‘nalishlarida ishonchli hamkor.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
