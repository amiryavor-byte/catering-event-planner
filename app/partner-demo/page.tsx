import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, BarChart3, ChefHat, Smartphone, Zap } from 'lucide-react';

export default function PartnerDemoPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-white">
                            C
                        </div>
                        <span className="font-semibold text-lg tracking-tight">CateringOS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/login?mode=partner"
                            className="bg-white text-slate-950 hover:bg-slate-200 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                        >
                            Get Partner Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            v2.0 Now Available for Partners
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Modern Catering</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            Replace fragmented spreadsheets with a unified intelligent platform. From AI-powered menu ingestion to real-time Kitchen Display Systems.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/25"
                            >
                                Start Free Trial
                                <Zap className="w-5 h-5 ml-2" />
                            </Link>
                            <button className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
                                Watch Video Tour
                            </button>
                        </div>
                        <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-8">
                            <div>
                                <div className="text-3xl font-bold text-white">50%</div>
                                <div className="text-sm text-slate-500 mt-1">Less Admin Time</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">100%</div>
                                <div className="text-sm text-slate-500 mt-1">Paperless Kitchen</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">0</div>
                                <div className="text-sm text-slate-500 mt-1">Missed Orders</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-20 blur-2xl -z-10" />
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-sm">
                            <Image
                                src="/images/demo/main_dashboard_mockup.png"
                                alt="Dashboard Interface"
                                width={800}
                                height={600}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature: Unified Logistics */}
            <section className="py-24 bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for High-Volume Operations</h2>
                        <p className="text-slate-400 text-lg">
                            Manage complex event schedules, detailed equipment manifests, and staffing rosters from a single command center.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            { title: "Smart Tables", desc: "Excel-like editing with database integrity. Batch updates, filtering, and instant search.", icon: BarChart3 },
                            { title: "Inventory Tracking", desc: "Real-time tracking of owned and rented assets. Automatic shortage alerts.", icon: CheckCircle2 },
                            { title: "Staff Scheduling", desc: "Drag-and-drop rostering with conflict detection and automated notifications.", icon: ChefHat },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                <feature.icon className="w-10 h-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image
                            src="/images/demo/smart_table_mockup.png"
                            alt="Smart Table Interface"
                            width={1200}
                            height={600}
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </section>

            {/* Feature: KDS */}
            <section className="py-24 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image
                            src="/images/demo/kds_mockup.png"
                            alt="Kitchen Display System"
                            width={800}
                            height={600}
                            className="w-full h-auto"
                        />
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                            <ChefHat className="w-4 h-4" />
                            Kitchen Display System
                        </div>
                        <h2 className="text-4xl font-bold">A Silent, Synchronized Kitchen</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Eliminate shouting and paper tickets. The KDS provides a real-time feed of orders, color-coded by urgency and prep station.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Real-time order syncing across stations",
                                "Prep, Cook, and Plating specific views",
                                "Ingredient-level checklists for quality control",
                                "Automated timing to ensure course synchronization"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Feature: Mobile Application */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                            <Smartphone className="w-4 h-4" />
                            Captain's App
                        </div>
                        <h2 className="text-4xl font-bold">Command from the Floor</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Empower your event captains with a dedicated mobile interface. Manage timelines, staff breaks, and guest requests without running back to the office.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6 mt-8">
                            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                <h4 className="font-semibold mb-2 text-white">Offline Mode</h4>
                                <p className="text-sm text-slate-400">Full functionality even in venues with poor connectivity. Syncs automatically when back online.</p>
                            </div>
                            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                <h4 className="font-semibold mb-2 text-white">Push-to-Talk</h4>
                                <p className="text-sm text-slate-400">Instant voice communication with kitchen and logistics teams.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex justify-center">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                        <Image
                            src="/images/demo/mobile_app_mockup.png"
                            alt="Mobile App"
                            width={400}
                            height={800}
                            className="relative w-72 h-auto drop-shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-slate-950" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to modernize your operations?</h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        Join the leading catering companies using CateringOS to deliver flawless events.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
