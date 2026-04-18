import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chair Configurator',
  description: '3D chair configurator with color and texture options',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
