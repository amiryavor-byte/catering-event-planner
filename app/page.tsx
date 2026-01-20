import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1b4b] to-[var(--background)]">
      <div className="glass-panel p-10 max-w-2xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Catering Planner
        </h1>
        <p className="text-xl text-slate-300">
          The next generation of event management is here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link href="/login" className="card hover:bg-white/5 transition-colors cursor-pointer block text-left">
            <h3 className="text-xl font-semibold mb-2 text-primary">Admin Portal</h3>
            <p className="text-sm text-slate-400">Manage menus, prices, and settings.</p>
          </Link>
          <Link href="/login" className="card hover:bg-white/5 transition-colors cursor-pointer block text-left">
            <h3 className="text-xl font-semibold mb-2 text-secondary">Events Board</h3>
            <p className="text-sm text-slate-400">Track inquiries, quotes, and active events.</p>
          </Link>
        </div>

        <Link href="/login" className="btn-primary w-full md:w-auto inline-flex justify-center items-center">
          Get Started
        </Link>
      </div>
    </main>
  );
}
