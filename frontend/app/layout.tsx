import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '安盾云检 | SafeSight AI',
  description: 'AI驱动的网站安全风险智能检测平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
