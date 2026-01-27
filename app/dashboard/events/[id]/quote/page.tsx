import React from 'react';
import { getQuoteData } from '@/lib/actions/quotes';

export const dynamic = 'force-dynamic';

import { QuoteBuilder } from './QuoteBuilder';
import { notFound } from 'next/navigation';

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parse ID
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
        return <div className="p-8 text-center text-red-500">Invalid Event ID</div>;
    }

    try {
        const data = await getQuoteData(eventId);
        return <QuoteBuilder initialData={data} eventId={eventId} />;
    } catch (error) {
        console.error('Failed to load quote data:', error);
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-red-500">Error Loading Quote</h2>
                <p className="text-slate-400">Please ensure the event exists and try again.</p>
            </div>
        );
    }
}
