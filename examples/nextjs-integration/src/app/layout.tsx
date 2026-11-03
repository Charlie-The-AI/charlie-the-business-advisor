import type { Metadata } from 'next';
import { CharlieProvider } from '@charlie-the-ai/advisor-react';

export const metadata: Metadata = {
  title: 'Next.js Charlie Integration Example',
  description: 'Example Next.js App Router application integrating @charlie-the-ai/advisor-react',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', margin: 0, padding: 0, backgroundColor: '#090d16', color: '#f3f4f6' }}>
        <CharlieProvider
          config={{
            currency: 'NGN',
            timezone: 'Africa/Lagos',
            businessId: 'biz_solar_store',
          }}
        >
          {children}
        </CharlieProvider>
      </body>
    </html>
  );
}
