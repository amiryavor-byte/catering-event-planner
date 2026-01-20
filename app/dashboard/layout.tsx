import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '280px',
                minHeight: '100vh',
                background: 'var(--background)',
                padding: '2rem'
            }}>
                {children}
            </main>
        </div>
    );
}
