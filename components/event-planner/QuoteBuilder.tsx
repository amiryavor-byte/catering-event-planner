'use client';

import { useState } from 'react';
import { Event, EventMenuItem } from '@/lib/data/types';
import { Settings, Save, Calculator, ExternalLink } from 'lucide-react';
import { updateEvent } from '@/lib/actions/event-planning';

interface QuoteBuilderProps {
    event: Event;
    assignedMenu: any[]; // Using specific type if possible, else defaults from parent
    assignedStaff: any[];
}

export default function QuoteBuilder({ event, assignedMenu, assignedStaff }: QuoteBuilderProps) {
    const [isSaving, setIsSaving] = useState(false);

    // We can initialize state from event.quoteConfig if it existed, 
    // but for now we'll start with defaults or raw values.
    const [settings, setSettings] = useState({
        depositPercentage: 25,
        taxRate: 8,
        serviceFee: 15,
        expirationDays: 30,
        showStaffBreakdown: false,
    });

    const foodCost = assignedMenu.reduce((sum: number, i: any) => sum + ((i.priceOverride ?? i.item?.basePrice ?? 0) * i.quantity), 0);
    const laborCost = assignedStaff.reduce((sum: number, s: any) => sum + (s.user.hourlyRate || 0) * 5, 0); // Est 5 hours
    // Simplified logic, ideally should come from Equipment too
    const subtotal = foodCost + laborCost;

    const serviceFeeAmount = subtotal * (settings.serviceFee / 100);
    const taxAmount = (subtotal + serviceFeeAmount) * (settings.taxRate / 100);
    const total = subtotal + serviceFeeAmount + taxAmount;
    const depositAmount = total * (settings.depositPercentage / 100);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Generate a token if one doesn't exist
            const token = event.quoteToken || crypto.randomUUID();

            await updateEvent(event.id, {
                quoteToken: token,
                quoteConfig: JSON.stringify(settings),
                quoteExpiresAt: new Date(Date.now() + settings.expirationDays * 86400000).toISOString(),
            });
            alert('Quote configuration saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save quote settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Col: Config */}
            <div className="lg:col-span-2 space-y-6">
                <div className="card">
                    <div className="flex items-center gap-2 mb-6 text-xl font-bold text-white border-b border-white/10 pb-4">
                        <Settings className="text-primary" />
                        <h2>Quote Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Deposit Percentage (%)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-white"
                                    value={settings.depositPercentage}
                                    onChange={(e) => setSettings({ ...settings, depositPercentage: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-white"
                                    value={settings.taxRate}
                                    onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Service Fee (%)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-white"
                                    value={settings.serviceFee}
                                    onChange={(e) => setSettings({ ...settings, serviceFee: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Expires In (Days)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-white"
                                    value={settings.expirationDays}
                                    onChange={(e) => setSettings({ ...settings, expirationDays: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                        <ExternalLink className="text-secondary" />
                        <h2>Client Link</h2>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-md flex items-center justify-between border border-white/10">
                        <code className="text-sm text-slate-300 truncate">
                            {event.quoteToken
                                ? `${window.location.origin}/portal/quote/${event.quoteToken}`
                                : 'Save settings to generate link...'}
                        </code>
                        {event.quoteToken && (
                            <button
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/portal/quote/${event.quoteToken}`)}
                                className="ml-4 text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Col: Live Preview / Calc */}
            <div className="card h-fit sticky top-6">
                <div className="flex items-center gap-2 mb-6 text-xl font-bold text-white border-b border-white/10 pb-4">
                    <Calculator className="text-emerald-400" />
                    <h2>Live Estimate</h2>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-400">
                        <span>Items Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>Service Fee ({settings.serviceFee}%)</span>
                        <span>${serviceFeeAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>Tax ({settings.taxRate}%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-white/10 my-4 pt-4 flex justify-between text-xl font-bold text-white">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 mt-4">
                        <div className="flex justify-between text-emerald-400 font-medium">
                            <span>Make Deposit</span>
                            <span>${depositAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-emerald-500/70 mt-1">Required to book event</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors"
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
}
