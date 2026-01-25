import React from 'react';
import { getQuoteByToken } from '@/lib/actions/quotes';
import { ClientQuoteView } from './ClientQuoteView';
import { notFound } from 'next/navigation';

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    try {
        const data = await getQuoteByToken(token);
        if (!data) return notFound();

        return <ClientQuoteView data={data} />;
    } catch (error) {
        // Handle expired or invalid quotes
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="max-w-md p-8 bg-slate-900 rounded-xl border border-white/10 text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Quote Unavailable</h1>
                    <p className="text-slate-400">This quote may have expired or the link is invalid. Please contact us for assistance.</p>
                </div>
            </div>
        );
    }
}
