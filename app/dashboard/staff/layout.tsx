import StaffSidebar from '@/components/StaffSidebar';

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex' }}>
            <StaffSidebar />
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
