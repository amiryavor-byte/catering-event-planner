'use client'

import { useState } from 'react';
import { Rocket, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface DeploymentResult {
    success: boolean;
    message: string;
    files: Array<{ file: string; status: string; error?: string }>;
    endpoints: Array<{ endpoint: string; status: string; httpStatus: number }>;
    timestamp: string;
}

export default function DeployPage() {
    const [deploying, setDeploying] = useState(false);
    const [result, setResult] = useState<DeploymentResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleDeploy() {
        setDeploying(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/admin/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deploy' })
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Deployment failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setDeploying(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Deploy Backend</h1>
                <p className="text-slate-400">Upload PHP files to HostGator via FTP</p>
            </header>

            {/* Deploy Button */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Deployment Control</h2>

                <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-warning mt-0.5" size={20} />
                        <div>
                            <div className="font-semibold text-warning mb-1">Production Deployment</div>
                            <div className="text-sm text-slate-400">
                                This will upload all PHP backend files to HostGator and replace existing files.
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {deploying ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Deploying...
                        </>
                    ) : (
                        <>
                            <Rocket size={20} />
                            Deploy Backend to HostGator
                        </>
                    )}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="card bg-error/10 border-error/30 mb-6">
                    <div className="flex items-start gap-3">
                        <XCircle className="text-error mt-0.5" size={20} />
                        <div>
                            <div className="font-semibold text-error mb-1">Deployment Failed</div>
                            <div className="text-sm text-slate-300">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className={`card ${result.success ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
                        <div className="flex items-start gap-3">
                            {result.success ? (
                                <CheckCircle className="text-success mt-0.5" size={20} />
                            ) : (
                                <AlertCircle className="text-warning mt-0.5" size={20} />
                            )}
                            <div>
                                <div className={`font-semibold mb-1 ${result.success ? 'text-success' : 'text-warning'}`}>
                                    {result.message}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Deployed at {new Date(result.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Results */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-white mb-4">File Upload Results</h3>
                        <div className="space-y-2">
                            {result.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-white font-mono text-sm">{file.file}</span>
                                    <div className="flex items-center gap-2">
                                        {file.status === 'uploaded' ? (
                                            <>
                                                <CheckCircle size={16} className="text-success" />
                                                <span className="text-success text-sm">Uploaded</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} className="text-error" />
                                                <span className="text-error text-sm">{file.error || 'Failed'}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Endpoint Tests */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-white mb-4">Endpoint Health Check</h3>
                        <div className="space-y-2">
                            {result.endpoints.map((endpoint, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-white font-mono text-sm">{endpoint.endpoint}</span>
                                    <div className="flex items-center gap-2">
                                        {endpoint.status === 'working' ? (
                                            <>
                                                <CheckCircle size={16} className="text-success" />
                                                <span className="text-success text-sm">HTTP {endpoint.httpStatus}</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} className="text-error" />
                                                <span className="text-error text-sm">
                                                    {endpoint.httpStatus === 0 ? 'No response' : `HTTP ${endpoint.httpStatus}`}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Files to be Deployed */}
            <div className="card mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Files to Deploy</h3>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        'db_connect.php',
                        'menu_items.php',
                        'ingredients.php',
                        'recipes.php',
                        'users.php',
                        'tasks.php'
                    ].map(file => (
                        <div key={file} className="text-sm text-slate-400 font-mono">
                            {file}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
