import type { Metadata } from 'next'; import './globals.css';
export const metadata:Metadata={title:'Prime Capital — Ishonchli investitsiya',description:'Ko‘chmas mulk va investitsiya yo‘nalishlarida ishonchli hamkor.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}</body></html>}
