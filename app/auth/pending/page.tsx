import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function PendingApproval() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1b4b] to-[var(--background)]">
            <div className="glass-panel p-10 max-w-md w-full text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-yellow-500/20 rounded-full">
                        <ChefHat className="w-12 h-12 text-yellow-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white">
                    Account Pending
                </h1>

                <p className="text-slate-300">
                    Your request has been sent to the administrator. You will be notified once your account is approved.
                </p>

                <div className="pt-6 border-t border-white/10">
                    <Link href="/login" className="text-sm text-primary hover:text-primary-hover transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
