import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'Charlie the Business Advisor | AI-Powered Business Intelligence',
  description:
    'Commercial AI advisory and deterministic analytics platform for businesses scaling sales, customer retention, and product profitability.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-gray-100 min-h-screen">
        <Sidebar />
        <div className="pl-64 min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
