import React from 'react';
import { getQuoteByToken } from '@/lib/actions/quotes';

export const dynamic = 'force-dynamic';

import { ClientQuoteView } from './ClientQuoteView';
import { notFound } from 'next/navigation';

export default async function ClientQuotePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    try {
        const data = await getQuoteByToken(token);
        if (!data) return notFound();

        return <ClientQuoteView data={data} />;
    } catch (error) {
        console.error('Failed to load quote by token:', error);
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-500/20 rounded-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Unavailable</h1>
                    <p className="text-slate-400 mb-6">
                        This quote is no longer available or the link has expired.
                    </p>
                </div>
            </div>
        );
    }
}
