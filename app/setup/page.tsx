'use client';

import { useState } from 'react';
import { parseStaffList, parseMenuFile } from '@/lib/actions/setup';
import { saveCompanySettings, getCompanySettings, type CompanySettings } from '@/lib/actions/company';
import { Upload, Check, AlertCircle, Loader2, Building2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function SetupPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Step 1 - Company Settings
    const [companySettings, setCompanySettings] = useState<CompanySettings>({
        name: '',
        logoUrl: '',
        primaryColor: '#6366f1'
    });
    const [logoPreview, setLogoPreview] = useState<string>('');

    // Step 2 - Staff Import
    const [staffResult, setStaffResult] = useState<{ added: number, tasks: number } | null>(null);
    const [staffFile, setStaffFile] = useState<File | null>(null);

    // Step 3 - Menu Import
    const [menuResult, setMenuResult] = useState<{ itemsFound: number, tasksCreated?: number } | null>(null);
    const [menuFile, setMenuFile] = useState<File | null>(null);

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'logo');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setCompanySettings(prev => ({ ...prev, logoUrl: data.url }));
            } else {
                alert('Failed to upload logo: ' + data.error);
                setLogoPreview('');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload logo');
            setLogoPreview('');
        } finally {
            setUploadingLogo(false);
        }
    }

    function handleStep1Next() {
        if (!companySettings.name.trim()) {
            alert('Please enter your company name');
            return;
        }

        setLoading(true);
        const result = saveCompanySettings(companySettings);
        setLoading(false);

        if (result.success) {
            setStep(2);
        } else {
            alert('Failed to save company settings: ' + result.error);
        }
    }

    async function handleStaffUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!staffFile) {
            alert('Please select a file to upload');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', staffFile);
        const res = await parseStaffList(formData);
        setLoading(false);

        if (res.success) {
            setStaffResult({ added: res.added || 0, tasks: res.tasks || 0 });
        } else {
            alert('Failed to parse staff list: ' + res.error);
        }
    }

    function handleStaffFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setStaffFile(file);
        }
    }

    async function handleMenuUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!menuFile) {
            alert('Please select a menu file to upload');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', menuFile);
        const res = await parseMenuFile(formData);
        setLoading(false);

        if (res.success) {
            setMenuResult({ itemsFound: res.itemsFound || 0, tasksCreated: res.tasksCreated || 0 });
        } else {
            alert('Failed to parse menu: ' + res.error);
        }
    }

    function handleMenuFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setMenuFile(file);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 p-6">
            <div className="glass-panel w-full max-w-2xl p-10 animate-in fade-in zoom-in duration-500">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        CaterPlan Setup
                    </h1>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Building2 className="text-primary" size={24} />
                            <h2 className="text-xl text-white font-semibold">Company Branding</h2>
                        </div>

                        <div className="grid gap-6">
                            {/* Logo Upload */}
                            <div className="space-y-3">
                                <label className="text-slate-400 text-sm">Company Logo</label>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary bg-white/5">
                                            <Image
                                                src={logoPreview}
                                                alt="Company logo preview"
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center bg-white/5">
                                            <ImageIcon className="text-slate-600" size={32} />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                                            {uploadingLogo ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} />
                                                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                onChange={handleLogoUpload}
                                                disabled={uploadingLogo}
                                            />
                                        </label>
                                        <p className="text-xs text-slate-500 mt-2">PNG, JPG or WebP (max 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Company Name */}
                            <label className="block">
                                <span className="text-slate-400 text-sm">Company Name *</span>
                                <input
                                    type="text"
                                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                    placeholder="e.g. Elite Catering Co."
                                    value={companySettings.name}
                                    onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </label>

                            {/* Primary Color */}
                            <label className="block">
                                <span className="text-slate-400 text-sm">Primary Brand Color</span>
                                <div className="flex gap-4 mt-2 items-center">
                                    <input
                                        type="color"
                                        className="h-12 w-20 rounded-lg cursor-pointer border-2 border-white/10"
                                        value={companySettings.primaryColor}
                                        onChange={(e) => setCompanySettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                                    />
                                    <div>
                                        <span className="text-white font-mono text-sm">{companySettings.primaryColor}</span>
                                        <p className="text-slate-500 text-xs">Pick a color to theme your dashboard</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={handleStep1Next}
                            className="btn-primary w-full"
                            disabled={loading || !companySettings.name.trim()}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    Saving...
                                </span>
                            ) : (
                                'Next: Import Staff'
                            )}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl text-white font-semibold">Import Staff</h2>
                        <p className="text-slate-400 text-sm">Upload your existing staff roster (CSV or Excel). Our AI will create accounts automatically.</p>

                        {!staffResult ? (
                            <form onSubmit={handleStaffUpload} className="space-y-4">
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-white/5">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="staff-file"
                                        accept=".csv,.txt,.xlsx,.xls"
                                        onChange={handleStaffFileChange}
                                    />
                                    <label htmlFor="staff-file" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="text-slate-400" size={32} />
                                        <span className="text-white font-medium">
                                            {staffFile ? staffFile.name : 'Click to Upload Roster'}
                                        </span>
                                        <span className="text-slate-500 text-xs">Supports CSV, XLSX</span>
                                    </label>
                                </div>

                                {staffFile && (
                                    <button
                                        type="submit"
                                        className="btn-primary w-full"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={16} />
                                                AI Processing...
                                            </span>
                                        ) : (
                                            'Process File'
                                        )}
                                    </button>
                                )}
                            </form>
                        ) : (
                            <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex gap-4 items-start">
                                <Check className="text-success mt-1" size={20} />
                                <div>
                                    <p className="text-white font-medium">Success!</p>
                                    <p className="text-slate-300 text-sm">Added {staffResult.added} staff members.</p>
                                    {staffResult.tasks > 0 && (
                                        <p className="text-warning text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> Generated {staffResult.tasks} tasks for missing info.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="text-slate-400 hover:text-white px-4 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="btn-primary flex-1"
                            >
                                {staffResult ? 'Next: Import Menus' : 'Skip for Now'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Upload className="text-primary" size={24} />
                            <h2 className="text-xl text-white font-semibold">Import Menus</h2>
                        </div>
                        <p className="text-slate-400 text-sm">Upload PDF menus or menu images. AI will extract dishes, categories, and predict ingredients.</p>

                        {!menuResult ? (
                            <form onSubmit={handleMenuUpload} className="space-y-4">
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-white/5">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="menu-file"
                                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={handleMenuFileChange}
                                    />
                                    <label htmlFor="menu-file" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="text-slate-400" size={32} />
                                        <span className="text-white font-medium">
                                            {menuFile ? menuFile.name : 'Click to Upload Menu'}
                                        </span>
                                        <span className="text-slate-500 text-xs">Supports PDF, PNG, JPG, WebP</span>
                                    </label>
                                </div>

                                {menuFile && (
                                    <button
                                        type="submit"
                                        className="btn-primary w-full"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={16} />
                                                AI Analyzing Menu...
                                            </span>
                                        ) : (
                                            'Extract Menu Items'
                                        )}
                                    </button>
                                )}
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex gap-4 items-start">
                                    <Check className="text-success mt-1" size={20} />
                                    <div>
                                        <p className="text-white font-medium">Menu Extracted Successfully!</p>
                                        <p className="text-slate-300 text-sm">Found {menuResult.itemsFound} menu items.</p>
                                        {menuResult.tasksCreated && menuResult.tasksCreated > 0 && (
                                            <p className="text-primary text-sm mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} /> {menuResult.tasksCreated} tasks created to add predicted ingredients to inventory.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setMenuFile(null);
                                        setMenuResult(null);
                                    }}
                                    className="text-primary hover:text-primary/80 text-sm transition-colors"
                                >
                                    + Parse Another Menu
                                </button>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-slate-400 hover:text-white px-4 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="btn-primary flex-1 bg-gradient-to-r from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Check size={16} />
                                    {menuResult ? 'Finish Setup' : 'Skip & Finish'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
