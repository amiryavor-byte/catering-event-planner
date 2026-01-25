'use client';

import { useActionState } from 'react';
import { provisionClientAction } from '@/lib/actions/provision';
import { Terminal, UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ProvisionClientPage() {
    const [state, dispatch, isPending] = useActionState(provisionClientAction, {});

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Client Provisioning</h1>
                <p className="text-muted-foreground">
                    Deploy the white-label backend to a new client server via FTP.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Form Section */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
                        <UploadCloud className="w-6 h-6 text-primary" />
                        <h2>Connection Details</h2>
                    </div>

                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="host" className="text-sm font-medium">FTP Host</label>
                            <input
                                id="host"
                                name="host"
                                placeholder="ftp.client-site.com"
                                defaultValue="75.203.51.130"
                                className="w-full p-2 border rounded-md bg-background"
                                required
                            />
                            {state.errors?.host && <p className="text-sm text-red-500">{state.errors.host[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="user" className="text-sm font-medium">FTP User</label>
                            <input
                                id="user"
                                name="user"
                                placeholder="username@client-site.com"
                                className="w-full p-2 border rounded-md bg-background"
                                required
                            />
                            {state.errors?.user && <p className="text-sm text-red-500">{state.errors.user[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">FTP Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-2 border rounded-md bg-background"
                                required
                            />
                            {state.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="remotePath" className="text-sm font-medium">Remote Path</label>
                            <input
                                id="remotePath"
                                name="remotePath"
                                placeholder="/public_html/catering_app"
                                defaultValue="/public_html/catering_app"
                                className="w-full p-2 border rounded-md bg-background"
                                required
                            />
                            {state.errors?.remotePath && <p className="text-sm text-red-500">{state.errors.remotePath[0]}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors disabled:opacity-50 mt-4"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Provisioning...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-4 h-4" />
                                    Deploy to Client
                                </>
                            )}
                        </button>
                    </form>

                    {state.message && (
                        <div className={`mt-4 p-3 rounded-md flex items-start gap-2 ${state.success ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                            {state.success ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                            <p className="text-sm">{state.message}</p>
                        </div>
                    )}
                </div>

                {/* Console Output Section */}
                <div className="bg-zinc-950 text-zinc-50 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center gap-2 mb-4 text-zinc-400 border-b border-zinc-800 pb-2">
                        <Terminal className="w-5 h-5" />
                        <h3 className="font-mono text-sm uppercase tracking-wider">Deployment Log</h3>
                    </div>

                    <div className="font-mono text-sm space-y-1 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                        {isPending && (
                            <div className="flex items-center gap-2 text-yellow-500 animate-pulse">
                                <span>❯ Connecting to server...</span>
                            </div>
                        )}

                        {!isPending && !state.details && (
                            <div className="text-zinc-600 italic">
                                Ready to deploy. Waiting for input...
                            </div>
                        )}

                        {state.details && state.details.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 border-b border-zinc-900/50 py-1 last:border-0">
                                <span className={
                                    file.status === 'uploaded' ? 'text-green-500' :
                                        file.status === 'failed' ? 'text-red-500' : 'text-zinc-500'
                                }>
                                    {file.status === 'uploaded' ? '✓' : '✗'}
                                </span>
                                <span className="text-zinc-300">{file.file}</span>
                                {file.size && <span className="text-zinc-600 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>}
                                {file.error && <span className="text-red-400 text-xs ml-auto">{file.error}</span>}
                            </div>
                        ))}

                        {state.success && (
                            <div className="text-green-500 mt-4 border-t border-zinc-800 pt-2">
                                ❯ Deployment completed successfully.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
