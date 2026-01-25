'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteConfig, updateQuoteConfig, publishQuote, sendQuoteEmail } from '@/lib/actions/quotes';
import { DownloadQuotePdfButton } from '@/components/quotes/DownloadQuotePdfButton';
import { Event, User, EventMenuItem, StaffAvailability } from '@/lib/data/types';
import { ArrowLeft, Save, Send, Eye, DollarSign, Settings, GripVertical, Check, Mail } from 'lucide-react';

interface QuoteData {
    event: Event;
    client: User | null;
    items: {
        menu: EventMenuItem[];
        staff: any[]; // Using any for now as types are loose
        equipment: any[];
    };
    config: QuoteConfig;
    token?: string;
}

interface QuoteBuilderProps {
    initialData: QuoteData;
    eventId: number;
}

export function QuoteBuilder({ initialData, eventId }: QuoteBuilderProps) {
    const router = useRouter();
    const [config, setConfig] = useState<QuoteConfig>(initialData.config);
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Calculate Totals
    const totals = useMemo(() => {
        const menuTotal = initialData.items.menu.reduce((sum, item) => {
            const price = item.priceOverride ?? item.basePrice ?? 0;
            return sum + (price * item.quantity);
        }, 0);

        // Mock staff/equipment totals for now if fields missing
        const staffTotal = 0;
        const equipmentTotal = 0;

        const subtotal = menuTotal + staffTotal + equipmentTotal;
        const deposit = (config.requireDeposit ?? true)
            ? (config.depositType === 'percentage'
                ? (subtotal * (config.depositAmount / 100))
                : config.depositAmount)
            : 0;

        return { menuTotal, staffTotal, equipmentTotal, subtotal, deposit };
    }, [initialData.items, config.depositType, config.depositAmount]);

    async function handleSave() {
        setIsSaving(true);
        try {
            await updateQuoteConfig(eventId, config);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save config:', error);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    }

    async function handlePublish() {
        if (!confirm('This will generate a public link and set the event status to "Quote". Continue?')) return;

        try {
            await publishQuote(eventId);
            router.refresh(); // Refresh to see the token
        } catch (error) {
            alert('Failed to publish quote');
        }
    }

    async function handleSendEmail() {
        if (!confirm('Send proposal email to client?')) return;
        setIsSending(true);
        try {
            const result = await sendQuoteEmail(eventId);
            if (result.success) {
                alert('Email sent successfully!');
            } else {
                alert('Failed to send email: ' + result.error);
            }
        } catch (error) {
            alert('Error sending email');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Quote Builder</h1>
                        <p className="text-xs text-slate-400">Event: {initialData.event.name}</p>
                    </div>
                    {initialData.token && (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs border border-green-500/30">
                            Published
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {initialData.token && (
                        <button
                            onClick={handleSendEmail}
                            disabled={isSending}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm border border-purple-500/50 transition-colors disabled:opacity-50 shadow-lg shadow-purple-900/20"
                        >
                            <Mail size={16} />
                            <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send to Client'}</span>
                        </button>
                    )}
                    <DownloadQuotePdfButton data={initialData} />
                    {initialData.token && (
                        <button
                            onClick={() => window.open(`/portal/quotes/${initialData.token}`, '_blank')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-sm border border-white/5 transition-colors"
                        >
                            <Eye size={16} />
                            <span className="hidden sm:inline">Preview Portal</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : <><Save size={16} /><span className="hidden sm:inline">Save</span></>}
                    </button>
                    {!initialData.token && (
                        <button
                            onClick={handlePublish}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-sm transition-colors"
                        >
                            <Send size={16} />
                            Publish
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Visual Editor (Center) */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Quote Preview Card */}
                        <div className="bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden min-h-[800px] flex flex-col">
                            {/* Header Section */}
                            <div className="p-8 border-b border-slate-100 flex justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800">Catering Quote</h2>
                                    <p className="text-slate-500 mt-1">Prepared for {initialData.client?.name || 'Valued Client'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-400">Total Estimate</div>
                                    <div className="text-3xl font-bold text-emerald-600">
                                        ${totals.subtotal.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Sections Placeholder */}
                            <div className="p-8 flex-1 space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold border-b pb-2 mb-4 uppercase tracking-wide text-slate-400 text-xs">Menu Selections</h3>
                                    <div className="space-y-4">
                                        {initialData.items.menu.length === 0 ? (
                                            <p className="text-center text-slate-400 py-8 italic border-2 border-dashed rounded-lg">No menu items added yet.</p>
                                        ) : (
                                            initialData.items.menu.map(item => (
                                                <div key={item.id} className="flex justify-between items-start group">
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400">Photo</div>
                                                        <div>
                                                            <div className="font-semibold">{item.menuItemName || 'Unknown Item'}</div>
                                                            <div className="text-sm text-slate-500">{item.description}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">${(item.priceOverride ?? item.basePrice ?? 0).toFixed(2)}</div>
                                                        <div className="text-xs text-slate-400">x {item.quantity}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Menu Item</button>
                                    </div>
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <span>Terms & Conditions Apply</span>
                                    <span>Valid until {initialData.event.quoteExpiresAt ? new Date(initialData.event.quoteExpiresAt).toLocaleDateString() : '7 days from now'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Settings & Margin) */}
                <div className="w-80 border-l border-white/10 bg-slate-900 p-4 flex flex-col gap-6 overflow-y-auto">

                    {/* Live Margin Calculator */}
                    <div className="p-4 rounded-xl bg-slate-800 border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-medium">
                            <DollarSign size={18} />
                            <span>Live Calculator</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Revenue</span>
                                <span className="text-white">${totals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Est. Cost</span>
                                <span className="text-slate-300">$0.00</span>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between font-bold">
                                <span className="text-slate-400">Profit</span>
                                <span className="text-emerald-400">${totals.subtotal.toLocaleString()} (100%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Deposit Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                <Settings size={14} /> Deposit Settings
                            </h3>
                            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.requireDeposit}
                                    onChange={(e) => setConfig({ ...config, requireDeposit: e.target.checked })}
                                    className="rounded border-slate-600 bg-transparent text-blue-600 focus:ring-0"
                                />
                                Require Deposit
                            </label>
                        </div>

                        {config.requireDeposit ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase">Deposit Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfig({ ...config, depositType: 'percentage' })}
                                            className={`flex-1 py-1.5 text-xs rounded border transition-colors ${config.depositType === 'percentage' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 hover:bg-white/5 text-slate-400'}`}
                                        >
                                            Percentage
                                        </button>
                                        <button
                                            onClick={() => setConfig({ ...config, depositType: 'fixed' })}
                                            className={`flex-1 py-1.5 text-xs rounded border transition-colors ${config.depositType === 'fixed' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 hover:bg-white/5 text-slate-400'}`}
                                        >
                                            Fixed Amount
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase">
                                        {config.depositType === 'percentage' ? 'Percentage %' : 'Amount $'}
                                    </label>
                                    <input
                                        type="number"
                                        value={config.depositAmount}
                                        onChange={(e) => setConfig({ ...config, depositAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="text-xs text-slate-400 text-right">
                                    Required Now: <span className="text-white font-medium">${totals.deposit.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-xs text-slate-500 italic text-center py-2 border border-dashed border-white/10 rounded">
                                No upfront deposit required.
                            </div>
                        )}
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300">Client Permissions</h3>
                        <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${config.allowClientEdit ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-600 bg-transparent'}`}
                                onClick={() => setConfig({ ...config, allowClientEdit: !config.allowClientEdit })}
                            >
                                {config.allowClientEdit && <Check size={10} />}
                            </div>
                            <span>Allow Editing Quantities</span>
                        </label>
                    </div>

                </div>
            </div>
        </div>
    );
}
