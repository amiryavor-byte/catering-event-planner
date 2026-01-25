import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Catering Proposal',
    description: 'View your catering proposal',
};

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-200`}>
                {children}
            </body>
        </html>
    );
}
