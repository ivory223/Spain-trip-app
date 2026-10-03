import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '西班牙慢游 · Our Spain Journal',
  description: 'Barcelona to Madrid · 2026年10月22–29日 · 一家三口的随身旅行手帐',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '西班牙慢游' },
  icons: { icon: '/favicon.svg', apple: '/icons/apple-touch-icon.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f7f5ef' };
export default function Layout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
