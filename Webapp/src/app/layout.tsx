import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'Prime Capital', description: 'Investitsiya va ko‘chmas mulk platformasi' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body className={inter.className}>
    <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive"/>
    {children}
  </body></html>;
}
