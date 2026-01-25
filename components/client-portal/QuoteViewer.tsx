'use client';

import { useState } from 'react';
import { Event, EventMenuItem } from '@/lib/data/types';
import { Check, Download, CreditCard, Calendar } from 'lucide-react';
import { acceptQuote } from '@/lib/actions/quote';

interface QuoteViewerProps {
    event: Event;
    items: EventMenuItem[];
    staff: any[]; // Ideally typed
}

export default function QuoteViewer({ event, items, staff }: QuoteViewerProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [accepted, setAccepted] = useState(event.status === 'approved' || event.status === 'active');

    // Parse config
    let config = {
        taxRate: 8,
        serviceFee: 15,
        depositPercentage: 25,
        showStaffBreakdown: false,
    };
    try {
        if (event.quoteConfig && typeof event.quoteConfig === 'string') {
            config = { ...config, ...JSON.parse(event.quoteConfig) };
        } else if (event.quoteConfig) {
            config = { ...config, ...event.quoteConfig };
        }
    } catch (e) { console.error('Error parsing quote config', e); }

    const foodCost = items.reduce((sum, i) => sum + ((i.priceOverride ?? i.item?.basePrice ?? 0) * i.quantity), 0);
    const laborCost = staff.reduce((sum, s) => sum + (s.user.hourlyRate || 0) * 5, 0); // Est 5h

    // logic matches builder
    const subtotal = foodCost + laborCost;
    const serviceFeeAmount = subtotal * (config.serviceFee / 100);
    const taxAmount = (subtotal + serviceFeeAmount) * (config.taxRate / 100);
    const total = subtotal + serviceFeeAmount + taxAmount;
    const depositAmount = total * (config.depositPercentage / 100);

    const handleAccept = async () => {
        if (!confirm('Are you sure you want to accept this quote? This will confirm your booking.')) return;
        setIsAccepting(true);
        try {
            await acceptQuote(event.quoteToken!);
            setAccepted(true);
        } catch (err) {
            console.error(err);
            alert('Failed to accept quote. Please try again or contact us.');
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-primary/20">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {event.name}
                    </h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar size={16} />
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBD'}
                        {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                    </p>
                </div>
                <div className="flex gap-2">
                    {accepted ? (
                        <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center gap-2 font-medium">
                            <Check size={16} />
                            Accepted
                        </span>
                    ) : (
                        <span className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center gap-2 font-medium">
                            Pending Approval
                        </span>
                    )}
                </div>
            </header>

            {/* Menu Section */}
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Menu Selection</h2>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                            <div>
                                <p className="font-medium text-slate-200">{item.item?.name || 'Item'}</p>
                                <p className="text-sm text-slate-400">{item.quantity} x ${(item.priceOverride ?? item.item?.basePrice ?? 0).toFixed(2)}</p>
                            </div>
                            <span className="text-slate-200 font-medium">
                                ${((item.priceOverride ?? item.item?.basePrice ?? 0) * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-slate-500 italic">No menu items selected.</p>}
                </div>
            </section>

            {/* Costs Breakdown */}
            <section className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Estimated Costs</h2>
                <div className="space-y-3">
                    <div className="flex justify-between text-slate-400">
                        <span>Items Subtotal</span>
                        <span>${foodCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>Staffing & Service (Est)</span>
                        <span>${laborCost.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>Service Fee ({config.serviceFee}%)</span>
                        <span>${serviceFeeAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>Tax ({config.taxRate}%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    <div className="flex justify-between text-2xl font-bold text-white">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    {!accepted && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-primary font-bold">Deposit Required</span>
                                <span className="text-xl text-primary font-bold">${depositAmount.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-primary/70">
                                A {config.depositPercentage}% deposit is required to secure your date.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                <button
                    disabled
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-slate-400 rounded-lg cursor-not-allowed border border-white/5"
                    title="Download PDF (Coming Soon)"
                >
                    <Download size={18} />
                    Download PDF
                </button>

                {!accepted && (
                    <button
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        {isAccepting ? 'Processing...' : 'Accept & Pay Deposit'}
                        {!isAccepting && <CreditCard size={18} />}
                    </button>
                )}
                {accepted && (
                    <div className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2">
                        <Check size={18} />
                        Quote Accepted
                    </div>
                )}
            </div>

            {event.notes && (
                <div className="text-sm text-slate-500 mt-8 text-center max-w-2xl mx-auto">
                    <strong>Notes:</strong> {event.notes}
                </div>
            )}
        </div>
    );
}
