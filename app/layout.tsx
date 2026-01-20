import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { VersionBadge } from '@/components/VersionBadge';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Catering Event Planner',
  description: 'Modern software for professional caterers',
};

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={outfit.className}>
        {children}
        <VersionBadge userEmail={session?.user?.email || undefined} />
      </body>
    </html>
  );
}
