'use client';

import React, { useState } from 'react';
import { uploadPaymentProof } from '@/lib/actions/quotes';
import { Event, User, EventMenuItem, QuoteConfig } from '@/lib/data/types';
import { Check, CreditCard, Upload, MessageSquare } from 'lucide-react';
import { DownloadQuotePdfButton } from '@/components/quotes/DownloadQuotePdfButton';

interface QuoteData {
    event: Event;
    client: User | null;
    items: {
        menu: EventMenuItem[];
        staff: any[];
        equipment: any[];
    };
    config: QuoteConfig;
    token: string;
}

export function ClientQuoteView({ data }: { data: QuoteData }) {
    const [accepted, setAccepted] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [proofUrl, setProofUrl] = useState<string | null>((data.config as any).paymentProofUrl || null);
    const isApproved = data.event.status === 'approved' || data.event.status === 'active';

    // Calculate totals on client side for live updates (if we add editing later)
    const menuTotal = data.items.menu.reduce((sum, item) => sum + ((item.priceOverride ?? item.basePrice ?? 0) * item.quantity), 0);
    const total = menuTotal; // Add other items later
    const depositRequired = data.config.depositType === 'percentage'
        ? total * (data.config.depositAmount / 100)
        : data.config.depositAmount;

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0] || !data.token) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const result = await uploadPaymentProof(data.token, formData);
            if (result.success && result.url) {
                setProofUrl(result.url);
                alert('Payment proof uploaded successfully!');
            } else {
                alert('Upload failed: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Upload error occurred');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background Elements for Glassmorphism */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                    <div className="text-center md:text-left">
                        <div className="text-sm font-medium text-blue-400 mb-1">PROPOSAL FOR</div>
                        <h1 className="text-3xl font-bold text-white mb-2">{data.client?.name || 'Valued Client'}</h1>
                        <p className="text-slate-400">{data.event.name} • {new Date(data.event.startDate || '').toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Estimated Total</div>
                            <div className="text-3xl font-bold text-emerald-400">${total.toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2 justify-end w-full">
                            <DownloadQuotePdfButton data={data} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-full text-sm font-medium border border-white/10 transition-colors flex items-center justify-center gap-2" />
                            {!accepted && !isApproved && (
                                <button
                                    onClick={() => setAccepted(true)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Accept Proposal
                                </button>
                            )}
                            {isApproved && (
                                <div className="bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-full font-medium border border-emerald-500/30 flex items-center gap-2">
                                    <Check size={18} /> Event Booked
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* Menu Section */}
                    {data.items.menu.length > 0 && (
                        <Section title="Menu Selections" icon={<MessageSquare size={18} />}>
                            <div className="space-y-4">
                                {data.items.menu.map(item => (
                                    <div key={item.id} className="group relative overflow-hidden backdrop-blur-md bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors flex gap-4">
                                        <div className="w-20 h-20 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-slate-500">
                                            Photo
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg text-slate-200">{item.menuItemName}</h4>
                                            <p className="text-slate-400 text-sm">{item.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-emerald-400">${(item.priceOverride ?? item.basePrice ?? 0).toFixed(2)}</div>
                                            <div className="text-sm text-slate-500">Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Payment / Deposit Section (Only if accepted or approved, AND deposit is required/proof uploaded) */}
                    {(accepted || isApproved) && (data.config.requireDeposit ?? true) && (
                        <div className="backdrop-blur-xl bg-gradient-to-b from-blue-900/20 to-slate-900/50 border border-blue-500/20 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <CreditCard className="text-blue-400" />
                                Secure Constraints
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-slate-300 mb-4">
                                        To secure your date, a deposit of <strong className="text-white">${depositRequired.toLocaleString()}</strong> is required.
                                    </p>

                                    <div className="space-y-3">
                                        <PaymentLink href="https://paypal.me/yourbusiness" label="Pay with PayPal" color="bg-[#0070BA]" />
                                        <PaymentLink href="https://cash.app/$yourbusiness" label="Pay with Cash App" color="bg-[#00D632]" />
                                        <PaymentLink href="#" label="Pay with Zelle (scan QR)" color="bg-[#6D1ED4]" />
                                    </div>
                                </div>

                                <div className="border-l border-white/10 pl-8">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Proof of Payment</h3>

                                    {proofUrl ? (
                                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 text-center">
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Check className="text-emerald-400" />
                                            </div>
                                            <p className="text-emerald-400 font-medium">Payment Proof Received</p>
                                            <p className="text-xs text-emerald-500/60 mt-1">We will review it shortly.</p>
                                        </div>
                                    ) : (
                                        <label className={`block border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-white/20 transition-colors cursor-pointer bg-white/5 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleUpload}
                                                disabled={uploading}
                                            />
                                            {uploading ? (
                                                <div className="animate-pulse">Uploading...</div>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                                    <p className="text-sm text-slate-300">Upload Screenshot</p>
                                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                                </>
                                            )}
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children, icon }: { title: string, children: React.ReactNode, icon?: React.ReactNode }) {
    return (
        <section className="backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                {icon} {title}
            </h3>
            {children}
        </section>
    );
}

function PaymentLink({ href, label, color }: { href: string, label: string, color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${color} hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg block text-center transition-opacity shadow-lg`}
        >
            {label}
        </a>
    );
}
