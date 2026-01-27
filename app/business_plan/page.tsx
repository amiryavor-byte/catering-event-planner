import React from 'react';

export default function BusinessPlanPage() {
    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">Catering Software Partnership</h1>
                    <p className="text-xl text-gray-600">Business Plan & Operational Agreement</p>
                </div>

                {/* Partners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
                        <h3 className="text-lg font-bold text-gray-900">Amir Yavor</h3>
                        <p className="text-gray-500 text-sm mb-2">Technical Co-Founder</p>
                        <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Product Development</li>
                            <li>• Deployment & Hosting Setup</li>
                            <li>• Customization (10hrs/deal)</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500">
                        <h3 className="text-lg font-bold text-gray-900">David Fertig</h3>
                        <p className="text-gray-500 text-sm mb-2">Sales Co-Founder</p>
                        <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Lead Generation</li>
                            <li>• Contract Negotiation</li>
                            <li>• Client Relations & Payment</li>
                        </ul>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">01. Executive Summary</div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">The "White Label" Perpetual Model</h2>
                    <p className="mb-4 leading-relaxed text-gray-600">
                        This partnership aims to commercialize a proprietary Catering Event Planning Software through a High-Touch "White Label" Licensing model. Unlike typical SaaS, this model provides clients with a <strong>self-hosted, perpetual license</strong>, minimizing our long-term overhead while maximizing upfront cash flow and paid customization opportunities.
                    </p>
                    <p className="leading-relaxed text-gray-600">
                        The business is structured to provide immediate returns on each sale, with a clear 5-year transition plan for Amir to exit day-to-day operations while retaining a long-term royalty interest.
                    </p>
                </div>

                {/* Structure & Finance */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">02. Structure & Financials</div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Profit Sharing & Expenses</h2>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4 text-gray-900">Revenue Split (Year 1)</h3>
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                            <span>Amir Yavor</span>
                            <span className="font-bold text-blue-600">51%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>David Fertig</span>
                            <span className="font-bold text-green-600">49%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">*Of Net Distributable Revenue</p>
                    </div>

                    <h3 className="font-bold text-lg mb-3 text-gray-900">Expense Handling</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded mt-1">Sales</span>
                            <div className="text-sm">
                                <strong className="text-gray-900">David's Budget:</strong> Marketing, travel, dinners, ads.
                                <div className="text-gray-500 text-xs">Paid from David's 49% share.</div>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded mt-1">Tech</span>
                            <div className="text-sm">

                                <strong className="text-gray-900">Amir's Budget:</strong> Hardware, IDEs, Development tools.
                                <div className="text-gray-500 text-xs">Paid from Amir's 51% share.</div>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded mt-1">Shared</span>
                            <div className="text-sm">
                                <strong className="text-gray-900">Shared Infrastructure:</strong> Production server (if applicable), Domains.
                                <div className="text-gray-500 text-xs">Split <strong>Proportionally</strong> (e.g., 51/49).</div>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Product & Pricing */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">03. The Offering</div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Product & Pricing Strategy</h2>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2 text-gray-900">Core License</h3>
                            <div className="text-3xl font-bold text-gray-900 mb-2">$3,000 - $5,000</div>
                            <div className="text-sm text-gray-500 mb-4">One-time Fee Per Client</div>
                            <ul className="text-sm space-y-2 text-gray-600">
                                <li>✅ Full Installation on Client's Host</li>
                                <li>✅ <strong>10 Hours</strong> Custom Development</li>
                                <li>✅ Lifetime Bug Warranty</li>
                            </ul>
                        </div>
                        <div className="flex-1 border-l pl-0 md:pl-8 border-gray-100">
                            <h3 className="font-bold text-lg mb-2 text-gray-900">Exclusions</h3>
                            <ul className="text-sm space-y-2 text-gray-600 mb-4">
                                <li>❌ Hosting Fees (~$20/mo, paid by client)</li>
                                <li>❌ Feature Upgrades (Sold separately)</li>
                            </ul>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-bold text-yellow-800 text-sm mb-1">The Upsell Engine</h4>
                                <p className="text-xs text-yellow-700">New features (e.g. AI Menu) are "Crowdfunded". If 40 clients pay $500 each, we build it once and profit $20k.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forecast */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">04. Projections</div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Sales Forecast</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500">Year</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500">Target</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500">Est. Rev</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500">Amir (51%)</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500">David (49%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-3 py-4 font-bold text-gray-900">Year 1</td>
                                    <td className="px-3 py-4 text-gray-600">10 Clients</td>
                                    <td className="px-3 py-4 text-gray-600">$40,000</td>
                                    <td className="px-3 py-4 text-blue-600 font-medium">$20,400</td>
                                    <td className="px-3 py-4 text-green-600 font-medium">$19,600</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-4 font-bold text-gray-900">Year 2</td>
                                    <td className="px-3 py-4 text-gray-600">20 Clients</td>
                                    <td className="px-3 py-4 text-gray-600">$80,000</td>
                                    <td className="px-3 py-4 text-blue-600 font-medium">$40,800</td>
                                    <td className="px-3 py-4 text-green-600 font-medium">$39,200</td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-4 font-bold text-gray-900">Year 3</td>
                                    <td className="px-3 py-4 text-gray-600">35 Clients</td>
                                    <td className="px-3 py-4 text-gray-600">$140,000</td>
                                    <td className="px-3 py-4 text-blue-600 font-medium">$71,400+</td>
                                    <td className="px-3 py-4 text-green-600 font-medium">$68,600</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Operation */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">05. Operations</div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">"White Glove" Deployment</h2>
                    <ol className="relative border-l border-gray-200 ml-4">
                        <li className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white text-blue-800 text-xs font-bold">1</span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">Sale Closed</h3>
                            <p className="mb-4 text-base font-normal text-gray-500">David collects signed contract & license fee.</p>
                        </li>
                        <li className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white text-blue-800 text-xs font-bold">2</span>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Provisioning</h3>
                            <p className="text-base font-normal text-gray-500">Partnership creates hosting acct (DigitalOcean/Vercel). Client provides Credit Card for billing.</p>
                        </li>
                        <li className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white text-blue-800 text-xs font-bold">3</span>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Deployment & Customization</h3>
                            <p className="text-base font-normal text-gray-500">Amir deploys code + 10hrs custom styling/config.</p>
                        </li>
                    </ol>
                </div>

                {/* Exit Strategy */}
                <div className="bg-purple-50 rounded-xl shadow-sm p-8 border border-purple-100">
                    <div className="text-purple-800 uppercase tracking-wider text-xs font-bold mb-2">06. Long Term</div>
                    <h2 className="text-2xl font-bold mb-6 text-purple-900">5-Year Exit Strategy</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-sm mb-6">
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="font-bold text-gray-900">Year 1</div>
                            <div className="text-gray-500 text-xs">51% / 49%</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="font-bold text-gray-900">Year 2</div>
                            <div className="text-gray-500 text-xs">45% / 55%</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="font-bold text-gray-900">Year 3</div>
                            <div className="text-gray-500 text-xs">35% / 65%</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="font-bold text-gray-900">Year 4</div>
                            <div className="text-gray-500 text-xs">20% / 80%</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="font-bold text-gray-900">Year 5</div>
                            <div className="text-gray-500 text-xs">10% / 90%</div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg text-purple-800">
                            Year 6+: 5% Perpetual Royalty
                        </p>
                        <p className="text-xs text-purple-600 mt-2">
                            David may buy out the timeline after Year 3 (subject to 5% royalty).
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
